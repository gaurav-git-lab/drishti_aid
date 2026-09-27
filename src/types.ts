/**
 * DRISHTI-AID Client Type Definitions
 */

export interface DisasterScenario {
  id: string;
  name: string;
  state: string;
  riverBasin: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  bounds: [[number, number], [number, number]];
  areaKm2: number;
  disasterDate: string;
  satelliteSensor: string;
  orbitPass: string;
  sarPolarization: string;
  rainfall24hMm: number;
  epicenter: [number, number];
  shelters: ShelterPoint[];
  roadNetwork: RoadNetwork;
  description: string;
}

export interface ShelterPoint {
  id: string;
  name: string;
  type: 'shelter' | 'hospital' | 'ndrf_base' | 'helipad';
  coordinates: [number, number];
  capacity: number;
  currentOccupancy: number;
  medicalStaff: number;
  floodSafe: boolean;
  contact: string;
  supplies: {
    foodPacks: number;
    waterLiters: number;
    ambulances: number;
    rescueBoats: number;
  };
}

export interface RoadNode {
  id: string;
  coordinates: [number, number];
  name?: string;
}

export interface RoadEdge {
  id: string;
  from: string;
  to: string;
  type: 'highway' | 'arterial' | 'local' | 'bridge';
  distanceKm: number;
  lanes: number;
  baseSpeedKmh: number;
}

export interface RoadNetwork {
  nodes: RoadNode[];
  edges: RoadEdge[];
}

export interface FloodPolygonFeature {
  type: 'Feature';
  properties: {
    id: string;
    zoneName: string;
    floodDepthM: number;
    sarBackscatterDropDb: number;
    confidenceScore: number;
    areaKm2: number;
    waterType: 'river_breach' | 'urban_waterlog' | 'lowland_inundation';
    severity: 'critical' | 'severe' | 'moderate';
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface ChangeDetectionResult {
  scenarioId: string;
  timestamp: string;
  timelineHour: number;
  sensor: string;
  polarization: string;
  thresholdAppliedDb: number;
  totalAreaKm2: number;
  floodedAreaKm2: number;
  floodPercentage: number;
  processingTimeMs: number;
  confidenceAverage: number;
  coherenceMean: number;
  geoJson: {
    type: 'FeatureCollection';
    features: FloodPolygonFeature[];
  };
}

export interface RiskZoneFeature {
  type: 'Feature';
  properties: {
    id: string;
    zoneName: string;
    riskScore: number;
    category: 'Critical' | 'High' | 'Medium' | 'Low';
    isFlooded: boolean;
    floodFactor: number;
    populationDensityScore: number;
    estimatedPopulation: number;
    accessibilityScore: number;
    nearestShelterName: string;
    distanceToShelterKm: number;
    recommendedAction: string;
    ndrfPriority: 1 | 2 | 3 | 4;
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface RiskAnalysisResult {
  scenarioId: string;
  timestamp: string;
  totalPopulationAtRisk: number;
  criticalZonesCount: number;
  highZonesCount: number;
  mediumZonesCount: number;
  lowZonesCount: number;
  processingTimeMs: number;
  geoJson: {
    type: 'FeatureCollection';
    features: RiskZoneFeature[];
  };
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
  safetyScore: number;
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
      coordinates: number[][];
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

export interface AiBriefingResponse {
  executiveSummary: string;
  ndrfDeploymentPriority: string[];
  safeEvacuationCorridors: string[];
  medicalPreparedness: string;
  source: 'gemini-3.8-flash' | 'gemini-3.6-flash' | 'gemini-flash-latest' | 'rule_based_fallback';
}

export interface PipelineProgress {
  stage: 'idle' | 'ingesting' | 'change_detection' | 'risk_scoring' | 'route_planning' | 'completed';
  progressPercent: number;
  elapsedMs: number;
  currentStepMessage: string;
  benchmarks: {
    dataLoadMs?: number;
    changeDetectionMs?: number;
    riskScoringMs?: number;
    routingMs?: number;
    totalPipelineMs?: number;
  };
}

export type BasemapStyle = 'dark' | 'light' | 'satellite' | 'terrain';

export type MapFocusMode = 'all' | 'flood' | 'risk' | 'routes' | 'shelters';

export interface LayerVisibility {
  basemapStyle: BasemapStyle;
  satelliteBase?: boolean; // legacy compat
  floodExtent: boolean;
  riskZones: boolean;
  safeRoutes: boolean;
  shelters: boolean;
  roadNetwork: boolean;
  weatherPrecipitation: boolean;
  weatherWind: boolean;
  copernicusSentinel?: boolean;
  floodOpacity: number; // 0.1 - 1.0
  riskOpacity: number;  // 0.1 - 1.0
  showRiskLabels: boolean;
}

export type SelectedFeature =
  | { type: 'zone'; data: RiskZoneFeature['properties'] }
  | { type: 'flood'; data: FloodPolygonFeature['properties'] }
  | { type: 'shelter'; data: ShelterPoint }
  | { type: 'route'; data: SafeRouteItem }
  | { type: 'copernicus'; data: any }
  | null;

export interface GeeStatusResponse {
  isConfigured: boolean;
  projectId: string | null;
  serviceAccountEmail: string | null;
  hasPrivateKey: boolean;
  hasApiKey: boolean;
  activeCatalogCollections: string[];
  connectionMode: 'live_cloud_api' | 'calibrated_earth_engine_archive';
  instructions: string[];
}

export interface SatelliteComparisonLayer {
  id: string;
  name: string;
  sensor: string;
  acquisitionDate: string;
  orbitMode: string;
  polarization: string;
  bandDescription: string;
  meanBackscatterDb?: number;
  waterCoverageKm2?: number;
  previewImageUrl: string;
  histogram: { db: number; count: number }[];
}

export interface DisasterComparisonData {
  disasterName: string;
  location: string;
  coordinates: [number, number];
  bounds: [[number, number], [number, number]];
  preEvent: SatelliteComparisonLayer;
  postEvent: SatelliteComparisonLayer;
  differenceMetrics: {
    backscatterDropDb: number;
    thresholdCutoffDb: number;
    floodedAreaKm2: number;
    waterExpansionFactor: string;
    confidenceScore: number;
    sarCoherenceLossPct: number;
  };
  geeScriptCode: {
    javascript: string;
    python: string;
  };
}

export interface NasaGpmGranule {
  granuleId: string;
  datasetTitle: string;
  timeStart: string;
  timeEnd?: string;
  dataCenter: string;
  archiveSizeMb?: number;
  cloudHosted: boolean;
  downloadUrl?: string;
  browseUrl?: string;
}

export interface NasaEarthdataStatusResponse {
  isConfigured: boolean;
  provider: string;
  username: string | null;
  authVerified: boolean;
  activeSensors: string[];
  tokenExpiresAt: string | null;
  latestGranule?: NasaGpmGranule | null;
  granulesCount?: number;
  authError?: string | null;
}

