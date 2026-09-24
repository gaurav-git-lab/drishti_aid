import React from 'react';
import { BrainCircuit, ShieldAlert, Sparkles, Truck, HeartHandshake, AlertCircle } from 'lucide-react';
import { AiBriefingResponse, DisasterScenario } from '../types';

interface AiTacticalBriefingModalProps {
  briefing: AiBriefingResponse | null;
  scenario: DisasterScenario;
  onClose: () => void;
  isLoading: boolean;
  onRegenerate: () => void;
}

export const AiTacticalBriefingModal: React.FC<AiTacticalBriefingModalProps> = ({
  briefing,
  scenario,
  onClose,
  isLoading,
  onRegenerate,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 ring-1 ring-purple-500/20">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">
                  DRISHTI AI Tactical NDRF Advisory
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {briefing?.source === 'gemini-3.8-flash'
                    ? 'Gemini 3.8 Flash'
                    : briefing?.source === 'gemini-3.6-flash'
                    ? 'Gemini 3.6 Flash'
                    : briefing?.source === 'gemini-flash-latest'
                    ? 'Gemini Flash'
                    : 'Tactical Heuristic Fallback'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Automated Incident Commander Briefing • {scenario.name}
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[65vh]">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <BrainCircuit className="w-8 h-8 text-purple-400 animate-spin" />
              <p className="text-sm text-slate-300 font-medium">
                Synthesizing SAR radar extent, population density rasters, and A* road clearance...
              </p>
            </div>
          ) : briefing ? (
            <>
              {/* Executive Summary */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                  Executive Situational Summary
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {briefing.executiveSummary}
                </p>
              </div>

              {/* NDRF Tactical Deployment Priorities */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  NDRF Deployment & Boat Allocation Priorities
                </h3>
                <ul className="space-y-2">
                  {briefing.ndrfDeploymentPriority.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-200 flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800"
                    >
                      <span className="w-4 h-4 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safe Evacuation Corridors */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  Arterial Evacuation Corridors
                </h3>
                <ul className="space-y-2">
                  {briefing.safeEvacuationCorridors.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-200 flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800"
                    >
                      <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Medical & Hospital Preparedness */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-cyan-400" />
                  Hospital & Trauma Preparedness
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {briefing.medicalPreparedness}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              Run analysis pipeline first to generate automated AI briefing.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="text-purple-400 hover:text-purple-300 font-mono text-[11px] underline disabled:opacity-50"
          >
            ↻ Regenerate Briefing
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
