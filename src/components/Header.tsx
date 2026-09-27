import React from 'react';
import {
  Satellite,
  Play,
  FileText,
  Radio,
  BrainCircuit,
  Database,
  RefreshCw,
  MapPin,
  Globe2,
  Maximize2,
  Minimize2,
  BarChart2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { DisasterScenario, PipelineProgress } from '../types';

interface HeaderProps {
  currentScenario: DisasterScenario;
  onScenarioChange: (scenarioId: string) => void;
  onLoadData: () => void;
  onSimulatePostEvent: () => void;
  onRunAnalysis: () => void;
  onOpenReport: () => void;
  onOpenAiBriefing: () => void;
  onOpenGeeComparison: () => void;
  onOpenCopernicus: () => void;
  onOpenCarto: () => void;
  onOpenPitchDeck?: () => void;
  pipelineProgress: PipelineProgress;
  hasPostEventData: boolean;
  hasAnalysisResults: boolean;
  isLoading: boolean;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  isMetricsExpanded: boolean;
  onToggleMetrics: () => void;
  activeMapMode?: 'carto' | 'tactical' | 'copernicus';
  onSelectMapMode?: (mode: 'carto' | 'tactical' | 'copernicus') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScenario,
  onScenarioChange,
  onLoadData,
  onSimulatePostEvent,
  onRunAnalysis,
  onOpenReport,
  onOpenAiBriefing,
  onOpenGeeComparison,
  onOpenCopernicus,
  onOpenCarto,
  onOpenPitchDeck,
  pipelineProgress,
  hasPostEventData,
  hasAnalysisResults,
  isLoading,
  isZenMode,
  onToggleZenMode,
  isMetricsExpanded,
  onToggleMetrics,
  activeMapMode = 'carto',
  onSelectMapMode,
}) => {
  const scenariosList = [
    { id: 'mumbai', label: 'Mumbai' },
    { id: 'chennai', label: 'Chennai' },
    { id: 'kerala', label: 'Kerala' },
  ];

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Left: Brand + Scenario Pills */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 ring-1 ring-cyan-300/40">
              <Radio className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight text-white font-mono">
                  DRISHTI-AID
                </span>
                <span className="px-1 py-0.2 text-[8px] font-mono uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                  SAR
                </span>
              </div>
            </div>
          </div>

          {/* Scenario Selector Segmented Buttons */}
          <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
            {scenariosList.map((sc) => (
              <button
                key={sc.id}
                onClick={() => onScenarioChange(sc.id)}
                disabled={isLoading}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1 ${
                  currentScenario.id === sc.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MapPin className="w-2.5 h-2.5" />
                <span>{sc.label}</span>
              </button>
            ))}
          </div>

          {/* Map Engine Mode Switcher: CARTO (Default) vs Copernicus vs Tactical GIS */}
          {onSelectMapMode && (
            <div className="flex items-center bg-slate-950/90 rounded-lg p-0.5 border border-slate-800 shadow-inner">
              <button
                id="btn-switch-to-carto"
                onClick={() => onSelectMapMode('carto')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                  activeMapMode === 'carto'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
                title="CARTO Geospatial Cloud View (Default)"
              >
                <Layers className="w-3 h-3" />
                <span>CARTO</span>
              </button>
              <button
                id="btn-switch-to-copernicus"
                onClick={() => onSelectMapMode('copernicus')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                  activeMapMode === 'copernicus'
                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-indigo-300'
                }`}
                title="Copernicus Data Space Ecosystem Live Satellite Canvas"
              >
                <Satellite className="w-3 h-3" />
                <span>Copernicus</span>
              </button>
              <button
                id="btn-switch-to-tactical"
                onClick={() => onSelectMapMode('tactical')}
                className={`px-2 py-1 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                  activeMapMode === 'tactical'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
                title="Tactical SAR Flood Inundation & Routing Canvas"
              >
                <span>Tactical GIS</span>
              </button>
            </div>
          )}

          <div className="hidden xl:flex items-center gap-1.5 pl-2 text-[10px] text-slate-400 font-mono">
            <Satellite className="w-3 h-3 text-cyan-400" />
            <span>Sentinel-1 SAR</span>
          </div>
        </div>

        {/* Center: Pipeline Workflow & GEE */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Step 1: Baseline */}
          <button
            id="btn-load-data"
            onClick={onLoadData}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95 disabled:opacity-50"
            title="Load Pre-Disaster Baseline Imagery"
          >
            <Database className="w-3 h-3 text-cyan-400" />
            <span className="hidden md:inline">1. Baseline</span>
            <span className="md:hidden">1</span>
          </button>

          {/* Step 2: Ingest Post-SAR */}
          <button
            id="btn-simulate-post"
            onClick={onSimulatePostEvent}
            disabled={isLoading}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition active:scale-95 border disabled:opacity-50 ${
              hasPostEventData
                ? 'bg-blue-950/80 text-blue-300 border-blue-500/60 shadow-sm'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Ingest Post-Disaster SAR Pass"
          >
            <Satellite className="w-3 h-3 text-blue-400" />
            <span className="hidden md:inline">2. Post-SAR</span>
            <span className="md:hidden">2</span>
          </button>

          {/* Step 3: Run Full Pipeline */}
          <button
            id="btn-run-analysis"
            onClick={onRunAnalysis}
            disabled={isLoading || pipelineProgress.stage !== 'idle'}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/25 transition active:scale-95 disabled:opacity-50"
            title="Run Sentinel-1 Change Detection, Risk Matrix & Safe Corridors"
          >
            {isLoading ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3 fill-current" />
            )}
            <span>Run Pipeline</span>
          </button>

          <div className="w-px h-4 bg-slate-800 mx-0.5" />

          {/* Copernicus Satellite Data */}
          <button
            onClick={onOpenCopernicus}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 transition active:scale-95"
            title="Browse live Sentinel Data via Copernicus"
          >
            <Satellite className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">Copernicus</span>
            <span className="sm:hidden">CDSE</span>
          </button>

          {/* CARTO Geospatial Map */}
          <button
            id="btn-carto-map"
            onClick={onOpenCarto}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 transition active:scale-95"
            title="View Live CARTO Spatial Cloud Map"
          >
            <Layers className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">CARTO Map</span>
            <span className="sm:hidden">CARTO</span>
          </button>

          {/* GEE Satellite Before & After Comparison */}
          <button
            id="btn-gee-comparison"
            onClick={onOpenGeeComparison}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 transition active:scale-95"
            title="Inspect Before & After Satellite Comparison via Earth Engine"
          >
            <Globe2 className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">GEE Compare</span>
            <span className="sm:hidden">GEE</span>
          </button>

          {/* AI Tactical Briefing */}
          <button
            id="btn-ai-briefing"
            onClick={onOpenAiBriefing}
            disabled={!hasAnalysisResults}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border transition ${
              hasAnalysisResults
                ? 'bg-purple-950/50 text-purple-300 border-purple-500/50 hover:bg-purple-900/50'
                : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
            }`}
            title="AI NDRF Incident Commander Briefing"
          >
            <BrainCircuit className="w-3 h-3 text-purple-400" />
            <span className="hidden lg:inline">AI Briefing</span>
          </button>

          {/* SITREP Report */}
          <button
            id="btn-export-report"
            onClick={onOpenReport}
            disabled={!hasAnalysisResults}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg border transition ${
              hasAnalysisResults
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/50'
                : 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed opacity-50'
            }`}
            title="Download Official SITREP"
          >
            <FileText className="w-3 h-3 text-emerald-400" />
            <span className="hidden lg:inline">SITREP</span>
          </button>

          {/* Pitch Deck Button */}
          {onOpenPitchDeck && (
            <button
              id="btn-pitch-deck"
              onClick={onOpenPitchDeck}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 shadow-sm transition active:scale-95"
              title="Open 1-Page PDF Executive Pitch Deck"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Pitch Deck</span>
              <span className="sm:hidden">Deck</span>
            </button>
          )}
        </div>

        {/* Right: Map-First View Toggles (Zen Map & Metrics) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Toggle Metrics Bar */}
          <button
            onClick={onToggleMetrics}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition ${
              isMetricsExpanded
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-semibold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
            title={isMetricsExpanded ? 'Collapse detailed cards' : 'Expand detailed cards'}
          >
            <BarChart2 className="w-3 h-3 text-cyan-400" />
            <span className="hidden md:inline">{isMetricsExpanded ? 'Cards' : 'Metrics'}</span>
          </button>

          {/* Zen Map Focus Mode Toggle */}
          <button
            onClick={onToggleZenMode}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border transition ${
              isZenMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
            title={isZenMode ? 'Exit Zen Mode (restore status bar)' : 'Enter Zen Mode (100% full map)'}
          >
            {isZenMode ? <Minimize2 className="w-3 h-3 text-emerald-400" /> : <Maximize2 className="w-3 h-3 text-slate-400" />}
            <span className="hidden sm:inline">{isZenMode ? 'Normal View' : 'Zen Map'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
