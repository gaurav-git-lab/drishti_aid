import React from 'react';
import { Camera, Play, Radio, Sparkles } from 'lucide-react';

interface TopNavProps {
  activeTab: 'preview' | 'gis' | 'pipeline' | 'code' | 'pitch';
  onSelectTab: (tab: 'preview' | 'gis' | 'pipeline' | 'code' | 'pitch') => void;
  onCaptureFrame: () => void;
  onPlayPreview: () => void;
  isPlaying: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  onCaptureFrame,
  onPlayPreview,
  isPlaying,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-b border-slate-800/80 shrink-0 z-50">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2">
        <a
          href="#preview"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('preview');
          }}
          className="text-lg font-black tracking-tight text-white hover:text-cyan-300 transition-colors flex items-center gap-2"
        >
          <Radio className="w-5 h-5 text-cyan-400" />
          <span>DRISHTI-AID</span>
        </a>
        <span className="text-xs font-mono text-slate-500 hidden sm:inline">· SIH 2026</span>
      </div>

      {/* Zone 2: 4-5 clean text navigation links */}
      <nav className="flex items-center gap-1 md:gap-4 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectTab('preview')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'preview'
              ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30'
              : 'hover:text-slate-100 hover:bg-slate-900'
          }`}
        >
          Video Preview
        </button>

        <button
          onClick={() => onSelectTab('gis')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'gis'
              ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30'
              : 'hover:text-slate-100 hover:bg-slate-900'
          }`}
        >
          Interactive GIS
        </button>

        <button
          onClick={() => onSelectTab('pipeline')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'pipeline'
              ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30'
              : 'hover:text-slate-100 hover:bg-slate-900'
          }`}
        >
          Pipeline Tech
        </button>

        <button
          onClick={() => onSelectTab('code')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'code'
              ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30'
              : 'hover:text-slate-100 hover:bg-slate-900'
          }`}
        >
          Code &amp; Render
        </button>

        <button
          onClick={() => onSelectTab('pitch')}
          className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap hidden lg:block ${
            activeTab === 'pitch'
              ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30'
              : 'hover:text-slate-100 hover:bg-slate-900'
          }`}
        >
          Pitch Storyboard
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onCaptureFrame}
          className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700/80 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
          title="Export current 1080p frame as high-res PNG image"
        >
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Capture Frame</span>
        </button>

        <button
          onClick={onPlayPreview}
          className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all shadow-md shadow-cyan-400/20 flex items-center gap-1.5 whitespace-nowrap"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isPlaying ? 'Pause' : 'Play 20s'}</span>
        </button>
      </div>
    </header>
  );
};
