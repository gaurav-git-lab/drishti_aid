import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Printer,
  Download,
  BrainCircuit,
  Radio,
  MapPin,
  Route,
  Home,
  CheckCircle2,
  Database,
  ArrowRight,
  Activity,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Search,
  Users,
  Building2,
  Globe,
  Award
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PitchDeckModalProps {
  onClose: () => void;
}

export const PitchDeckModal: React.FC<PitchDeckModalProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 6;
  const slideRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const nextSlide = () => setCurrentSlide((p) => Math.min(totalSlides, p + 1));
  const prevSlide = () => setCurrentSlide((p) => Math.max(1, p - 1));

  const handleDownloadPdf = async () => {
    if (!slideRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(slideRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
      pdf.save(`DRISHTI-AID_Slide_${currentSlide}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const SlideHeader = ({ title }: { title: string }) => (
    <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2 mb-4">
      <div className="flex items-center justify-center w-20 h-10 border-2 border-indigo-900 rounded-full text-indigo-900 font-bold text-sm bg-white shrink-0">
        GeoPulse
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-wider text-center flex-1 px-4">
        {title}
      </h1>
      <div className="text-right shrink-0">
        <div className="font-extrabold text-slate-800 text-sm leading-tight">SMART INDIA<br/>HACKATHON</div>
        <div className="text-indigo-900 font-black text-sm">2026</div>
      </div>
    </div>
  );

  const renderSlide1 = () => (
    <div className="flex flex-col h-full w-full p-10 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 text-right">
        <div className="font-extrabold text-slate-800 text-xl leading-tight">SMART INDIA<br/>HACKATHON</div>
        <div className="text-indigo-900 font-black text-xl">2026</div>
      </div>
      
      <div className="text-center mt-8 mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-900 mb-8 tracking-wide">
          SMART INDIA HACKATHON 2026
        </h1>
        <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">
          DRISHTI-AID
        </h2>
      </div>

      <div className="max-w-3xl mx-auto w-full space-y-6 text-lg md:text-xl text-slate-800 font-medium z-10">
        <div className="flex gap-4">
          <span className="font-bold w-64 shrink-0">• Problem Statement ID:</span>
          <span>SIH26206</span>
        </div>
        <div className="flex gap-4">
          <span className="font-bold w-64 shrink-0">• Problem Statement Title:</span>
          <span>Student Innovation-Disaster management includes ideas related to risk mitigation, Planning and management before, after or during a disaster.</span>
        </div>
        <div className="flex gap-4">
          <span className="font-bold w-64 shrink-0">• Theme:</span>
          <span>Disaster Management</span>
        </div>
        <div className="flex gap-4">
          <span className="font-bold w-64 shrink-0">• PS Category:</span>
          <span>Software</span>
        </div>
        <div className="flex gap-4">
          <span className="font-bold w-64 shrink-0">• Team ID:</span>
          <span>140770</span>
        </div>
        <div className="flex gap-4">
          <span className="font-bold w-64 shrink-0">• Team Name:</span>
          <span className="font-bold text-indigo-900">GeoPulse</span>
        </div>
      </div>
      
      {/* Decorative hexagon/brain background hint */}
      <div className="absolute right-10 bottom-10 opacity-10">
        <BrainCircuit className="w-96 h-96" />
      </div>
    </div>
  );

  const renderSlide2 = () => (
    <div className="flex flex-col h-full p-8 bg-white">
      <SlideHeader title="DRISHTI-AID" />
      <div className="text-center text-slate-600 font-semibold mb-4 text-sm uppercase tracking-wide">
        AI-Powered Satellite Disaster Damage Mapping, Rescue Planning & Flood Management
      </div>
      
      <div className="bg-teal-600 text-white text-center py-2 font-bold tracking-wider mb-6">
        HOW THE SOLUTION WORKS — ONE INTEGRATED PIPELINE
      </div>

      <div className="flex items-center justify-between mb-8 px-4">
        {[
          { icon: Radio, text: 'Satellite Data', n: 1 },
          { icon: BrainCircuit, text: 'AI Damage Detection', n: 2 },
          { icon: Database, text: 'Flood & Risk Assessment', n: 3 },
          { icon: Activity, text: 'Rescue Priority', n: 4 },
          { icon: Route, text: 'Safe Route', n: 5 },
          { icon: Home, text: 'Shelter Recommendation', n: 6 }
        ].map((step, i) => (
          <React.Fragment key={step.n}>
            <div className="flex flex-col items-center w-32 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center relative">
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-white border border-teal-500 text-teal-600 rounded-full flex items-center justify-center font-bold text-xs">
                {step.n}
              </div>
              <step.icon className="w-8 h-8 text-slate-800 mb-2" />
              <span className="text-[11px] font-bold text-teal-700 leading-tight">{step.text}</span>
            </div>
            {i < 5 && <ArrowRight className="w-6 h-6 text-slate-300 shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1">
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">💡</div>
            <h3 className="font-bold text-lg text-slate-800">The Idea</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex gap-2"><span className="text-slate-400">•</span> <span>AI compares pre/post-disaster satellite images → detects damage</span></li>
            <li className="flex gap-2"><span className="text-slate-400">•</span> <span>Combines flood, elevation, rainfall & population data → risk scoring</span></li>
            <li className="flex gap-2"><span className="text-slate-400">•</span> <span>Generates safe rescue routes + shelter/hospital locations</span></li>
            <li className="flex gap-2"><span className="text-slate-400">•</span> <span>Displayed on interactive GIS dashboard</span></li>
          </ul>
        </div>
        
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-800 text-white flex items-center justify-center"><ShieldCheck className="w-5 h-5"/></div>
            <h3 className="font-bold text-lg text-slate-800">How It Addresses the Problem</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex gap-2"><span className="text-slate-400">•</span> <span>Automates damage detection → faster than manual survey</span></li>
            <li className="flex gap-2"><span className="text-slate-400">•</span> <span>Identifies high-risk zones (population + terrain + flood)</span></li>
            <li className="flex gap-2"><span className="text-slate-400">•</span> <span>Prioritizes rescue by severity & vulnerability</span></li>
            <li className="flex gap-2"><span className="text-slate-400">•</span> <span>Risk-aware routes, not just shortest path</span></li>
            <li className="flex gap-2"><span className="text-slate-400">•</span> <span>AI confidence shown → human verification before action</span></li>
          </ul>
        </div>

        <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-600 text-white flex items-center justify-center"><Radio className="w-5 h-5"/></div>
            <h3 className="font-bold text-lg text-slate-800">Innovation & Uniqueness</h3>
          </div>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex gap-2"><span className="text-slate-400">•</span> <span>Action-oriented, not just a damage map</span></li>
            <li className="flex gap-2"><span className="text-slate-400">•</span> <span>Risk-aware routing (safety &gt; distance)</span></li>
            <li className="flex gap-2"><span className="text-slate-400">•</span> <span>Human-in-the-loop + confidence-aware AI</span></li>
            <li className="flex gap-2"><span className="text-slate-400">•</span> <span>Scalable to earthquakes, cyclones, fires</span></li>
            <li className="flex gap-2"><span className="text-slate-400">•</span> <span>Future: drone-fed real-time updates</span></li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderSlide3 = () => (
    <div className="flex flex-col h-full p-8 bg-white">
      <SlideHeader title="TECHNICAL APPROACH" />
      
      <div className="grid grid-cols-12 gap-6 h-full">
        {/* Left Column */}
        <div className="col-span-4 flex flex-col gap-4">
          <div className="bg-slate-800 text-white p-2 text-center font-bold tracking-widest text-sm uppercase">
            Technologies To Be Used
          </div>
          <div className="flex gap-2">
            <div className="bg-slate-100 p-3 rounded flex-1 text-center border border-slate-200">
              <div className="bg-slate-800 w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white mb-2 font-mono font-bold">&lt;/&gt;</div>
              <div className="font-bold text-sm text-slate-800 mb-1">Languages & Backend</div>
              <div className="text-xs text-slate-600 font-medium">Python · JavaScript/TS · SQL<br/>FastAPI/Flask · React.js<br/>REST APIs</div>
            </div>
            <div className="bg-slate-100 p-3 rounded flex-1 text-center border border-slate-200">
              <div className="bg-slate-800 w-10 h-10 mx-auto rounded-full flex items-center justify-center text-white mb-2"><Cpu className="w-5 h-5"/></div>
              <div className="font-bold text-sm text-slate-800 mb-1">AI/ML & Vision</div>
              <div className="text-xs text-slate-600 font-medium">PyTorch · TensorFlow<br/>OpenCV · Scikit-learn<br/>U-Net models</div>
            </div>
          </div>
          
          <div className="bg-slate-800 text-white p-2 text-center font-bold tracking-widest text-sm uppercase mt-4">
            Traditional vs. Drishti-AID
          </div>
          <div className="border border-rose-200 bg-rose-50 p-3 rounded">
            <div className="font-bold text-rose-800 mb-2 flex items-center gap-1">❌ Traditional Method</div>
            <div className="text-xs text-rose-900 font-medium mb-1">✕ Manual visual exams & lab delays</div>
            <div className="text-xs text-rose-900 font-medium mb-3">✕ Slow, fragmented paper/system logs</div>
            <div className="bg-rose-200 text-rose-900 text-center font-black py-1.5 rounded">24~48 HOURS</div>
          </div>
          <div className="border border-teal-200 bg-teal-50 p-3 rounded">
            <div className="font-bold text-teal-800 mb-2 flex items-center gap-1">✨ Drishti-AID Approach</div>
            <div className="text-xs text-teal-900 font-medium mb-1">✓ Sub-second AI computer vision diagnosis</div>
            <div className="text-xs text-teal-900 font-medium mb-3">✓ Automated real-time digital logging</div>
            <div className="bg-teal-200 text-teal-900 text-center font-black py-1.5 rounded">UNDER 6 HOUR</div>
          </div>
        </div>

        {/* Right Column - Flowchart */}
        <div className="col-span-8 flex flex-col">
          <div className="bg-slate-800 text-white p-2 text-center font-bold tracking-widest text-sm uppercase mb-6">
            Methodology & Process of Implementation
          </div>
          
          <div className="flex-1 grid grid-cols-3 gap-y-8 gap-x-6 relative">
            {/* Row 1 */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center z-10">
              <Database className="w-8 h-8 mx-auto mb-2 text-slate-800" />
              <div className="font-bold text-orange-800 text-sm mb-1">Data collection</div>
              <div className="text-xs text-slate-600">Imagery, weather, DEM, roads, hospitals</div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center z-10">
              <Layers className="w-8 h-8 mx-auto mb-2 text-slate-800" />
              <div className="font-bold text-orange-800 text-sm mb-1">Data PreProcessing</div>
              <div className="text-xs text-slate-600">Align, clean, mask clouds, normalize</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center z-10">
              <BrainCircuit className="w-8 h-8 mx-auto mb-2 text-slate-800" />
              <div className="font-bold text-indigo-900 text-sm mb-1">AI Damage Detection</div>
              <div className="text-xs text-slate-600">Change detection, severity, confidence</div>
            </div>

            {/* Row 2 (Reversed Flow) */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center z-10">
              <Route className="w-8 h-8 mx-auto mb-2 text-slate-800" />
              <div className="font-bold text-teal-800 text-sm mb-1">Route Planning</div>
              <div className="text-xs text-slate-600">A*/Dijkstra avoiding flooded roads</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center z-10">
              <Activity className="w-8 h-8 mx-auto mb-2 text-slate-800" />
              <div className="font-bold text-indigo-900 text-sm mb-1">Rescue Priority Calc.</div>
              <div className="text-xs text-slate-600">Critical, high, medium, low zones</div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center z-10">
              <Layers className="w-8 h-8 mx-auto mb-2 text-slate-800" />
              <div className="font-bold text-indigo-900 text-sm mb-1">Flood & Risk Analysis</div>
              <div className="text-xs text-slate-600">SAR flood extent plus zone risk map</div>
            </div>

            {/* Row 3 */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center z-10">
              <Home className="w-8 h-8 mx-auto mb-2 text-slate-800" />
              <div className="font-bold text-teal-800 text-sm mb-1">Shelter Recommendation</div>
              <div className="text-xs text-slate-600">Nearest shelters, hospitals, capacity</div>
            </div>

            <div className="bg-slate-100 border border-slate-300 rounded-lg p-4 text-center z-10">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-800" />
              <div className="font-bold text-teal-800 text-sm mb-1">GIS Command Dashboard</div>
              <div className="text-xs text-slate-600">Maps, risk zones recommendations</div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center z-10">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-800" />
              <div className="font-bold text-orange-800 text-sm mb-1">Human Verification</div>
              <div className="text-xs text-slate-600">Authorities verify, correct, refresh data</div>
            </div>
            
            {/* Visual arrows for flowchart (simplified via css absolute lines) */}
            {/* Left to right (Row 1) */}
            <div className="absolute top-[15%] left-[30%] w-[8%] h-1 bg-slate-400"></div>
            <div className="absolute top-[15%] left-[64%] w-[8%] h-1 bg-slate-400"></div>
            {/* Down (Col 3) */}
            <div className="absolute top-[28%] right-[16%] w-1 h-[8%] bg-slate-400"></div>
            {/* Right to left (Row 2) */}
            <div className="absolute top-[48%] left-[64%] w-[8%] h-1 bg-slate-400"></div>
            <div className="absolute top-[48%] left-[30%] w-[8%] h-1 bg-slate-400"></div>
            {/* Down (Col 1) */}
            <div className="absolute top-[62%] left-[16%] w-1 h-[8%] bg-slate-400"></div>
            {/* Left to right (Row 3) */}
            <div className="absolute bottom-[18%] left-[30%] w-[8%] h-1 bg-slate-400"></div>
            <div className="absolute bottom-[18%] left-[64%] w-[8%] h-1 bg-slate-400"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSlide4 = () => (
    <div className="flex flex-col h-full p-8 bg-white">
      <SlideHeader title="FEASIBILITY AND VIABILITY" />
      
      <div className="font-bold text-slate-800 flex items-center gap-2 mb-4">
        <div className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</div>
        FEASIBLE TODAY — A PROVEN PIPELINE BUILT FROM OPEN TOOLS AND FREE DATA
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-bold text-teal-600 text-sm mb-2 flex items-center gap-1">• TECHNICAL</h4>
          <p className="text-xs text-slate-700">Open-source geo + AI stack: Python, PyTorch, GeoPandas, PostGIS, Leaflet</p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-bold text-blue-600 text-sm mb-2 flex items-center gap-1">• OPERATIONAL</h4>
          <p className="text-xs text-slate-700">Decision support for authorities — never a replacement for them</p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-bold text-green-600 text-sm mb-2 flex items-center gap-1">• ECONOMIC</h4>
          <p className="text-xs text-slate-700">Prototype runs on free datasets and open tools; cloud added on demand</p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4">
          <h4 className="font-bold text-orange-600 text-sm mb-2 flex items-center gap-1">• SCALABLE</h4>
          <p className="text-xs text-slate-700">Same modules extend to cyclones, landslides, earthquakes, forest fires</p>
        </div>
      </div>

      <div className="font-bold text-slate-800 flex items-center gap-2 mb-4">
        <div className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</div>
        DATA IS AVAILABLE — AND EVERY RISK HAS A COUNTER-MEASURE
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h4 className="text-xs font-bold text-slate-500 mb-4">SATELLITE REVISIT INTERVAL (DAYS)</h4>
          {/* Mock Chart */}
          <div className="space-y-3">
            <div>
              <div className="text-[10px] mb-1">Landsat (single)</div>
              <div className="w-full bg-teal-700 h-6 rounded text-white text-[10px] flex items-center px-2 justify-end">16.0</div>
            </div>
            <div>
              <div className="text-[10px] mb-1">Landsat 8+9</div>
              <div className="w-1/2 bg-teal-600 h-6 rounded text-white text-[10px] flex items-center px-2 justify-end">8.0</div>
            </div>
            <div>
              <div className="text-[10px] mb-1">Sentinel-1 (A+C)</div>
              <div className="w-2/5 bg-teal-600 h-6 rounded text-white text-[10px] flex items-center px-2 justify-end">6.0</div>
            </div>
            <div>
              <div className="text-[10px] mb-1">Sentinel-2 (A+B)</div>
              <div className="w-1/3 bg-teal-600 h-6 rounded text-white text-[10px] flex items-center px-2 justify-end">5.0</div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic mt-4">
            Fusing sources shortens the effective wait; INSAT-3DS adds sub-hourly weather updates.
          </p>
        </div>

        <div className="col-span-8">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="bg-orange-50 text-orange-800 text-left p-2 border-b-2 border-white">RISK / CHALLENGE</th>
                <th className="bg-teal-50 text-teal-800 text-left p-2 border-b-2 border-white">STRATEGY BUILT INTO THE SYSTEM</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="bg-orange-50/50 p-2 border-b border-white">Revisit delay right after a disaster</td><td className="bg-teal-50/50 p-2 border-b border-white">Fuse Sentinel-1, Sentinel-2, Landsat, weather</td></tr>
              <tr><td className="bg-orange-50/50 p-2 border-b border-white">Cloud cover hides optical imagery</td><td className="bg-teal-50/50 p-2 border-b border-white">Sentinel-1 SAR images through cloud and night</td></tr>
              <tr><td className="bg-orange-50/50 p-2 border-b border-white">AI may misread water or damage</td><td className="bg-teal-50/50 p-2 border-b border-white">Confidence score on every output; low ones flagged</td></tr>
              <tr><td className="bg-orange-50/50 p-2 border-b border-white">Road and shelter data can be stale</td><td className="bg-teal-50/50 p-2 border-b border-white">Cross-checked with OSM, Bhuvan, field and drone data</td></tr>
              <tr><td className="bg-orange-50/50 p-2 border-b border-white">Weak network and power on the ground</td><td className="bg-teal-50/50 p-2 border-b border-white">Offline-cached dashboard; cloud + edge compute</td></tr>
              <tr><td className="bg-orange-50/50 p-2 border-b border-white">Flood extent and access change hourly</td><td className="bg-teal-50/50 p-2 border-b border-white">Continuous re-analysis and dynamic re-routing</td></tr>
              <tr><td className="bg-orange-50/50 p-2 border-b border-white">Automated output could be over-trusted</td><td className="bg-teal-50/50 p-2 border-b border-white">Human-in-the-loop sign-off before any action</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSlide5 = () => (
    <div className="flex flex-col h-full p-8 bg-white">
      <SlideHeader title="IMPACT AND BENEFITS" />
      
      <div className="font-bold text-slate-800 flex items-center gap-2 mb-3">
        <div className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</div>
        WHAT CHANGES ON THE GROUND — ONE OPERATING PICTURE, NOT SCATTERED REPORTS
      </div>
      
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 space-y-3">
        <div>
          <h4 className="font-bold text-slate-700 text-sm">DAMAGE ASSESSMENT</h4>
          <p className="text-xs text-slate-600">Slow manual ground survey, district by district <span className="text-teal-600 font-bold mx-2">→</span> <span className="text-teal-700 font-bold">AI map of flood and damage extent straight from satellite</span></p>
        </div>
        <div>
          <h4 className="font-bold text-slate-700 text-sm">RESCUE TARGETING</h4>
          <p className="text-xs text-slate-600">Ad-hoc calls and an incomplete picture of who is worst hit <span className="text-teal-600 font-bold mx-2">→</span> <span className="text-teal-700 font-bold">Zones ranked by population exposure, damage and accessibility</span></p>
        </div>
        <div>
          <h4 className="font-bold text-slate-700 text-sm">ROUTE PLANNING</h4>
          <p className="text-xs text-slate-600">Crews sent down roads that may already be cut <span className="text-teal-600 font-bold mx-2">→</span> <span className="text-teal-700 font-bold">Risk-aware routes to hospitals and safe shelters</span></p>
        </div>
      </div>

      <div className="font-bold text-slate-800 flex items-center gap-2 mb-3">
        <div className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</div>
        BENEFITS ACROSS FOUR DIMENSIONS
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4 flex-1">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <h4 className="font-bold text-teal-600 text-sm mb-2 flex items-center gap-1">● SOCIAL</h4>
          <ul className="text-[10px] text-slate-700 space-y-1 font-bold">
            <li>▪ Rescue reaches the most vulnerable first</li>
            <li>▪ Faster evacuation and emergency response</li>
            <li>▪ Better access to hospitals and safe shelters</li>
            <li>▪ Lower risk to human life during disasters</li>
          </ul>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-1">● ECONOMIC</h4>
          <ul className="text-[10px] text-slate-700 space-y-1 font-bold">
            <li>▪ Cuts time and manpower for assessment</li>
            <li>▪ Optimises limited vehicles and personnel</li>
            <li>▪ Locates damaged infrastructure sooner</li>
            <li>▪ Open-source stack keeps build cost low</li>
          </ul>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <h4 className="font-bold text-green-600 text-sm mb-2 flex items-center gap-1">● ENVIRONMENTAL</h4>
          <ul className="text-[10px] text-slate-700 space-y-1 font-bold">
            <li>▪ Rapid mapping of flood-affected land</li>
            <li>▪ Identifies crop and land-surface damage</li>
            <li>▪ Monitors rivers, water bodies and terrain</li>
            <li>▪ Historical maps aid climate-risk planning</li>
          </ul>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <h4 className="font-bold text-orange-700 text-sm mb-2 flex items-center gap-1">● GOVERNANCE</h4>
          <ul className="text-[10px] text-slate-700 space-y-1 font-bold">
            <li>▪ One GIS command picture for every team</li>
            <li>▪ Evidence-based, multi-source decisions</li>
            <li>▪ Human verification before critical action</li>
            <li>▪ Spans preparedness, response, recovery</li>
          </ul>
        </div>
      </div>

      <div className="font-bold text-slate-800 flex items-center gap-2 mb-2">
        <div className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</div>
        PILOT TARGETS FOR THE FIRST DISTRICT DEPLOYMENT
      </div>
      <div className="flex gap-4">
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded flex items-center p-2 gap-3">
          <div className="text-teal-700 font-black text-xl w-16 text-center">&lt; 6 hrs</div>
          <div className="text-[10px] font-bold text-slate-700">Initial assessment time, down from 24–48 hrs today</div>
        </div>
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded flex items-center p-2 gap-3">
          <div className="text-teal-700 font-black text-xl w-16 text-center">+30%</div>
          <div className="text-[10px] font-bold text-slate-700">Rescues reaching critical zones in the first 12 hrs</div>
        </div>
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded flex items-center p-2 gap-3">
          <div className="text-teal-700 font-black text-xl w-16 text-center">−50%</div>
          <div className="text-[10px] font-bold text-slate-700">Failed route attempts, through risk-aware routing</div>
        </div>
      </div>
    </div>
  );

  const renderSlide6 = () => (
    <div className="flex flex-col h-full p-8 bg-white">
      <SlideHeader title="RESEARCH AND REFERENCES" />
      
      <div className="grid grid-cols-2 gap-8 h-full">
        <div>
          <div className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <div className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</div>
            REFERENCES & RESEARCH WORK
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">● INTERNATIONAL EARTH-OBSERVATION GUIDANCE</h4>
              <ul className="text-xs text-slate-700 ml-5 mt-1 space-y-1">
                <li><strong className="text-slate-900">UN-SPIDER</strong> — Flood mapping & damage assessment with Sentinel-2</li>
                <li><strong className="text-slate-900">UN-SPIDER</strong> — Radar-based flood mapping with SAR</li>
                <li><strong className="text-slate-900">ESA</strong> — Sentinel-1 for emergency response and impact assessment</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">● INDIAN SPACE & METEOROLOGICAL DATA</h4>
              <ul className="text-xs text-slate-700 ml-5 mt-1 space-y-1">
                <li><strong className="text-slate-900">ISRO / NRSC</strong> — Bhuvan geoportal, Indian geospatial layers</li>
                <li><strong className="text-slate-900">ISRO</strong> — MOSDAC satellite meteorological data</li>
                <li><strong className="text-slate-900">ISRO</strong> — INSAT-3DS meteorological satellite and storm warning</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">● GEOSPATIAL PROCESSING & HUMANITARIAN MAPPING</h4>
              <ul className="text-xs text-slate-700 ml-5 mt-1 space-y-1">
                <li><strong className="text-slate-900">Google Earth Engine</strong> — Sentinel-1 change detection for inundation mapping</li>
                <li><strong className="text-slate-900">HOT / OpenStreetMap</strong> — disaster road, building and infrastructure data</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <div className="font-bold text-slate-800 flex items-center gap-2 mb-4">
            <div className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</div>
            RESEARCH AREAS STUDIED
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-teal-50 border border-teal-100 text-teal-800 font-bold text-center py-2 rounded text-sm">Remote Sensing</div>
            <div className="bg-teal-50 border border-teal-100 text-teal-800 font-bold text-center py-2 rounded text-sm">SAR Image Processing</div>
            <div className="bg-teal-50 border border-teal-100 text-teal-800 font-bold text-center py-2 rounded text-sm">AI / Computer Vision</div>
            <div className="bg-teal-50 border border-teal-100 text-teal-800 font-bold text-center py-2 rounded text-sm">GIS & Spatial Analysis</div>
            <div className="bg-teal-50 border border-teal-100 text-teal-800 font-bold text-center py-2 rounded text-sm">Risk Assessment</div>
            <div className="bg-teal-50 border border-teal-100 text-teal-800 font-bold text-center py-2 rounded text-sm">Graph-Based Routing</div>
            <div className="bg-teal-50 border border-teal-100 text-teal-800 font-bold text-center py-2 rounded text-sm">Humanitarian Mapping</div>
            <div className="bg-teal-50 border border-teal-100 text-teal-800 font-bold text-center py-2 rounded text-sm">Human-in-the-Loop AI</div>
          </div>

          <div className="bg-slate-800 text-white p-5 rounded-lg shadow-lg">
            <h4 className="text-slate-400 text-xs font-bold mb-2 uppercase">OVERALL RESEARCH BASIS</h4>
            <p className="text-sm leading-relaxed">
              Satellite EO, SAR, GIS and GeoAI are already established for disaster mapping and response. 
              <br/><br/>
              <span className="text-teal-300 font-medium">DRISHTI-AID's contribution is to chain them into one workflow and keep a human in the loop at every operational decision.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800 text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm">SIH 2026 Pitch Deck Viewer</h2>
            <p className="text-xs text-slate-400">Team GeoPulse • DRISHTI-AID</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1">
            <button 
              onClick={prevSlide} 
              disabled={currentSlide === 1}
              className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold px-2 w-20 text-center">
              Slide {currentSlide} / {totalSlides}
            </span>
            <button 
              onClick={nextSlide} 
              disabled={currentSlide === totalSlides}
              className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-30 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
          
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        {/* Force 16:9 Aspect Ratio Container for the Slide */}
        <div className="relative w-full max-w-[1280px] aspect-video bg-white shadow-2xl rounded-xl overflow-hidden shrink-0 transition-all duration-300 transform">
          <div ref={slideRef} className="absolute inset-0 bg-white">
            {currentSlide === 1 && renderSlide1()}
            {currentSlide === 2 && renderSlide2()}
            {currentSlide === 3 && renderSlide3()}
            {currentSlide === 4 && renderSlide4()}
            {currentSlide === 5 && renderSlide5()}
            {currentSlide === 6 && renderSlide6()}
            
            {/* Common Footer for slides 2-6 */}
            {currentSlide > 1 && (
              <div className="absolute bottom-4 right-6 text-slate-500 font-bold text-sm">
                {currentSlide}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
