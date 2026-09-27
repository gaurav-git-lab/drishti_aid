import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, FileCode, Play, Code2 } from 'lucide-react';

export const CodeInspector: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'html' | 'python' | 'hyperframes'>('html');
  const [copied, setCopied] = useState<boolean>(false);

  const htmlCode = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        margin: 0; width: 1920px; height: 1080px; overflow: hidden;
        background: #030712; font-family: 'Inter', sans-serif; color: #f8fafc;
      }
      #root {
        width: 100%; height: 100%; position: relative;
        display: flex; align-items: center; justify-content: center;
      }
      .glow-cyan { position: absolute; width: 800px; height: 800px; background: rgba(6, 182, 212, 0.15); border-radius: 50%; filter: blur(120px); top: -200px; left: -200px; }
      .glow-indigo { position: absolute; width: 800px; height: 800px; background: rgba(79, 70, 229, 0.15); border-radius: 50%; filter: blur(120px); bottom: -200px; right: -200px; }
      .scene { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; visibility: hidden; }
      .headline { font-size: 80px; font-weight: 900; letter-spacing: -0.03em; text-align: center; line-height: 1.1; margin-bottom: 24px; }
      .subhead { font-size: 40px; font-weight: 700; color: #94a3b8; text-align: center; }
      .mono-badge { font-family: 'JetBrains Mono', monospace; font-size: 24px; padding: 12px 24px; border-radius: 12px; background: rgba(6, 182, 212, 0.1); border: 2px solid rgba(6, 182, 212, 0.3); color: #22d3ee; margin-bottom: 32px; }
      .pipeline-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; width: 1200px; margin-top: 48px; }
      .pipeline-card { background: rgba(15, 23, 42, 0.6); border: 2px solid rgba(51, 65, 85, 0.5); border-radius: 24px; padding: 48px; display: flex; flex-direction: column; opacity: 0; transform: translateY(40px); }
      .card-icon { font-size: 48px; margin-bottom: 24px; }
      .card-title { font-size: 32px; font-weight: 700; color: #f8fafc; margin-bottom: 12px; }
      .card-desc { font-size: 24px; color: #94a3b8; line-height: 1.4; }
      .ui-mockup { width: 1400px; height: 800px; background: #0f172a; border-radius: 32px; border: 2px solid rgba(56, 189, 248, 0.3); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(14, 165, 233, 0.2); overflow: hidden; position: relative; opacity: 0; transform: scale(0.95); display: flex; }
      .sidebar { width: 350px; background: rgba(3, 7, 18, 0.8); border-right: 1px solid rgba(51, 65, 85, 0.5); padding: 32px; }
      .map-area { flex: 1; position: relative; background: #0b1120; overflow: hidden; }
      .radar-sweep { position: absolute; top: 50%; left: 50%; width: 1200px; height: 1200px; background: conic-gradient(from 0deg, transparent 0deg, rgba(6, 182, 212, 0.2) 60deg, transparent 61deg); border-radius: 50%; transform-origin: center center; margin-top: -600px; margin-left: -600px; }
      .flood-zone { position: absolute; width: 400px; height: 300px; background: rgba(225, 29, 72, 0.4); border: 2px solid #f43f5e; border-radius: 50%; filter: blur(10px); top: 30%; left: 40%; opacity: 0; }
      .tech-tags { display: flex; gap: 24px; margin-top: 48px; }
      .tech-tag { font-size: 28px; font-weight: 700; padding: 16px 32px; border-radius: 100px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); }
      .highlight-cyan { color: #22d3ee; }
      .highlight-rose { color: #f43f5e; }
      .highlight-emerald { color: #34d399; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="20" data-width="1920" data-height="1080">
      <div class="glow-cyan" data-layout-allow-overflow></div>
      <div class="glow-indigo" data-layout-allow-overflow></div>

      <!-- Scene 1: The Problem (0 - 4s) -->
      <div class="scene" id="scene-1">
        <div class="mono-badge" id="s1-badge">THE CRITICAL GAP</div>
        <h1 class="headline" id="s1-h1">Optical Satellites Are <br/><span class="highlight-rose">Blind in Cloudbursts</span>.</h1>
        <p class="subhead" id="s1-sub">Do you wait 24-48 hours for clear skies to route rescues?</p>
      </div>

      <!-- Scene 2: The Solution (4 - 8s) -->
      <div class="scene" id="scene-2">
        <div class="mono-badge" style="border-color: rgba(52, 211, 153, 0.3); color: #34d399; background: rgba(52, 211, 153, 0.1);" id="s2-badge">THE SOLUTION</div>
        <h1 class="headline" id="s2-h1" style="font-size: 100px;">DRISHTI-<span class="highlight-cyan">AID</span></h1>
        <p class="subhead" id="s2-sub">C-Band Synthetic Aperture Radar + AI Triage</p>
        <div class="tech-tags" id="s2-tags">
          <div class="tech-tag">Zero Cloud Blindspots</div>
          <div class="tech-tag">Sub-Second AI Engine</div>
        </div>
      </div>

      <!-- Scene 3: The Pipeline (8 - 14s) -->
      <div class="scene" id="scene-3">
        <h1 class="headline" id="s3-h1" style="font-size: 64px;">One Integrated Pipeline. <br/><span class="highlight-cyan">Under 6 Hours.</span></h1>
        <div class="pipeline-grid">
          <div class="pipeline-card" id="card-1">
            <div class="card-icon">🛰️</div>
            <div class="card-title">Copernicus SAR Ingestion</div>
            <div class="card-desc">Dual-pol VV/VH radar penetrates thick monsoons.</div>
          </div>
          <div class="pipeline-card" id="card-2">
            <div class="card-icon">🧠</div>
            <div class="card-title">AI Damage Detection</div>
            <div class="card-desc">Specular reflection matrix flags flood extent instantly.</div>
          </div>
          <div class="pipeline-card" id="card-3">
            <div class="card-icon">🗺️</div>
            <div class="card-title">A* Evacuation Routing</div>
            <div class="card-desc">Graphs safe corridors avoiding flooded terrain.</div>
          </div>
          <div class="pipeline-card" id="card-4">
            <div class="card-icon">🏥</div>
            <div class="card-title">Tactical Shelter Dispatch</div>
            <div class="card-desc">Directs NDRF to nearest hospitals via dry roads.</div>
          </div>
        </div>
      </div>

      <!-- Scene 4: UI Mockup (14 - 18s) -->
      <div class="scene" id="scene-4">
        <div class="ui-mockup" id="s4-ui">
          <div class="sidebar">
            <div style="width: 40px; height: 40px; background: #0ea5e9; border-radius: 8px; margin-bottom: 32px;"></div>
            <div style="padding: 16px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px;">
              <div style="color: #34d399; font-weight: 700; font-size: 20px; margin-bottom: 8px;">Run Pipeline Active</div>
              <div style="height: 6px; width: 100%; background: #065f46; border-radius: 3px; overflow: hidden;"><div id="progress-bar" style="width: 0%; height: 100%; background: #34d399;"></div></div>
            </div>
          </div>
          <div class="map-area">
            <div class="radar-sweep" id="radar"></div>
            <div class="flood-zone" id="flood-1"></div>
            <div class="flood-zone" id="flood-2" style="width: 250px; height: 350px; top: 20%; left: 60%;"></div>
            <svg id="route-path" style="position: absolute; inset: 0; width: 100%; height: 100%;" viewBox="0 0 1000 800">
              <path id="route-line" d="M200,600 C300,500 400,650 500,450 C600,250 800,200 850,300" fill="none" stroke="#10b981" stroke-width="8" stroke-dasharray="1000" stroke-dashoffset="1000" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Scene 5: Outro (18 - 20s) -->
      <div class="scene" id="scene-5">
        <h1 class="headline" id="s5-h1" style="font-size: 100px;">DRISHTI-<span class="highlight-cyan">AID</span></h1>
        <p class="subhead" id="s5-sub">By Team GeoPulse • Smart India Hackathon 2026</p>
      </div>
    </div>
    
    <script>
      const tl = gsap.timeline({ paused: false });
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = tl;

      gsap.set(".scene", { autoAlpha: 0 });
      gsap.set(["#s1-badge", "#s1-h1", "#s1-sub"], { y: 30, opacity: 0 });
      gsap.set(["#s2-badge", "#s2-h1", "#s2-sub", ".tech-tag"], { y: 30, opacity: 0 });
      gsap.set("#s3-h1", { y: -30, opacity: 0 });
      gsap.set(["#s5-h1", "#s5-sub"], { scale: 0.9, opacity: 0 });

      // Scene 1: 0 - 3.5s
      tl.to("#scene-1", { autoAlpha: 1, duration: 0 }, 0);
      tl.to("#s1-badge", { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.5);
      tl.to("#s1-h1", { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.8);
      tl.to("#s1-sub", { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 1.4);
      tl.to("#scene-1", { autoAlpha: 0, duration: 0.4 }, 3.5);

      // Scene 2: 3.5s - 7.5s
      tl.to("#scene-2", { autoAlpha: 1, duration: 0 }, 3.9);
      tl.to("#s2-badge", { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 4.0);
      tl.to("#s2-h1", { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.2)" }, 4.3);
      tl.to("#s2-sub", { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 4.7);
      tl.to(".tech-tag", { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: "power2.out" }, 5.2);
      tl.to("#scene-2", { autoAlpha: 0, duration: 0.4 }, 7.5);

      // Scene 3: 7.5s - 13.5s
      tl.to("#scene-3", { autoAlpha: 1, duration: 0 }, 7.9);
      tl.to("#s3-h1", { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 8.0);
      tl.to("#card-1", { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.1)" }, 8.5);
      tl.to("#card-2", { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.1)" }, 9.2);
      tl.to("#card-3", { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.1)" }, 9.9);
      tl.to("#card-4", { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.1)" }, 10.6);
      tl.to("#scene-3", { autoAlpha: 0, duration: 0.4 }, 13.5);

      // Scene 4: 13.5s - 18s (Mockup & UI)
      tl.to("#scene-4", { autoAlpha: 1, duration: 0 }, 13.9);
      tl.to("#s4-ui", { scale: 1, opacity: 1, duration: 0.8, ease: "power4.out" }, 14.0);
      tl.to("#radar", { rotation: 360, duration: 4, ease: "none", repeat: 2 }, 14.0);
      tl.to("#progress-bar", { width: "100%", duration: 2.5, ease: "power1.inOut" }, 14.5);
      tl.to(".flood-zone", { opacity: 1, duration: 0.5, stagger: 0.3, ease: "power2.out" }, 15.5);
      tl.to("#route-line", { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" }, 16.5);
      tl.to("#scene-4", { autoAlpha: 0, duration: 0.4 }, 18.0);

      // Scene 5: 18s - 20s (Outro)
      tl.to("#scene-5", { autoAlpha: 1, duration: 0 }, 18.4);
      tl.to("#s5-h1", { scale: 1, opacity: 1, duration: 0.8, ease: "elastic.out(1, 0.7)" }, 18.5);
      tl.to("#s5-sub", { scale: 1, opacity: 1, duration: 0.6, ease: "power3.out" }, 18.9);
    <\/script>
  </body>
</html>`;

  const pythonCode = `import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os

WIDTH = 1920
HEIGHT = 1080
FPS = 30
DURATION = 20 # seconds

def create_frame(text_lines, bg_color=(3, 7, 18), text_color=(255, 255, 255)):
    img = Image.new('RGB', (WIDTH, HEIGHT), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    try:
        font = ImageFont.truetype("arialbd.ttf", 80)
        sub_font = ImageFont.truetype("arial.ttf", 50)
    except IOError:
        font = ImageFont.load_default()
        sub_font = ImageFont.load_default()

    total_height = len(text_lines) * 100
    current_y = (HEIGHT - total_height) // 2

    for i, line in enumerate(text_lines):
        f = font if i == 0 else sub_font
        bbox = draw.textbbox((0, 0), line, font=f)
        w = bbox[2] - bbox[0]
        x = (WIDTH - w) // 2
        color = (34, 211, 238) if i == 0 else text_color
        draw.text((x, current_y), line, font=f, fill=color)
        current_y += 120

    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

print("Starting video generation...")
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter('drishti_aid_video.mp4', fourcc, FPS, (WIDTH, HEIGHT))

scenes = [
    {
        "lines": ["DRISHTI-AID", "Optical Satellites Are Blind in Cloudbursts.", "Do you wait 24-48 hours for clear skies?"],
        "frames": FPS * 5
    },
    {
        "lines": ["THE SOLUTION", "C-Band Synthetic Aperture Radar", "Zero Cloud Blindspots. Sub-Second AI Triage."],
        "frames": FPS * 5
    },
    {
        "lines": ["INTEGRATED PIPELINE", "1. Copernicus SAR Ingestion", "2. AI Damage Detection", "3. A* Evacuation Routing", "4. Tactical Shelter Dispatch"],
        "frames": FPS * 5
    },
    {
        "lines": ["REAL-WORLD IMPACT", "Real-time. Automated. Live GIS Dashboard.", "Built by Team GeoPulse", "Smart India Hackathon 2026"],
        "frames": FPS * 5
    }
]

print("Rendering frames...")
frame_count = 0
for scene in scenes:
    frame_img = create_frame(scene["lines"])
    for i in range(scene["frames"]):
        if i < 15:
            alpha = i / 15.0
            fade_frame = cv2.addWeighted(frame_img, alpha, np.zeros_like(frame_img), 1 - alpha, 0)
            out.write(fade_frame)
        else:
            out.write(frame_img)
        frame_count += 1
        if frame_count % 30 == 0:
            print(f"Rendered {frame_count // FPS} / {DURATION} seconds...")

out.release()
print("Video saved as drishti_aid_video.mp4!")`;

  const hyperframesCode = `{
  "$schema": "https://hyperframes.heygen.com/schema/hyperframes.json",
  "registry": "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry",
  "paths": {
    "blocks": "compositions",
    "components": "compositions/components",
    "assets": "assets"
  },
  "media": {
    "autoProxy": true
  }
}

// Render via CLI:
// npx hyperframes preview --background
// npm run render (outputs 1080p MP4)
// npm run check (verifies timeline contrast, layout, and timings)`;

  const currentCode = 
    activeCodeTab === 'html' ? htmlCode :
    activeCodeTab === 'python' ? pythonCode : hyperframesCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = 
      activeCodeTab === 'html' ? 'drishti_aid_composition.html' :
      activeCodeTab === 'python' ? 'render_video.py' : 'hyperframes.json';
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col p-6 lg:p-8 overflow-hidden select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Code2 className="w-4 h-4" />
            <span>Composition Source &amp; Render Scripts</span>
          </div>
          <h2 className="text-2xl font-black text-white">Source Code &amp; Video Generators</h2>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveCodeTab('html')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                activeCodeTab === 'html'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              GSAP HTML (20s)
            </button>

            <button
              onClick={() => setActiveCodeTab('python')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                activeCodeTab === 'python'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              OpenCV Python (.mp4)
            </button>

            <button
              onClick={() => setActiveCodeTab('hyperframes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                activeCodeTab === 'hyperframes'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              HyperFrames JSON
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 transition-colors"
            title="Download file"
          >
            <Download className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Code Block Container */}
      <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-slate-300">
              {activeCodeTab === 'html' ? 'index.html — 1920×1080 GSAP Canvas' :
               activeCodeTab === 'python' ? 'render_video.py — OpenCV 30 FPS MP4 Writer' :
               'hyperframes.json — Schema & Registry Config'}
            </span>
          </div>
          <span className="text-slate-500">
            {activeCodeTab === 'html' ? 'HTML5 + CSS + GSAP 3.14.2' : activeCodeTab === 'python' ? 'Python 3.10+ (cv2, PIL, numpy)' : 'JSON'}
          </span>
        </div>

        <pre className="flex-1 p-6 font-mono text-xs text-slate-300 overflow-auto whitespace-pre leading-relaxed select-text bg-[#030712]">
          {currentCode}
        </pre>
      </div>
    </div>
  );
};
