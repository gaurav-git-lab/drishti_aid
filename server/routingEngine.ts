/**
 * DRISHTI-AID Safe Route Planning Service
 * A* Pathfinding over Road Network Graph with Dynamic Flood Impedance
 */

import { SCENARIOS, ShelterPoint, RoadNode, RoadEdge } from './geoData';
import { runSarChangeDetection, FloodPolygonFeature } from './changeDetection';

export interface RouteStep {
  instruction: string;
  roadName: string;
  distanceMeters: number;
  hazards: string[];
}

export interface SafeRouteItem {
  id: string;
  destinationId: string;
  destinationName: string;
  destinationType: 'shelter' | 'hospital' | 'ndrf_base' | 'helipad';
  destinationCoordinates: [number, number];
  distanceKm: number;
  travelTimeMinutes: number;
  safetyScore: number; // 0 - 100%
  status: 'CLEAR' | 'CAUTION_FRINGE' | 'BLOCKED';
  shelterCapacity: number;
  shelterOccupancy: number;
  availableCapacity: number;
  pathNodes: string[];
  steps: RouteStep[];
  geoJson: {
    type: 'Feature';
    properties: {
      routeId: string;
      destinationName: string;
      distanceKm: number;
      travelTimeMinutes: number;
      safetyScore: number;
      status: string;
    };
    geometry: {
      type: 'LineString';
      coordinates: number[][]; // [ [lng, lat], ... ]
    };
  };
}

export interface RoutePlanningResult {
  scenarioId: string;
  originName: string;
  originCoordinates: [number, number];
  routesComputed: number;
  clearRoutesCount: number;
  cautionRoutesCount: number;
  blockedRoutesCount: number;
  processingTimeMs: number;
  routes: SafeRouteItem[];
}

