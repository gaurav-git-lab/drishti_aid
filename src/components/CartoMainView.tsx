import React from 'react';
import { MapPin } from 'lucide-react';
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
}) => {
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
      </div>

      {/* Embedded Live CARTO Iframe Canvas */}
      <div className="w-full h-full bg-slate-950 relative">
        <iframe
          id="carto-main-canvas-iframe"
          src={mapUrl}
          title="CARTO Live Geospatial Cloud Map"
          className="w-full h-full border-0"
          allow="geolocation; fullscreen"
          loading="eager"
        />
      </div>
    </div>
  );
};
