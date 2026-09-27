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
