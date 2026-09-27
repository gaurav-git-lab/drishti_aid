import React, { useState } from 'react';
import { 
  Radio, 
  Layers, 
  Eye, 
  EyeOff, 
  Route, 
  Building2, 
  AlertTriangle, 
  Compass, 
  MapPin, 
  ShieldAlert, 
  Play, 
  RefreshCw,
  Info
} from 'lucide-react';
import { tacticalAudio } from '../utils/audioSynthesizer';

export const InteractiveGISMap: React.FC = () => {
  const [showClouds, setShowClouds] = useState<boolean>(false);
  const [sarMode, setSarMode] = useState<'dual' | 'vv' | 'vh'>('dual');
  const [thresholdDb, setThresholdDb] = useState<number>(-18);
  const [selectedZone, setSelectedZone] = useState<number>(4);
  const [selectedShelter, setSelectedShelter] = useState<string>('alpha');
  const [isRouting, setIsRouting] = useState<boolean>(false);
  const [radarActive, setRadarActive] = useState<boolean>(true);

  const zones = [
    { id: 1, name: 'Zone 1: North Bund', stranded: 620, risk: 'High', x: 260, y: 320 },
    { id: 2, name: 'Zone 2: Old Bridge Lowlands', stranded: 1100, risk: 'Critical', x: 380, y: 440 },
    { id: 3, name: 'Zone 3: Riverbend Village', stranded: 890, risk: 'High', x: 310, y: 620 },
    { id: 4, name: 'Zone 4: Central Ward (Active)', stranded: 1420, risk: 'Severe', x: 220, y: 550 },
  ];

  const shelters = [
    { id: 'alpha', name: 'NDRF Base Alpha (High Ground)', capacity: '2,500 beds', x: 880, y: 260, dist: '8.4 km', eta: '14 min' },
    { id: 'beta', name: 'Civil Hospital & Helipad', capacity: '1,200 beds', x: 780, y: 620, dist: '11.2 km', eta: '19 min' },
  ];

  const triggerReroute = () => {
    setIsRouting(true);
    tacticalAudio.playRadarPing();
    setTimeout(() => {
      setIsRouting(false);
      tacticalAudio.playRouteLock();
    }, 600);
  };

  const currentZone = zones.find(z => z.id === selectedZone) || zones[3];
  const currentShelter = shelters.find(s => s.id === selectedShelter) || shelters[0];

  return (
    <div className="w-full h-full flex flex-col lg:flex-row bg-slate-950 overflow-hidden select-none">
      {/* Tactical GIS Sidebar */}
      <div className="w-full lg:w-96 bg-slate-900/90 border-r border-slate-800 p-6 flex flex-col justify-between overflow-y-auto shrink-0">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Interactive SAR Triage Simulation</span>
            </div>
            <h2 className="text-xl font-black text-white">Copernicus Sentinel-1 GIS</h2>
            <p className="text-xs text-slate-400 mt-1">
              Simulate cloud penetration, specular water detection thresholds, and dynamic A* evacuation corridors.
            </p>
          </div>

          {/* Cloud Cover Layer Simulator */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                {showClouds ? <Eye className="w-3.5 h-3.5 text-rose-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                Monsoon Cloud Layer
              </span>
              <button
                onClick={() => setShowClouds(!showClouds)}
                className={`text-xs px-2.5 py-1 rounded-md font-mono transition-colors ${
                  showClouds 
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {showClouds ? 'Simulating Optical Failure' : 'SAR Microwave Mode'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              {showClouds 
                ? 'Optical satellites (Landsat, Sentinel-2) are blinded by >95% cloud cover. No ground roads visible.' 
                : 'C-Band radar (5.405 GHz) pierces dense water vapor and rain bands with zero signal attenuation.'}
            </p>
          </div>

          {/* Dual-Pol Polarization Switch */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Radar Polarization Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dual', label: 'Dual VV+VH' },
                { id: 'vv', label: 'VV (Co-Pol)' },
                { id: 'vh', label: 'VH (Cross)' },
              ].map(pol => (
                <button
                  key={pol.id}
                  onClick={() => setSarMode(pol.id as 'dual' | 'vv' | 'vh')}
                  className={`py-1.5 text-xs font-mono rounded-lg border transition-colors ${
                    sarMode === pol.id
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pol.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Specular Threshold Slider */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Specular Reflection Cutoff</span>
              <span className="font-mono text-cyan-400 font-bold">{thresholdDb} dB</span>
            </div>
            <input
              type="range"
              min={-24}
              max={-12}
              step={1}
              value={thresholdDb}
              onChange={(e) => setThresholdDb(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>-24 dB (Only Deep Water)</span>
              <span>-12 dB (Saturated Soil)</span>
            </div>
          </div>

          {/* Evacuation Target Selector */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Select Stranded Community
            </div>
            <div className="grid grid-cols-2 gap-2">
              {zones.map(z => (
                <button
                  key={z.id}
                  onClick={() => {
                    setSelectedZone(z.id);
                    triggerReroute();
                  }}
                  className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                    selectedZone === z.id
                      ? 'bg-rose-950/40 border-rose-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold">{z.name}</div>
                  <div className="text-[10px] text-rose-300 font-mono">{z.stranded} stranded</div>
                </button>
              ))}
            </div>
          </div>

          {/* Destination Shelter */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Destination Emergency Shelter
            </div>
            <div className="space-y-2">
              {shelters.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedShelter(s.id);
                    triggerReroute();
                  }}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs flex justify-between items-center transition-colors ${
                    selectedShelter === s.id
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-bold">{s.name}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">{s.capacity}</div>
                  </div>
                  <div className="text-right font-mono text-[11px] text-cyan-300">
                    <div>{s.dist}</div>
                    <div className="text-[10px] text-slate-400">ETA {s.eta}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer trigger */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setRadarActive(!radarActive)}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${radarActive ? 'animate-spin' : ''}`} />
            <span>Radar Sweep {radarActive ? 'Active' : 'Paused'}</span>
          </button>

          <button
            onClick={triggerReroute}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <Route className="w-3.5 h-3.5" />
            <span>Recalculate A*</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="flex-1 relative bg-[#070d1a] overflow-hidden flex items-center justify-center p-8">
        {/* SVG Tactical Map Canvas */}
        <div className="relative w-full max-w-5xl aspect-[16/10] bg-slate-950/90 rounded-3xl border-2 border-slate-800/80 shadow-2xl overflow-hidden flex">
          {/* Radar Circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[300px] h-[300px] border border-cyan-500 rounded-full" />
            <div className="w-[600px] h-[600px] border border-cyan-500 rounded-full absolute" />
            <div className="w-[900px] h-[900px] border border-cyan-500 rounded-full absolute" />
            <div className="w-full h-px bg-cyan-500/40 absolute" />
            <div className="h-full w-px bg-cyan-500/40 absolute" />
          </div>

          {/* Sweeping Beam */}
          {radarActive && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '1200px',
                height: '1200px',
                marginTop: '-600px',
                marginLeft: '-600px',
                borderRadius: '50%',
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(6, 182, 212, 0.15) 55deg, rgba(6, 182, 212, 0.35) 60deg, transparent 61deg)',
                transformOrigin: 'center center',
                animation: 'spin 5s linear infinite',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Simulated Flood Extent Polygons (Size depends on thresholdDb) */}
          <div
            style={{
              position: 'absolute',
              top: '25%',
              left: '26%',
              width: `${400 + (thresholdDb + 18) * 15}px`,
              height: `${280 + (thresholdDb + 18) * 12}px`,
              borderRadius: '42%',
              background: 'rgba(225, 29, 72, 0.35)',
              border: '2px solid rgba(244, 63, 94, 0.8)',
              filter: 'blur(8px)',
              boxShadow: '0 0 40px rgba(244, 63, 94, 0.35)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '16%',
              left: '54%',
              width: `${300 + (thresholdDb + 18) * 10}px`,
              height: `${320 + (thresholdDb + 18) * 10}px`,
              borderRadius: '48%',
              background: 'rgba(225, 29, 72, 0.3)',
              border: '2px solid rgba(244, 63, 94, 0.8)',
              filter: 'blur(10px)',
            }}
          />

          {/* Road Network Lines (Base Map) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 625">
            <g stroke="#334155" strokeWidth="2" strokeDasharray="4 4">
              <line x1="100" y1="300" x2="900" y2="300" />
              <line x1="200" y1="100" x2="200" y2="550" />
              <line x1="500" y1="80" x2="500" y2="550" />
              <line x1="800" y1="80" x2="800" y2="550" />
              <path d="M150,500 Q400,350 850,260" fill="none" />
              <path d="M250,200 Q500,450 850,550" fill="none" />
            </g>

            {/* Dynamic A* Evacuation Route Line */}
            <path
              d={
                selectedShelter === 'alpha'
                  ? `M${currentZone.x},${currentZone.y} C${currentZone.x + 100},${currentZone.y - 120} 460,420 540,320 C620,220 740,210 ${currentShelter.x},${currentShelter.y}`
                  : `M${currentZone.x},${currentZone.y} C${currentZone.x + 120},${currentZone.y + 40} 480,560 620,580 C700,590 740,610 ${currentShelter.x},${currentShelter.y}`
              }
              fill="none"
              stroke="#10b981"
              strokeWidth="6"
              strokeLinecap="round"
              className={isRouting ? 'opacity-30' : 'opacity-100 transition-opacity'}
              style={{
                filter: 'drop-shadow(0 0 8px #34d399)',
              }}
            />
          </svg>

          {/* Stranded Zone Pin */}
          <div
            style={{ left: `${(currentZone.x / 1000) * 100}%`, top: `${(currentZone.y / 625) * 100}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-rose-500 animate-ping absolute" />
            <div className="w-6 h-6 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-xs font-black shadow-lg">
              !
            </div>
            <div className="mt-1 px-2.5 py-0.5 rounded bg-slate-900 border border-rose-500/50 text-[11px] font-mono text-rose-300 font-bold whitespace-nowrap shadow-lg">
              {currentZone.name} ({currentZone.stranded})
            </div>
          </div>

          {/* Destination Shelter Pin */}
          <div
            style={{ left: `${(currentShelter.x / 1000) * 100}%`, top: `${(currentShelter.y / 625) * 100}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-400 border-2 border-slate-950 flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_#34d399]">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="mt-1 px-2.5 py-0.5 rounded bg-slate-900 border border-emerald-500/50 text-[11px] font-mono text-emerald-300 font-bold whitespace-nowrap shadow-lg">
              {currentShelter.name}
            </div>
          </div>

          {/* Cloud Cover Simulation Overlay */}
          {showClouds && (
            <div className="absolute inset-0 bg-slate-200/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-8 text-center text-slate-800">
              <AlertTriangle className="w-16 h-16 text-rose-600 mb-4 animate-bounce" />
              <h3 className="text-3xl font-black mb-2">OPTICAL SENSORS BLINDED (&gt;95% CLOUDS)</h3>
              <p className="text-base font-semibold max-w-lg text-slate-700 mb-6">
                Conventional visual and infrared satellites cannot penetrate monsoon moisture. Rescue teams would be blind for 24 to 48 hours.
              </p>
              <button
                onClick={() => setShowClouds(false)}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-xl flex items-center gap-2"
              >
                <Radio className="w-4 h-4" />
                <span>Switch to DRISHTI-AID C-Band SAR</span>
              </button>
            </div>
          )}

          {/* Floating Status HUD on Map */}
          <div className="absolute top-4 left-4 p-3 rounded-xl bg-slate-950/85 border border-slate-800 backdrop-blur text-xs font-mono space-y-1 pointer-events-none z-10">
            <div className="text-cyan-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              SENTINEL-1 C-SAR PASS // 5.405 GHz
            </div>
            <div className="text-slate-400">Flood Inundation: <strong className="text-rose-400">42.6 km²</strong></div>
            <div className="text-slate-400">Passable Roads: <strong className="text-emerald-400">78.3%</strong></div>
          </div>

          <div className="absolute bottom-4 right-4 p-3 rounded-xl bg-slate-950/85 border border-slate-800 backdrop-blur text-xs font-mono text-right pointer-events-none z-10">
            <div className="text-emerald-400 font-bold">A* DRY CORRIDOR LOCKED</div>
            <div className="text-slate-300">{currentShelter.dist} · ETA {currentShelter.eta}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
