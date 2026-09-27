import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Repeat, 
  StepBack, 
  StepForward, 
  Sliders,
  Layers,
  Sparkles
} from 'lucide-react';
import { SCENES, TOTAL_DURATION, FPS, TOTAL_FRAMES } from '../types';
import { tacticalAudio } from '../utils/audioSynthesizer';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isLooping: boolean;
  isMuted: boolean;
  scaleMode: 'fit' | 'fill' | 'original';
  interactiveLayer: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSetSpeed: (speed: number) => void;
  onToggleLoop: () => void;
  onToggleMute: () => void;
  onToggleScaleMode: () => void;
  onToggleInteractiveLayer: () => void;
  onRestart: () => void;
  onJumpToScene: (startTime: number) => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  isLooping,
  isMuted,
  scaleMode,
  interactiveLayer,
  onPlayPause,
  onSeek,
  onSetSpeed,
  onToggleLoop,
  onToggleMute,
  onToggleScaleMode,
  onToggleInteractiveLayer,
  onRestart,
  onJumpToScene,
}) => {
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const currentFrame = Math.min(TOTAL_FRAMES, Math.floor(currentTime * FPS));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${String(mins).padStart(2, '0')}:${secs.padStart(4, '0')}`;
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  };

  const handleStep = (deltaFrames: number) => {
    const deltaSeconds = deltaFrames / FPS;
    const target = Math.max(0, Math.min(TOTAL_DURATION, currentTime + deltaSeconds));
    onSeek(target);
  };

  const currentScene = SCENES.find(
    (s) => currentTime >= s.startTime && (currentTime < s.endTime || (s.number === 5 && currentTime <= s.endTime))
  ) || SCENES[0];

  return (
    <div className="w-full bg-slate-950/95 border-t border-slate-800/80 px-6 py-4 flex flex-col gap-3 select-none backdrop-blur-md">
      {/* Upper Scrubber Bar & Scene Landmarks */}
      <div className="w-full flex flex-col gap-1.5">
        {/* Timeline Header Info */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold">{currentScene.badge}</span>
            <span>·</span>
            <span className="text-slate-200 font-semibold">{currentScene.title}</span>
            <span className="hidden md:inline text-slate-500">({currentScene.keyAction})</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Frame <strong className="text-white font-mono">{currentFrame}</strong> / {TOTAL_FRAMES}
            </span>
            <span>·</span>
            <span className="text-cyan-300 font-bold font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Scrubber Track with Chapter Region Visualizer */}
        <div className="relative w-full h-8 flex items-center group">
          {/* Visual Chapter Bar */}
          <div className="absolute inset-x-0 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex">
            {SCENES.map((scene) => {
              const widthPct = ((scene.endTime - scene.startTime) / TOTAL_DURATION) * 100;
              const isSceneActive = currentTime >= scene.startTime && currentTime < scene.endTime;
              return (
                <div
                  key={scene.id}
                  style={{ width: `${widthPct}%` }}
                  className={`h-full border-r border-slate-950 relative transition-colors ${
                    isSceneActive ? 'bg-cyan-500/30' : 'bg-slate-800/40 hover:bg-slate-700/50'
                  }`}
                  title={`${scene.title} (${scene.startTime}s - ${scene.endTime}s)`}
                />
              );
            })}
          </div>

          {/* Progress fill */}
          <div 
            className="absolute left-0 h-2 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-l-full pointer-events-none"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />

          {/* Chapter markers (ticks) */}
          {SCENES.map((scene) => {
            const leftPct = (scene.startTime / TOTAL_DURATION) * 100;
            return (
              <button
                key={scene.id}
                onClick={() => onJumpToScene(scene.startTime)}
                style={{ left: `${leftPct}%` }}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-4 -ml-1 rounded-sm bg-slate-600 hover:bg-cyan-400 z-10 cursor-pointer transition-colors"
                title={`Jump to Scene ${scene.number}: ${scene.title}`}
              />
            );
          })}

          {/* Range input scrubber */}
          <input
            type="range"
            min={0}
            max={duration}
            step={0.033}
            value={currentTime}
            onChange={handleScrubberChange}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setHoverTime(pct * duration);
            }}
            onMouseLeave={() => setHoverTime(null)}
            className="w-full absolute inset-0 opacity-0 cursor-pointer z-20"
          />

          {/* Scrubber Playhead Handle */}
          <div
            style={{ left: `${(currentTime / duration) * 100}%` }}
            className="absolute top-1/2 -translate-y-1/2 -ml-2.5 w-5 h-5 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-[0_0_12px_#22d3ee] pointer-events-none z-15"
          />

          {/* Hover timestamp tooltip */}
          {hoverTime !== null && (
            <div
              style={{ left: `${(hoverTime / duration) * 100}%` }}
              className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] pointer-events-none border border-slate-700 shadow-md whitespace-nowrap"
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>
      </div>

      {/* Lower Row Controls: Transport Buttons, Scene Jumpers, Settings */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        {/* Left: Playback transport */}
        <div className="flex items-center gap-2">
          {/* Restart */}
          <button
            onClick={onRestart}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Restart from beginning (0s)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Step Back 1 Frame */}
          <button
            onClick={() => handleStep(-1)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Step Back 1 Frame (-1/30s)"
          >
            <StepBack className="w-4 h-4" />
          </button>

          {/* Main Play / Pause */}
          <button
            onClick={onPlayPause}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-sm transition-all shadow-lg ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
            }`}
            title={isPlaying ? 'Pause (Space)' : 'Play Preview (Space)'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play 20s Pitch</span>
              </>
            )}
          </button>

          {/* Step Forward 1 Frame */}
          <button
            onClick={() => handleStep(1)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Step Forward 1 Frame (+1/30s)"
          >
            <StepForward className="w-4 h-4" />
          </button>

          {/* Divider */}
          <span className="h-5 w-px bg-slate-800 mx-1" />

          {/* Loop toggle */}
          <button
            onClick={onToggleLoop}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${
              isLooping
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Loop Playback"
          >
            <Repeat className="w-4 h-4" />
            <span className="hidden sm:inline">Loop</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium ${
              !isMuted
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isMuted ? 'Unmute Tactical Audio' : 'Mute Tactical Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>
        </div>

        {/* Center: Scene Jumpers 1 to 5 */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <span className="text-[11px] font-mono text-slate-500 px-2 uppercase">Scenes:</span>
          {SCENES.map((scene) => {
            const isActive = currentScene.id === scene.id;
            return (
              <button
                key={scene.id}
                onClick={() => onJumpToScene(scene.startTime)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={`Scene ${scene.number}: ${scene.title} (${scene.startTime}s - ${scene.endTime}s)`}
              >
                0{scene.number}
              </button>
            );
          })}
        </div>

        {/* Right: Speed, Scale, Interactive toggle */}
        <div className="flex items-center gap-2">
          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <span className="text-[10px] font-mono text-slate-500 pl-1">SPEED</span>
            {[0.5, 1, 1.5, 2].map((rate) => (
              <button
                key={rate}
                onClick={() => onSetSpeed(rate)}
                className={`px-2 py-0.5 text-xs font-mono rounded ${
                  playbackRate === rate
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Scale Mode */}
          <button
            onClick={onToggleScaleMode}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-mono"
            title="Toggle Canvas Fit Mode (Fit / Fill / 100%)"
          >
            <Maximize2 className="w-4 h-4" />
            <span className="hidden lg:inline uppercase">{scaleMode}</span>
          </button>

          {/* Interactive Layer Toggle */}
          <button
            onClick={onToggleInteractiveLayer}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              interactiveLayer
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle SAR Data Inspection Overlay"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Inspect SAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
