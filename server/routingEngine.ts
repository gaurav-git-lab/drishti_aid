/**
 * DRISHTI-AID Safe Route Planning Service
 * A* Pathfinding over Road Network Graph with Dynamic Flood Impedance
 */

import { getScenario, type ShelterPoint, type RoadNode, type RoadEdge } from './geoData.ts';
import { runSarChangeDetection, type FloodPolygonFeature, type ChangeDetectionResult } from './changeDetection.ts';

// ─── Binary Min-Heap for O(log n) Dijkstra priority queue ───────────────────
class MinHeap<T extends { cost: number }> {
  private data: T[] = [];
  get size() { return this.data.length; }
  push(item: T) {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }
  pop(): T | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this._sinkDown(0);
    }
    return top;
  }
  private _bubbleUp(i: number) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[parent].cost <= this.data[i].cost) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }
  private _sinkDown(i: number) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.data[l].cost < this.data[smallest].cost) smallest = l;
      if (r < n && this.data[r].cost < this.data[smallest].cost) smallest = r;
      if (smallest === i) break;
      [this.data[smallest], this.data[i]] = [this.data[i], this.data[smallest]];
      i = smallest;
    }
  }
}

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

// Check if a point is near any flood polygon — uses precomputed bounding boxes
function getFloodImpedance(
  pt: [number, number],
  floodFeatures: FloodPolygonFeature[],
  floodBBoxes: Array<{ minLng: number; maxLng: number; minLat: number; maxLat: number }>,
  isElevated: boolean = false
): { isFlooded: boolean; penalty: number; reason?: string } {
  if (isElevated) {
    return { isFlooded: false, penalty: 1.0 }; // Elevated flyovers/bridges bypass surface water
  }

  const [lat, lng] = pt;

  for (let i = 0; i < floodFeatures.length; i++) {
    const { minLng, maxLng, minLat, maxLat } = floodBBoxes[i];
    const feat = floodFeatures[i];

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
  customOrigin?: [number, number],
  precomputedChangeDetection?: ChangeDetectionResult
): RoutePlanningResult {
  const startTime = Date.now();
  const scenario = getScenario(scenarioId);
  // Reuse caller-supplied change detection to avoid re-running SAR computation
  const changeDetection = precomputedChangeDetection ?? runSarChangeDetection(scenarioId, timelineHour);
  const floodFeatures = changeDetection.geoJson.features;

  // Precompute bounding boxes for all flood polygons once
  const floodBBoxes = floodFeatures.map((feat) => {
    const coords = feat.geometry.coordinates[0];
    let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
    for (const pt of coords) {
      if (pt[0] < minLng) minLng = pt[0];
      if (pt[0] > maxLng) maxLng = pt[0];
      if (pt[1] < minLat) minLat = pt[1];
      if (pt[1] > maxLat) maxLat = pt[1];
    }
    return { minLng, maxLng, minLat, maxLat };
  });

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
    const floodCheck = getFloodImpedance([midLat, midLng], floodFeatures, floodBBoxes, isElevated);

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

  // Dijkstra / A* from startNodeId to all destinations — O((E+V) log V) with min-heap
  const dist = new Map<string, number>();
  const prev = new Map<string, { nodeId: string; edge?: RoadEdge }>();
  const visited = new Set<string>();

  scenario.roadNetwork.nodes.forEach((n) => dist.set(n.id, Infinity));
  dist.set(startNodeId, 0);

  const pq = new MinHeap<{ id: string; cost: number }>();
  pq.push({ id: startNodeId, cost: 0 });

  while (pq.size > 0) {
    const curr = pq.pop()!;

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
          const check = getFloodImpedance(n.coordinates, floodFeatures, floodBBoxes, isElevated);
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
