import React, { useState, useRef, useEffect } from 'react';
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
  Search,
  X,
  ChevronDown,
} from 'lucide-react';
import { DisasterScenario, PipelineProgress } from '../types';

interface CityRecord {
  name: string;
  state: string;
  scenarioId: string;
  riverBasin: string;
}

const INDIAN_CITIES: CityRecord[] = [
  { name: 'Mumbai', state: 'Maharashtra', scenarioId: 'mumbai', riverBasin: 'Mithi River Basin' },
  { name: 'Delhi', state: 'NCR', scenarioId: 'delhi', riverBasin: 'Yamuna Floodplain' },
  { name: 'Bengaluru', state: 'Karnataka', scenarioId: 'bengaluru', riverBasin: 'Bellandur Basin' },
  { name: 'Chennai', state: 'Tamil Nadu', scenarioId: 'chennai', riverBasin: 'Adyar-Cooum Estuary' },
  { name: 'Kolkata', state: 'West Bengal', scenarioId: 'kolkata', riverBasin: 'Hooghly Delta' },
  { name: 'Hyderabad', state: 'Telangana', scenarioId: 'hyderabad', riverBasin: 'Musi Catchment' },
  { name: 'Pune', state: 'Maharashtra', scenarioId: 'pune', riverBasin: 'Mula-Mutha Basin' },
  { name: 'Ahmedabad', state: 'Gujarat', scenarioId: 'ahmedabad', riverBasin: 'Sabarmati Basin' },
  { name: 'Kochi', state: 'Kerala', scenarioId: 'kochi', riverBasin: 'Periyar Estuary' },
  { name: 'Thiruvananthapuram', state: 'Kerala', scenarioId: 'thiruvananthapuram', riverBasin: 'Karamana Basin' },
  { name: 'Guwahati', state: 'Assam', scenarioId: 'guwahati', riverBasin: 'Brahmaputra Valley' },
  { name: 'Patna', state: 'Bihar', scenarioId: 'patna', riverBasin: 'Ganga Floodplain' },
  { name: 'Bihar (Kosi-Gandak Flood)', state: 'Bihar', scenarioId: 'bihar', riverBasin: 'Kosi-Gandak Confluence' },
  { name: 'Bhubaneswar', state: 'Odisha', scenarioId: 'bhubaneswar', riverBasin: 'Mahanadi Delta' },
  { name: 'Surat', state: 'Gujarat', scenarioId: 'surat', riverBasin: 'Tapi Estuary' },
  { name: 'Jaipur', state: 'Rajasthan', scenarioId: 'jaipur', riverBasin: 'Dravyavati Basin' },
  { name: 'Lucknow', state: 'Uttar Pradesh', scenarioId: 'lucknow', riverBasin: 'Gomti Floodplain' },
  { name: 'Indore', state: 'Madhya Pradesh', scenarioId: 'indore', riverBasin: 'Kahn Catchment' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', scenarioId: 'visakhapatnam', riverBasin: 'Coastal Basin' },
  { name: 'Srinagar', state: 'Jammu & Kashmir', scenarioId: 'srinagar', riverBasin: 'Jhelum Basin' },
  { name: 'Coimbatore', state: 'Tamil Nadu', scenarioId: 'coimbatore', riverBasin: 'Noyyal Basin' },
  { name: 'Madurai', state: 'Tamil Nadu', scenarioId: 'madurai', riverBasin: 'Vaigai Basin' },
  { name: 'Nagpur', state: 'Maharashtra', scenarioId: 'nagpur', riverBasin: 'Nag & Pili Catchment' },
  { name: 'Varanasi', state: 'Uttar Pradesh', scenarioId: 'varanasi', riverBasin: 'Ganga Floodplain' },
  { name: 'Dehradun', state: 'Uttarakhand', scenarioId: 'dehradun', riverBasin: 'Song River Valley' },
  { name: 'Shimla', state: 'Himachal Pradesh', scenarioId: 'shimla', riverBasin: 'Sutlej Catchment' },
  { name: 'Amritsar', state: 'Punjab', scenarioId: 'amritsar', riverBasin: 'Beas & Ravi Basin' },
  { name: 'Chandigarh', state: 'Punjab/HR', scenarioId: 'chandigarh', riverBasin: 'Sukhna Catchment' },
];

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
  activeMapMode?: 'detailed' | 'copernicus';
  onSelectMapMode?: (mode: 'detailed' | 'copernicus') => void;
  onReturnToLanding?: () => void;
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
  onReturnToLanding,
  pipelineProgress,
  hasPostEventData,
  hasAnalysisResults,
  isLoading,
  isZenMode,
  onToggleZenMode,
  isMetricsExpanded,
  onToggleMetrics,
  activeMapMode = 'detailed',
  onSelectMapMode,
}) => {
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = INDIAN_CITIES.filter((c) => {
    if (!citySearchQuery.trim()) return true;
    const q = citySearchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.riverBasin.toLowerCase().includes(q)
    );
  });

  const handleSelectCity = (city: CityRecord) => {
    onScenarioChange(city.scenarioId);
    setCitySearchQuery('');
    setIsCityDropdownOpen(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCities.length > 0) {
        handleSelectCity(filteredCities[0]);
      } else if (citySearchQuery.trim()) {
        const query = citySearchQuery.trim();
        const customCity: CityRecord = {
          name: query.charAt(0).toUpperCase() + query.slice(1),
          state: 'Disaster AOI',
          scenarioId: query.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
          riverBasin: `${query} River Basin`,
        };
        handleSelectCity(customCity);
      } else {
        setIsCityDropdownOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsCityDropdownOpen(false);
    }
  };

  return (
    <header className="w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 z-50 shadow-sm relative">
      <div className="w-full px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2.5">
        {/* Left: Brand + Search City Option */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onReturnToLanding}
            className="flex items-center gap-2 group hover:opacity-90 transition text-left cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 rounded-lg p-0.5"
            title="Return to DRISHTI-AID Overview & Landing Page"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 ring-1 ring-cyan-300/40 group-hover:ring-cyan-300">
              <Radio className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight text-white font-mono group-hover:text-cyan-300 transition-colors">
                  DRISHTI-AID
                </span>
                <span className="px-1 py-0.2 text-[8px] font-mono uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                  SAR
                </span>
              </div>
            </div>
          </button>

          {/* Search the City Option */}
          <div ref={cityDropdownRef} className="relative">
            <div className="flex items-center bg-slate-950/90 rounded-lg border border-slate-800 focus-within:border-cyan-500/70 focus-within:ring-1 focus-within:ring-cyan-400/40 p-0.5 transition-all shadow-sm">
              <div className="flex items-center pl-2 pr-1 pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              </div>

              <input
                type="text"
                value={citySearchQuery}
                onFocus={() => setIsCityDropdownOpen(true)}
                onChange={(e) => {
                  setCitySearchQuery(e.target.value);
                  setIsCityDropdownOpen(true);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={`Search city (${currentScenario.name.split(' ')[0]})...`}
                className="w-32 sm:w-44 text-xs font-mono bg-transparent text-slate-100 placeholder-slate-500 outline-none py-1 pr-1.5"
              />

              {citySearchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setCitySearchQuery('');
                    setIsCityDropdownOpen(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCityDropdownOpen((prev) => !prev)}
                  className="px-1.5 py-1 text-[11px] font-mono font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                  title="Browse cities"
                >
                  <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                  <span className="max-w-[75px] truncate">{currentScenario.name.split(' ')[0]}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {/* City Dropdown Menu */}
            {isCityDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-slate-950/98 backdrop-blur-2xl border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-950/80 z-[9999] p-2 flex flex-col gap-1 max-h-80 overflow-y-auto">
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800/80 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                    Select Indian City
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-500/30">
                    Sentinel SAR
                  </span>
                </div>

                {filteredCities.length > 0 ? (
                  filteredCities.slice(0, 10).map((city) => {
                    const isCurrent = currentScenario.id === city.scenarioId;
                    return (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => handleSelectCity(city)}
                        disabled={isLoading}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left transition flex items-center justify-between group cursor-pointer ${
                          isCurrent
                            ? 'bg-cyan-950/70 border border-cyan-500/50 text-cyan-200'
                            : 'hover:bg-slate-900 border border-transparent text-slate-300 hover:text-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold group-hover:text-cyan-300">
                              {city.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/70 px-1.5 py-0.2 rounded">
                              {city.state}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                            {city.riverBasin}
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-900/60 px-1.5 py-0.5 rounded border border-cyan-500/40">
                            ACTIVE
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-center text-xs font-mono text-slate-400 flex flex-col items-center gap-2">
                    <span>No pre-configured city found for "{citySearchQuery}".</span>
                    <button
                      type="button"
                      onClick={() => {
                        const query = citySearchQuery.trim();
                        if (query) {
                          handleSelectCity({
                            name: query.charAt(0).toUpperCase() + query.slice(1),
                            state: 'Disaster AOI',
                            scenarioId: query.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                            riverBasin: `${query} River Basin`,
                          });
                        }
                      }}
                      className="w-full py-1.5 px-2 text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition shadow-md shadow-cyan-600/30 cursor-pointer"
                    >
                      Analyze & Fit "{citySearchQuery}"
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Map Engine Mode Switcher: Detailed View (Google Maps) vs Copernicus */}
          {onSelectMapMode && (
            <div className="flex items-center bg-slate-950/90 rounded-lg p-0.5 border border-slate-800 shadow-inner">
              <button
                id="btn-switch-to-detailed"
                onClick={() => onSelectMapMode('detailed')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                  activeMapMode === 'detailed'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
                title="Detailed View (Google Maps Platform integrated view)"
              >
                <MapPin className="w-3 h-3" />
                <span>Detailed View</span>
              </button>
              <button
                id="btn-switch-to-copernicus"
                onClick={() => onSelectMapMode('copernicus')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                  activeMapMode === 'copernicus'
                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-indigo-300'
                }`}
                title="Copernicus Data Space Ecosystem Live Satellite Canvas"
              >
                <Satellite className="w-3 h-3" />
                <span>Copernicus</span>
              </button>
            </div>
          )}
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
