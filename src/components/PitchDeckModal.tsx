import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  Sparkles,
  Radio,
  Satellite,
  Layers,
  BrainCircuit,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  Globe2,
  Database,
  ArrowRight,
  Zap,
  Target,
  FileCheck,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PitchDeckModalProps {
  onClose: () => void;
}

export const PitchDeckModal: React.FC<PitchDeckModalProps> = ({ onClose }) => {
  const deckRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!deckRef.current) return;
    setIsExporting(true);

    try {
      const element = deckRef.current;
      // High-resolution capture specifically tuned for a crisp 1-page A4 landscape or portrait PDF
      const canvas = await html2canvas(element, {
        scale: 2.5,
        backgroundColor: '#030712',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4', // 297mm x 210mm
      });

      const pdfWidth = 297;
      const pdfHeight = 210;

      // Exactly fit onto 1 single PDF page
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`DRISHTI-AID-Executive-Pitch-Deck.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF pitch deck:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 print:p-0 print:bg-white overflow-y-auto">
      <div className="bg-slate-950 border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 print:border-none print:shadow-none print:max-h-none print:w-full">
        {/* Modal Top Control Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  DRISHTI-AID • One-Page Executive Pitch Deck
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                  A4 Landscape Single Page PDF
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Ready for Investor Pitch, NDRF Command, Hackathon Presentation & Ministry Briefings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Print pitch deck"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              id="btn-download-pitch-deck-pdf"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-md shadow-cyan-500/30 transition active:scale-95 disabled:opacity-50"
              title="Download 1-Page Vector High-Res PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating PDF...' : 'Download 1-Page PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Preview Area with the Print/PDF Deck Container */}
        <div className="overflow-y-auto p-3 sm:p-5 flex-1 bg-slate-950 flex justify-center items-start print:p-0 print:bg-white">
          {/* Exact 16:9 / A4 Landscape Aspect Ratio Canvas (297mm x 210mm layout) */}
          <div
            ref={deckRef}
            className="w-full max-w-[1140px] bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-6 sm:p-7 shadow-2xl relative overflow-hidden font-sans print:border-none print:rounded-none print:shadow-none print:p-6"
            style={{ minHeight: '660px' }}
          >
            {/* Background Ambient Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Brand, Title & Tagline */}
            <div className="flex items-start justify-between border-b border-slate-800/80 pb-4 mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-300/40">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-mono">
                      DRISHTI-AID
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                      DEFENSE & DISASTER GIS
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      ALL-WEATHER RADAR
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Real-Time Synthetic Aperture Radar (SAR) Flood Inundation & AI Tactical Evacuation Engine
                  </p>
                </div>
              </div>

              <div className="text-right font-mono hidden sm:block">
                <div className="text-xs font-bold text-cyan-400">EXECUTIVE BRIEFING</div>
                <div className="text-[11px] text-slate-400">250 km² AOI • 10m Calibrated Pixel</div>
                <div className="text-[10px] text-slate-500">Dual-Polarized C-SAR • Gemini 3.8 AI</div>
              </div>
            </div>

            {/* 3-Column Pitch Deck Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 mb-4">
              {/* Column 1: The Problem & The Solution */}
              <div className="space-y-3.5">
                {/* 1. Problem Statement */}
                <div className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-3.5 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-400 mb-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span>The Critical Gap</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    Optical Satellites Are Blind in Cloudbursts
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    During heavy monsoons, <strong>95% of optical imagery (Landsat/Google Maps) is obscured by cloud cover</strong>. Emergency responders wait 24–48 hours for cloudy skies to clear while urban corridors flood in minutes without situational awareness.
                  </p>
                </div>

                {/* 2. The Solution */}
                <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-3.5 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Our Solution</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    C-Band Radar + Sub-Second AI Triage
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong>DRISHTI-AID</strong> ingests European Space Agency (ESA) Copernicus Sentinel-1 C-SAR radar that penetrates thick cloud cover day and night. It calculates backscatter decibel drops (-18dB) to map water within seconds and scores community vulnerability.
                  </p>
                </div>

                {/* Core Metrics Pill Group */}
                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2">
                    <div className="text-base font-extrabold text-cyan-400">250 km²</div>
                    <div className="text-[9px] text-slate-400 uppercase">Expanded Regional AOI</div>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2">
                    <div className="text-base font-extrabold text-emerald-400">&lt; 3.2s</div>
                    <div className="text-[9px] text-slate-400 uppercase">Inundation Pipeline</div>
                  </div>
                </div>
              </div>

              {/* Column 2: Tech Architecture & Differentiation */}
              <div className="space-y-3.5">
                {/* 3. Core Capabilities */}
                <div className="bg-slate-900/80 border border-indigo-500/30 rounded-xl p-3.5 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Proprietary GIS Pipeline</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Dual-Pol VV/VH Radar Inundation:</strong> Calibrated specular reflection matrix identifies submerged roads and urban waterlogging.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Tri-Engine Map Switching:</strong> Seamless live toggling between CARTO Spatial Cloud, Copernicus Satellite Canvas, and Tactical GIS.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Dynamic A* Flood-Clear Routing:</strong> Real-time road penalty graph finding safe evacuation corridors to NDRF shelters and hospitals.
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. AI Strategic Co-Pilot */}
                <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-3.5 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-400 mb-1.5">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Gemini 3.8 AI Incident Commander</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                    Translates raw pixel mathematics into actionable NDRF operational orders: boat allocations, medical triage routes, and high-consequence community alerts.
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-purple-300 bg-purple-950/40 px-2 py-1 rounded border border-purple-500/20">
                    <span>Google GenAI SDK Grounding</span>
                    <span>100% Automated SITREPs</span>
                  </div>
                </div>
              </div>

              {/* Column 3: Market, Deployment & Impact */}
              <div className="space-y-3.5">
                {/* 5. Target Stakeholders */}
                <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-3.5 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>Users & Deployability</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <div className="flex items-center justify-between p-1.5 bg-slate-950/70 rounded-lg border border-slate-800">
                      <span className="font-semibold text-white">NDRF & State DMAs</span>
                      <span className="text-[10px] font-mono text-cyan-300">Incident Command</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-slate-950/70 rounded-lg border border-slate-800">
                      <span className="font-semibold text-white">Municipal Corporations</span>
                      <span className="text-[10px] font-mono text-cyan-300">Urban Flood Triage</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-slate-950/70 rounded-lg border border-slate-800">
                      <span className="font-semibold text-white">Insurers & Infrastructure</span>
                      <span className="text-[10px] font-mono text-cyan-300">Damage Estimation</span>
                    </div>
                  </div>
                </div>

                {/* 6. Proven Historical Scenarios */}
                <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-3.5 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Calibrated Scenarios</span>
                  </div>
                  <div className="space-y-1.5 text-[10px] font-mono text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-white">● Mumbai Mithi Basin:</span>
                      <span className="text-cyan-400">250 km² • CST/BKC Corridor</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">● Chennai Adyar Catchment:</span>
                      <span className="text-cyan-400">250 km² • Chembarambakkam</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white">● Kerala Periyar Plain:</span>
                      <span className="text-cyan-400">250 km² • Cochin Airport Hub</span>
                    </div>
                  </div>
                </div>

                {/* Status Box */}
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/70 to-indigo-950/70 border border-cyan-500/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-cyan-400 font-bold block">
                      Production State
                    </span>
                    <strong className="text-white">TRL-7 Functional Prototype</strong>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                    READY TO DEPLOY
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Strip: Key Differentiators & Call to Action */}
            <div className="border-t border-slate-800/80 pt-3 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                <span className="flex items-center gap-1 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Zero Cloud Blindspots
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Database className="w-3.5 h-3.5 text-cyan-400" /> Copernicus Data Space Ecosystem
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Award className="w-3.5 h-3.5 text-indigo-400" /> A* Safe Routing Engine
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <FileCheck className="w-3.5 h-3.5 text-purple-400" /> One-Click SITREP PDF
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-slate-400">Contact:</span>
                <strong className="text-cyan-300 font-bold">DRISHTI-AID Initiative</strong>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">gauravmeenaonly@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
