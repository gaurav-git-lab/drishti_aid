import React from 'react';
import { Play, Pause, SkipBack, SkipForward, CloudRain, Zap, X, Sliders, Layers } from 'lucide-react';
import { RadarFrame } from '../types';

interface WeatherRadarControllerProps {
  frames: RadarFrame[];
  currentFrameIndex: number;
  onSelectFrame: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
  onClose: () => void;
  scenarioName: string;
  rainfall24hMm: number;
  className?: string;
}

export const WeatherRadarController: React.FC<WeatherRadarControllerProps> = ({
  frames,
  currentFrameIndex,
  onSelectFrame,
  isPlaying,
  onTogglePlay,
  opacity,
  onChangeOpacity,
  onClose,
  scenarioName,
  rainfall24hMm,
  className,
}) => {
  const currentFrame = frames[currentFrameIndex];
  const frameDate = currentFrame?.time
    ? new Date(currentFrame.time * 1000)
    : new Date();

  const formattedTime = frameDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const isLatestFrame = currentFrameIndex === frames.length - 1;

  return (
    <div className={className || "absolute bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-lg select-none"}>
      <div className="bg-slate-950/85 hover:bg-slate-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-3 shadow-2xl text-slate-100 transition-all duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800/80 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute" />
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            </div>
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              Doppler Precipitation Radar
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
              {formattedTime}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition"
              title="Close Radar Overlay"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Radar Controls: Slider & Playback */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 transition"
              title={isPlaying ? 'Pause radar loop' : 'Play 2h radar loop'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>

            <button
              onClick={() => onSelectFrame(Math.max(0, currentFrameIndex - 1))}
              disabled={currentFrameIndex === 0}
              className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition text-xs"
              title="Step backward"
            >
              <SkipBack className="w-3 h-3" />
            </button>

            {/* Time Scrubber Slider */}
            <div className="flex-1 flex flex-col justify-center">
              <input
                type="range"
                min="0"
                max={Math.max(0, frames.length - 1)}
                value={currentFrameIndex}
                onChange={(e) => onSelectFrame(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
            </div>

            <button
              onClick={() => onSelectFrame(Math.min(frames.length - 1, currentFrameIndex + 1))}
              disabled={currentFrameIndex >= frames.length - 1}
              className="w-6 h-6 flex items-center justify-center rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition text-xs"
              title="Step forward"
            >
              <SkipForward className="w-3 h-3" />
            </button>

            <button
              onClick={() => onSelectFrame(frames.length - 1)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition ${
                isLatestFrame
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Jump to latest scan"
            >
              LIVE
            </button>
          </div>

          {/* Sub-bar: Opacity & Info */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="font-mono text-[10px] text-slate-400">
              Frame {currentFrameIndex + 1}/{frames.length || 1} • {isLatestFrame ? 'Real-Time Scan' : formattedTime}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Opacity:</span>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
                className="w-16 accent-cyan-400 bg-slate-800 h-1 rounded cursor-pointer"
              />
              <span className="font-mono text-[10px] text-cyan-400 w-7 text-right">
                {Math.round(opacity * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Reflectivity dBZ Legend Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mb-1">
            <span>RADAR REFLECTIVITY (dBZ)</span>
            <span className="text-cyan-400">Rainfall Intensity</span>
          </div>
          <div className="grid grid-cols-5 gap-1 text-[9px] font-mono text-center font-bold">
            <div className="bg-sky-500/80 text-slate-950 rounded py-0.5">15 Light</div>
            <div className="bg-emerald-500/80 text-slate-950 rounded py-0.5">25 Mod</div>
            <div className="bg-yellow-400/90 text-slate-950 rounded py-0.5">35 Heavy</div>
            <div className="bg-rose-500/90 text-white rounded py-0.5">50 Severe</div>
            <div className="bg-fuchsia-600 text-white rounded py-0.5">65+ Burst</div>
          </div>
        </div>
      </div>
    </div>
  );
};
