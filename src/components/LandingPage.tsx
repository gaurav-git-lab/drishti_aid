import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  Shield,
  Layers,
  MapPin,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  Compass,
  Zap,
  Globe2,
  Radio,
  Search,
} from 'lucide-react';
import { SCENARIOS } from '../../server/geoData';

interface LandingPageProps {
  onEnterApp: (scenarioId?: string) => void;
  currentScenarioId: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  currentScenarioId,
}) => {
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [pingCount, setPingCount] = useState(0);
  const [pings, setPings] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState(currentScenarioId || 'mumbai');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTitleHovered, setIsTitleHovered] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEntering, setIsEntering] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy Web Audio Context initializer
  const getAudioContext = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  };

  // High-tech tactical mouse hover and interaction sound synthesizer
  const playHoverSound = (variant: 'blip' | 'radar' | 'subtle' | 'sonar' = 'blip', customFreq?: number) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (variant === 'radar') {
        // High-tech radar sweep tone
        const freq = customFreq || 840;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (variant === 'subtle') {
        // Soft button hover tick
        const freq = customFreq || 520;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.025, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (variant === 'sonar') {
        // Sonar ping launch chirp
        const freq = customFreq || 1080;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);
      } else {
        // Standard tactical cyber blip
        const freq = customFreq || 640;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq + 140, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
      }
    } catch {
      // Audio autoplay restrictions or fallback
    }
  };

  // Trigger pulse effect when logo is clicked - Exactly 1 Click opens the website
  const handleLogoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEntering) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newPing = { id: Date.now() + Math.random(), x, y };
    setPings((prev) => [...prev.slice(-4), newPing]);
    setPingCount((c) => c + 1);
    setIsEntering(true);

    // Audio confirmation chirp
    playHoverSound('sonar', 1100);

    // Launch directly into Mission Control after a brief tactile ripple effect
    setTimeout(() => {
      onEnterApp(selectedScenario);
    }, 280);
  };

  // Subtle mouse tracking for ambient radial lighting
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  interface CityOption {
    name: string;
    state: string;
    riverBasin: string;
    scenarioId: string;
    elevation: string;
  }

  const CITY_DATABASE: CityOption[] = [
    { name: 'Mumbai', state: 'Maharashtra', riverBasin: 'Mithi River Catchment & Mahim Basin', scenarioId: 'mumbai', elevation: '8m MSL' },
    { name: 'Delhi', state: 'National Capital Region', riverBasin: 'Yamuna River Floodplain Basin', scenarioId: 'delhi', elevation: '216m MSL' },
    { name: 'Bengaluru', state: 'Karnataka', riverBasin: 'Vrishabhavathi & Bellandur Lake Basin', scenarioId: 'bengaluru', elevation: '920m MSL' },
    { name: 'Chennai', state: 'Tamil Nadu', riverBasin: 'Adyar & Cooum Coastal Estuary Basin', scenarioId: 'chennai', elevation: '6m MSL' },
    { name: 'Kolkata', state: 'West Bengal', riverBasin: 'Hooghly Estuary & Ganga Lower Delta', scenarioId: 'kolkata', elevation: '9m MSL' },
    { name: 'Hyderabad', state: 'Telangana', riverBasin: 'Musi River Catchment Basin', scenarioId: 'hyderabad', elevation: '542m MSL' },
    { name: 'Pune', state: 'Maharashtra', riverBasin: 'Mula-Mutha River & Khadakwasla Basin', scenarioId: 'pune', elevation: '560m MSL' },
    { name: 'Ahmedabad', state: 'Gujarat', riverBasin: 'Sabarmati River & Dharoi Basin', scenarioId: 'ahmedabad', elevation: '53m MSL' },
    { name: 'Kochi', state: 'Kerala', riverBasin: 'Periyar River Coastal Estuary & Backwaters', scenarioId: 'kochi', elevation: '4m MSL' },
    { name: 'Thiruvananthapuram', state: 'Kerala', riverBasin: 'Karamana & Neyyar River Basin', scenarioId: 'thiruvananthapuram', elevation: '10m MSL' },
    { name: 'Patna', state: 'Bihar', riverBasin: 'Ganges & Son Confluence Floodplain', scenarioId: 'patna', elevation: '53m MSL' },
    { name: 'Guwahati', state: 'Assam', riverBasin: 'Brahmaputra Valley River Basin', scenarioId: 'guwahati', elevation: '55m MSL' },
    { name: 'Bhubaneswar', state: 'Odisha', riverBasin: 'Mahanadi River Delta & Kuakhai Basin', scenarioId: 'bhubaneswar', elevation: '45m MSL' },
    { name: 'Surat', state: 'Gujarat', riverBasin: 'Tapi River Estuary & Ukai Dam Basin', scenarioId: 'surat', elevation: '13m MSL' },
    { name: 'Jaipur', state: 'Rajasthan', riverBasin: 'Dravyavati River Basin', scenarioId: 'jaipur', elevation: '431m MSL' },
    { name: 'Lucknow', state: 'Uttar Pradesh', riverBasin: 'Gomti River Floodplain', scenarioId: 'lucknow', elevation: '123m MSL' },
    { name: 'Indore', state: 'Madhya Pradesh', riverBasin: 'Kahn & Saraswati River Catchment', scenarioId: 'indore', elevation: '553m MSL' },
    { name: 'Visakhapatnam', state: 'Andhra Pradesh', riverBasin: 'Eastern Ghats Coastal Basin', scenarioId: 'visakhapatnam', elevation: '12m MSL' },
    { name: 'Srinagar', state: 'Jammu & Kashmir', riverBasin: 'Jhelum River & Dal Lake Basin', scenarioId: 'srinagar', elevation: '1585m MSL' },
    { name: 'Coimbatore', state: 'Tamil Nadu', riverBasin: 'Noyyal River Basin', scenarioId: 'coimbatore', elevation: '411m MSL' },
    { name: 'Madurai', state: 'Tamil Nadu', riverBasin: 'Vaigai River Basin', scenarioId: 'madurai', elevation: '101m MSL' },
    { name: 'Kozhikode', state: 'Kerala', riverBasin: 'Chaliyar & Kallai River Basin', scenarioId: 'kochi', elevation: '1m MSL' },
    { name: 'Aluva', state: 'Kerala', riverBasin: 'Periyar River Lower Reach Basin', scenarioId: 'kerala', elevation: '8m MSL' },
    { name: 'Thane', state: 'Maharashtra', riverBasin: 'Ulhas River & Thane Creek Basin', scenarioId: 'mumbai', elevation: '7m MSL' },
    { name: 'Navi Mumbai', state: 'Maharashtra', riverBasin: 'Panvel Creek & Kasadi River Basin', scenarioId: 'mumbai', elevation: '10m MSL' },
    { name: 'Nagpur', state: 'Maharashtra', riverBasin: 'Nag & Pili River Catchment', scenarioId: 'nagpur', elevation: '310m MSL' },
    { name: 'Varanasi', state: 'Uttar Pradesh', riverBasin: 'Ganga & Varuna River Floodplain', scenarioId: 'varanasi', elevation: '80m MSL' },
    { name: 'Dehradun', state: 'Uttarakhand', riverBasin: 'Song & Asan River Valley', scenarioId: 'dehradun', elevation: '640m MSL' },
    { name: 'Shimla', state: 'Himachal Pradesh', riverBasin: 'Sutlej River Catchment Area', scenarioId: 'shimla', elevation: '2206m MSL' },
    { name: 'Vijayawada', state: 'Andhra Pradesh', riverBasin: 'Krishna River Delta', scenarioId: 'visakhapatnam', elevation: '11m MSL' },
    { name: 'Mangaluru', state: 'Karnataka', riverBasin: 'Netravati & Gurupura River Estuary', scenarioId: 'kochi', elevation: '22m MSL' },
    { name: 'Vadodara', state: 'Gujarat', riverBasin: 'Vishwamitri River Basin', scenarioId: 'surat', elevation: '39m MSL' },
    { name: 'Cuttack', state: 'Odisha', riverBasin: 'Mahanadi & Kathajodi Confluence', scenarioId: 'bhubaneswar', elevation: '36m MSL' },
    { name: 'Amritsar', state: 'Punjab', riverBasin: 'Beas & Ravi River Basin', scenarioId: 'amritsar', elevation: '234m MSL' },
    { name: 'Chandigarh', state: 'Punjab/Haryana', riverBasin: 'Sukhna Lake Catchment', scenarioId: 'chandigarh', elevation: '321m MSL' },
  ];

  const handleCitySubmit = () => {
    if (!searchQuery.trim()) {
      onEnterApp(selectedScenario);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const match = CITY_DATABASE.find(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.riverBasin.toLowerCase().includes(q)
    );
    playHoverSound('sonar', 1040);
    if (match) {
      setSelectedScenario(match.scenarioId);
      onEnterApp(match.scenarioId);
    } else {
      const customId = q.replace(/[^a-z0-9_-]/g, '');
      setSelectedScenario(customId);
      onEnterApp(customId);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full bg-[#05070d] text-slate-100 flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans"
      style={{
        backgroundImage: `
          radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, 0.08) 0%, transparent 600px),
          radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.05) 0%, transparent 800px)
        `,
      }}
    >
      {/* Background Orbital Grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #38bdf8 1px, transparent 1px),
            linear-gradient(to bottom, #38bdf8 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Top Header Contract: Minimal 3-Zone Bar */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900/80">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
          <span className="text-base font-semibold tracking-wider uppercase font-mono text-slate-200">
            DRISHTI<span className="text-cyan-400 font-extrabold">-AID</span>
          </span>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            · EO-SAR OPS
          </span>
        </div>

        {/* Zone 2: Quiet Metadata */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span>Sentinel-1 SAR C-Band</span>
          <span className="text-slate-700">/</span>
          <span>Copernicus CDSE</span>
          <span className="text-slate-700">/</span>
          <span className="text-cyan-400/90 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Active Surveillance
          </span>
        </div>

        {/* Zone 3: Quiet Telemetry Lock Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800/80 px-2.5 py-1 rounded-md text-slate-400">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline text-slate-500">Radar Gate:</span>
            <span className="text-cyan-300 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              1-Click Launch
            </span>
          </div>
        </div>
      </header>

      {/* Main Hero & Interactive Center Core */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-4xl mx-auto w-full text-center">
        
        {/* INTERACTIVE DRISHTI-AID LOGO IN THE CENTRE */}
        <div className="relative mb-14 sm:mb-16 flex items-center justify-center">
          {/* Concentric Ambient Radar Orbit Rings */}
          <div
            className={`absolute w-72 h-72 rounded-full border border-cyan-500/15 pointer-events-none transition-all duration-700 ${
              isLogoHovered ? 'scale-115 border-cyan-400/30' : 'scale-100'
            }`}
          />
          <div
            className={`absolute w-96 h-96 rounded-full border border-dashed border-cyan-500/10 pointer-events-none transition-all duration-1000 ${
              isLogoHovered ? 'scale-110 rotate-45 border-cyan-400/20' : 'scale-100'
            }`}
          />
          
          {/* Sonar Click Shockwave Ripples */}
          {pings.map((ping) => (
            <span
              key={ping.id}
              className="absolute rounded-full border-2 border-cyan-400 pointer-events-none animate-ping"
              style={{
                width: '180px',
                height: '180px',
                animationDuration: '1.2s',
              }}
            />
          ))}

          {/* Interactive Logo Emblem Container */}
          <div
            onClick={handleLogoClick}
            onMouseEnter={() => {
              setIsLogoHovered(true);
              playHoverSound('radar', 840);
            }}
            onMouseLeave={() => setIsLogoHovered(false)}
            role="button"
            tabIndex={0}
            aria-label="Interactive DRISHTI-AID Satellite Radar Emblem - Click once to enter website"
            className="group relative cursor-pointer select-none rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-transform duration-300 active:scale-95"
          >
            {/* Ambient Radial Backglow */}
            <div
              className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 ${
                isLogoHovered
                  ? 'bg-cyan-500/25 scale-125'
                  : 'bg-cyan-500/10 scale-100'
              }`}
            />

            {/* Emblem Glass Housing */}
            <div
              className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-b from-[#0a1222] to-[#050914] border border-cyan-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.15)] transition-all duration-500 ease-out will-change-transform ${
                isLogoHovered
                  ? 'border-cyan-400 shadow-[0_0_80px_rgba(6,182,212,0.45)] scale-110 sm:scale-115 -translate-y-1'
                  : 'scale-100'
              }`}
            >
              {/* Radar Rotating Sweep Line */}
              <div
                className={`absolute inset-0 rounded-full pointer-events-none overflow-hidden transition-opacity duration-300 ${
                  isLogoHovered ? 'opacity-100' : 'opacity-60'
                }`}
              >
                <div
                  className="w-full h-full origin-center animate-[spin_4s_linear_infinite]"
                  style={{
                    background:
                      'conic-gradient(from 0deg at 50% 50%, rgba(6, 182, 212, 0.35) 0deg, rgba(6, 182, 212, 0) 75deg, transparent 360deg)',
                  }}
                />
              </div>

              {/* Polar Coordinate Crosshairs */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-[1px] bg-cyan-500/20" />
                <div className="h-full w-[1px] bg-cyan-500/20 absolute" />
              </div>

              {/* Degree Compass Ticks */}
              <div className="absolute inset-2 rounded-full border border-cyan-500/20 pointer-events-none" />
              <span className="absolute top-2 text-[9px] font-mono text-cyan-400/60 pointer-events-none font-bold">
                000°
              </span>
              <span className="absolute right-2 text-[9px] font-mono text-cyan-400/60 pointer-events-none font-bold">
                090°
              </span>
              <span className="absolute bottom-2 text-[9px] font-mono text-cyan-400/60 pointer-events-none font-bold">
                180°
              </span>
              <span className="absolute left-2 text-[9px] font-mono text-cyan-400/60 pointer-events-none font-bold">
                270°
              </span>

              {/* Center Emblem: Stylized SAR Aperture & Drishti Eye Icon */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <svg
                  className={`w-16 h-16 sm:w-20 sm:h-20 text-cyan-400 transition-all duration-500 ${
                    isLogoHovered
                      ? 'scale-110 drop-shadow-[0_0_15px_#22d3ee]'
                      : 'drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                  }`}
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer Hexagonal Telemetry Frame */}
                  <polygon
                    points="50,10 85,30 85,70 50,90 15,70 15,30"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                    className="opacity-75"
                  />

                  {/* Satellite Microwave Array Wings */}
                  <line x1="8" y1="50" x2="25" y2="50" stroke="#38bdf8" strokeWidth="2.5" />
                  <line x1="75" y1="50" x2="92" y2="50" stroke="#38bdf8" strokeWidth="2.5" />
                  <rect x="5" y="44" width="8" height="12" rx="1" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
                  <rect x="87" y="44" width="8" height="12" rx="1" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />

                  {/* The Drishti Eye / Aperture Center */}
                  <path
                    d="M26 50C26 50 36 34 50 34C64 34 74 50 74 50C74 50 64 66 50 66C36 66 26 50 26 50Z"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="rgba(8, 20, 40, 0.7)"
                  />
                  {/* Optical Pupil Core */}
                  <circle
                    cx="50"
                    cy="50"
                    r="8"
                    fill="#38bdf8"
                    className="animate-pulse"
                  />
                  <circle cx="50" cy="50" r="3" fill="#ffffff" />
                </svg>

                {/* Sub-label under logo */}
                <span className="text-[10px] font-mono tracking-widest text-cyan-300 font-semibold mt-1">
                  SAR C-BAND
                </span>
              </div>
            </div>

            {/* Tooltip & 1-Click Launch Status */}
            <div
              className={`absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-mono transition-all duration-300 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-lg ${
                isEntering
                  ? 'bg-emerald-950/95 border-emerald-500/80 text-emerald-200 shadow-emerald-950/60 scale-105'
                  : isLogoHovered
                  ? 'bg-slate-950/95 border-cyan-400/80 text-cyan-200 shadow-cyan-950/50 scale-105'
                  : 'bg-slate-950/80 border-slate-800/80 text-slate-400 opacity-90'
              }`}
            >
              {isEntering ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-emerald-200">Orbital Lock Confirmed · Launching Mission Control...</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-semibold text-cyan-300">Click radar once to enter website</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Title & Core Proposition with Dynamic Shimmer & Interactive Hover Depth */}
        <div
          onMouseEnter={() => {
            setIsTitleHovered(true);
            playHoverSound('blip', 720);
          }}
          onMouseLeave={() => setIsTitleHovered(false)}
          className="group relative cursor-default max-w-4xl mb-10 pt-2 transition-all duration-300"
        >
          {/* Ambient Laser Scanline on Title Hover */}
          <div className="absolute -inset-x-8 inset-y-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="w-full h-full bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent blur-md" />
          </div>

          <h1 className="relative text-3xl sm:text-5xl font-extrabold tracking-normal transition-all duration-300 flex flex-col items-center gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-2">
              <span
                onMouseEnter={() => playHoverSound('blip', 680)}
                className="inline-block transition-all duration-300 hover:text-cyan-300 hover:scale-[1.03] hover:-translate-y-0.5 hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] will-change-transform"
              >
                Satellite Radar
              </span>
              <span
                onMouseEnter={() => playHoverSound('blip', 740)}
                className="inline-block transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 hover:drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-cyan-300 will-change-transform"
              >
                Intelligence
              </span>
              <span className="text-slate-400 font-light px-1">for</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-2">
              <span
                onMouseEnter={() => playHoverSound('blip', 700)}
                className="inline-block transition-all duration-300 hover:text-cyan-200 hover:scale-[1.03] hover:-translate-y-0.5 text-white will-change-transform"
              >
                Tactical Disaster
              </span>
              <span
                onMouseEnter={() => playHoverSound('blip', 800)}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300 transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5 hover:drop-shadow-[0_0_25px_rgba(34,211,238,0.8)] will-change-transform"
              >
                Evacuation
              </span>
            </div>
          </h1>
        </div>

        {/* 3 Quantitative Capability Evidence Points (Unboxed, Dynamic Zoom on Hover + Hover Sounds) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-2xl mb-8 text-left border-y border-slate-900/90 py-5">
          <div
            onMouseEnter={() => playHoverSound('subtle', 520)}
            className="group relative p-3 rounded-lg transition-all duration-300 ease-out hover:scale-[1.05] hover:-translate-y-1.5 hover:bg-slate-900/40 hover:border-slate-800/80 border border-transparent hover:shadow-[0_12px_24px_-6px_rgba(6,182,212,0.15)] will-change-transform cursor-default"
          >
            <div className="text-2xl font-mono font-bold text-cyan-400 tabular-nums transition-all duration-300 group-hover:text-cyan-300 group-hover:scale-105 inline-block origin-left group-hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
              10m
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono transition-colors duration-200 group-hover:text-slate-300">
              SAR Microwave Spatial Resolution · Day & night all-weather penetration through cloud cover
            </div>
          </div>

          <div
            onMouseEnter={() => playHoverSound('subtle', 560)}
            className="group relative p-3 rounded-lg transition-all duration-300 ease-out hover:scale-[1.05] hover:-translate-y-1.5 hover:bg-slate-900/40 hover:border-slate-800/80 border border-transparent hover:shadow-[0_12px_24px_-6px_rgba(6,182,212,0.15)] will-change-transform cursor-default"
          >
            <div className="text-2xl font-mono font-bold text-cyan-400 tabular-nums transition-all duration-300 group-hover:text-cyan-300 group-hover:scale-105 inline-block origin-left group-hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
              &lt; 450ms
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono transition-colors duration-200 group-hover:text-slate-300">
              A* Safe Route Routing Engine · Dynamic flood impedance avoiding inundated road networks
            </div>
          </div>

          <div
            onMouseEnter={() => playHoverSound('subtle', 600)}
            className="group relative p-3 rounded-lg transition-all duration-300 ease-out hover:scale-[1.05] hover:-translate-y-1.5 hover:bg-slate-900/40 hover:border-slate-800/80 border border-transparent hover:shadow-[0_12px_24px_-6px_rgba(6,182,212,0.15)] will-change-transform cursor-default"
          >
            <div className="text-2xl font-mono font-bold text-cyan-400 tabular-nums transition-all duration-300 group-hover:text-cyan-300 group-hover:scale-105 inline-block origin-left group-hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
              3-Agency
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono transition-colors duration-200 group-hover:text-slate-300">
              Sensor Fusion Pipeline · Copernicus CDSE, NASA Earthdata & Google Earth Engine
            </div>
          </div>
        </div>

        {/* CORE CITY SEARCH & DISASTER THEATRE CONTROLS */}
        <div className="w-full max-w-md flex flex-col gap-3.5 [perspective:1000px]">
          
          {/* Dedicated Search the City Module */}
          <div className="group w-full bg-[#0a0f1d]/95 border border-slate-800/90 hover:border-cyan-500/50 rounded-xl p-3.5 text-left transition-all duration-300 ease-out hover:scale-[1.01] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-8px_rgba(6,182,212,0.25)] hover:bg-[#0d1426] will-change-transform">
            
            {/* Header: Title + Active Geocoding Status */}
            <div className="flex items-center justify-between px-1 mb-2.5">
              <span className="text-xs font-mono font-medium text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-cyan-400 transition-transform duration-300 group-hover:scale-110" />
                Search City
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-500/40 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                COPERNICUS SAR
              </span>
            </div>

            {/* Tactical Search Bar */}
            <div className="relative mb-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4 text-cyan-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onMouseEnter={() => playHoverSound('subtle', 480)}
                onFocus={() => playHoverSound('blip', 560)}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCitySubmit();
                  }
                }}
                placeholder="Search any city (e.g. Mumbai, Delhi, Bengaluru, Chennai)..."
                className="w-full pl-9 pr-20 py-2 text-xs font-mono bg-slate-950 border border-slate-700/90 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 rounded-lg text-slate-100 placeholder-slate-500 transition-all outline-none"
              />
              <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    onMouseEnter={() => playHoverSound('subtle', 520)}
                    className="p-1 text-slate-500 hover:text-slate-300 cursor-pointer rounded"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCitySubmit}
                  onMouseEnter={() => playHoverSound('subtle', 580)}
                  className="px-2.5 py-1 text-[11px] font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded flex items-center gap-1 transition-colors cursor-pointer"
                  title="Search & Launch"
                >
                  <span>Go</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Live Filter Results or Popular Suggestions */}
            {searchQuery.trim().length > 0 ? (
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {CITY_DATABASE.filter((c) => {
                  const q = searchQuery.toLowerCase().trim();
                  return (
                    c.name.toLowerCase().includes(q) ||
                    c.state.toLowerCase().includes(q) ||
                    c.riverBasin.toLowerCase().includes(q)
                  );
                }).slice(0, 5).map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onMouseEnter={() => playHoverSound('blip', 650)}
                    onClick={() => {
                      playHoverSound('sonar', 1040);
                      setSelectedScenario(city.scenarioId);
                      onEnterApp(city.scenarioId);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/70 hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-500/50 text-left transition-all flex items-center justify-between group/item cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white group-hover/item:text-cyan-300">
                          {city.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded">
                          {city.state}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                        {city.riverBasin}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-[10px] font-mono text-slate-500 group-hover/item:text-cyan-300">
                      <span>{city.elevation}</span>
                      <ChevronRight className="w-3 h-3 transition-transform group-hover/item:translate-x-0.5" />
                    </div>
                  </button>
                ))}

                {CITY_DATABASE.filter((c) => {
                  const q = searchQuery.toLowerCase().trim();
                  return (
                    c.name.toLowerCase().includes(q) ||
                    c.state.toLowerCase().includes(q) ||
                    c.riverBasin.toLowerCase().includes(q)
                  );
                }).length === 0 && (
                  <button
                    type="button"
                    onClick={handleCitySubmit}
                    className="w-full p-2 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-left hover:bg-cyan-900/40 transition flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-semibold text-cyan-200">
                        Search SAR coverage for "{searchQuery}"
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Sentinel-1 C-Band Geocoding
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-300 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Launch</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 pt-1 flex-wrap">
                <span className="text-slate-500 text-[10px]">Popular:</span>
                {['Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata', 'Kochi'].map((cityName) => (
                  <button
                    key={cityName}
                    type="button"
                    onClick={() => {
                      const match = CITY_DATABASE.find(c => c.name.toLowerCase() === cityName.toLowerCase());
                      if (match) {
                        playHoverSound('sonar', 1040);
                        setSelectedScenario(match.scenarioId);
                        onEnterApp(match.scenarioId);
                      }
                    }}
                    onMouseEnter={() => playHoverSound('subtle', 520)}
                    className="px-1.5 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition cursor-pointer text-[10px]"
                  >
                    {cityName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Technical Specs Modal Trigger */}
          <button
            onClick={() => {
              playHoverSound('blip', 720);
              setIsSpecsOpen(true);
            }}
            onMouseEnter={() => playHoverSound('blip', 660)}
            className="group w-full py-3 px-4 rounded-xl bg-slate-950/40 hover:bg-slate-900/80 text-slate-400 hover:text-cyan-200 text-xs font-mono font-medium border border-slate-800/90 hover:border-cyan-500/60 transition-all duration-300 ease-out hover:scale-[1.04] hover:-translate-y-1 hover:shadow-[0_12px_28px_-5px_rgba(6,182,212,0.3)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer will-change-transform"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
            <span className="transition-transform duration-200 group-hover:scale-102">
              View Satellite & Pipeline Architecture
            </span>
          </button>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
        <div>
          <span>DRISHTI-AID Satellite Emergency Dispatch System</span>
          <span className="mx-2 text-slate-800">·</span>
          <span>Sentinel-1 SAR C-Band Synthetic Aperture Radar</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Active Sentinel-1 SAR Constellation</span>
        </div>
      </footer>

      {/* Technical Specifications Modal (Option 3) */}
      {isSpecsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#090d18] border border-cyan-500/30 rounded-xl p-6 shadow-2xl text-left max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-mono tracking-tight">
                  Pipeline Architecture & Scientific Specifications
                </h3>
              </div>
              <button
                onClick={() => setIsSpecsOpen(false)}
                onMouseEnter={() => playHoverSound('subtle', 500)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 pt-5 text-sm text-slate-300">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold mb-2">
                  01. Synthetic Aperture Radar (SAR) Backscatter Analysis
                </h4>
                <p className="text-xs leading-relaxed text-slate-400">
                  DRISHTI-AID analyzes Sentinel-1 Level-1 GRD (Ground Range Detected) dual-polarization (VV/VH) radar backscatter. Smooth standing water exhibits specular microwave reflection, causing radar backscatter to drop drastically below the calibrated threshold of <code className="text-cyan-300 bg-cyan-950/40 px-1 py-0.5 rounded font-mono">-14.2 dB</code>.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold mb-2">
                  02. AI Multi-Factor Vulnerability Scoring
                </h4>
                <p className="text-xs leading-relaxed text-slate-400">
                  Risk scores are mathematically aggregated across 3 key operational dimensions:
                </p>
                <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-xs text-cyan-300 my-2">
                  Risk Score = (Inundation_Depth × 0.40) + (Population_Density × 0.40) + (Road_Impedance × 0.20)
                </div>
                <p className="text-xs text-slate-400">
                  Zones scoring &gt; 75 are tagged as <span className="text-red-400 font-semibold">Critical NDRF Priority</span> for immediate motor-boat deployment and aerial water drops.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold mb-2">
                  03. Dynamic A* Evacuation Routing
                </h4>
                <p className="text-xs leading-relaxed text-slate-400">
                  The routing graph dynamically injects high cost penalties for waterlogged or submerged street segments, directing emergency vehicles to the nearest dry high-ground relief shelter or medical hospital.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onMouseEnter={() => playHoverSound('blip', 700)}
                  onClick={() => {
                    playHoverSound('sonar', 1100);
                    setIsSpecsOpen(false);
                    onEnterApp(selectedScenario);
                  }}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Launch Live Operations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
