import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, CloudRain, ChevronUp, ChevronDown, Clock } from 'lucide-react';

interface TimelineControllerProps {
  currentHour: number;
  onHourChange: (hour: number) => void;
  disasterDate: string;
  rainfallMm: number;
  isRunningPipeline: boolean;
}

export const TimelineController: React.FC<TimelineControllerProps> = ({
  currentHour,
  onHourChange,
  disasterDate,
  rainfallMm,
  isRunningPipeline,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        onHourChange(currentHour >= 12 ? 0 : currentHour + 2);
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentHour, onHourChange]);

  const milestones = [
    { hr: 0, short: 'T+0', name: 'Baseline', title: 'T+0: Pre-Disaster SAR Baseline' },
    { hr: 2, short: '+2h', name: 'Runoff', title: 'T+2h: Inflow & Embankment Overtopping' },
    { hr: 4, short: '+4h', name: 'SAR', title: 'T+4h: Sentinel-1 SAR Pass / Flood Delineated' },
    { hr: 6, short: '+6h', name: 'Peak', title: 'T+6h: Maximum Deluge Crest' },
    { hr: 8, short: '+8h', name: 'Surge', title: 'T+8h: High-Tide Retardation & Surge' },
    { hr: 10, short: '+10h', name: 'Drain', title: 'T+10h: Drainage Phase' },
    { hr: 12, short: '+12h', name: 'Recess', title: 'T+12h: Slow Recession' },
  ];

  const getStageLabel = (hr: number) => {
    if (hr === 0) return 'T+0: Pre-Disaster SAR Baseline (Dry Ground)';
    if (hr === 2) return 'T+2h: Embankment Overtopping & Runoff';
    if (hr === 4) return 'T+4h: Sentinel-1 C-Band Pass / Flood Delineated';
    if (hr === 6) return 'T+6h: Peak Deluge Crest (Maximum Extent)';
    if (hr === 8) return 'T+8h: High-Tide Backwater Surge';
    if (hr === 10) return 'T+10h: Drainage Inflow Phase';
    return 'T+12h: Slow Recession & Mud Silt Deposition';
  };

  const calculatedRain = (
    rainfallMm * (currentHour === 0 ? 0.05 : Math.min(1, 0.2 + currentHour * 0.12))
  ).toFixed(0);

  // EXPANDED DETAILED CARD
  if (isExpanded) {
    return (
      <div className="bg-slate-950/60 hover:bg-slate-950/85 backdrop-blur-xl border border-slate-700/50 hover:border-slate-600/70 rounded-2xl px-3.5 py-2.5 shadow-2xl max-w-xl mx-auto text-slate-100 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-bold text-white truncate text-xs font-mono">
              {getStageLabel(currentHour)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="flex items-center gap-1 text-cyan-300 font-bold bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800/80 text-[10px] font-mono">
              <CloudRain className="w-3 h-3 text-blue-400" />
              {calculatedRain}mm
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white text-[11px] px-1.5 py-0.5 rounded bg-slate-800/60 border border-slate-700/60 transition"
              title="Collapse to minimal pill"
            >
              Minimize
            </button>
          </div>
        </div>

        {/* Slider & Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isRunningPipeline}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition active:scale-95 disabled:opacity-50 border shrink-0 ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40'
            }`}
            title={isPlaying ? 'Pause' : 'Play Timeline'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              onHourChange(0);
            }}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center justify-center transition active:scale-95 shrink-0"
            title="Reset to T+0h Baseline"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min="0"
              max="12"
              step="1"
              value={currentHour}
              onChange={(e) => {
                setIsPlaying(false);
                onHourChange(Number(e.target.value));
              }}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer appearance-none"
            />
          </div>

          <span className="font-mono text-xs font-bold text-cyan-300 bg-slate-950 px-2 py-0.5 rounded-md border border-cyan-500/30 shrink-0">
            T+{currentHour}h
          </span>
        </div>

        {/* Quick Milestones */}
        <div className="flex items-center justify-between gap-1 mt-2 pt-1.5 border-t border-slate-800/80">
          {milestones.map((m) => {
            const isActive = currentHour === m.hr;
            return (
              <button
                key={m.hr}
                onClick={() => {
                  setIsPlaying(false);
                  onHourChange(m.hr);
                }}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition border ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
                title={m.title}
              >
                {m.short} {m.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // MINIMAL COMPACT DOCK (Default)
  const activeMilestone = milestones.find((m) => m.hr === currentHour) || milestones[0];

  return (
    <div className="bg-slate-950/45 hover:bg-slate-950/75 backdrop-blur-md border border-slate-700/40 hover:border-slate-600/70 rounded-full px-2.5 py-1 shadow-lg flex items-center justify-between gap-2 text-slate-100 max-w-xl mx-auto ring-1 ring-white/5 transition-all">
      {/* Play/Pause & Reset */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={isRunningPipeline}
          className={`w-6 h-6 rounded-full flex items-center justify-center transition active:scale-95 disabled:opacity-50 border ${
            isPlaying
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
              : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40'
          }`}
          title={isPlaying ? 'Pause Timeline' : 'Auto-Play Timeline'}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5 fill-current" />}
        </button>

        <button
          onClick={() => {
            setIsPlaying(false);
            onHourChange(0);
          }}
          className="w-6 h-6 rounded-full bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/40 flex items-center justify-center transition active:scale-95"
          title="Reset to T+0h Baseline"
        >
          <RotateCcw className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Discrete Milestone Pills */}
      <div className="flex items-center bg-slate-950/40 p-0.5 rounded-full border border-slate-800/60 overflow-x-auto no-scrollbar gap-0.5 shrink-0">
        {milestones.map((m) => {
          const isActive = currentHour === m.hr;
          return (
            <button
              key={m.hr}
              onClick={() => {
                setIsPlaying(false);
                onHourChange(m.hr);
              }}
              className={`px-2 py-0.5 text-[10px] font-mono rounded-full transition flex items-center gap-1 ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={m.title}
            >
              <span>{m.short}</span>
              {isActive && <span className="hidden sm:inline text-[9px]">({m.name})</span>}
            </button>
          );
        })}
      </div>

      {/* Rain Indicator & Expand Details */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="hidden sm:flex items-center gap-1 text-blue-300 font-mono text-[10px] bg-slate-950/40 px-1.5 py-0.5 rounded-full border border-slate-800/60">
          <CloudRain className="w-2.5 h-2.5 text-blue-400" />
          {calculatedRain}mm
        </span>

        <button
          onClick={() => setIsExpanded(true)}
          className="w-6 h-6 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 flex items-center justify-center transition border border-transparent hover:border-slate-700"
          title="Expand detailed controls"
        >
          <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </div>
    </div>
  );
};
