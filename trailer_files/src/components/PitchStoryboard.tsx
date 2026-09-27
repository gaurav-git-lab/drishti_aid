import React from 'react';
import { Play, Clock, Sparkles, Radio, MessageSquare, Video } from 'lucide-react';
import { SCENES } from '../types';

interface PitchStoryboardProps {
  onJumpToScene: (startTime: number) => void;
}

export const PitchStoryboard: React.FC<PitchStoryboardProps> = ({ onJumpToScene }) => {
  const storyboards = [
    {
      scene: SCENES[0],
      duration: '3.5 seconds',
      timeframe: '00:00.0 – 00:03.5',
      visualLead: 'Satellite viewport obscured by dense tropical monsoon storm clouds.',
      voiceover: 'When catastrophic cloudbursts strike, optical satellites are completely blind. Rescue authorities cannot afford to wait 24 to 48 hours for clear skies while communities submerge.',
      techPoints: [
        'Visible/Infrared sensors suffer 100% cloud attenuation.',
        'Emergency response window (Golden Hour) is lost waiting for optical revisit.',
        'High casualty risk in mountainous valleys and urban lowlands.',
      ],
      color: 'rose',
    },
    {
      scene: SCENES[1],
      duration: '4.0 seconds',
      timeframe: '00:03.5 – 00:07.5',
      visualLead: 'Dynamic DRISHTI-AID brand reveal with animated C-Band microwave radar wave penetrating through rain.',
      voiceover: 'Introducing DRISHTI-AID. By leveraging C-Band Synthetic Aperture Radar coupled with sub-second AI triage, we eliminate cloud blindspots entirely.',
      techPoints: [
        '5.405 GHz radar wavelength effortlessly penetrates tropical monsoons.',
        'Active sensor emits its own microwave pulses day and night.',
        'Zero reliance on solar illumination or cloud-free skies.',
      ],
      color: 'emerald',
    },
    {
      scene: SCENES[2],
      duration: '6.0 seconds',
      timeframe: '00:07.5 – 00:13.5',
      visualLead: '4-stage pipeline grid cascading in with high-contrast tactical cards.',
      voiceover: 'Our end-to-end pipeline operates in under 6 hours: Ingesting Copernicus SAR imagery, running specular reflection damage matrices, routing dry evacuation paths via A*, and dispatching NDRF rescue teams directly to dry shelters.',
      techPoints: [
        'Step 1: Automated Sentinel-1 GRD ingestion with radiometric calibration.',
        'Step 2: AI specular reflection detection flags standing water (σ° < -18 dB).',
        'Step 3: A* algorithm calculates shortest dry corridor avoiding flooded bridges.',
        'Step 4: Real-time telemetry broadcast to NDRF rescue teams and hospitals.',
      ],
      color: 'cyan',
    },
    {
      scene: SCENES[3],
      duration: '4.5 seconds',
      timeframe: '00:13.5 – 00:18.0',
      visualLead: 'Tactical GIS Console mockup with sweeping radar beam, glowing flood polygons, and green vector route line animation.',
      voiceover: 'Here in the tactical console, automated algorithms flag 42 square kilometers of inundated territory within seconds, drawing an active 8.4-kilometer safe evacuation corridor directly to NDRF Base Alpha.',
      techPoints: [
        'Real-time rotating radar scan line over flooded river basin.',
        'Dynamic flood hazard boundaries calculated from multi-temporal SAR difference.',
        'Live ETA calculation (14 min) with bridge vulnerability verification.',
      ],
      color: 'blue',
    },
    {
      scene: SCENES[4],
      duration: '2.0 seconds',
      timeframe: '00:18.0 – 00:20.0',
      visualLead: 'Bold DRISHTI-AID title lockup with Smart India Hackathon 2026 accreditation and key impact metric cards.',
      voiceover: 'DRISHTI-AID: Transforming national disaster preparedness with precision satellite radar. Built by Team GeoPulse for Smart India Hackathon 2026.',
      techPoints: [
        '< 6 hours total turnaround vs 48 hours conventional.',
        '100% all-weather cloudburst operational readiness.',
        'Directly aligned with National Disaster Management Authority (NDMA) protocols.',
      ],
      color: 'cyan',
    },
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 p-6 lg:p-12 select-none">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase tracking-wider">
            <Video className="w-3.5 h-3.5" />
            <span>20-Second Pitch Video Storyboard</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            Scene-by-Scene Direction &amp; Voiceover
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Review the pacing, voiceover narrative, visual transitions, and key technical proofs presented in the pitch.
          </p>
        </div>

        {/* Storyboard List */}
        <div className="space-y-6">
          {storyboards.map((sb, i) => (
            <div
              key={sb.scene.id}
              className="p-6 lg:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col md:flex-row gap-6 items-start"
            >
              {/* Scene Number & Jump button */}
              <div className="flex md:flex-col items-center justify-between w-full md:w-36 shrink-0 gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black font-mono text-cyan-400">0{i + 1}</span>
                  <span className="text-[11px] font-mono text-slate-500 uppercase">{sb.duration}</span>
                </div>

                <button
                  onClick={() => onJumpToScene(sb.scene.startTime)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Jump to this scene in video player"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Play Scene</span>
                </button>
              </div>

              {/* Main Content */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      {sb.scene.badge}
                    </span>
                    <h3 className="text-xl font-bold text-white">{sb.scene.title}</h3>
                  </div>
                  <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                    {sb.timeframe}
                  </span>
                </div>

                {/* Voiceover */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200 flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-cyan-400 mt-1 shrink-0" />
                  <div>
                    <div className="text-[11px] font-mono text-cyan-400 font-semibold mb-1 uppercase">Voiceover Narrative</div>
                    <p className="italic leading-relaxed">&ldquo;{sb.voiceover}&rdquo;</p>
                  </div>
                </div>

                {/* Visual Lead & Tech proofs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-mono text-slate-500 uppercase block mb-1">Visual On-Screen</span>
                    <p className="text-slate-300">{sb.visualLead}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-mono text-slate-500 uppercase block mb-1">Key Technical Proofs</span>
                    <ul className="space-y-1 text-slate-400">
                      {sb.techPoints.map((tp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-cyan-400">·</span>
                          <span>{tp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
