import React from 'react';
import {
  Waves,
  Users,
  AlertTriangle,
  Compass,
  Building2,
  ChevronDown,
  ChevronUp,
  Layers,
  ExternalLink,
  CloudRain,
  Wind,
  Satellite,
} from 'lucide-react';
import {
  DisasterScenario,
  ChangeDetectionResult,
  RiskAnalysisResult,
  RoutePlanningResult,
  LayerVisibility,
} from '../types';

interface StatsPanelProps {
  scenario: DisasterScenario;
  changeDetection: ChangeDetectionResult | null;
  riskZones: RiskAnalysisResult | null;
  routesResult: RoutePlanningResult | null;
  layerVisibility: LayerVisibility;
  onToggleLayer: (layer: keyof LayerVisibility) => void;
  onSelectRouteModal: () => void;
  timelineHour: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isZenMode: boolean;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  scenario,
  changeDetection,
  riskZones,
  routesResult,
  layerVisibility,
  onToggleLayer,
  onSelectRouteModal,
  timelineHour,
  isExpanded,
  onToggleExpand,
  isZenMode,
}) => {
  if (isZenMode) {
    return null;
  }

  const floodedArea = changeDetection ? changeDetection.floodedAreaKm2 : 0;
  const floodPct = changeDetection ? changeDetection.floodPercentage : 0;
  const criticalCount = riskZones ? riskZones.criticalZonesCount : 0;
  const highCount = riskZones ? riskZones.highZonesCount : 0;
  const totalPop = riskZones ? riskZones.totalPopulationAtRisk : 0;
  const clearRoutes = routesResult ? routesResult.clearRoutesCount : 0;
  const totalRoutes = routesResult ? routesResult.routesComputed : 0;

  const totalCapacity = scenario.shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupancy = scenario.shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const freeBeds = totalCapacity - totalOccupancy;

  // MINIMAL COMPACT BAR (Default View - takes ~36px height)
  if (!isExpanded) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-3 py-1.5 text-slate-200 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
          {/* Quick Metrics Strip */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5">
            {/* Flooded Area */}
            <button
              onClick={() => onToggleLayer('floodExtent')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border font-mono transition text-xs shrink-0 ${
                layerVisibility.floodExtent
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 opacity-60'
              }`}
              title="Click to toggle Flood Extent layer"
            >
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-white">{floodedArea > 0 ? `${floodedArea} km²` : '0.00 km²'}</span>
              <span className="text-[10px] text-cyan-400/80">({floodPct}%)</span>
            </button>

            {/* At Risk Pop */}
            <button
              onClick={() => onToggleLayer('riskZones')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border font-mono transition text-xs shrink-0 ${
                layerVisibility.riskZones
                  ? 'bg-amber-950/50 border-amber-500/40 text-amber-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 opacity-60'
              }`}
              title="Click to toggle Risk Zones layer"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white">{totalPop > 0 ? totalPop.toLocaleString() : '--'}</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">at risk</span>
            </button>

            {/* Critical Zones */}
            <button
              onClick={() => onToggleLayer('riskZones')}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-rose-500/40 bg-rose-950/50 text-rose-300 font-mono transition text-xs shrink-0"
              title="Click to inspect High/Critical sectors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-bold text-white">{criticalCount}</span>
              <span className="text-[10px] text-orange-400 hidden sm:inline">+{highCount} High</span>
            </button>

            {/* Safe Routes */}
            <button
              onClick={onSelectRouteModal}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-emerald-500/40 bg-emerald-950/50 text-emerald-300 font-mono transition text-xs shrink-0 hover:bg-emerald-900/40"
              title="Open Navigation Table"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white">{clearRoutes}/{totalRoutes || 20}</span>
              <span className="text-[10px] text-emerald-400 hidden sm:inline">Routes Clear</span>
            </button>

            {/* Free Relief Beds */}
            <button
              onClick={() => onToggleLayer('shelters')}
              className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg border font-mono transition text-xs shrink-0 ${
                layerVisibility.shelters
                  ? 'bg-indigo-950/50 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 opacity-60'
              }`}
              title="Click to toggle Shelter Points layer"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold text-white">{freeBeds.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400">beds</span>
            </button>
          </div>

          {/* Right Controls: Quick Layer Switches & Expand Details */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
              <span className="px-1 text-[10px] text-slate-500 font-mono">LAYERS:</span>
              <button
                onClick={() => onToggleLayer('floodExtent')}
                className={`px-2 py-0.5 rounded transition font-medium ${
                  layerVisibility.floodExtent
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                Flood
              </button>
              <button
                onClick={() => onToggleLayer('riskZones')}
                className={`px-2 py-0.5 rounded transition font-medium ${
                  layerVisibility.riskZones
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                Risk
              </button>
              <button
                onClick={() => onToggleLayer('safeRoutes')}
                className={`px-2 py-0.5 rounded transition font-medium ${
                  layerVisibility.safeRoutes
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                Corridors
              </button>
              <button
                onClick={() => onToggleLayer('shelters')}
                className={`px-2 py-0.5 rounded transition font-medium ${
                  layerVisibility.shelters
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                Shelters
              </button>
              <button
                onClick={() => onToggleLayer('weatherPrecipitation')}
                className={`px-2 py-0.5 rounded transition font-medium flex items-center gap-1 ${
                  layerVisibility.weatherPrecipitation
                    ? 'bg-blue-400/20 text-blue-300'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
                title="Live Precipitation Radar"
              >
                <CloudRain className="w-3 h-3" /> Rain
              </button>
              <button
                onClick={() => onToggleLayer('weatherWind')}
                className={`px-2 py-0.5 rounded transition font-medium flex items-center gap-1 ${
                  layerVisibility.weatherWind
                    ? 'bg-purple-400/20 text-purple-300'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
                title="Live Wind Speed"
              >
                <Wind className="w-3 h-3" /> Wind
              </button>
              <button
                onClick={() => onToggleLayer('copernicusSentinel')}
                className={`px-2 py-0.5 rounded transition font-medium flex items-center gap-1 ${
                  layerVisibility.copernicusSentinel
                    ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
                title="Toggle Copernicus Data Space Ecosystem (CDSE) Live Sentinel-1 SAR Orbit Swaths"
              >
                <Satellite className="w-3 h-3 text-indigo-400" /> CDSE Swath
              </button>
            </div>

            {/* Expand Details Button */}
            <button
              onClick={onToggleExpand}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-slate-800 transition"
              title="Expand full operational KPI cards"
            >
              <span className="hidden sm:inline">Details</span>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EXPANDED DETAILED VIEW (Can be closed anytime)
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2 text-slate-100 shadow-md transition-all duration-200 animate-in slide-in-from-top-2 duration-150">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-2 flex-1">
          {/* Flooded Extent */}
          <div
            onClick={() => onToggleLayer('floodExtent')}
            className={`rounded-xl p-2 relative overflow-hidden transition cursor-pointer border ${
              layerVisibility.floodExtent
                ? 'bg-slate-950/80 border-cyan-500/40 hover:border-cyan-400/70 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}
            title="Click to toggle Flood Extent layer"
          >
            <div className="absolute top-0 right-0 w-8 h-8 bg-cyan-500/10 rounded-bl-xl flex items-center justify-center">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Flooded Extent (SAR)
            </p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-cyan-300 font-mono tracking-tight">
                {floodedArea > 0 ? `${floodedArea} km²` : '0.00 km²'}
              </span>
              <span className="text-[10px] text-cyan-400/90 font-mono font-semibold">
                ({floodPct}% AOI)
              </span>
            </div>
            <div className="flex items-center justify-between mt-0.5 text-[10px] text-slate-400">
              <span>&lt; -14.2 dB</span>
              <span className="text-cyan-400 font-medium">{layerVisibility.floodExtent ? '● Active' : '○ Hidden'}</span>
            </div>
          </div>

          {/* Population At Risk */}
          <div
            onClick={() => onToggleLayer('riskZones')}
            className={`rounded-xl p-2 relative overflow-hidden transition cursor-pointer border ${
              layerVisibility.riskZones
                ? 'bg-slate-950/80 border-amber-500/40 hover:border-amber-400/70 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}
            title="Click to toggle Risk Zones layer"
          >
            <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500/10 rounded-bl-xl flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Population At Risk
            </p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-amber-300 font-mono tracking-tight">
                {totalPop > 0 ? totalPop.toLocaleString() : '--'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">citizens</span>
            </div>
            <div className="flex items-center justify-between mt-0.5 text-[10px] text-slate-400">
              <span>WorldPop 30m</span>
              <span className="text-amber-400 font-medium">{layerVisibility.riskZones ? '● Active' : '○ Hidden'}</span>
            </div>
          </div>

          {/* Priority Risk Zones */}
          <div
            onClick={() => onToggleLayer('riskZones')}
            className="bg-slate-950/80 border border-rose-500/40 hover:border-rose-400/70 rounded-xl p-2 relative overflow-hidden transition cursor-pointer"
            title="Click to inspect Critical & High Risk sectors"
          >
            <div className="absolute top-0 right-0 w-8 h-8 bg-rose-500/10 rounded-bl-xl flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Critical Sectors (&gt;75)
            </p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-rose-400 font-mono tracking-tight">
                {criticalCount}
              </span>
              <span className="text-[10px] text-orange-400 font-mono font-semibold">
                +{highCount} High
              </span>
            </div>
            <div className="flex items-center justify-between mt-0.5 text-[10px] text-slate-400">
              <span>NDRF Priority 1/2</span>
              <span className="text-rose-400 font-medium">Urgent</span>
            </div>
          </div>

          {/* Verified Safe Routes */}
          <div
            onClick={onSelectRouteModal}
            className="bg-slate-950/80 border border-emerald-500/40 hover:border-emerald-400/70 rounded-xl p-2 relative overflow-hidden cursor-pointer transition group shadow-sm"
            title="Click to open Turn-by-Turn Safe Navigation Matrix"
          >
            <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/10 rounded-bl-xl flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
            </div>
            <div className="flex items-center justify-between pr-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Safe A* Routes
              </p>
            </div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-emerald-300 font-mono tracking-tight">
                {clearRoutes} / {totalRoutes || 20}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Clear</span>
            </div>
            <div className="flex items-center justify-between mt-0.5 text-[10px] text-emerald-400/90 font-medium">
              <span className="underline">Navigation Table →</span>
            </div>
          </div>

          {/* Shelter & Medical Capacity */}
          <div
            onClick={() => onToggleLayer('shelters')}
            className={`rounded-xl p-2 relative overflow-hidden transition cursor-pointer border hidden sm:block ${
              layerVisibility.shelters
                ? 'bg-slate-950/80 border-indigo-500/40 hover:border-indigo-400/70 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}
            title="Click to toggle Shelters & Hospitals layer"
          >
            <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-500/10 rounded-bl-xl flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Available Relief Beds
            </p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-indigo-300 font-mono tracking-tight">
                {freeBeds.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">free</span>
            </div>
            <div className="flex items-center justify-between mt-0.5 text-[10px] text-slate-400">
              <span>20 Facilities</span>
              <span className="text-indigo-400 font-medium">{layerVisibility.shelters ? '● Active' : '○ Hidden'}</span>
            </div>
          </div>
        </div>

        {/* GIS Layer Switcher & Minimize Button */}
        <div className="flex items-center gap-2 self-end xl:self-center">
          <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1 flex items-center gap-1 font-bold">
              <Layers className="w-3 h-3 text-cyan-400" />
              Layers:
            </span>

            <button
              onClick={() => onToggleLayer('floodExtent')}
              className={`px-2 py-0.5 text-xs font-semibold rounded-lg border transition ${
                layerVisibility.floodExtent
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                  : 'bg-slate-900/60 text-slate-500 border-slate-800'
              }`}
            >
              Flood SAR
            </button>

            <button
              onClick={() => onToggleLayer('riskZones')}
              className={`px-2 py-0.5 text-xs font-semibold rounded-lg border transition ${
                layerVisibility.riskZones
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-slate-900/60 text-slate-500 border-slate-800'
              }`}
            >
              Risk Heatmap
            </button>

            <button
              onClick={() => onToggleLayer('safeRoutes')}
              className={`px-2 py-0.5 text-xs font-semibold rounded-lg border transition ${
                layerVisibility.safeRoutes
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-900/60 text-slate-500 border-slate-800'
              }`}
            >
              Corridors
            </button>

            <button
              onClick={() => onToggleLayer('shelters')}
              className={`px-2 py-0.5 text-xs font-semibold rounded-lg border transition ${
                layerVisibility.shelters
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                  : 'bg-slate-900/60 text-slate-500 border-slate-800'
              }`}
            >
              Shelters
            </button>

            <button
              onClick={() => onToggleLayer('weatherPrecipitation')}
              className={`px-2 py-0.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1 ${
                layerVisibility.weatherPrecipitation
                  ? 'bg-blue-400/20 text-blue-300 border-blue-400/50'
                  : 'bg-slate-900/60 text-slate-500 border-slate-800'
              }`}
              title="Precipitation Radar Overlay"
            >
              <CloudRain className="w-3 h-3" />
              Rain Radar
            </button>

            <button
              onClick={() => onToggleLayer('weatherWind')}
              className={`px-2 py-0.5 text-xs font-semibold rounded-lg border transition flex items-center gap-1 ${
                layerVisibility.weatherWind
                  ? 'bg-purple-400/20 text-purple-300 border-purple-400/50'
                  : 'bg-slate-900/60 text-slate-500 border-slate-800'
              }`}
              title="Wind Speed Overlay"
            >
              <Wind className="w-3 h-3" />
              Wind
            </button>
          </div>

          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition"
            title="Collapse back to minimal bar"
          >
            <span>Minimize</span>
            <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
