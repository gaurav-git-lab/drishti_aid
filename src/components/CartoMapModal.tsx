import React, { useState } from 'react';
import { ExternalLink, X, Maximize2, Minimize2, Layers, RefreshCw } from 'lucide-react';

interface CartoMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapUrl?: string;
}

export const CartoMapModal: React.FC<CartoMapModalProps> = ({
  isOpen,
  onClose,
  mapUrl = 'https://thunbergii.app.carto.com/map/a7e2b3ad-4505-4663-8404-2d7ee51f9c6c',
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>(mapUrl);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);

  if (!isOpen) return null;

  return (
    <div
      id="carto-map-modal-overlay"
      className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4"
    >
      <div
        id="carto-map-modal-card"
        className={`bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${
          isFullscreen
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-6xl h-[88vh]'
        }`}
      >
        {/* Modal Header */}
        <div className="bg-slate-800/90 border-b border-slate-700 px-4 py-2.5 flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm ring-1 ring-emerald-400/30 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight truncate">
                  CARTO Geospatial Cloud Viewer
                </h3>
                <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-semibold shrink-0">
                  Live Map
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                {currentUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="btn-carto-reload"
              onClick={() => setIframeKey((prev) => prev + 1)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Reload CARTO Viewer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <a
              id="btn-carto-open-tab"
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Open full map in new browser tab"
            >
              <ExternalLink className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">Open in Tab</span>
            </a>
            <button
              id="btn-carto-fullscreen-toggle"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              id="btn-carto-close"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 hover:text-rose-300 text-slate-400 border border-slate-700 transition"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Map URL Switcher bar */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-medium shrink-0">Map Source:</span>
          <input
            id="input-carto-map-url"
            type="text"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 transition"
            placeholder="Paste another CARTO public map URL..."
          />
        </div>

        {/* Embedded CARTO iframe */}
        <div className="flex-1 w-full h-full bg-slate-950 relative">
          <iframe
            key={iframeKey}
            id="carto-live-map-iframe"
            src={currentUrl}
            title="CARTO Live Disaster & Spatial Map"
            className="w-full h-full border-0"
            allow="geolocation; fullscreen"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};
