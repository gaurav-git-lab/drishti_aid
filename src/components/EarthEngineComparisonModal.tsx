import React, { useState, useEffect } from 'react';
import {
  X,
  Satellite,
  Globe2,
  Sliders,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Code2,
  BarChart3,
  ExternalLink,
  ShieldCheck,
  Zap,
  Split,
  Eye,
  CloudRain,
} from 'lucide-react';
import { DisasterScenario, DisasterComparisonData, GeeStatusResponse, NasaEarthdataStatusResponse, NasaGpmGranule } from '../types';

interface EarthEngineComparisonModalProps {
  scenario: DisasterScenario;
  onClose: () => void;
  onSelectScenario: (scenarioId: string) => void;
}

export const EarthEngineComparisonModal: React.FC<EarthEngineComparisonModalProps> = ({
  scenario,
  onClose,
  onSelectScenario,
}) => {
  const [data, setData] = useState<DisasterComparisonData | null>(null);
  const [geeStatus, setGeeStatus] = useState<GeeStatusResponse | null>(null);
  const [nasaStatus, setNasaStatus] = useState<NasaEarthdataStatusResponse | null>(null);
  const [nasaGranules, setNasaGranules] = useState<NasaGpmGranule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide' | 'difference'>('slider');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeTab, setActiveTab] = useState<'visual' | 'histogram' | 'nasa' | 'script' | 'guide'>('visual');
  const [scriptLanguage, setScriptLanguage] = useState<'javascript' | 'python'>('javascript');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/gee/comparison?scenario=${scenario.id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.comparison);
          setGeeStatus(res.status);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load GEE comparison data', err);
        setIsLoading(false);
      });

    // Fetch live NASA Earthdata status & GPM precipitation granules
    fetch('/api/nasa/status')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setNasaStatus(res);
      })
      .catch((err) => console.warn('NASA status fetch error', err));

    fetch(`/api/nasa/granules?scenario=${scenario.id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.granules) setNasaGranules(res.granules);
      })
      .catch((err) => console.warn('NASA granules fetch error', err));
  }, [scenario.id]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
              <Globe2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  Google Earth Engine (GEE) Disaster Comparison
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  COPERNICUS/S1_GRD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sentinel-1 SAR C-band microwave before & after inundation change analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live GEE Connection Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border bg-slate-900 border-slate-800">
              <span
                className={`w-2 h-2 rounded-full ${
                  geeStatus?.isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-300 text-[11px]">
                {geeStatus?.isConfigured
                  ? `GEE Cloud: ${geeStatus.projectId}`
                  : 'Calibrated GEE Archive'}
              </span>
            </div>

            <button
              id="close-gee-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Disaster Scenario Switcher Bar */}
        <div className="px-5 py-2 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Actual Disaster:</span>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'mumbai', label: 'Mumbai Deluge (Mithi Basin)' },
                { id: 'chennai', label: 'Chennai Cyclone Michaung' },
                { id: 'kerala', label: 'Kerala Great Floods (Periyar)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectScenario(s.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    scenario.id === s.id
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'visual'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Before & After
            </button>
            <button
              onClick={() => setActiveTab('histogram')}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'histogram'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              SAR dB Histogram
            </button>
            <button
              onClick={() => setActiveTab('script')}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'script'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              GEE Scripts
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-slate-800 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              API Key Setup
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading || !data ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Satellite className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
              <p className="text-sm font-medium">Querying Earth Engine Sentinel-1 SAR catalog...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: VISUAL BEFORE & AFTER COMPARISON */}
              {activeTab === 'visual' && (
                <div className="space-y-4">
                  {/* View Controls & KPI Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                        Pre-Disaster Water
                      </p>
                      <p className="text-lg font-extrabold text-slate-200 font-mono mt-0.5">
                        {data.preEvent.waterCoverageKm2} km²
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Baseline dry ground</p>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                        Post-Disaster Inundation
                      </p>
                      <p className="text-lg font-extrabold text-cyan-400 font-mono mt-0.5">
                        {data.postEvent.waterCoverageKm2} km²
                      </p>
                      <p className="text-[11px] text-cyan-300/80 mt-0.5">
                        +{data.differenceMetrics.floodedAreaKm2} km² new water
                      </p>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                        SAR Backscatter Drop
                      </p>
                      <p className="text-lg font-extrabold text-rose-400 font-mono mt-0.5">
                        {data.differenceMetrics.backscatterDropDb} dB
                      </p>
                      <p className="text-[11px] text-rose-300/80 mt-0.5">Specular reflection attenuation</p>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                      <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                        Expansion Factor
                      </p>
                      <p className="text-lg font-extrabold text-amber-300 font-mono mt-0.5">
                        {data.differenceMetrics.waterExpansionFactor}
                      </p>
                      <p className="text-[11px] text-amber-300/80 mt-0.5">
                        Confidence: {(data.differenceMetrics.confidenceScore * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Comparison Mode:</span>
                      <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
                        <button
                          onClick={() => setViewMode('slider')}
                          className={`px-3 py-1 rounded-md transition ${
                            viewMode === 'slider'
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Interactive Swipe Slider
                        </button>
                        <button
                          onClick={() => setViewMode('sideBySide')}
                          className={`px-3 py-1 rounded-md transition ${
                            viewMode === 'sideBySide'
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Side-by-Side
                        </button>
                      </div>
                    </div>

                    {viewMode === 'slider' && (
                      <span className="text-xs font-mono text-cyan-300">
                        Swipe Position: {sliderPosition}%
                      </span>
                    )}
                  </div>

                  {/* Visual Container */}
                  {viewMode === 'slider' ? (
                    <div className="relative h-96 rounded-2xl overflow-hidden border border-slate-800 select-none bg-slate-950">
                      {/* Pre-Event Image (Underneath) */}
                      <img
                        src={data.preEvent.previewImageUrl}
                        alt="Pre-Disaster Baseline"
                        className="absolute inset-0 w-full h-full object-cover filter contrast-125"
                      />
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 z-10">
                        <span className="text-xs font-bold text-slate-200">
                          PRE: {data.preEvent.name}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {data.preEvent.acquisitionDate}
                        </div>
                      </div>

                      {/* Post-Event Image (Clipped by slider) */}
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                      >
                        <img
                          src={data.postEvent.previewImageUrl}
                          alt="Post-Disaster Active Flood"
                          className="absolute inset-0 w-full h-full object-cover filter contrast-125 brightness-95"
                        />
                        {/* Highlighting Inundation with Cyan Tint */}
                        <div className="absolute inset-0 bg-cyan-500/20 mix-blend-color-dodge pointer-events-none" />
                        <div className="absolute top-3 right-3 bg-cyan-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/60 z-10 text-right">
                          <span className="text-xs font-bold text-cyan-300">
                            POST: {data.postEvent.name}
                          </span>
                          <div className="text-[10px] text-cyan-400 font-mono">
                            {data.postEvent.acquisitionDate}
                          </div>
                        </div>
                      </div>

                      {/* Interactive Slider Bar */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_#00f2fe] cursor-ew-resize z-20 flex items-center justify-center"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="w-8 h-8 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-white -ml-3.5">
                          <Split className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Invisible Scrub Controller */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPosition}
                        onChange={(e) => setSliderPosition(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                      />
                    </div>
                  ) : (
                    /* Side by Side Mode */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pre Event Card */}
                      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-300">
                              Pre-Disaster Baseline
                            </span>
                            <div className="text-[10px] font-mono text-slate-400">
                              {data.preEvent.acquisitionDate}
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            Mean: {data.preEvent.meanBackscatterDb} dB
                          </span>
                        </div>
                        <div className="relative h-64">
                          <img
                            src={data.preEvent.previewImageUrl}
                            alt="Pre Event"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 text-xs space-y-1 bg-slate-900/60">
                          <p className="text-slate-300 font-semibold">{data.preEvent.name}</p>
                          <p className="text-[11px] text-slate-400">{data.preEvent.bandDescription}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            Sensor: {data.preEvent.sensor} • {data.preEvent.polarization}
                          </p>
                        </div>
                      </div>

                      {/* Post Event Card */}
                      <div className="bg-slate-950 rounded-2xl border border-cyan-500/40 overflow-hidden shadow-lg shadow-cyan-500/10">
                        <div className="p-3 border-b border-cyan-500/30 bg-cyan-950/30 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-cyan-300">
                              Post-Disaster SAR Pass
                            </span>
                            <div className="text-[10px] font-mono text-cyan-400">
                              {data.postEvent.acquisitionDate}
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-900/50 px-2 py-0.5 rounded border border-cyan-500/40">
                            Mean: {data.postEvent.meanBackscatterDb} dB
                          </span>
                        </div>
                        <div className="relative h-64">
                          <img
                            src={data.postEvent.previewImageUrl}
                            alt="Post Event"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-cyan-500/20 mix-blend-color-dodge" />
                        </div>
                        <div className="p-3 text-xs space-y-1 bg-cyan-950/20">
                          <p className="text-cyan-200 font-semibold">{data.postEvent.name}</p>
                          <p className="text-[11px] text-cyan-300/80">{data.postEvent.bandDescription}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Sensor: {data.postEvent.sensor} • {data.postEvent.polarization}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Satellite Parameters Table */}
                  <div className="bg-slate-950/90 rounded-xl border border-slate-800 p-4">
                    <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider font-mono">
                      Earth Observation Sensor Metadata
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px]">SAR Instrument</span>
                        <span className="font-semibold text-slate-200">{data.preEvent.sensor}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Orbit Track Mode</span>
                        <span className="font-semibold text-slate-200">{data.postEvent.orbitMode}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Coherence Drop</span>
                        <span className="font-semibold text-rose-400">
                          {data.differenceMetrics.sarCoherenceLossPct}% loss
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Threshold Cutoff</span>
                        <span className="font-semibold text-cyan-300 font-mono">
                          {data.differenceMetrics.thresholdCutoffDb} dB
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SAR BACKSCATTER HISTOGRAM */}
              {activeTab === 'histogram' && (
                <div className="space-y-4">
                  <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          Radar Backscatter Distribution (dB) Shift
                        </h3>
                        <p className="text-xs text-slate-400">
                          Shows the physical transition of pixels from dry rough soil (-9 dB) to specular smooth water (&lt; -14 dB)
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-slate-400" />
                          <span className="text-slate-300">Pre-Disaster (Dry Ground)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-cyan-400" />
                          <span className="text-cyan-300 font-semibold">Post-Disaster (Inundated)</span>
                        </div>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="h-64 flex items-end gap-1.5 pt-6 pb-2 px-2 border-b border-l border-slate-800 relative">
                      {/* Vertical Cutoff Threshold Line at -14.2 dB */}
                      <div
                        className="absolute top-0 bottom-0 w-px border-r border-dashed border-rose-500 z-10 flex flex-col justify-start"
                        style={{ left: '44%' }}
                      >
                        <span className="text-[10px] font-mono text-rose-400 bg-slate-950 px-1.5 py-0.5 rounded border border-rose-500/40 -translate-x-1/2">
                          Threshold: -14.2 dB
                        </span>
                      </div>

                      {data.postEvent.histogram.map((bin, idx) => {
                        const preBin = data.preEvent.histogram[idx] || { count: 0 };
                        const maxCount = 10000;
                        const postHeight = Math.min(100, (bin.count / maxCount) * 100);
                        const preHeight = Math.min(100, (preBin.count / maxCount) * 100);

                        return (
                          <div
                            key={bin.db}
                            className="flex-1 flex items-end justify-center gap-0.5 group relative h-full"
                          >
                            {/* Pre bar */}
                            <div
                              style={{ height: `${preHeight}%` }}
                              className="w-1/2 bg-slate-600/60 rounded-t-sm group-hover:bg-slate-500 transition"
                            />
                            {/* Post bar */}
                            <div
                              style={{ height: `${postHeight}%` }}
                              className="w-1/2 bg-cyan-500/80 rounded-t-sm group-hover:bg-cyan-400 transition"
                            />

                            {/* Hover tooltip */}
                            <div className="absolute -top-12 bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] font-mono opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 whitespace-nowrap shadow-lg">
                              <div>{bin.db} dB</div>
                              <div className="text-slate-400">Pre: {preBin.count} px</div>
                              <div className="text-cyan-400 font-bold">Post: {bin.count} px</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* X Axis Labels */}
                    <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2 px-1">
                      <span>-25 dB (Open Calm Water)</span>
                      <span className="text-rose-400 font-bold">-14.2 dB (Water Cutoff)</span>
                      <span>-8 dB (Dry Land / Canopy)</span>
                      <span>0 dB (Urban Reflector)</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <p className="font-bold text-cyan-300">Physics of SAR Microwave Flood Detection:</p>
                    <p>
                      At C-band (5.405 GHz), flat water surfaces specularly reflect incoming electromagnetic energy away from the radar receiver, causing a stark drop in the backscatter coefficient (<span className="text-cyan-400 font-mono font-bold">&lt; -14.2 dB</span>). In contrast, surrounding buildings, vegetated soil, and dry streets scatter waves back diffusely (-8 dB to -10 dB).
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: READY-TO-RUN GOOGLE EARTH ENGINE SCRIPTS */}
              {activeTab === 'script' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Run Direct in Google Earth Engine
                      </h3>
                      <p className="text-xs text-slate-400">
                        Export this exact scene's bounding box and date range to GEE Code Editor or Python
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
                        <button
                          onClick={() => setScriptLanguage('javascript')}
                          className={`px-3 py-1 rounded-md transition ${
                            scriptLanguage === 'javascript'
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          JavaScript (Code Editor)
                        </button>
                        <button
                          onClick={() => setScriptLanguage('python')}
                          className={`px-3 py-1 rounded-md transition ${
                            scriptLanguage === 'python'
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Python (Colab / Jupyter)
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          handleCopyCode(
                            scriptLanguage === 'javascript'
                              ? data.geeScriptCode.javascript
                              : data.geeScriptCode.python
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Script</span>
                          </>
                        )}
                      </button>

                      <a
                        href="https://code.earthengine.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition"
                      >
                        <span>Open GEE Code Editor</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                    <pre className="p-4 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed max-h-96">
                      {scriptLanguage === 'javascript'
                        ? data.geeScriptCode.javascript
                        : data.geeScriptCode.python}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 4: API KEY & GOOGLE CLOUD CREDENTIALS GUIDE */}
              {activeTab === 'guide' && (
                <div className="space-y-4">
                  <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-5">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-400" />
                      How to Set Up Google Earth Engine (GEE) Credentials
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Follow these 4 steps to link your Google Cloud project for live Earth Engine API access:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Step 1 */}
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 font-mono">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                            1
                          </span>
                          Sign Up for Earth Engine
                        </div>
                        <p className="text-xs text-slate-300">
                          Visit{' '}
                          <a
                            href="https://earthengine.google.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 underline"
                          >
                            earthengine.google.com
                          </a>{' '}
                          and click <strong>Get Started</strong>. Choose Non-commercial / Prototype access (free).
                        </p>
                      </div>

                      {/* Step 2 */}
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 font-mono">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                            2
                          </span>
                          Enable Earth Engine API in GCP
                        </div>
                        <p className="text-xs text-slate-300">
                          In the{' '}
                          <a
                            href="https://console.cloud.google.com/apis/library/earthengine.googleapis.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 underline"
                          >
                            Google Cloud Console
                          </a>
                          , select or create a project and click <strong>Enable Earth Engine API</strong>.
                        </p>
                      </div>

                      {/* Step 3 */}
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 font-mono">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                            3
                          </span>
                          Create Service Account & Key
                        </div>
                        <p className="text-xs text-slate-300">
                          Go to <strong>IAM & Admin &gt; Service Accounts</strong>. Create a Service Account with role <strong>Earth Engine Resource Viewer</strong>. Click <strong>Keys &gt; Add Key &gt; Create new JSON key</strong>.
                        </p>
                      </div>

                      {/* Step 4 */}
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 font-mono">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                            4
                          </span>
                          Add to Project Settings
                        </div>
                        <p className="text-xs text-slate-300">
                          In Google AI Studio, open the <strong>Settings</strong> or Secrets panel and configure:
                        </p>
                        <div className="bg-slate-950 p-2 rounded text-[11px] font-mono text-cyan-300">
                          EARTH_ENGINE_PROJECT_ID="your-project-id"
                          <br />
                          EARTH_ENGINE_SERVICE_ACCOUNT_EMAIL="..."
                          <br />
                          EARTH_ENGINE_PRIVATE_KEY="..."
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Collections Supported */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <h4 className="text-xs font-bold text-slate-300 mb-2 font-mono uppercase">
                      Supported Earth Observation Image Collections:
                    </h4>
                    <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-5">
                      <li>
                        <strong className="text-slate-200">COPERNICUS/S1_GRD</strong>: Sentinel-1 C-Band SAR Ground Range Detected (5.405 GHz, VV/VH polarizations).
                      </li>
                      <li>
                        <strong className="text-slate-200">COPERNICUS/S2_SR_HARMONIZED</strong>: Sentinel-2 MSI Multi-spectral Surface Reflectance (RGB True Color & NDWI).
                      </li>
                      <li>
                        <strong className="text-slate-200">JAXA/ALOS/AW3D30/V3_2</strong>: ALOS World 3D - 30m Global Digital Surface Model for runoff topography.
                      </li>
                      <li>
                        <strong className="text-slate-200">WorldPop/GP/100m/pop</strong>: High-resolution population density grid for risk weighting.
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Calibrated with ESA Sentinel-1 C-SAR & Google Earth Engine catalogs</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
