import React, { useState, useEffect } from 'react';
import { X, Satellite, Loader2, MapPin, Calendar, CheckCircle2, AlertTriangle, Search, Eye, RefreshCw, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import { DisasterScenario } from '../types';

interface CopernicusDataModalProps {
  scenario: DisasterScenario;
  onClose: () => void;
  onViewInProject?: () => void;
}

export const CopernicusDataModal: React.FC<CopernicusDataModalProps> = ({
  scenario,
  onClose,
  onViewInProject,
}) => {
  const [status, setStatus] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In-modal embedded viewer state (to show Copernicus Data Space Ecosystem directly in project)
  const [activeViewerProduct, setActiveViewerProduct] = useState<any | null>(null);
  const [inModalViewerOpen, setInModalViewerOpen] = useState<boolean>(false);
  const [viewerKey, setViewerKey] = useState<number>(0);

  const [selectedCollection, setSelectedCollection] = useState<'SENTINEL-1' | 'SENTINEL-2'>('SENTINEL-1');

  const handleSearch = async (collection = selectedCollection) => {
    setIsSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/copernicus/search?scenario=${scenario.id}&collection=${collection}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSearchResults(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/copernicus/status');
        const data = await res.json();
        setStatus(data);
        if (data.status === 'operational') {
          // Auto-load Sentinel-1 passes for the current scenario
          handleSearch('SENTINEL-1');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, [scenario.id]);

  const openInModalViewer = (item?: any) => {
    setActiveViewerProduct(item || null);
    setInModalViewerOpen(true);
  };

  const getCopernicusBrowserUrl = (item?: any) => {
    const zoom = 11;
    const lat = scenario.center[0];
    const lng = scenario.center[1];
    return `https://browser.dataspace.copernicus.eu/?zoom=${zoom}&lat=${lat}&lng=${lng}&themeId=DEFAULT-THEME`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Satellite className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Copernicus Data Space Ecosystem
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40">
                  In-Project Viewer
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Live Sentinel-1 SAR & Sentinel-2 Optical Data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onViewInProject && (
              <button
                onClick={() => {
                  onClose();
                  onViewInProject();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
                title="Switch main application canvas to Copernicus Satellite view"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Show in Main Map Window</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* In-Modal Embedded Browser View (when active) */}
        {inModalViewerOpen ? (
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden relative">
            {/* Viewer Top Sub-bar */}
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInModalViewerOpen(false)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Catalogue</span>
                </button>
                <div className="text-slate-300 font-mono text-[11px] truncate max-w-sm">
                  {activeViewerProduct ? activeViewerProduct.Name : `${scenario.name} Live Satellite Swath`}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewerKey((k) => k + 1)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="Reload Copernicus Iframe"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reload</span>
                </button>

                {onViewInProject && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewInProject();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Expand to Full Project Canvas</span>
                  </button>
                )}
              </div>
            </div>

            {/* Direct Embedded Copernicus Canvas inside project */}
            <div className="flex-1 w-full h-full relative">
              <iframe
                key={viewerKey}
                src={getCopernicusBrowserUrl(activeViewerProduct)}
                title="Copernicus Data Space Ecosystem In-Project Viewer"
                className="w-full h-full border-0"
                allow="geolocation; fullscreen; clipboard-read; clipboard-write"
                loading="eager"
              />
            </div>
          </div>
        ) : (
          /* Catalogue / Search View */
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <p className="text-slate-400">Verifying Copernicus connection...</p>
              </div>
            ) : status?.status === 'operational' ? (
              <>
                {/* Connection Status Banner */}
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-emerald-300 font-bold text-sm">CDSE Connection Active & Ready</h3>
                      <p className="text-xs text-emerald-400/80 mt-0.5">
                        Authenticated via OAuth Client Credentials. Live Sentinel data renders directly in the project without redirecting.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openInModalViewer()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shrink-0 shadow-md shadow-indigo-600/30 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Live Satellite Viewer</span>
                  </button>
                </div>

                {/* Search Control */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">Copernicus Live Satellite Telemetry</h3>
                    <p className="text-xs text-slate-400">
                      Target Sector: <span className="text-cyan-300 font-semibold">{scenario.name}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
                      <button
                        onClick={() => {
                          setSelectedCollection('SENTINEL-1');
                          handleSearch('SENTINEL-1');
                        }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                          selectedCollection === 'SENTINEL-1'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Sentinel-1 (SAR)
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCollection('SENTINEL-2');
                          handleSearch('SENTINEL-2');
                        }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                          selectedCollection === 'SENTINEL-2'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Sentinel-2 (MSI)
                      </button>
                    </div>

                    <button
                      onClick={() => handleSearch(selectedCollection)}
                      disabled={isSearching}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                    >
                      {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                {/* Results */}
                {searchResults && searchResults.value && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h3 className="text-white font-bold text-sm">
                        Recent Satellite Acquisitions ({searchResults.value.length} Products)
                      </h3>
                      <span className="text-[11px] text-slate-400">Click any product to render in project</span>
                    </div>

                    <div className="grid gap-2.5">
                      {searchResults.value.map((item: any) => (
                        <div
                          key={item.Id}
                          className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/60 hover:border-indigo-500/50 transition flex items-center justify-between gap-4 group"
                        >
                          <div className="flex gap-3.5 items-center flex-1 min-w-0">
                            {/* Quicklook Thumbnail */}
                            <div className="w-16 h-16 shrink-0 bg-slate-900 rounded-lg border border-slate-700 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
                              <img
                                src={`/api/copernicus/quicklook/${item.Id}`}
                                alt={item.Name}
                                className="w-full h-full object-cover absolute inset-0 z-0 opacity-80 group-hover:opacity-100 transition-opacity"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10 pointer-events-none"></div>
                              <Satellite className="w-5 h-5 text-indigo-400/60 mb-0.5 group-hover:text-indigo-400 transition-colors relative z-10" />
                              <div className="text-[9px] font-mono text-indigo-300 font-bold relative z-10">
                                {item.ProductType || 'SAR'}
                              </div>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="font-mono text-xs text-indigo-300 mb-1 truncate font-semibold">
                                {item.Name}
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-cyan-400" />
                                  {new Date(item.ContentDate.Start).toLocaleString()}
                                </span>
                                <span>Size: {(item.ContentLength / (1024 * 1024)).toFixed(1)} MB</span>
                                <span className="uppercase bg-slate-900 px-1.5 py-0.5 rounded text-[10px] text-indigo-300 border border-indigo-500/30">
                                  {item.Collection?.Name || 'SENTINEL-1'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* IN-PROJECT VIEW BUTTON */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => openInModalViewer(item)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg border border-indigo-500/50 shadow-md shadow-indigo-600/20 transition active:scale-95"
                              title="Show this satellite imagery right here in the project"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Show in Project</span>
                            </button>
                          </div>
                        </div>
                      ))}
                      {searchResults.value.length === 0 && (
                        <p className="text-sm text-slate-400 p-4 text-center">No recent products found for this sector.</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-red-400 font-bold mb-1">Connection Failed</h3>
                  <p className="text-sm text-red-300/80 break-words font-mono">
                    {status?.message || error || 'Unknown error'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

