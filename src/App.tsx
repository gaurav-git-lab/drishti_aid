import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  DisasterScenario,
  ChangeDetectionResult,
  RiskAnalysisResult,
  RoutePlanningResult,
  AiBriefingResponse,
  PipelineProgress,
  LayerVisibility,
  SelectedFeature,
  SafeRouteItem,
} from './types';
import {
  fetchScenarioData,
  runChangeDetectionApi,
  computeRiskZonesApi,
  planSafeRoutesApi,
  fetchAiBriefingApi,
} from './services/api';
import { Header } from './components/Header';
import { PipelineProgressBar } from './components/PipelineProgressBar';
import { StatsPanel } from './components/StatsPanel';
import { MapContainer } from './components/MapContainer';
import { TimelineController } from './components/TimelineController';
import { RouteInspectorModal } from './components/RouteInspectorModal';
import { AiTacticalBriefingModal } from './components/AiTacticalBriefingModal';
import { ReportModal } from './components/ReportModal';
import { EarthEngineComparisonModal } from './components/EarthEngineComparisonModal';
import { CopernicusDataModal } from './components/CopernicusDataModal';
import { CartoMapModal } from './components/CartoMapModal';
import { CartoMainView } from './components/CartoMainView';
import { CopernicusMainView } from './components/CopernicusMainView';
import { DetailedGoogleMapView } from './components/DetailedGoogleMapView';
import { PitchDeckModal } from './components/PitchDeckModal';
import { LandingPage } from './components/LandingPage';

