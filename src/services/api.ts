/**
 * DRISHTI-AID Backend API Client
 */

import {
  DisasterScenario,
  ChangeDetectionResult,
  RiskAnalysisResult,
  RoutePlanningResult,
  AiBriefingResponse,
} from '../types';

export async function fetchScenarioData(
  scenarioId: string = 'mumbai'
): Promise<{ scenario: DisasterScenario }> {
  const res = await fetch(`/api/data?scenario=${encodeURIComponent(scenarioId)}`);
  if (!res.ok) throw new Error(`Failed to load scenario data: ${res.statusText}`);
  return res.json();
}

export async function runChangeDetectionApi(
  scenarioId: string,
  timelineHour: number,
  thresholdDb: number = -14.2
): Promise<ChangeDetectionResult> {
  const res = await fetch('/api/change-detection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId, timelineHour, thresholdDb }),
  });
  if (!res.ok) throw new Error(`Change detection failed: ${res.statusText}`);
  return res.json();
}

export async function computeRiskZonesApi(
  scenarioId: string,
  timelineHour: number
): Promise<RiskAnalysisResult> {
  const res = await fetch('/api/risk-zones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId, timelineHour }),
  });
  if (!res.ok) throw new Error(`Risk scoring failed: ${res.statusText}`);
  return res.json();
}

export async function planSafeRoutesApi(
  scenarioId: string,
  timelineHour: number,
  origin?: [number, number]
): Promise<RoutePlanningResult> {
  const res = await fetch('/api/routes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId, timelineHour, origin }),
  });
  if (!res.ok) throw new Error(`Safe routing failed: ${res.statusText}`);
  return res.json();
}

export async function fetchAiBriefingApi(
  payload: {
    scenarioName: string;
    riverBasin: string;
    floodedAreaKm2: number;
    floodPercentage: number;
    criticalZonesCount: number;
    totalPopulationAtRisk: number;
    routesComputed: number;
    clearRoutesCount: number;
    timelineHour: number;
  }
): Promise<{ briefing: AiBriefingResponse }> {
  const res = await fetch('/api/ai-briefing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Tactical briefing failed: ${res.statusText}`);
  return res.json();
}

export async function fetchFullReportData(
  scenarioId: string,
  timelineHour: number
): Promise<any> {
  const res = await fetch('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarioId, timelineHour }),
  });
  if (!res.ok) throw new Error(`Report generation failed: ${res.statusText}`);
  return res.json();
}

export async function fetchWeatherRadarApi(): Promise<{
  success: boolean;
  host: string;
  generated: number;
  past: Array<{ time: number; path: string }>;
  nowcast: Array<{ time: number; path: string }>;
  latestTileUrl: string;
}> {
  try {
    const res = await fetch('/api/weather/radar');
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend radar proxy failed, trying direct RainViewer:', e);
  }

  // Direct client fallback if proxy unreachable
  const direct = await fetch('https://api.rainviewer.com/public/weather-maps.json');
  const data = await direct.json();
  const host = data.host || 'https://tilecache.rainviewer.com';
  const past = data.radar?.past || [];
  const nowcast = data.radar?.nowcast || [];
  const latest = past[past.length - 1] || nowcast[0] || { path: '/v2/radar/now', time: Math.floor(Date.now() / 1000) };
  return {
    success: true,
    host,
    generated: data.generated,
    past,
    nowcast,
    latestTileUrl: `${host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`,
  };
}

export async function fetchWeatherWindApi(
  scenarioId: string = 'mumbai',
  lat: number = 19.076,
  lon: number = 72.877
): Promise<{
  success: boolean;
  latitude: number;
  longitude: number;
  scenarioId: string;
  windSpeedKmh: number;
  windDirectionDeg: number;
  windGustsKmh: number;
  temperatureC: number;
  pressureHpa: number;
  beaufortScale: number;
  beaufortDescription: string;
  source: string;
  updatedAt: string;
}> {
  try {
    const res = await fetch(`/api/weather/wind?scenario=${encodeURIComponent(scenarioId)}&lat=${lat}&lon=${lon}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Backend wind proxy failed, trying direct Open-Meteo:', e);
  }

  // Direct client fallback
  try {
    const direct = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure`);
    if (direct.ok) {
      const data = await direct.json();
      const cur = data.current || {};
      const speed = Number(cur.wind_speed_10m || 28.5);
      return {
        success: true,
        latitude: lat,
        longitude: lon,
        scenarioId,
        windSpeedKmh: speed,
        windDirectionDeg: Math.round(Number(cur.wind_direction_10m || 245)),
        windGustsKmh: Number(cur.wind_gusts_10m || speed * 1.35),
        temperatureC: Number(cur.temperature_2m || 27.5),
        pressureHpa: Number(cur.surface_pressure || 1004.0),
        beaufortScale: speed > 60 ? 8 : speed > 40 ? 6 : 4,
        beaufortDescription: speed > 60 ? 'Gale' : speed > 40 ? 'Strong Breeze' : 'Moderate Breeze',
        source: 'direct_open_meteo',
        updatedAt: new Date().toISOString(),
      };
    }
  } catch (e2) {
    // Calibrated scenario fallback
  }

  return {
    success: true,
    latitude: lat,
    longitude: lon,
    scenarioId,
    windSpeedKmh: 42.0,
    windDirectionDeg: 245,
    windGustsKmh: 64.0,
    temperatureC: 27.5,
    pressureHpa: 998.0,
    beaufortScale: 6,
    beaufortDescription: 'Strong Breeze',
    source: 'offline_fallback',
    updatedAt: new Date().toISOString(),
  };
}
