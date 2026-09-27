export interface SceneInfo {
  id: string;
  number: number;
  title: string;
  badge: string;
  badgeColor: string;
  startTime: number;
  endTime: number;
  description: string;
  keyAction: string;
}

export const SCENES: SceneInfo[] = [
  {
    id: 'scene-1',
    number: 1,
    title: 'The Critical Gap',
    badge: 'THE CRITICAL GAP',
    badgeColor: 'border-rose-500/40 text-rose-400 bg-rose-500/10',
    startTime: 0,
    endTime: 3.5,
    description: 'Optical satellites are blind during monsoons and cloudbursts. 24–48h delays cost human lives.',
    keyAction: 'Problem statement & disaster bottleneck',
  },
  {
    id: 'scene-2',
    number: 2,
    title: 'The Solution: DRISHTI-AID',
    badge: 'THE SOLUTION',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    startTime: 3.5,
    endTime: 7.5,
    description: 'C-Band Synthetic Aperture Radar (SAR) with sub-second AI triage. Zero cloud blindspots.',
    keyAction: 'Dual-pol SAR penetration reveal',
  },
  {
    id: 'scene-3',
    number: 3,
    title: 'Integrated Pipeline (<6h)',
    badge: '4-STAGE PIPELINE',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    startTime: 7.5,
    endTime: 13.5,
    description: '1. Copernicus Ingestion → 2. AI Specular Detection → 3. A* Routing → 4. Tactical Shelter Dispatch.',
    keyAction: 'End-to-end algorithmic triage flow',
  },
  {
    id: 'scene-4',
    number: 4,
    title: 'Live Tactical UI & Triage',
    badge: 'REAL-TIME GIS CONSOLE',
    badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    startTime: 13.5,
    endTime: 18.0,
    description: 'Live radar sweep, specular water matrix detection, and animated A* dry corridor route drawing.',
    keyAction: 'Vector radar sweep & route synthesis',
  },
  {
    id: 'scene-5',
    number: 5,
    title: 'Outro: Team GeoPulse',
    badge: 'SIH 2026',
    badgeColor: 'border-cyan-400/40 text-cyan-300 bg-cyan-400/10',
    startTime: 18.0,
    endTime: 20.0,
    description: 'DRISHTI-AID by Team GeoPulse • Smart India Hackathon 2026 national disaster response platform.',
    keyAction: 'Final callout & team impact',
  },
];

export const TOTAL_DURATION = 20.0;
export const FPS = 30;
export const TOTAL_FRAMES = 600;
