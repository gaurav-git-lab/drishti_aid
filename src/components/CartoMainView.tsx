import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Maximize2, Minimize2, MapPin, Layers, Satellite } from 'lucide-react';
import { DisasterScenario } from '../types';

interface CartoMainViewProps {
  scenario: DisasterScenario;
  mapUrl?: string;
  onOpenTacticalGis?: () => void;
  onOpenCopernicus?: () => void;
  onOpenCopernicusView?: () => void;
}

export const CartoMainView: React.FC<CartoMainViewProps> = ({
  scenario,
  mapUrl = 'https://thunbergii.app.carto.com/map/a7e2b3ad-4505-4663-8404-2d7ee51f9c6c',
  onOpenTacticalGis,
  onOpenCopernicus,
  onOpenCopernicusView,
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>(mapUrl);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    const el = document.getElementById('carto-main-window-container');
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      id="carto-main-window-container"
      className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden"
    >
      {/* Floating Quick Banner / Controls on top of CARTO map */}
      <div className="absolute top-3 left-3 right-3 z-20 pointer-events-none flex items-center justify-between gap-2 flex-wrap">
        {/* Left Badge: Active CARTO Status */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 shadow-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white tracking-wide">
              CARTO Geospatial Cloud
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Default Map
            </span>
          </div>
          <div className="h-3.5 w-px bg-slate-700 mx-1" />
          <div className="flex items-center gap-1 text-[11px] text-slate-300">
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span className="font-semibold">{scenario.name}</span>
          </div>
        </div>

        {/* Right Floating Actions */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-xl">
          {onOpenCopernicusView && (
            <button
              id="btn-carto-switch-to-copernicus-view"
              onClick={onOpenCopernicusView}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-950/90 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 transition active:scale-95"
              title="Show live Copernicus Data Space Ecosystem satellite map in project"
            >
              <Satellite className="w-3 h-3 text-indigo-400" />
              <span>Copernicus Satellite Map</span>
            </button>
          )}

          {onOpenCopernicus && (
            <button
              id="btn-carto-open-copernicus"
              onClick={onOpenCopernicus}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95"
              title="Browse Sentinel SAR catalog and telemetry"
            >
              <span>Catalogue</span>
            </button>
          )}

          {onOpenTacticalGis && (
            <button
              id="btn-switch-tactical-gis"
              onClick={onOpenTacticalGis}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 transition active:scale-95"
              title="Switch to Tactical SAR & Flood Inundation GIS"
            >
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>Tactical SAR Map</span>
            </button>
          )}

          <button
            id="btn-carto-main-refresh"
            onClick={() => setIframeKey((prev) => prev + 1)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Reload CARTO Map"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <a
            id="btn-carto-main-tab"
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            title="Open full map in new browser tab"
          >
            <ExternalLink className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Open in Tab</span>
          </a>

          <button
            id="btn-carto-main-fullscreen"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Embedded Live CARTO Iframe Canvas */}
      <div className="w-full h-full bg-slate-950 relative">
        <iframe
          key={iframeKey}
          id="carto-main-canvas-iframe"
          src={currentUrl}
          title="CARTO Live Geospatial Cloud Map"
          className="w-full h-full border-0"
          allow="geolocation; fullscreen"
          loading="eager"
        />
      </div>
    </div>
  );
};
