import React from 'react';
import { Wind, Compass, X, Activity, Gauge, Zap } from 'lucide-react';
import { WindDataResponse } from '../types';

interface WeatherWindHudProps {
  windData: WindDataResponse | null;
  windMode: 'streamlines' | 'vectors' | 'both';
  onChangeWindMode: (mode: 'streamlines' | 'vectors' | 'both') => void;
  onClose: () => void;
}

export const WeatherWindHud: React.FC<WeatherWindHudProps> = ({
  windData,
  windMode,
  onChangeWindMode,
  onClose,
}) => {
  if (!windData) return null;

  const speedKmh = windData.windSpeedKmh;
  const speedKnots = (speedKmh / 1.852).toFixed(1);
  const dirDeg = windData.windDirectionDeg;
  const gustsKmh = windData.windGustsKmh;

  // Cardinal direction calculation
  const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const cardinalIndex = Math.round(dirDeg / 22.5) % 16;
  const cardinalText = cardinals[cardinalIndex];

  // Intensity color
  const intensityColor =
    speedKmh >= 65
      ? 'text-rose-400 border-rose-500/40 bg-rose-950/40'
      : speedKmh >= 40
      ? 'text-amber-400 border-amber-500/40 bg-amber-950/40'
      : speedKmh >= 20
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40'
      : 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';

  return (
    <div className="absolute top-16 right-4 z-20 w-72 select-none">
      <div className="bg-slate-950/85 hover:bg-slate-950/95 backdrop-blur-xl border border-purple-500/40 rounded-2xl p-3 shadow-2xl text-slate-100 transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
          <div className="flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 font-mono">
              Tactical Wind Telemetry
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Close Wind Overlay"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main Telemetry Grid: Compass & Readings */}
        <div className="grid grid-cols-2 gap-2 items-center mb-2.5">
          {/* Rotating Compass Widget */}
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/90 border border-slate-800 relative">
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Outer compass ring */}
              <div className="absolute inset-0 rounded-full border border-slate-700/80 flex items-center justify-center">
                <span className="absolute top-0.5 text-[8px] font-mono text-slate-400 font-bold">N</span>
                <span className="absolute right-0.5 text-[8px] font-mono text-slate-500">E</span>
                <span className="absolute bottom-0.5 text-[8px] font-mono text-slate-500">S</span>
                <span className="absolute left-0.5 text-[8px] font-mono text-slate-500">W</span>
              </div>

              {/* Rotating Needle / Arrow */}
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-out"
                style={{ transform: `rotate(${dirDeg}deg)` }}
              >
                <div className="flex flex-col items-center justify-between h-14">
                  {/* Arrowhead pointing toward wind destination */}
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[16px] border-b-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 ring-2 ring-purple-600" />
                  <div className="w-0.5 h-3 bg-purple-500/40" />
                </div>
              </div>
            </div>

            <div className="mt-1 text-center">
              <span className="font-mono text-xs font-bold text-purple-300">
                {dirDeg}° {cardinalText}
              </span>
            </div>
          </div>

          {/* Speed & Metrics */}
          <div className="space-y-1.5 text-left">
            <div>
              <div className="text-[9px] uppercase font-mono text-slate-400">Current Velocity</div>
              <div className="text-lg font-mono font-extrabold text-white tracking-tight leading-none">
                {speedKmh.toFixed(1)} <span className="text-[11px] font-normal text-slate-300">km/h</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                {speedKnots} kts • {(speedKmh / 3.6).toFixed(1)} m/s
              </div>
            </div>

            <div className="pt-1 border-t border-slate-800">
              <div className="text-[9px] uppercase font-mono text-slate-400">Peak Gusts</div>
              <div className="text-xs font-mono font-bold text-amber-300">
                {gustsKmh.toFixed(1)} km/h
              </div>
            </div>

            <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Barometer:</span>
              <span className="text-slate-200">{windData.pressureHpa.toFixed(0)} hPa</span>
            </div>
          </div>
        </div>

        {/* Beaufort Scale Banner */}
        <div className={`px-2.5 py-1 rounded-xl border mb-2 flex items-center justify-between text-[11px] font-mono ${intensityColor}`}>
          <span className="font-bold">Beaufort Force {windData.beaufortScale}</span>
          <span className="font-medium text-[10px]">{windData.beaufortDescription}</span>
        </div>

        {/* Visualization Mode Selector */}
        <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Render Mode:</span>
          <div className="flex bg-slate-900/90 rounded-lg p-0.5 border border-slate-800 text-[10px]">
            <button
              onClick={() => onChangeWindMode('streamlines')}
              className={`px-2 py-0.5 rounded transition ${
                windMode === 'streamlines'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Animated Streamline Particles"
            >
              Flow
            </button>
            <button
              onClick={() => onChangeWindMode('vectors')}
              className={`px-2 py-0.5 rounded transition ${
                windMode === 'vectors'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vector Arrow Grid"
            >
              Arrows
            </button>
            <button
              onClick={() => onChangeWindMode('both')}
              className={`px-2 py-0.5 rounded transition ${
                windMode === 'both'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Both Flow & Vector Arrows"
            >
              Both
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
