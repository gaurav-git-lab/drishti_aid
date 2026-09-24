import express from 'express';
import { Readable } from 'stream';
import { SCENARIOS, getScenario } from './geoData.ts';
import { runSarChangeDetection } from './changeDetection.ts';
import { computeRiskZones } from './riskScoring.ts';
import { computeSafeRoutes } from './routingEngine.ts';
import { generateTacticalBriefing } from './geminiService.ts';
import { getGeeStatus, getEarthEngineDisasterComparison, generateEarthEngineScript, getGoogleOAuthToken } from './geeService.ts';
import { getNasaEarthdataStatus, getNasaGpmGranules } from './nasaEarthdataService.ts';
import { getCopernicusStatus, searchSentinelData, getQuicklookImageStream } from './copernicusService.ts';
import { getRainViewerRadar, getMeteorologicalWind } from './weatherService.ts';

export function createExpressApp() {
  const app = express();
  app.use(express.json());

  const router = express.Router();

  // Health check
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'DRISHTI-AID Satellite Disaster Response Pipeline',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // NASA Earthdata 1: Live Status & Token Authentication Verification
  router.get('/nasa/status', async (req, res) => {
    try {
      const status = await getNasaEarthdataStatus();
      res.json({ success: true, ...status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // NASA Earthdata 2: Live GPM Precipitation Granules for Active Disaster
  router.get('/nasa/granules', async (req, res) => {
    try {
      const scenarioId = (req.query.scenario as string) || 'mumbai';
      const granules = await getNasaGpmGranules(scenarioId);
      res.json({ success: true, granules });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Copernicus 1: Auth Status
  router.get('/copernicus/status', async (req, res) => {
    try {
      const status = await getCopernicusStatus();
      res.json({ success: true, ...status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Copernicus 2: Search Sentinel Data
  router.get('/copernicus/search', async (req, res) => {
    try {
      const collection = (req.query.collection as string) || 'SENTINEL-1';
      const scenarioId = (req.query.scenario as string) || 'mumbai';
      const data = await searchSentinelData(scenarioId, collection);
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Copernicus 3: Fetch Quicklook Preview
  router.get('/copernicus/quicklook/:id', async (req, res) => {
    try {
      const { stream, contentType } = await getQuicklookImageStream(req.params.id);
      res.setHeader('Content-Type', contentType);
      if (stream) {
        Readable.fromWeb(stream as any).pipe(res);
      } else {
        res.status(404).send('Quicklook image not available');
      }
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  });

  // GEE 1: Status & Credentials Check with live OAuth2 token verification
  router.get('/gee/status', async (req, res) => {
    try {
      await getGoogleOAuthToken();
    } catch (e) {
      console.warn('Google Earth Engine Auth Token check:', e);
    }
    const status = getGeeStatus();
    res.json({
      success: true,
      ...status,
    });
  });

  // GEE 2: Real Pre vs Post Disaster Satellite Comparison
  router.get('/gee/comparison', (req, res) => {
    const scenarioId = (req.query.scenario as string) || 'mumbai';
    const comparison = getEarthEngineDisasterComparison(scenarioId);
    const status = getGeeStatus();
    res.json({
      success: true,
      comparison,
      status,
    });
  });

  // GEE 3: Export Earth Engine Scripts
  router.get('/gee/script', (req, res) => {
    const scenarioId = (req.query.scenario as string) || 'mumbai';
    const scripts = generateEarthEngineScript(scenarioId);
    res.json({
      success: true,
      scripts,
    });
  });

  // 1. GET /api/data - Load baseline imagery, reference layers & shelters
  router.get('/data', (req, res) => {
    const scenarioId = (req.query.scenario as string) || 'mumbai';
    const scenario = getScenario(scenarioId);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      scenario,
      availableScenarios: Object.keys(SCENARIOS).map((k) => ({
        id: SCENARIOS[k].id,
        name: SCENARIOS[k].name,
        state: SCENARIOS[k].state,
        riverBasin: SCENARIOS[k].riverBasin,
      })),
    });
  });

  // 2. POST /api/change-detection - Compare pre/post SAR -> output flood GeoJSON
  router.post('/change-detection', (req, res) => {
    const { scenarioId = 'mumbai', timelineHour = 4, thresholdDb = -14.2 } = req.body || {};
    const result = runSarChangeDetection(scenarioId, Number(timelineHour), Number(thresholdDb));
    res.json({
      success: true,
      ...result,
    });
  });

  // 3. POST /api/risk-zones - Overlay flood with population -> risk scores
  router.post('/risk-zones', (req, res) => {
    const { scenarioId = 'mumbai', timelineHour = 4 } = req.body || {};
    const result = computeRiskZones(scenarioId, Number(timelineHour));
    res.json({
      success: true,
      ...result,
    });
  });

  // 4. POST /api/routes - Compute A* safe routes avoiding flooded cells to shelters/hospitals
  router.post('/routes', (req, res) => {
    const { scenarioId = 'mumbai', timelineHour = 4, origin } = req.body || {};
    const result = computeSafeRoutes(scenarioId, Number(timelineHour), origin);
    res.json({
      success: true,
      ...result,
    });
  });

  // 5. POST /api/ai-briefing - Gemini tactical situational dispatch advisory
  router.post('/ai-briefing', async (req, res) => {
    try {
      const briefing = await generateTacticalBriefing(req.body);
      res.json({
        success: true,
        briefing,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Weather 1: Live RainViewer Doppler Radar Frames & Tiles
  router.get('/weather/radar', async (req, res) => {
    try {
      const radar = await getRainViewerRadar();
      res.json({ success: true, ...radar });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Weather 2: Live Meteorological Wind Vectors & Surface Conditions
  router.get('/weather/wind', async (req, res) => {
    try {
      const scenarioId = (req.query.scenario as string) || 'mumbai';
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : 19.076;
      const lon = req.query.lon ? parseFloat(req.query.lon as string) : 72.877;
      const wind = await getMeteorologicalWind(scenarioId, lat, lon);
      res.json({ success: true, ...wind });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. GET /api/report or POST /api/report - Generate PDF situational report data
  router.all('/report', async (req, res) => {
    const scenarioId = (req.body?.scenarioId || req.query.scenario || 'mumbai') as string;
    const timelineHour = Number(req.body?.timelineHour || req.query.timelineHour || 4);

    const scenario = getScenario(scenarioId);
    const changeDetection = runSarChangeDetection(scenarioId, timelineHour);
    const riskZones = computeRiskZones(scenarioId, timelineHour);
    const routes = computeSafeRoutes(scenarioId, timelineHour);

    const briefing = await generateTacticalBriefing({
      scenarioName: scenario.name,
      riverBasin: scenario.riverBasin,
      floodedAreaKm2: changeDetection.floodedAreaKm2,
      floodPercentage: changeDetection.floodPercentage,
      criticalZonesCount: riskZones.criticalZonesCount,
      totalPopulationAtRisk: riskZones.totalPopulationAtRisk,
      routesComputed: routes.routesComputed,
      clearRoutesCount: routes.clearRoutesCount,
      timelineHour,
    });

    res.json({
      success: true,
      reportId: `DRISHTI-SITREP-${Date.now().toString().slice(-6)}`,
      generatedAt: new Date().toISOString(),
      scenario,
      timelineHour,
      changeDetection,
      riskZones,
      routes,
      briefing,
    });
  });

  // Mount router under /api AND root / so both /api/foo and /foo work in any serverless or proxied context
  app.use('/api', router);
  app.use('/', router);

  return app;
}
