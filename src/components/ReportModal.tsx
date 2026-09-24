import React, { useRef, useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldAlert,
  Calendar,
  Waves,
  Users,
  Compass,
  Building2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  DisasterScenario,
  ChangeDetectionResult,
  RiskAnalysisResult,
  RoutePlanningResult,
  AiBriefingResponse,
} from '../types';

interface ReportModalProps {
  scenario: DisasterScenario;
  changeDetection: ChangeDetectionResult | null;
  riskZones: RiskAnalysisResult | null;
  routesResult: RoutePlanningResult | null;
  aiBriefing: AiBriefingResponse | null;
  timelineHour: number;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  scenario,
  changeDetection,
  riskZones,
  routesResult,
  aiBriefing,
  timelineHour,
  onClose,
}) => {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const reportId = `DRISHTI-SITREP-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toUTCString();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0f172a',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${reportId}-${scenario.id}.pdf`);
    } catch (err) {
      console.error('PDF generation error, fallback to browser print:', err);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const topRoutes = routesResult?.routes.slice(0, 5) || [];
  const criticalSectors = riskZones?.geoJson.features
    .filter((f) => f.properties.category === 'Critical' || f.properties.category === 'High')
    .slice(0, 8) || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 print:border-none print:shadow-none print:max-h-none print:w-full">
        {/* Modal Toolbar */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-950 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">
              Disaster Situational Report (SITREP) Export
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Report Sheet */}
        <div className="overflow-y-auto p-6 flex-1 bg-slate-900 print:bg-white print:text-black">
          <div
            ref={reportRef}
            className="max-w-3xl mx-auto bg-slate-950 border border-slate-800 rounded-xl p-6 print:border-none print:bg-white print:text-black shadow-lg"
          >
            {/* Header / Meta */}
            <div className="border-b border-slate-800 pb-4 mb-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 font-bold">
                    DRISHTI-AID NATIONAL DISASTER COMMAND
                  </span>
                  <h1 className="text-xl font-extrabold text-white mt-0.5 print:text-black">
                    OFFICIAL DISASTER SITUATION REPORT
                  </h1>
                </div>
                <div className="text-right font-mono text-xs text-slate-400">
                  <div className="text-cyan-300 font-bold">{reportId}</div>
                  <div>T+{timelineHour}h Assessment Pass</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs font-mono text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Scenario:</span>
                  <strong className="text-white">{scenario.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Satellite Sensor:</span>
                  <span>{scenario.satelliteSensor}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Generated At:</span>
                  <span>{dateStr.split('GMT')[0]} UTC</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Monitored AOI:</span>
                  <span className="text-cyan-300">{scenario.areaKm2} km²</span>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                1. Executive Summary & Radar Telemetry
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                {aiBriefing?.executiveSummary ||
                  `Sentinel-1 synthetic aperture radar interferometric change detection at T+${timelineHour}h confirms ${
                    changeDetection?.floodedAreaKm2 || 0
                  } km² inundation across ${scenario.riverBasin}. An estimated ${
                    riskZones?.totalPopulationAtRisk.toLocaleString() || 0
                  } citizens are located in high-risk zones, requiring immediate resource mobilization.`}
              </p>
            </div>

            {/* Inundation & Key Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] uppercase font-mono text-slate-400">Flooded Extent</span>
                <div className="text-lg font-bold text-cyan-300 font-mono mt-0.5">
                  {changeDetection?.floodedAreaKm2} km²
                </div>
                <span className="text-[10px] text-slate-400">
                  {changeDetection?.floodPercentage}% of 50 km² AOI
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] uppercase font-mono text-slate-400">Critical Sectors</span>
                <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
                  {riskZones?.criticalZonesCount} Zones
                </div>
                <span className="text-[10px] text-slate-400">
                  Score &gt; 75 (Immediate Evac)
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] uppercase font-mono text-slate-400">Verified A* Routes</span>
                <div className="text-lg font-bold text-emerald-300 font-mono mt-0.5">
                  {routesResult?.clearRoutesCount} / {routesResult?.routesComputed}
                </div>
                <span className="text-[10px] text-slate-400">100% Flood-Clear Corridors</span>
              </div>
            </div>

            {/* Priority Zones Table */}
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                2. High Consequence Risk Sectors
              </h3>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-2">Sector</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Score</th>
                      <th className="p-2">Population</th>
                      <th className="p-2">Nearest Shelter</th>
                      <th className="p-2">Directive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                    {criticalSectors.map((feat) => (
                      <tr key={feat.properties.id} className="hover:bg-slate-900/30">
                        <td className="p-2 font-bold text-white">{feat.properties.zoneName.split('(')[0]}</td>
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              feat.properties.category === 'Critical'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {feat.properties.category}
                          </span>
                        </td>
                        <td className="p-2 font-bold text-white">{feat.properties.riskScore}</td>
                        <td className="p-2 text-slate-300">~{feat.properties.estimatedPopulation.toLocaleString()}</td>
                        <td className="p-2 text-slate-300 truncate max-w-[140px]">{feat.properties.nearestShelterName}</td>
                        <td className="p-2 text-slate-400 font-sans text-[10px] truncate max-w-[180px]">
                          {feat.properties.recommendedAction.split(':')[0]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top 5 Safe Routes Table */}
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                3. Primary Evacuation Corridors (A* Validated)
              </h3>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-2">Destination</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Distance</th>
                      <th className="p-2">Est. Time</th>
                      <th className="p-2">Beds Free</th>
                      <th className="p-2">Clearance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                    {topRoutes.map((r) => (
                      <tr key={r.id}>
                        <td className="p-2 font-bold text-white">{r.destinationName}</td>
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              r.status === 'CLEAR'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-2 text-slate-300">{r.distanceKm} km</td>
                        <td className="p-2 text-cyan-300">~{r.travelTimeMinutes} mins</td>
                        <td className="p-2 text-emerald-400">{r.availableCapacity.toLocaleString()}</td>
                        <td className="p-2 font-bold text-white">{r.safetyScore}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Shelter Resource Matrix */}
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                4. Shelter & Hospital Supply Matrix (Sample of 20 Shelters)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Total Bed Capacity</span>
                  <span className="text-white font-bold">
                    {scenario.shelters.reduce((a, s) => a + s.capacity, 0).toLocaleString()} beds
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Current Occupancy</span>
                  <span className="text-amber-300 font-bold">
                    {scenario.shelters.reduce((a, s) => a + s.currentOccupancy, 0).toLocaleString()} (
                    {Math.round(
                      (scenario.shelters.reduce((a, s) => a + s.currentOccupancy, 0) /
                        scenario.shelters.reduce((a, s) => a + s.capacity, 0)) *
                        100
                    )}
                    %)
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Motorized Rescue Boats</span>
                  <span className="text-cyan-300 font-bold">
                    {scenario.shelters.reduce((a, s) => a + s.supplies.rescueBoats, 0)} boats
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Medical Staff</span>
                  <span className="text-emerald-300 font-bold">
                    {scenario.shelters.reduce((a, s) => a + s.medicalStaff, 0)} personnel
                  </span>
                </div>
              </div>
            </div>

            {/* Authentication Stamp */}
            <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between font-mono">
              <span>DRISHTI-AID Satellite SAR Response System • Built for SIH 2024</span>
              <span>CONFIDENTIAL - EMERGENCY OPERATIONAL USE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