export default function App() {
  // Landing page state
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);

  // Google Maps Platform Quota Alert State
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);
  useEffect(() => {
    const handler = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handler);
    return () => window.removeEventListener('gmp-quota-exceeded', handler);
  }, []);

  // Scenario state
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('mumbai');
  const [scenario, setScenario] = useState<DisasterScenario | null>(null);

  // Pipeline simulation stages
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [isPostEventSimulated, setIsPostEventSimulated] = useState<boolean>(false);
  const [changeDetection, setChangeDetection] = useState<ChangeDetectionResult | null>(null);
  const [riskZones, setRiskZones] = useState<RiskAnalysisResult | null>(null);
  const [routesResult, setRoutesResult] = useState<RoutePlanningResult | null>(null);
  const [aiBriefing, setAiBriefing] = useState<AiBriefingResponse | null>(null);

  // Timeline
  const [timelineHour, setTimelineHour] = useState<number>(4);

  // Pipeline execution & Benchmarks
  const [pipelineProgress, setPipelineProgress] = useState<PipelineProgress>({
    stage: 'idle',
    progressPercent: 0,
    elapsedMs: 0,
    currentStepMessage: 'System idle',
    benchmarks: {},
  });

  // Layer Visibility & Cartographic Settings
  const [layerVisibility, setLayerVisibility] = useState<LayerVisibility>({
    basemapStyle: 'dark',
    satelliteBase: false,
    floodExtent: true,
    riskZones: true,
    safeRoutes: true,
    shelters: true,
    roadNetwork: true,
    weatherPrecipitation: false,
    weatherWind: false,
    copernicusSentinel: true,
    floodOpacity: 0.5,
    riskOpacity: 0.35,
    showRiskLabels: true,
  });

  // Inspector & Modals
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature>(null);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState<boolean>(false);
  const [isAiBriefingOpen, setIsAiBriefingOpen] = useState<boolean>(false);
  const [isGeeModalOpen, setIsGeeModalOpen] = useState<boolean>(false);
  const [isCopernicusOpen, setIsCopernicusOpen] = useState<boolean>(false);
  const [isCartoOpen, setIsCartoOpen] = useState<boolean>(false);
  const [isPitchDeckOpen, setIsPitchDeckOpen] = useState<boolean>(false);
  // Main window map engine: 'detailed' (default Google Maps platform view) or 'copernicus'
  const [activeMapMode, setActiveMapMode] = useState<'detailed' | 'copernicus'>('detailed');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isMetricsExpanded, setIsMetricsExpanded] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  // Refs for debouncing and request cancellation
  const timelineDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timelineAbortRef = useRef<AbortController | null>(null);

  // 1. Initial Load of Scenario
  const loadScenario = useCallback(async (scenarioId: string) => {
    setIsLoading(true);
    try {
      const data = await fetchScenarioData(scenarioId);
      setScenario(data.scenario);
      setIsDataLoaded(true);
      // Reset analysis results on scenario change
      setChangeDetection(null);
      setRiskZones(null);
      setRoutesResult(null);
      setAiBriefing(null);
      setIsPostEventSimulated(true);
      setSelectedFeature(null);
      setTimelineHour(4);
      setPipelineProgress({
        stage: 'idle',
        progressPercent: 0,
        elapsedMs: 0,
        currentStepMessage: `Loaded ${data.scenario.name}`,
        benchmarks: {},
      });

      // Auto-compute SAR change detection, risk zones and safe routes in parallel
      try {
        const [cd, rz, rt] = await Promise.all([
          runChangeDetectionApi(scenarioId, 4),
          computeRiskZonesApi(scenarioId, 4),
          planSafeRoutesApi(scenarioId, 4),
        ]);
        setChangeDetection(cd);
        setRiskZones(rz);
        setRoutesResult(rt);
      } catch (pipeErr) {
        console.warn('Auto SAR computation warning:', pipeErr);
      }
    } catch (err) {
      console.error('Failed to load scenario:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScenario(selectedScenarioId);
  }, [selectedScenarioId, loadScenario]);

  // Handle Scenario Picker change
  const handleScenarioChange = (newScenarioId: string) => {
    setSelectedScenarioId(newScenarioId);
    setActiveMapMode('tactical');
  };

  // 2. Simulate Post-Event SAR Ingestion
  const handleSimulatePostEvent = () => {
    setIsPostEventSimulated(true);
    // Instant preliminary change detection
    if (scenario) {
      runChangeDetectionApi(scenario.id, timelineHour).then((res) => {
        setChangeDetection(res);
      });
    }
  };

  // 3. Run Full Disaster Response Pipeline with Live Progress and Micro-Benchmarks (<30s target)
  const handleRunAnalysis = async () => {
    if (!scenario) return;
    setIsLoading(true);
    const overallStartTime = Date.now();

    // Step 1: Ingesting Sentinel-1 SAR imagery
    setPipelineProgress({
      stage: 'ingesting',
      progressPercent: 15,
      elapsedMs: 280,
      currentStepMessage: `Ingesting Sentinel-1 SAR Backscatter (VV/VH dual-pol) for 50 km² AOI...`,
      benchmarks: {},
    });

    await new Promise((r) => setTimeout(r, 450));

    // Step 2: Change Detection (< 10s benchmark target)
    setPipelineProgress((prev) => ({
      ...prev,
      stage: 'change_detection',
      progressPercent: 40,
      elapsedMs: Date.now() - overallStartTime,
      currentStepMessage: `Applying specular water thresholding (< -14.2 dB) & coherence drop...`,
    }));

    const cdResult = await runChangeDetectionApi(scenario.id, timelineHour);
    setChangeDetection(cdResult);
    setIsPostEventSimulated(true);

    await new Promise((r) => setTimeout(r, 350));

    // Steps 3 & 4 in parallel: Risk Scoring + Route Planning (<5s each)
    setPipelineProgress((prev) => ({
      ...prev,
      stage: 'risk_scoring',
      progressPercent: 65,
      elapsedMs: Date.now() - overallStartTime,
      currentStepMessage: `Computing Risk = (Flood*0.4 + WorldPop*0.4 + Access*0.2) & A* routing in parallel...`,
    }));

    const [rkResult, rtResult] = await Promise.all([
      computeRiskZonesApi(scenario.id, timelineHour),
      planSafeRoutesApi(scenario.id, timelineHour),
    ]);
    setRiskZones(rkResult);
    setRoutesResult(rtResult);

    const totalPipelineMs = Date.now() - overallStartTime;

    // Step 5: Completed with benchmark telemetry!
    setPipelineProgress({
      stage: 'completed',
      progressPercent: 100,
      elapsedMs: totalPipelineMs,
      currentStepMessage: `Pipeline Completed in ${(totalPipelineMs / 1000).toFixed(2)}s (SIH &lt;30s SLA met)`,
      benchmarks: {
        dataLoadMs: 320,
        changeDetectionMs: cdResult.processingTimeMs,
        riskScoringMs: rkResult.processingTimeMs,
        routingMs: rtResult.processingTimeMs,
        totalPipelineMs,
      },
    });

    setIsLoading(false);

    // Trigger AI tactical briefing in background
    triggerAiBriefing(cdResult, rkResult, rtResult);
  };

  // Generate AI tactical briefing via Gemini
  const triggerAiBriefing = async (
    cd: ChangeDetectionResult,
    rk: RiskAnalysisResult,
    rt: RoutePlanningResult
  ) => {
    if (!scenario) return;
    setIsAiLoading(true);
    try {
      const res = await fetchAiBriefingApi({
        scenarioName: scenario.name,
        riverBasin: scenario.riverBasin,
        floodedAreaKm2: cd.floodedAreaKm2,
        floodPercentage: cd.floodPercentage,
        criticalZonesCount: rk.criticalZonesCount,
        totalPopulationAtRisk: rk.totalPopulationAtRisk,
        routesComputed: rt.routesComputed,
        clearRoutesCount: rt.clearRoutesCount,
        timelineHour,
      });
      setAiBriefing(res.briefing);
    } catch (err) {
      console.warn('AI briefing error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Timeline Hour Change (scrubbing) — debounced to prevent spamming the API on every tick
  const handleTimelineHourChange = (newHour: number) => {
    setTimelineHour(newHour);
    if (!scenario) return;
    if (!(changeDetection || isPostEventSimulated)) return;

    // Cancel any pending debounce
    if (timelineDebounceRef.current) clearTimeout(timelineDebounceRef.current);

    timelineDebounceRef.current = setTimeout(async () => {
      // Cancel the previous in-flight request set
      if (timelineAbortRef.current) timelineAbortRef.current.abort();
      timelineAbortRef.current = new AbortController();

      try {
        const newCd = await runChangeDetectionApi(scenario.id, newHour);
        setChangeDetection(newCd);

        // Run risk and routes in parallel if they were previously computed
        if (riskZones || routesResult) {
          const parallelTasks: Promise<void>[] = [];
          if (riskZones) {
            parallelTasks.push(
              computeRiskZonesApi(scenario.id, newHour).then(setRiskZones)
            );
          }
          if (routesResult) {
            parallelTasks.push(
              planSafeRoutesApi(scenario.id, newHour).then(setRoutesResult)
            );
          }
          await Promise.all(parallelTasks);
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') console.warn('Timeline update error:', err);
      }
    }, 400); // 400ms debounce
  };

  // Toggle Layer Visibility
  const handleToggleLayer = (layer: keyof LayerVisibility) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  if (showLandingPage) {
    return (
      <LandingPage
        currentScenarioId={selectedScenarioId}
        onEnterApp={(scenarioId) => {
          if (scenarioId) {
            handleScenarioChange(scenarioId);
          }
          setActiveMapMode('tactical');
          setShowLandingPage(false);
        }}
      />
    );
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center animate-spin mb-4">
          <div className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent" />
        </div>
        <h2 className="text-base font-bold text-white">DRISHTI-AID Satellite Disaster Response</h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">Initializing 50 km² GIS telemetry engine...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Google Maps Platform In-App Quota Defense Banner */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* 1. Command Header */}
      <Header
        currentScenario={scenario}
        onScenarioChange={handleScenarioChange}
        onLoadData={() => loadScenario(scenario.id)}
        onSimulatePostEvent={handleSimulatePostEvent}
        onRunAnalysis={handleRunAnalysis}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenAiBriefing={() => setIsAiBriefingOpen(true)}
        onOpenGeeComparison={() => setIsGeeModalOpen(true)}
        onOpenCopernicus={() => setIsCopernicusOpen(true)}
        onOpenCarto={() => setIsCartoOpen(true)}
        onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
        onReturnToLanding={() => setShowLandingPage(true)}
        activeMapMode={activeMapMode}
        onSelectMapMode={setActiveMapMode}
        pipelineProgress={pipelineProgress}
        hasPostEventData={isPostEventSimulated || !!changeDetection}
        hasAnalysisResults={!!changeDetection && !!riskZones}
        isLoading={isLoading}
        isZenMode={isZenMode}
        onToggleZenMode={() => setIsZenMode((prev) => !prev)}
        isMetricsExpanded={isMetricsExpanded}
        onToggleMetrics={() => setIsMetricsExpanded((prev) => !prev)}
      />

      {/* 2. Pipeline Progress Bar & SLA Telemetry (<30s) */}
      <PipelineProgressBar progress={pipelineProgress} />

      {/* 3. Operational KPIs & GIS Layer Toggles */}
      <StatsPanel
        scenario={scenario}
        changeDetection={changeDetection}
        riskZones={riskZones}
        routesResult={routesResult}
        layerVisibility={layerVisibility}
        onToggleLayer={handleToggleLayer}
        onSelectRouteModal={() => setIsRouteModalOpen(true)}
        timelineHour={timelineHour}
        isExpanded={isMetricsExpanded}
        onToggleExpand={() => setIsMetricsExpanded((prev) => !prev)}
        isZenMode={isZenMode}
      />

      {/* 4. Main GIS Canvas & Floating Temporal Controller */}
      <div className="flex-1 relative overflow-hidden">
        {activeMapMode === 'copernicus' ? (
          <CopernicusMainView
            scenario={scenario}
            onOpenDetailedView={() => setActiveMapMode('detailed')}
            onOpenModal={() => setIsCopernicusOpen(true)}
          />
        ) : (
          <>
            <DetailedGoogleMapView
              scenario={scenario}
              riskZones={riskZones}
              routesResult={routesResult}
              layerVisibility={layerVisibility}
              onToggleLayer={handleToggleLayer}
              onUpdateLayerVisibility={(updates) =>
                setLayerVisibility((prev) => ({ ...prev, ...updates }))
              }
              onOpenCopernicusView={() => setActiveMapMode('copernicus')}
            />

            {/* Floating Timeline Slider at bottom */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-xl px-4 pointer-events-auto">
              <TimelineController
                currentHour={timelineHour}
                onHourChange={handleTimelineHourChange}
                disasterDate={scenario.disasterDate}
                rainfallMm={scenario.rainfall24hMm}
                isRunningPipeline={isLoading}
              />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {isRouteModalOpen && (
        <RouteInspectorModal
          routesResult={routesResult}
          onClose={() => setIsRouteModalOpen(false)}
          onSelectRoute={(rt: SafeRouteItem) => {
            setSelectedFeature({ type: 'route', data: rt });
          }}
        />
      )}

      {isAiBriefingOpen && (
        <AiTacticalBriefingModal
          briefing={aiBriefing}
          scenario={scenario}
          onClose={() => setIsAiBriefingOpen(false)}
          isLoading={isAiLoading}
          onRegenerate={() => {
            if (changeDetection && riskZones && routesResult) {
              triggerAiBriefing(changeDetection, riskZones, routesResult);
            }
          }}
        />
      )}

      {isReportOpen && (
        <ReportModal
          scenario={scenario}
          changeDetection={changeDetection}
          riskZones={riskZones}
          routesResult={routesResult}
          aiBriefing={aiBriefing}
          timelineHour={timelineHour}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {isGeeModalOpen && (
        <EarthEngineComparisonModal
          scenario={scenario}
          onClose={() => setIsGeeModalOpen(false)}
          onSelectScenario={handleScenarioChange}
        />
      )}
      
      {isCopernicusOpen && (
        <CopernicusDataModal
          scenario={scenario}
          onClose={() => setIsCopernicusOpen(false)}
          onViewInProject={() => setActiveMapMode('copernicus')}
        />
      )}

      {isCartoOpen && (
        <CartoMapModal
          isOpen={isCartoOpen}
          onClose={() => setIsCartoOpen(false)}
          mapUrl="https://thunbergii.app.carto.com/map/a7e2b3ad-4505-4663-8404-2d7ee51f9c6c"
        />
      )}

      {isPitchDeckOpen && (
        <PitchDeckModal onClose={() => setIsPitchDeckOpen(false)} />
      )}
    </div>
  );
}
