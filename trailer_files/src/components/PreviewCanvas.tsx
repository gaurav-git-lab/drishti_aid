import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import gsap from 'gsap';
import { TOTAL_DURATION } from '../types';
import { tacticalAudio } from '../utils/audioSynthesizer';
import { 
  CloudRain, 
  Satellite, 
  Cpu, 
  Route, 
  Building2, 
  ShieldCheck, 
  Radio, 
  AlertTriangle,
  Waves,
  Crosshair,
  Compass
} from 'lucide-react';

export interface PreviewCanvasRef {
  seek: (time: number) => void;
  play: () => void;
  pause: () => void;
  setSpeed: (rate: number) => void;
  getCanvasElement: () => HTMLDivElement | null;
}

interface PreviewCanvasProps {
  isPlaying: boolean;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onEnded: () => void;
  playbackRate: number;
  scaleMode: 'fit' | 'fill' | 'original';
  interactiveLayer?: boolean;
}

export const PreviewCanvas = forwardRef<PreviewCanvasRef, PreviewCanvasProps>(({
  isPlaying,
  currentTime,
  onTimeUpdate,
  onEnded,
  playbackRate,
  scaleMode,
  interactiveLayer = false,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [scale, setScale] = useState<number>(0.6);
  const lastSoundScene = useRef<number>(-1);

  // Resize calculation to maintain 16:9 (1920x1080)
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (scaleMode === 'original') {
        setScale(1);
        return;
      }
      const scaleX = clientWidth / 1920;
      const scaleY = clientHeight / 1080;
      const targetScale = scaleMode === 'fill' ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY) * 0.96;
      setScale(Math.max(0.2, targetScale));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scaleMode]);

  // Build the GSAP timeline
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main 20s timeline
      const tl = gsap.timeline({
        paused: true,
        onUpdate: () => {
          const t = tl.time();
          onTimeUpdate(t);

          // Audio triggers at scene boundaries
          if (t >= 0 && t < 0.2 && lastSoundScene.current !== 1) {
            lastSoundScene.current = 1;
          } else if (t >= 3.5 && t < 3.8 && lastSoundScene.current !== 2) {
            lastSoundScene.current = 2;
            tacticalAudio.playRadarPing();
          } else if (t >= 7.5 && t < 7.8 && lastSoundScene.current !== 3) {
            lastSoundScene.current = 3;
            tacticalAudio.playClick();
          } else if (t >= 13.5 && t < 13.8 && lastSoundScene.current !== 4) {
            lastSoundScene.current = 4;
            tacticalAudio.playRadarPing();
          } else if (t >= 16.5 && t < 16.8 && lastSoundScene.current !== 4.5) {
            lastSoundScene.current = 4.5;
            tacticalAudio.playRouteLock();
          } else if (t >= 18.0 && t < 18.3 && lastSoundScene.current !== 5) {
            lastSoundScene.current = 5;
            tacticalAudio.playClick();
          }
        },
        onComplete: () => {
          onEnded();
        },
      });

      timelineRef.current = tl;
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__timelines = (window as any).__timelines || {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__timelines['main'] = tl;
      }

      // Initial element state resets
      gsap.set('.scene-view', { autoAlpha: 0 });
      gsap.set(['#s1-badge', '#s1-h1', '#s1-sub', '#s1-clouds', '#s1-optical-box'], { y: 35, opacity: 0 });
      gsap.set(['#s2-badge', '#s2-h1', '#s2-sub', '.tech-tag-item', '#s2-radar-wave'], { y: 35, opacity: 0 });
      gsap.set('#s3-h1', { y: -30, opacity: 0 });
      gsap.set(['#card-1', '#card-2', '#card-3', '#card-4'], { y: 40, opacity: 0 });
      gsap.set('#s4-ui', { scale: 0.94, opacity: 0 });
      gsap.set('.flood-zone-poly', { opacity: 0 });
      gsap.set('#route-line', { strokeDashoffset: 1000 });
      gsap.set(['#s5-h1', '#s5-sub', '#s5-stats'], { scale: 0.92, opacity: 0 });

      // === SCENE 1: 0 - 3.5s (The Critical Gap) ===
      tl.to('#scene-1', { autoAlpha: 1, duration: 0.1 }, 0);
      tl.to('#s1-badge', { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 0.4);
      tl.to('#s1-h1', { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, 0.7);
      tl.to('#s1-sub', { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 1.3);
      tl.to(['#s1-clouds', '#s1-optical-box'], { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power2.out' }, 1.6);
      tl.to('#scene-1', { autoAlpha: 0, duration: 0.4 }, 3.5);

      // === SCENE 2: 3.5s - 7.5s (The Solution) ===
      tl.to('#scene-2', { autoAlpha: 1, duration: 0.1 }, 3.8);
      tl.to('#s2-badge', { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 3.9);
      tl.to('#s2-h1', { y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.3)' }, 4.2);
      tl.to('#s2-sub', { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 4.7);
      tl.to('#s2-radar-wave', { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, 5.0);
      tl.to('.tech-tag-item', { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: 'power2.out' }, 5.3);
      tl.to('#scene-2', { autoAlpha: 0, duration: 0.4 }, 7.5);

      // === SCENE 3: 7.5s - 13.5s (Integrated Pipeline) ===
      tl.to('#scene-3', { autoAlpha: 1, duration: 0.1 }, 7.8);
      tl.to('#s3-h1', { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, 7.9);
      tl.to('#card-1', { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.15)' }, 8.3);
      tl.to('#card-2', { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.15)' }, 9.1);
      tl.to('#card-3', { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.15)' }, 9.9);
      tl.to('#card-4', { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.15)' }, 10.7);
      tl.to('#scene-3', { autoAlpha: 0, duration: 0.4 }, 13.5);

      // === SCENE 4: 13.5s - 18s (Tactical UI Mockup) ===
      tl.to('#scene-4', { autoAlpha: 1, duration: 0.1 }, 13.8);
      tl.to('#s4-ui', { scale: 1, opacity: 1, duration: 0.7, ease: 'power3.out' }, 13.9);
      // Radar continuous rotation
      tl.to('#radar-sweep-beam', { rotation: 360, duration: 4, ease: 'none', repeat: 1 }, 14.0);
      // AI Progress bar fill
      tl.to('#pipeline-progress-bar', { width: '100%', duration: 2.4, ease: 'power1.inOut' }, 14.3);
      // Flood zones detection highlight
      tl.to('.flood-zone-poly', { opacity: 1, duration: 0.6, stagger: 0.25, ease: 'power2.out' }, 15.2);
      // Safe Route drawing SVG stroke
      tl.to('#route-line', { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 16.2);
      tl.to('#scene-4', { autoAlpha: 0, duration: 0.4 }, 18.0);

      // === SCENE 5: 18s - 20s (Outro & Impact) ===
      tl.to('#scene-5', { autoAlpha: 1, duration: 0.1 }, 18.3);
      tl.to('#s5-h1', { scale: 1, opacity: 1, duration: 0.7, ease: 'elastic.out(1, 0.7)' }, 18.4);
      tl.to('#s5-sub', { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' }, 18.7);
      tl.to('#s5-stats', { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, 18.9);

      // Seek to current time
      tl.seek(currentTime);
      if (isPlaying) {
        tl.play();
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Update speed
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.timeScale(playbackRate);
    }
  }, [playbackRate]);

  // Synchronize playing state
  useEffect(() => {
    if (!timelineRef.current) return;
    if (isPlaying) {
      timelineRef.current.play();
    } else {
      timelineRef.current.pause();
    }
  }, [isPlaying]);

  useImperativeHandle(ref, () => ({
    seek: (time: number) => {
      if (timelineRef.current) {
        timelineRef.current.seek(time);
      }
    },
    play: () => {
      if (timelineRef.current) {
        timelineRef.current.play();
      }
    },
    pause: () => {
      if (timelineRef.current) {
        timelineRef.current.pause();
      }
    },
    setSpeed: (rate: number) => {
      if (timelineRef.current) {
        timelineRef.current.timeScale(rate);
      }
    },
    getCanvasElement: () => canvasRef.current,
  }));

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950 select-none"
    >
      {/* 1920x1080 16:9 Scaled Viewport Container */}
      <div
        ref={canvasRef}
        id="drishti-canvas"
        style={{
          width: '1920px',
          height: '1080px',
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          background: '#030712',
        }}
        className="relative shrink-0 text-slate-50 font-sans shadow-2xl rounded-none border border-slate-800/60 overflow-hidden"
      >
        {/* Background Atmospheric Glows */}
        <div 
          className="absolute -top-[200px] -left-[200px] w-[900px] h-[900px] rounded-full bg-cyan-500/15 blur-[140px] pointer-events-none"
        />
        <div 
          className="absolute -bottom-[200px] -right-[200px] w-[900px] h-[900px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none"
        />
        <div 
          className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25 pointer-events-none"
        />

        {/* Global Watermark/Status Header in canvas */}
        <div className="absolute top-8 left-10 right-10 flex items-center justify-between text-xs font-mono text-slate-500 tracking-wider pointer-events-none z-30">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">DRISHTI-AID MISSION PREVIEW</span>
            <span>·</span>
            <span>SIH 2026 // PS-GEO-04</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>RES: 1920×1080 FHD</span>
            <span>·</span>
            <span>FPS: 30</span>
            <span>·</span>
            <span className="text-cyan-400 font-mono">SAR DUAL-POL VV/VH</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SCENE 1: THE CRITICAL GAP (0.0s - 3.5s) */}
        {/* ============================================================ */}
        <div
          id="scene-1"
          className="scene-view absolute inset-0 flex flex-col items-center justify-center px-24 text-center z-10"
        >
          <div
            id="s1-badge"
            className="font-mono text-xl tracking-wider px-6 py-2.5 rounded-xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-400 mb-8 uppercase font-bold shadow-[0_0_20px_rgba(244,63,94,0.15)]"
          >
            THE CRITICAL GAP
          </div>

          <h1
            id="s1-h1"
            className="text-[76px] font-black tracking-tight leading-[1.08] mb-6 text-white max-w-5xl"
            style={{ textWrap: 'balance' }}
          >
            Optical Satellites Are <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-500 to-rose-400 font-extrabold">
              Blind in Cloudbursts.
            </span>
          </h1>

          <p
            id="s1-sub"
            className="text-[34px] font-semibold text-slate-400 max-w-4xl leading-relaxed mb-10"
          >
            Do you wait <span className="text-rose-300 font-bold">24–48 hours</span> for clear skies to route rescues?
          </p>

          {/* Graphical comparison callout */}
          <div id="s1-optical-box" className="flex items-center gap-8 mt-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 max-w-3xl">
            <div className="w-16 h-16 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
              <CloudRain className="w-8 h-8 text-rose-400 animate-bounce" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-slate-200">Dense Cloud Cover &gt; 95%</div>
              <div className="text-sm text-slate-400">Standard optical sensors (Landsat, Sentinel-2, Planet) capture pure white cloud tops, leaving flood ground conditions invisible.</div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SCENE 2: THE SOLUTION (3.5s - 7.5s) */}
        {/* ============================================================ */}
        <div
          id="scene-2"
          className="scene-view absolute inset-0 flex flex-col items-center justify-center px-24 text-center z-10"
        >
          <div
            id="s2-badge"
            className="font-mono text-xl tracking-wider px-6 py-2.5 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 mb-8 uppercase font-bold shadow-[0_0_20px_rgba(52,211,153,0.15)]"
          >
            THE SOLUTION
          </div>

          <h1
            id="s2-h1"
            className="text-[104px] font-black tracking-tight leading-none mb-6 text-white"
          >
            DRISHTI-<span className="text-cyan-400 drop-shadow-[0_0_35px_rgba(34,211,238,0.4)]">AID</span>
          </h1>

          <p
            id="s2-sub"
            className="text-[38px] font-bold text-slate-300 max-w-4xl leading-tight mb-8"
          >
            C-Band Synthetic Aperture Radar + AI Triage
          </p>

          {/* Radar Wave Beam Graphic */}
          <div id="s2-radar-wave" className="relative w-[500px] h-14 flex items-center justify-center mb-6">
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee]" />
            <div className="px-5 py-2 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-base flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400 animate-spin" />
              <span>5.405 GHz C-Band Wavelength: Penetrates Thick Rain Clouds</span>
            </div>
          </div>

          <div id="s2-tags" className="flex items-center gap-6 mt-4">
            <div className="tech-tag-item text-[26px] font-bold px-8 py-4 rounded-full bg-slate-900/90 border border-slate-700/80 text-slate-200 shadow-lg flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              Zero Cloud Blindspots
            </div>
            <div className="tech-tag-item text-[26px] font-bold px-8 py-4 rounded-full bg-slate-900/90 border border-slate-700/80 text-cyan-300 shadow-lg flex items-center gap-3">
              <Cpu className="w-6 h-6 text-cyan-400" />
              Sub-Second AI Engine
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SCENE 3: THE PIPELINE (7.5s - 13.5s) */}
        {/* ============================================================ */}
        <div
          id="scene-3"
          className="scene-view absolute inset-0 flex flex-col items-center justify-center px-16 z-10"
        >
          <h1
            id="s3-h1"
            className="text-[64px] font-black tracking-tight text-center leading-tight mb-10 text-white"
          >
            One Integrated Pipeline. <br />
            <span className="text-cyan-400 drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]">Under 6 Hours.</span>
          </h1>

          <div className="grid grid-cols-2 gap-8 w-[1240px]">
            {/* Card 1 */}
            <div
              id="card-1"
              className="pipeline-card bg-slate-900/80 border-2 border-slate-700/60 rounded-3xl p-10 flex flex-col justify-between hover:border-cyan-500/50 transition-colors shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
              <div className="flex items-start justify-between mb-5">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-3xl">
                  <Satellite className="w-8 h-8" />
                </div>
                <span className="font-mono text-sm px-3 py-1 rounded bg-slate-800 text-cyan-300 border border-cyan-500/20">STEP 01</span>
              </div>
              <div>
                <div className="text-[30px] font-bold text-white mb-2">Copernicus SAR Ingestion</div>
                <div className="text-[20px] text-slate-400 leading-snug">
                  Dual-pol VV/VH radar penetrates thick monsoons with zero atmospheric attenuation.
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div
              id="card-2"
              className="pipeline-card bg-slate-900/80 border-2 border-slate-700/60 rounded-3xl p-10 flex flex-col justify-between hover:border-cyan-500/50 transition-colors shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
              <div className="flex items-start justify-between mb-5">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-3xl">
                  <Cpu className="w-8 h-8" />
                </div>
                <span className="font-mono text-sm px-3 py-1 rounded bg-slate-800 text-blue-300 border border-blue-500/20">STEP 02</span>
              </div>
              <div>
                <div className="text-[30px] font-bold text-white mb-2">AI Damage Detection</div>
                <div className="text-[20px] text-slate-400 leading-snug">
                  Specular reflection matrix flags flood extent and submerged infrastructure instantly.
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div
              id="card-3"
              className="pipeline-card bg-slate-900/80 border-2 border-slate-700/60 rounded-3xl p-10 flex flex-col justify-between hover:border-emerald-500/50 transition-colors shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
              <div className="flex items-start justify-between mb-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl">
                  <Route className="w-8 h-8" />
                </div>
                <span className="font-mono text-sm px-3 py-1 rounded bg-slate-800 text-emerald-300 border border-emerald-500/20">STEP 03</span>
              </div>
              <div>
                <div className="text-[30px] font-bold text-white mb-2">A* Evacuation Routing</div>
                <div className="text-[20px] text-slate-400 leading-snug">
                  Graphs safe, dry corridors avoiding flooded terrain and breached bridges.
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div
              id="card-4"
              className="pipeline-card bg-slate-900/80 border-2 border-slate-700/60 rounded-3xl p-10 flex flex-col justify-between hover:border-rose-500/50 transition-colors shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />
              <div className="flex items-start justify-between mb-5">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-3xl">
                  <Building2 className="w-8 h-8" />
                </div>
                <span className="font-mono text-sm px-3 py-1 rounded bg-slate-800 text-rose-300 border border-rose-500/20">STEP 04</span>
              </div>
              <div>
                <div className="text-[30px] font-bold text-white mb-2">Tactical Shelter Dispatch</div>
                <div className="text-[20px] text-slate-400 leading-snug">
                  Directs NDRF rescue teams to nearest hospitals and high-ground shelters via dry roads.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SCENE 4: UI MOCKUP & LIVE RADAR (13.5s - 18.0s) */}
        {/* ============================================================ */}
        <div
          id="scene-4"
          className="scene-view absolute inset-0 flex items-center justify-center z-10"
        >
          <div
            id="s4-ui"
            className="w-[1440px] h-[820px] bg-slate-900/95 border-2 border-cyan-500/30 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_80px_rgba(6,182,212,0.18)] overflow-hidden flex relative"
          >
            {/* Tactical Sidebar */}
            <div className="w-[380px] bg-slate-950/85 border-r border-slate-800 p-8 flex flex-col justify-between">
              <div>
                {/* Brand icon & title */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-slate-950 font-black">
                    <Radio className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-lg text-white">DRISHTI-AID CONSOLE</div>
                    <div className="text-xs font-mono text-cyan-400">SAR COPERNICUS FEED</div>
                  </div>
                </div>

                {/* Telemetry rows */}
                <div className="space-y-3 mb-8">
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
                    <span className="text-slate-400">SENSOR</span>
                    <span className="text-cyan-300 font-bold">SENTINEL-1 C-SAR</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
                    <span className="text-slate-400">POLARIZATION</span>
                    <span className="text-slate-200">DUAL VV + VH</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
                    <span className="text-slate-400">RESOLUTION</span>
                    <span className="text-slate-200">10m Ground Sample</span>
                  </div>
                </div>

                {/* Pipeline Status box with animated progress bar */}
                <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 shadow-inner mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-emerald-400 font-bold text-lg flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      Run Pipeline Active
                    </div>
                    <span className="text-xs font-mono text-emerald-300">AUTO-TRIAGE</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-3">Specular matrix calculation & A* pathfinding</div>
                  <div className="h-2 w-full bg-emerald-950 rounded-full overflow-hidden border border-emerald-900">
                    <div
                      id="pipeline-progress-bar"
                      style={{ width: '0%' }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all"
                    />
                  </div>
                </div>

                {/* Tactical Legend */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
                  <div className="text-slate-400 font-semibold mb-1">MAP OVERLAYS</div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-rose-500/80 border border-rose-400" />
                    <span className="text-slate-300">Inundated Flood Zone (Specular &lt; -18dB)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-1.5 rounded bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                    <span className="text-slate-300">A* Optimal Evacuation Route</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400" />
                    <span className="text-slate-300">NDRF Alpha Hub & Shelters</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-800 pt-4">
                <span>LAT: 26.8467° N</span>
                <span>LON: 80.9462° E</span>
              </div>
            </div>

            {/* Map Area */}
            <div className="flex-1 relative bg-[#070d18] overflow-hidden flex items-center justify-center">
              {/* Radar Grid circles */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-[300px] h-[300px] border border-cyan-500 rounded-full" />
                <div className="w-[600px] h-[600px] border border-cyan-500 rounded-full absolute" />
                <div className="w-[900px] h-[900px] border border-cyan-500 rounded-full absolute" />
                <div className="w-[1200px] h-[1200px] border border-cyan-500 rounded-full absolute" />
                <div className="w-full h-px bg-cyan-500/40 absolute" />
                <div className="h-full w-px bg-cyan-500/40 absolute" />
              </div>

              {/* Rotating Radar Sweep Cone */}
              <div
                id="radar-sweep-beam"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '1200px',
                  height: '1200px',
                  marginTop: '-600px',
                  marginLeft: '-600px',
                  borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, transparent 0deg, rgba(6, 182, 212, 0.22) 55deg, rgba(6, 182, 212, 0.4) 60deg, transparent 61deg)',
                  transformOrigin: 'center center',
                  pointerEvents: 'none',
                }}
              />

              {/* Flood Zones (AI Specular detection) */}
              <div
                className="flood-zone-poly absolute w-[420px] h-[280px] rounded-[40%] bg-rose-600/35 border-2 border-rose-500 filter blur-[8px] top-[28%] left-[28%] shadow-[0_0_50px_rgba(244,63,94,0.4)] pointer-events-none"
              />
              <div
                className="flood-zone-poly absolute w-[300px] h-[340px] rounded-[50%] bg-rose-600/30 border-2 border-rose-500 filter blur-[10px] top-[18%] left-[58%] shadow-[0_0_50px_rgba(244,63,94,0.3)] pointer-events-none"
              />

              {/* Flood Warning Label on Map */}
              <div className="flood-zone-poly absolute top-[36%] left-[34%] px-3 py-1.5 rounded-lg bg-rose-950/90 border border-rose-500 text-rose-300 font-mono text-xs flex items-center gap-1.5 shadow-lg">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>FLOOD WATER EXTENT: 42.6 km²</span>
              </div>

              {/* Rescue Start Point (Threatened Community) */}
              <div className="absolute top-[64%] left-[20%] flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-rose-500 animate-ping absolute" />
                <div className="w-5 h-5 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-[10px] font-bold z-10 shadow-lg">
                  !
                </div>
                <span className="font-mono text-[11px] bg-slate-900/90 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded mt-1.5 whitespace-nowrap">
                  Zone 4: 1,420 Stranded
                </span>
              </div>

              {/* Evacuation Destination: High Ground Shelter & Hospital */}
              <div className="absolute top-[28%] left-[84%] flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center text-slate-950 font-bold z-10 shadow-[0_0_20px_#34d399]">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span className="font-mono text-[11px] bg-slate-900/90 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded mt-1.5 whitespace-nowrap">
                  NDRF Shelter Base Alpha
                </span>
              </div>

              {/* Safe Route SVG Line */}
              <svg
                id="route-path-svg"
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 1060 820"
              >
                <defs>
                  <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <path
                  id="route-line"
                  d="M210,540 C310,440 370,580 490,400 C580,240 760,200 890,250"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                  strokeLinecap="round"
                  filter="url(#glow-emerald)"
                />
              </svg>

              {/* Floating ETA Badge */}
              <div className="absolute top-[38%] left-[56%] px-3 py-1.5 rounded-lg bg-slate-900/95 border border-emerald-500/60 text-emerald-400 font-mono text-xs flex items-center gap-2 shadow-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>A* EVACUATION CORRIDOR: 8.4 km (ETA: 14 min)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SCENE 5: OUTRO & SIH 2026 (18.0s - 20.0s) */}
        {/* ============================================================ */}
        <div
          id="scene-5"
          className="scene-view absolute inset-0 flex flex-col items-center justify-center px-24 text-center z-10"
        >
          <div className="mb-6 font-mono text-sm tracking-widest text-cyan-400 uppercase flex items-center gap-2">
            <Radio className="w-4 h-4 animate-spin text-cyan-400" />
            <span>SMART INDIA HACKATHON 2026</span>
          </div>

          <h1
            id="s5-h1"
            className="text-[110px] font-black tracking-tight leading-none mb-6 text-white"
          >
            DRISHTI-<span className="text-cyan-400 drop-shadow-[0_0_40px_rgba(34,211,238,0.5)]">AID</span>
          </h1>

          <p
            id="s5-sub"
            className="text-[40px] font-bold text-slate-300 max-w-4xl leading-tight mb-12"
          >
            By Team GeoPulse • Smart India Hackathon 2026
          </p>

          <div
            id="s5-stats"
            className="flex items-center gap-8 justify-center"
          >
            <div className="px-8 py-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-3xl font-black text-emerald-400 font-mono">&lt; 6 Hours</div>
              <div className="text-sm text-slate-400 font-medium">Turnaround vs 48h Conventional</div>
            </div>
            <div className="px-8 py-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-3xl font-black text-cyan-400 font-mono">100%</div>
              <div className="text-sm text-slate-400 font-medium">Cloud Penetration C-Band SAR</div>
            </div>
            <div className="px-8 py-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-3xl font-black text-blue-400 font-mono">A* Algorithm</div>
              <div className="text-sm text-slate-400 font-medium">Safe Dry Evacuation Corridors</div>
            </div>
          </div>
        </div>

        {/* Live Interactive Layer Overlay (If toggled by user) */}
        {interactiveLayer && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-40 p-12 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-mono text-cyan-400 text-sm">INTERACTIVE SAR GIS INSPECTION MODE</span>
                <h3 className="text-2xl font-bold text-white">C-Band SAR Specular Water Reflectance Map</h3>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded border border-cyan-500/40">SENTINEL-1</span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded border border-emerald-500/40">LIVE DATA LAYER</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 my-auto">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
                  <Waves className="w-5 h-5" />
                  Water Specular Backscatter
                </div>
                <div className="text-2xl font-mono font-bold text-white mb-1">-21.4 dB</div>
                <p className="text-xs text-slate-400">Smooth water surfaces reflect radar energy away from the sensor, producing low backscatter values (dark pixels).</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                  <Route className="w-5 h-5" />
                  Dry Road Corridors
                </div>
                <div className="text-2xl font-mono font-bold text-white mb-1">-8.2 dB</div>
                <p className="text-xs text-slate-400">Asphalt and elevated road embankments maintain normal double-bounce reflection, classified safe for rescue trucks.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 text-cyan-400 font-bold mb-2">
                  <Crosshair className="w-5 h-5" />
                  NDRF Evac Node 01
                </div>
                <div className="text-2xl font-mono font-bold text-white mb-1">Passable (Dry)</div>
                <p className="text-xs text-slate-400">Route safely navigates around breached bridges and flooded lowlands directly to relief shelter Alpha.</p>
              </div>
            </div>

            <div className="text-xs font-mono text-slate-500 text-center">
              Click &quot;Interactive GIS&quot; tab on top to explore the full full-screen interactive simulation.
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

PreviewCanvas.displayName = 'PreviewCanvas';
