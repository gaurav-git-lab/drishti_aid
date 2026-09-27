/**
 * SAR Change Detection Service
 * Simulates Sentinel-1 C-Band SAR microwave backscatter analysis
 * Water displays specular reflection -> drastic backscatter drop (typically < -15 dB or pre/post ratio < 0.45)
 */

import { SCENARIOS, getScenario } from './geoData.ts';

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
    coordinates: number[][][]; // [ [ [lng, lat], [lng, lat], ... ] ]
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

// Generate realistic SAR flood polygon contours around river basins and low-elevation cells
export function runSarChangeDetection(
  scenarioId: string,
  timelineHour: number = 4,
  thresholdDb: number = -14.2
): ChangeDetectionResult {
  const startTime = Date.now();
  const scenario = getScenario(scenarioId);
  const [epicenterLat, epicenterLng] = scenario.epicenter;

  // Growth scale depending on timeline hour (0 = none, 2 = rising, 6 = peak, 12 = receding)
  const timeFactor =
    timelineHour <= 0
      ? 0.05
      : timelineHour <= 2
      ? 0.55
      : timelineHour <= 6
      ? 1.0
      : 0.82;

  const features: FloodPolygonFeature[] = [];

  if (scenarioId === 'mumbai') {
    // 1. Mithi River Main Breach (Kurla West / CST Road) - Expanded for 250 km² extent
    const rad1 = 0.028 * timeFactor;
    features.push({
      type: 'Feature',
      properties: {
        id: 'fl_mum_1',
        zoneName: 'Mithi River Basin & Kurla West Sector',
        floodDepthM: +(2.8 * timeFactor).toFixed(2),
        sarBackscatterDropDb: -18.4,
        confidenceScore: 0.96,
        areaKm2: +(24.8 * timeFactor).toFixed(2),
        waterType: 'river_breach',
        severity: 'critical',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [epicenterLng - rad1 * 1.5, epicenterLat - rad1 * 0.8],
            [epicenterLng - rad1 * 0.7, epicenterLat + rad1 * 1.2],
            [epicenterLng + rad1 * 0.5, epicenterLat + rad1 * 1.5],
            [epicenterLng + rad1 * 1.4, epicenterLat + rad1 * 0.5],
            [epicenterLng + rad1 * 1.1, epicenterLat - rad1 * 0.6],
            [epicenterLng + rad1 * 0.3, epicenterLat - rad1 * 1.2],
            [epicenterLng - rad1 * 0.9, epicenterLat - rad1 * 1.0],
            [epicenterLng - rad1 * 1.5, epicenterLat - rad1 * 0.8],
          ],
        ],
      },
    });

    // 2. Dharavi 90ft Corridor Lowland
    const rad2 = 0.022 * timeFactor;
    features.push({
      type: 'Feature',
      properties: {
        id: 'fl_mum_2',
        zoneName: 'Dharavi Slum Cluster & Mahim Creek Backwater',
        floodDepthM: +(1.9 * timeFactor).toFixed(2),
        sarBackscatterDropDb: -16.2,
        confidenceScore: 0.92,
        areaKm2: +(18.5 * timeFactor).toFixed(2),
        waterType: 'lowland_inundation',
        severity: 'critical',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.852 - rad2, 19.043 - rad2 * 0.6],
            [72.852 - rad2 * 0.4, 19.043 + rad2 * 0.9],
            [72.852 + rad2 * 1.1, 19.043 + rad2 * 0.7],
            [72.852 + rad2 * 1.3, 19.043 - rad2 * 0.4],
            [72.852 + rad2 * 0.5, 19.043 - rad2 * 1.1],
            [72.852 - rad2, 19.043 - rad2 * 0.6],
          ],
        ],
      },
    });

    // 3. Kalina CST Road / Mumbai Airport Southern Perimeter
    const rad3 = 0.018 * timeFactor;
    features.push({
      type: 'Feature',
      properties: {
        id: 'fl_mum_3',
        zoneName: 'Kalina SCLR Underpass & Airside Runoff',
        floodDepthM: +(1.6 * timeFactor).toFixed(2),
        sarBackscatterDropDb: -15.1,
        confidenceScore: 0.89,
        areaKm2: +(12.6 * timeFactor).toFixed(2),
        waterType: 'urban_waterlog',
        severity: 'severe',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.868 - rad3, 19.072 - rad3 * 0.5],
            [72.868 - rad3 * 0.3, 19.072 + rad3 * 1.1],
            [72.868 + rad3 * 1.2, 19.072 + rad3 * 0.6],
            [72.868 + rad3 * 0.9, 19.072 - rad3 * 0.8],
            [72.868 - rad3, 19.072 - rad3 * 0.5],
          ],
        ],
      },
    });

    // 4. Chunabhatti / Sion Rail Sump
    const rad4 = 0.016 * timeFactor;
    features.push({
      type: 'Feature',
      properties: {
        id: 'fl_mum_4',
        zoneName: 'Chunabhatti Rail Yard & Sion Canal Overflow',
        floodDepthM: +(1.4 * timeFactor).toFixed(2),
        sarBackscatterDropDb: -14.8,
        confidenceScore: 0.87,
        areaKm2: +(9.2 * timeFactor).toFixed(2),
        waterType: 'urban_waterlog',
        severity: 'moderate',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.876 - rad4, 19.052 - rad4],
            [72.876 - rad4 * 0.2, 19.052 + rad4 * 1.2],
            [72.876 + rad4 * 1.4, 19.052 + rad4 * 0.4],
            [72.876 + rad4 * 0.7, 19.052 - rad4 * 0.9],
            [72.876 - rad4, 19.052 - rad4],
          ],
        ],
      },
    });
  } else if (scenarioId === 'chennai') {
    // Chennai Adyar River Inundation - Expanded for 250 km² extent
    const rad1 = 0.030 * timeFactor;
    features.push({
      type: 'Feature',
      properties: {
        id: 'fl_chn_1',
        zoneName: 'Adyar River Channel & Saidapet Causeway',
        floodDepthM: +(3.2 * timeFactor).toFixed(2),
        sarBackscatterDropDb: -19.1,
        confidenceScore: 0.97,
        areaKm2: +(32.4 * timeFactor).toFixed(2),
        waterType: 'river_breach',
        severity: 'critical',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [80.220 - rad1 * 1.6, 13.015 - rad1 * 0.4],
            [80.220 - rad1 * 0.5, 13.015 + rad1 * 0.9],
            [80.220 + rad1 * 1.4, 13.015 + rad1 * 1.2],
            [80.220 + rad1 * 1.8, 13.015 - rad1 * 0.3],
            [80.220 + rad1 * 0.8, 13.015 - rad1 * 1.1],
            [80.220 - rad1 * 1.6, 13.015 - rad1 * 0.4],
          ],
        ],
      },
    });
    const rad2 = 0.020 * timeFactor;
    features.push({
      type: 'Feature',
      properties: {
        id: 'fl_chn_2',
        zoneName: 'Kotturpuram Housing Board Colony Submersion',
        floodDepthM: +(2.5 * timeFactor).toFixed(2),
        sarBackscatterDropDb: -17.5,
        confidenceScore: 0.93,
        areaKm2: +(17.8 * timeFactor).toFixed(2),
        waterType: 'urban_waterlog',
        severity: 'critical',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [80.244 - rad2, 13.018 - rad2],
            [80.244 - rad2 * 0.2, 13.018 + rad2 * 1.2],
            [80.244 + rad2 * 1.3, 13.018 + rad2 * 0.5],
            [80.244 + rad2 * 0.8, 13.018 - rad2 * 0.9],
            [80.244 - rad2, 13.018 - rad2],
          ],
        ],
      },
    });
  } else {
    // Kerala Periyar Inundation - Expanded for 250 km² extent
    const rad1 = 0.032 * timeFactor;
    features.push({
      type: 'Feature',
      properties: {
        id: 'fl_ker_1',
        zoneName: 'Periyar River Spill & Aluva Manappuram',
        floodDepthM: +(3.5 * timeFactor).toFixed(2),
        sarBackscatterDropDb: -20.2,
        confidenceScore: 0.98,
        areaKm2: +(36.5 * timeFactor).toFixed(2),
        waterType: 'river_breach',
        severity: 'critical',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [76.353 - rad1 * 1.5, 10.105 - rad1 * 0.5],
            [76.353 - rad1 * 0.4, 10.105 + rad1 * 1.1],
            [76.353 + rad1 * 1.4, 10.105 + rad1 * 0.8],
            [76.353 + rad1 * 1.6, 10.105 - rad1 * 0.4],
            [76.353 + rad1 * 0.6, 10.105 - rad1 * 1.2],
            [76.353 - rad1 * 1.5, 10.105 - rad1 * 0.5],
          ],
        ],
      },
    });
  }

  // Dynamic flood features for any searched city scenario
  if (features.length === 0) {
    const rad = 0.025 * timeFactor;
    features.push({
      type: 'Feature',
      properties: {
        id: `fl_${scenarioId}_1`,
        zoneName: `${scenario.name} Core Breach Sector`,
        floodDepthM: +(2.6 * timeFactor).toFixed(2),
        sarBackscatterDropDb: -18.2,
        confidenceScore: 0.95,
        areaKm2: +(26.4 * timeFactor).toFixed(2),
        waterType: 'river_breach',
        severity: 'critical',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [epicenterLng - rad * 1.4, epicenterLat - rad * 0.7],
            [epicenterLng - rad * 0.5, epicenterLat + rad * 1.2],
            [epicenterLng + rad * 0.6, epicenterLat + rad * 1.4],
            [epicenterLng + rad * 1.3, epicenterLat + rad * 0.4],
            [epicenterLng + rad * 1.0, epicenterLat - rad * 0.7],
            [epicenterLng - rad * 0.8, epicenterLat - rad * 1.1],
            [epicenterLng - rad * 1.4, epicenterLat - rad * 0.7],
          ],
        ],
      },
    });

    const rad2 = 0.019 * timeFactor;
    features.push({
      type: 'Feature',
      properties: {
        id: `fl_${scenarioId}_2`,
        zoneName: `${scenario.riverBasin} Lowland Catchment`,
        floodDepthM: +(1.8 * timeFactor).toFixed(2),
        sarBackscatterDropDb: -15.8,
        confidenceScore: 0.91,
        areaKm2: +(17.2 * timeFactor).toFixed(2),
        waterType: 'lowland_inundation',
        severity: 'severe',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [epicenterLng - rad2 * 1.8, epicenterLat + rad2 * 0.4],
            [epicenterLng - rad2 * 0.9, epicenterLat + rad2 * 1.6],
            [epicenterLng + rad2 * 0.2, epicenterLat + rad2 * 1.3],
            [epicenterLng - rad2 * 0.4, epicenterLat + rad2 * 0.1],
            [epicenterLng - rad2 * 1.8, epicenterLat + rad2 * 0.4],
          ],
        ],
      },
    });

    const rad3 = 0.015 * timeFactor;
    features.push({
      type: 'Feature',
      properties: {
        id: `fl_${scenarioId}_3`,
        zoneName: `${scenario.name} Urban Waterlogging Basin`,
        floodDepthM: +(1.2 * timeFactor).toFixed(2),
        sarBackscatterDropDb: -14.6,
        confidenceScore: 0.88,
        areaKm2: +(11.5 * timeFactor).toFixed(2),
        waterType: 'urban_waterlog',
        severity: 'moderate',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [epicenterLng + rad3 * 0.4, epicenterLat - rad3 * 1.8],
            [epicenterLng + rad3 * 1.5, epicenterLat - rad3 * 0.8],
            [epicenterLng + rad3 * 1.8, epicenterLat - rad3 * 1.6],
            [epicenterLng + rad3 * 0.9, epicenterLat - rad3 * 2.2],
            [epicenterLng + rad3 * 0.4, epicenterLat - rad3 * 1.8],
          ],
        ],
      },
    });
  }

  const totalFloodedAreaKm2 = +features
    .reduce((sum, f) => sum + f.properties.areaKm2, 0)
    .toFixed(2);
  const floodPercentage = +(
    (totalFloodedAreaKm2 / scenario.areaKm2) *
    100
  ).toFixed(1);

  const processingTimeMs = Math.floor(Math.random() * 250) + 380; // realistic fast computation < 1s

  return {
    scenarioId,
    timestamp: new Date().toISOString(),
    timelineHour,
    sensor: scenario.satelliteSensor,
    polarization: scenario.sarPolarization,
    thresholdAppliedDb: thresholdDb,
    totalAreaKm2: scenario.areaKm2,
    floodedAreaKm2: totalFloodedAreaKm2,
    floodPercentage,
    processingTimeMs,
    confidenceAverage: 0.93,
    coherenceMean: 0.28,
    geoJson: {
      type: 'FeatureCollection',
      features,
    },
  };
}