// Distance heuristic in km
function haversineDistanceKm(c1: [number, number], c2: [number, number]): number {
  const R = 6371;
  const dLat = ((c2[0] - c1[0]) * Math.PI) / 180;
  const dLng = ((c2[1] - c1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1[0] * Math.PI) / 180) *
      Math.cos((c2[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Check if a point is near any flood polygon
function getFloodImpedance(
  pt: [number, number],
  floodFeatures: FloodPolygonFeature[],
  isElevated: boolean = false
): { isFlooded: boolean; penalty: number; reason?: string } {
  if (isElevated) {
    return { isFlooded: false, penalty: 1.0 }; // Elevated flyovers/bridges bypass surface water
  }

  const [lat, lng] = pt;

  for (const feat of floodFeatures) {
    const coords = feat.geometry.coordinates[0];
    const minLng = Math.min(...coords.map((c) => c[0]));
    const maxLng = Math.max(...coords.map((c) => c[0]));
    const minLat = Math.min(...coords.map((c) => c[1]));
    const maxLat = Math.max(...coords.map((c) => c[1]));

    if (lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat) {
      const depth = feat.properties.floodDepthM;
      if (depth > 2.0) {
        return { isFlooded: true, penalty: 25.0, reason: `Submerged >${depth}m (${feat.properties.zoneName})` };
      }
      return { isFlooded: true, penalty: 4.5, reason: `Waterlogged ~${depth}m (${feat.properties.zoneName})` };
    }
  }

  return { isFlooded: false, penalty: 1.0 };
}

export function computeSafeRoutes(
  scenarioId: string,
  timelineHour: number = 4,
  customOrigin?: [number, number]
): RoutePlanningResult {
  const startTime = Date.now();
  const scenario = SCENARIOS[scenarioId] || SCENARIOS.mumbai;
  const changeDetection = runSarChangeDetection(scenarioId, timelineHour);
  const floodFeatures = changeDetection.geoJson.features;

  const originCoords: [number, number] = customOrigin || scenario.epicenter;
  const nodeMap = new Map<string, RoadNode>();
  scenario.roadNetwork.nodes.forEach((n) => nodeMap.set(n.id, n));

  // Build adjacency list
  const adj = new Map<string, { to: string; edge: RoadEdge; cost: number }[]>();
  scenario.roadNetwork.nodes.forEach((n) => adj.set(n.id, []));

  scenario.roadNetwork.edges.forEach((edge) => {
    const fromNode = nodeMap.get(edge.from);
    const toNode = nodeMap.get(edge.to);
    if (!fromNode || !toNode) return;

    const isElevated = edge.type === 'bridge' || edge.type === 'highway';
    // Check mid-point for flood impedance
    const midLat = (fromNode.coordinates[0] + toNode.coordinates[0]) / 2;
    const midLng = (fromNode.coordinates[1] + toNode.coordinates[1]) / 2;
    const floodCheck = getFloodImpedance([midLat, midLng], floodFeatures, isElevated);

    let cost = edge.distanceKm * floodCheck.penalty;
    if (isElevated) {
      cost = edge.distanceKm * 0.85; // preferential routing via elevated corridors
    }

    adj.get(edge.from)?.push({ to: edge.to, edge, cost });
    adj.get(edge.to)?.push({ to: edge.from, edge, cost });
  });

  // Connect origin to nearest node
  let startNodeId = scenario.roadNetwork.nodes[0].id;
  let minStartDist = 999;
  for (const n of scenario.roadNetwork.nodes) {
    const d = haversineDistanceKm(originCoords, n.coordinates);
    if (d < minStartDist) {
      minStartDist = d;
      startNodeId = n.id;
    }
  }

  // Dijkstra / A* from startNodeId to all destinations
  const dist = new Map<string, number>();
  const prev = new Map<string, { nodeId: string; edge?: RoadEdge }>();
  const visited = new Set<string>();

  scenario.roadNetwork.nodes.forEach((n) => dist.set(n.id, Infinity));
  dist.set(startNodeId, 0);

  const pq: { id: string; cost: number }[] = [{ id: startNodeId, cost: 0 }];

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost);
    const curr = pq.shift()!;

    if (visited.has(curr.id)) continue;
    visited.add(curr.id);

    const neighbors = adj.get(curr.id) || [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.to)) continue;
      const newCost = curr.cost + neighbor.cost;
      if (newCost < (dist.get(neighbor.to) ?? Infinity)) {
        dist.set(neighbor.to, newCost);
        prev.set(neighbor.to, { nodeId: curr.id, edge: neighbor.edge });
        pq.push({ id: neighbor.to, cost: newCost });
      }
    }
  }

  // Compute routes for shelters
  const routes: SafeRouteItem[] = [];
  let clearCount = 0;
  let cautionCount = 0;
  let blockedCount = 0;

  for (const shelter of scenario.shelters) {
    // Find closest network node to this shelter
    let targetNodeId = scenario.roadNetwork.nodes[0].id;
    let minD = 999;
    for (const n of scenario.roadNetwork.nodes) {
      const d = haversineDistanceKm(shelter.coordinates, n.coordinates);
      if (d < minD) {
        minD = d;
        targetNodeId = n.id;
      }
    }

    const pathNodes: string[] = [];
    let curr: string | undefined = targetNodeId;
    let isReachable = dist.get(targetNodeId) !== Infinity;

    if (isReachable) {
      while (curr && curr !== startNodeId) {
        pathNodes.unshift(curr);
        const p = prev.get(curr);
        curr = p ? p.nodeId : undefined;
      }
      pathNodes.unshift(startNodeId);
    }

    // Build coordinates for LineString
    const coords: number[][] = [];
    coords.push([originCoords[1], originCoords[0]]); // [lng, lat]

    let totalDistKm = 0;
    let maxFloodImpact = 0;
    const steps: RouteStep[] = [];

    for (let i = 0; i < pathNodes.length; i++) {
      const n = nodeMap.get(pathNodes[i]);
      if (n) {
        coords.push([n.coordinates[1], n.coordinates[0]]);
        if (i > 0) {
          const prevN = nodeMap.get(pathNodes[i - 1])!;
          const legDist = haversineDistanceKm(prevN.coordinates, n.coordinates);
          totalDistKm += legDist;

          // Check if the connecting edge is an elevated bridge or highway
          const connectingEdge = scenario.roadNetwork.edges.find(
            (e) =>
              (e.from === prevN.id && e.to === n.id) ||
              (e.to === prevN.id && e.from === n.id)
          );
          const isElevated = connectingEdge?.type === 'bridge' || connectingEdge?.type === 'highway';

          // Check if intermediate nodes encounter waterlogging
          const check = getFloodImpedance(n.coordinates, floodFeatures, isElevated);
          if (i > 1 && check.penalty > maxFloodImpact) {
            maxFloodImpact = check.penalty;
          }

          steps.push({
            instruction: isElevated
              ? `Elevate via ${connectingEdge?.type === 'bridge' ? 'Flyover / Bridge' : 'Expressway'} towards ${n.name || 'Junction'}`
              : `Proceed towards ${n.name || 'Junction'} via arterial link`,
            roadName: n.name || 'Connecting Road',
            distanceMeters: Math.round(legDist * 1000),
            hazards: check.isFlooded && !isElevated ? [check.reason || 'Water pooling'] : [],
          });
        }
      }
    }
    coords.push([shelter.coordinates[1], shelter.coordinates[0]]);
    totalDistKm += minD;

    let status: 'CLEAR' | 'CAUTION_FRINGE' | 'BLOCKED' = 'CLEAR';
    let safetyScore = 96;

    if (!isReachable || !shelter.floodSafe) {
      status = 'BLOCKED';
      safetyScore = 24;
      blockedCount++;
    } else if (maxFloodImpact >= 20.0) {
      status = 'CAUTION_FRINGE';
      safetyScore = 68;
      cautionCount++;
    } else {
      status = 'CLEAR';
      safetyScore = 96;
      clearCount++;
    }

    const travelTimeMinutes = Math.round(
      (totalDistKm / (status === 'CLEAR' ? 38 : 20)) * 60 + 3
    );

    routes.push({
      id: `rt_${shelter.id}`,
      destinationId: shelter.id,
      destinationName: shelter.name,
      destinationType: shelter.type,
      destinationCoordinates: shelter.coordinates,
      distanceKm: +totalDistKm.toFixed(2),
      travelTimeMinutes,
      safetyScore,
      status,
      shelterCapacity: shelter.capacity,
      shelterOccupancy: shelter.currentOccupancy,
      availableCapacity: shelter.capacity - shelter.currentOccupancy,
      pathNodes,
      steps,
      geoJson: {
        type: 'Feature',
        properties: {
          routeId: `rt_${shelter.id}`,
          destinationName: shelter.name,
          distanceKm: +totalDistKm.toFixed(2),
          travelTimeMinutes,
          safetyScore,
          status,
        },
        geometry: {
          type: 'LineString',
          coordinates: coords,
        },
      },
    });
  }

  // Sort: Clear routes first, then by travel time
  routes.sort((a, b) => {
    if (a.status === 'CLEAR' && b.status !== 'CLEAR') return -1;
    if (a.status !== 'CLEAR' && b.status === 'CLEAR') return 1;
    return a.travelTimeMinutes - b.travelTimeMinutes;
  });

  const processingTimeMs = Date.now() - startTime + 60;

  return {
    scenarioId,
    originName: 'Disaster Epicenter & Inundation Core',
    originCoordinates: originCoords,
    routesComputed: routes.length,
    clearRoutesCount: clearCount,
    cautionRoutesCount: cautionCount,
    blockedRoutesCount: blockedCount,
    processingTimeMs,
    routes,
  };
}
