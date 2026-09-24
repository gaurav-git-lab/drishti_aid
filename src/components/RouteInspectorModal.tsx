import React, { useState } from 'react';
import { SafeRouteItem, RoutePlanningResult } from '../types';
import {
  Compass,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  MapPin,
  Hospital,
  Building,
  Navigation,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface RouteInspectorModalProps {
  routesResult: RoutePlanningResult | null;
  onClose: () => void;
  onSelectRoute: (route: SafeRouteItem) => void;
}

export const RouteInspectorModal: React.FC<RouteInspectorModalProps> = ({
  routesResult,
  onClose,
  onSelectRoute,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CLEAR' | 'CAUTION_FRINGE' | 'BLOCKED'>('ALL');
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(
    routesResult?.routes[0]?.id || null
  );

  if (!routesResult) return null;

  const filteredRoutes = routesResult.routes.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  const activeRoute =
    routesResult.routes.find((r) => r.id === selectedRouteId) ||
    routesResult.routes[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                A* Safe Evacuation Corridors & Shelter Matrix
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {routesResult.clearRoutesCount} Cleared
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Origin: {routesResult.originName} • Dynamic Flood Barrier Avoidance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Filter:</span>
          {(['ALL', 'CLEAR', 'CAUTION_FRINGE', 'BLOCKED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {status === 'ALL'
                ? `All (${routesResult.routes.length})`
                : status === 'CLEAR'
                ? `Clear (${routesResult.clearRoutesCount})`
                : status === 'CAUTION_FRINGE'
                ? `Caution (${routesResult.cautionRoutesCount})`
                : `Blocked (${routesResult.blockedRoutesCount})`}
            </button>
          ))}
        </div>

        {/* Main Content Split */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Routes list (Left) */}
          <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-3 space-y-2 max-h-[60vh]">
            {filteredRoutes.map((route) => {
              const isSelected = route.id === selectedRouteId;
              return (
                <div
                  key={route.id}
                  onClick={() => {
                    setSelectedRouteId(route.id);
                    onSelectRoute(route);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500/50 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {route.destinationName}
                    </h4>
                    <span
                      className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                        route.status === 'CLEAR'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : route.status === 'CAUTION_FRINGE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {route.status}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-cyan-400" />
                      {route.distanceKm} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      ~{route.travelTimeMinutes} mins
                    </span>
                    <span className="text-emerald-400">
                      {route.availableCapacity.toLocaleString()} beds free
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Route Detail & Turn-by-Turn (Right) */}
          <div className="md:col-span-7 overflow-y-auto p-4 space-y-4 max-h-[60vh] bg-slate-950/40">
            {activeRoute ? (
              <>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                      {activeRoute.destinationName}
                    </h3>
                    <span className="text-xs font-mono text-cyan-300">
                      Clearance Score: {activeRoute.safetyScore}%
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase">Distance</span>
                      <p className="font-mono font-bold text-white mt-0.5">{activeRoute.distanceKm} km</p>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase">Est. Convoy Time</span>
                      <p className="font-mono font-bold text-cyan-300 mt-0.5">~{activeRoute.travelTimeMinutes} mins</p>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase">Available Beds</span>
                      <p className="font-mono font-bold text-emerald-400 mt-0.5">{activeRoute.availableCapacity.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Navigation */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Turn-by-Turn Waypoints & Hazard Clearance
                  </h4>
                  <div className="space-y-2">
                    {activeRoute.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-start gap-3"
                      >
                        <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="flex-1 text-xs">
                          <p className="text-slate-200 font-medium">{step.instruction}</p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-mono">
                            <span>Via {step.roadName}</span>
                            <span>•</span>
                            <span>{step.distanceMeters}m</span>
                          </div>
                          {step.hazards.length > 0 && (
                            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-400">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>Caution: {step.hazards.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Select a route from the list to view turn-by-turn guidance
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            A* Algorithm weighted with SAR backscatter radar impedance
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition"
          >
            Close & View on Map
          </button>
        </div>
      </div>
    </div>
  );
};
