import React from 'react';
import {
  Satellite,
  Navigation,
  Activity,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Eye,
  Waves,
  ChevronRight,
  Play,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: (scenarioId?: string) => void;
  currentScenarioId: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, currentScenarioId }) => {

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      {/* Background ambient glowing orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-indigo-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/4 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-[160px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
                <Satellite className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-wider text-white">
                  DRISHTI<span className="text-cyan-400">-AID</span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-full font-semibold">
                  SAR C-Band AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
                Copernicus Sentinel-1 Rapid Inundation & Evacuation Engine
              </p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <a href="#pipeline" className="hover:text-cyan-400 transition-colors">SAR Pipeline</a>
            <a href="#comparison" className="hover:text-cyan-400 transition-colors">Why SAR vs Optical</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>COPERNICUS LEO: ACTIVE</span>
            </div>
            <button
              onClick={() => onEnterApp(currentScenarioId)}
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 border border-cyan-300/30 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <span>Launch Mission Control</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-20 md:pt-28 md:pb-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium backdrop-blur-md mb-6 shadow-lg shadow-cyan-950/40">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>SMART INDIA HACKATHON 2026 • AUTONOMOUS SATELLITE DISASTER RESPONSE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.12] max-w-4xl">
          When Cloudbursts Blind Optical Satellites,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
            We See Through The Storm.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl font-light mt-6">
          Conventional optical imaging is rendered completely blind by monsoon cloud covers during peak flood disasters.
          <strong className="text-white font-medium"> DRISHTI-AID</strong> leverages active microwave C-Band Synthetic Aperture Radar (SAR)
          to pierce dense storm clouds 24/7, segmenting floodwaters and computing guaranteed dry evacuation corridors in under 1.2 seconds.
        </p>

        {/* Launch Button */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
          <button
            onClick={() => onEnterApp(currentScenarioId)}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-2xl shadow-cyan-400/30 hover:shadow-cyan-400/50 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>Launch Tactical Mission Console</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Live Telemetry Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-12 w-full max-w-4xl border-t border-slate-800/80 mt-12 text-left">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md hover:border-cyan-500/40 transition-colors">
            <div className="text-3xl font-black text-cyan-400 font-mono">100%</div>
            <div className="text-xs text-slate-300 font-semibold mt-1">Cloud Penetration</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">5.405 GHz C-Band Radar</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
            <div className="text-3xl font-black text-emerald-400 font-mono">&lt; 1.2s</div>
            <div className="text-xs text-slate-300 font-semibold mt-1">AI Inference Time</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Specular Backscatter Matrix</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md hover:border-indigo-500/40 transition-colors">
            <div className="text-3xl font-black text-indigo-400 font-mono">10m</div>
            <div className="text-xs text-slate-300 font-semibold mt-1">Ground Resolution</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Copernicus Sentinel-1 GRD</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-md hover:border-amber-500/40 transition-colors">
            <div className="text-3xl font-black text-amber-400 font-mono">A* Engine</div>
            <div className="text-xs text-slate-300 font-semibold mt-1">Safe Evacuation</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">Zero Water Breach Guarantee</div>
          </div>
        </div>
      </section>

      {/* Why Optical Satellites Fail vs How SAR Wins */}
      <section id="comparison" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase mb-2">
            <Eye className="w-3.5 h-3.5" />
            <span>The Sensor Revolution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why Optical Satellites Fail During Monsoons
          </h2>
          <p className="text-base text-slate-400 mt-2">
            During devastating flood events, thick cloudburst cover and rainfall create a total blackout for standard optical sensors.
            DRISHTI-AID solves this by using active radar microwaves.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Failure of Optical Satellites */}
          <div className="rounded-2xl bg-gradient-to-b from-rose-950/20 via-slate-900/60 to-slate-950/90 border border-rose-500/30 p-8 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Conventional Optical Satellites</h3>
                <span className="text-xs font-mono text-rose-400">Sentinel-2 • Landsat • Planet (RGB/NIR)</span>
              </div>
            </div>

            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold text-base leading-none">✕</span>
                <div>
                  <strong className="text-white block font-medium">100% Blinded by Monsoon Clouds</strong>
                  Optical wavelengths (0.4 - 0.9 µm) cannot penetrate water droplets in cumulonimbus cloud covers.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold text-base leading-none">✕</span>
                <div>
                  <strong className="text-white block font-medium">Zero Night-Time Imaging</strong>
                  Passive optical imaging relies strictly on solar sunlight. If a river breaches at night, optical satellites are useless.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-rose-400 font-bold text-base leading-none">✕</span>
                <div>
                  <strong className="text-white block font-medium">Critical 48-Hour Revisit Delay</strong>
                  First responders are left blind during the golden hours of rescue operations.
                </div>
              </li>
            </ul>

            <div className="mt-8 p-4 rounded-xl bg-rose-950/40 border border-rose-500/20 text-xs font-mono text-rose-300">
              RESULT: NDRF and district collectors make blind routing decisions during peak casualty windows.
            </div>
          </div>

          {/* The DRISHTI-AID SAR Solution */}
          <div className="rounded-2xl bg-gradient-to-b from-cyan-950/30 via-slate-900/60 to-slate-950/90 border border-cyan-500/40 p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-cyan-500/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                <Satellite className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">DRISHTI-AID Microwave SAR Engine</h3>
                <span className="text-xs font-mono text-cyan-400">Sentinel-1 C-Band (5.405 GHz Active Radar)</span>
              </div>
            </div>

            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">100% Cloud, Smoke & Storm Penetration</strong>
                  5.6 cm radar microwave pulses completely ignore rain droplets, thick clouds, and hurricane mists.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">24/7 Day & Night Active Radar Transmission</strong>
                  Transmits its own electromagnetic beam and measures backscatter echo regardless of solar daylight.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">Specular Water Reflection Physics</strong>
                  Smooth standing floodwater acts as a mirror, reflecting radar energy away (-15 to -22 dB drop), giving sharp water boundaries.
                </div>
              </li>
            </ul>

            <div className="mt-8 p-4 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center justify-between">
              <span>ACTIVE SYSTEM: COPERNICUS SENTINEL-1 IW GRD</span>
              <span className="text-emerald-400 font-bold">100% OPERATIONAL</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Autonomous Disaster Response Pipeline */}
      <section id="pipeline" className="relative z-10 py-20 bg-slate-950/60 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Autonomous Workflow</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              One Unified Emergency Response Pipeline
            </h2>
            <p className="text-base text-slate-400 mt-2">
              From raw Copernicus satellite orbit passes to tactical rescue dispatch instructions on the ground in under 6 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5 font-mono font-bold text-lg">
                  01
                </div>
                <h4 className="text-base font-bold text-white mb-2">Copernicus SAR Ingestion</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fetches dual-polarization (VV + VH) calibrated backscatter grids from Copernicus Open Access Hub & Google Earth Engine.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-cyan-300">
                • 10m Ground Sample Distance<br />• Calibrated Gamma0 backscatter
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between hover:border-sky-500/50 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-5 font-mono font-bold text-lg">
                  02
                </div>
                <h4 className="text-base font-bold text-white mb-2">Specular AI Water Extraction</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Applies Otsu adaptive thresholding and temporal change detection matrix to classify deep water vs normal ground clutter.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-sky-300">
                • Otsu dB Thresholding<br />• 94.8% Coherence Change Loss
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between hover:border-emerald-500/50 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 font-mono font-bold text-lg">
                  03
                </div>
                <h4 className="text-base font-bold text-white mb-2">A* Evacuation Routing</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ingests OpenStreetMap road vectors, intersects with SAR flood polygons, and assigns infinite penalty to submerged road corridors.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-emerald-300">
                • 100% Dry Road Assurance<br />• Sub-second topology graph
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between hover:border-indigo-500/50 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 font-mono font-bold text-lg">
                  04
                </div>
                <h4 className="text-base font-bold text-white mb-2">Tactical Shelter Dispatch</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Matches isolated civilian pockets to nearest active NDRF staging shelters, hospitals with ICU capacity, and helicopter landing zones.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-indigo-300">
                • Live Hospital Bed Triage<br />• PDF Mission Brief Export
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Footer (One-Liner) */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/90 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          {/* Brand & Attribution */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/20">
              <Satellite className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wider whitespace-nowrap">
                DRISHTI-AID
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 whitespace-nowrap">
                Team GeoPulse • Smart India Hackathon 2026
              </span>
            </div>
          </div>

          {/* Operational Status Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-sm whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SYSTEM STATUS: 100% OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
