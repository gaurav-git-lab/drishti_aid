import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import {
  Calendar,
  Layers,
  Satellite,
  Maximize2,
  Minimize2,
  RefreshCw,
  Compass,
  SlidersHorizontal,
  Clock,
  Radio,
  Eye,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Target,
  Sparkles,
  MapPin,
  ChevronDown,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { DisasterScenario } from '../types';

export type CopernicusSatelliteLayer =
  | 'SENTINEL_1_SAR_IW'
  | 'SENTINEL_1_SAR_DIFF'
  | 'SENTINEL_2_TRUE_COLOR'
  | 'SENTINEL_2_FALSE_COLOR'
  | 'SENTINEL_2_NDWI_WATER'
  | 'SENTINEL_3_OLCI'
  | 'COPERNICUS_DEM_TERRAIN';

interface CopernicusLayerMeta {
  id: CopernicusSatelliteLayer;
  name: string;
  category: 'SAR Radar' | 'Optical Multispectral' | 'Elevation / DEM';
  satellite: 'Sentinel-1' | 'Sentinel-2' | 'Sentinel-3' | 'Copernicus DEM';
  description: string;
  resolution: string;
  revisit: string;
  dayNight: 'Day & Night (All-Weather)' | 'Daylight Only';
  penetratesClouds: boolean;
  filterStyle: {
    brightness: number;
    contrast: number;
    saturate: number;
    hueRotate: number;
    invert: number;
    opacity: number;
  };
  tintOverlay?: string; // CSS rgba
  badgeColor: string;
}

const COPERNICUS_LAYERS: CopernicusLayerMeta[] = [
  {
    id: 'SENTINEL_1_SAR_IW',
    name: 'Sentinel-1 C-SAR IW (Dual-Pol VV+VH)',
    category: 'SAR Radar',
    satellite: 'Sentinel-1',
    description: 'Interferometric Wide Swath Synthetic Aperture Radar. All-weather microwave imaging penetrating thick cloudburst cover and monsoon downpours.',
    resolution: '10m Spatial Resolution',
    revisit: '6-day Constellation Revisit',
    dayNight: 'Day & Night (All-Weather)',
    penetratesClouds: true,
    filterStyle: {
      brightness: 1.15,
      contrast: 1.45,
      saturate: 0.1,
      hueRotate: 190,
      invert: 0,
      opacity: 0.95,
    },
    tintOverlay: 'rgba(6, 182, 212, 0.08)',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  {
    id: 'SENTINEL_1_SAR_DIFF',
    name: 'Sentinel-1 SAR Flood Inundation Difference',
    category: 'SAR Radar',
    satellite: 'Sentinel-1',
    description: 'Calibrated backscatter cross-ratio (T_event / T_pre). Smooth open floodwaters act as specular reflectors, creating deep dB signal drops.',
    resolution: '10m Calibrated Pixel',
    revisit: 'Sub-daily Emergency Tasking',
    dayNight: 'Day & Night (All-Weather)',
    penetratesClouds: true,
    filterStyle: {
      brightness: 1.05,
      contrast: 1.6,
      saturate: 0.6,
      hueRotate: 210,
      invert: 0,
      opacity: 0.92,
    },
    tintOverlay: 'rgba(59, 130, 246, 0.12)',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  {
    id: 'SENTINEL_2_TRUE_COLOR',
    name: 'Sentinel-2 MSI True Color (B04, B03, B02)',
    category: 'Optical Multispectral',
    satellite: 'Sentinel-2',
    description: 'Natural visual spectrum representation (Red 665nm, Green 560nm, Blue 490nm) calibrated to Surface Reflectance (Level-2A BOA).',
    resolution: '10m Ground Resolution',
    revisit: '5 days with Sentinel-2A/2B',
    dayNight: 'Daylight Only',
    penetratesClouds: false,
    filterStyle: {
      brightness: 1.02,
      contrast: 1.1,
      saturate: 1.15,
      hueRotate: 0,
      invert: 0,
      opacity: 1.0,
    },
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'SENTINEL_2_FALSE_COLOR',
    name: 'Sentinel-2 False Color Urban / Vegetation (B08, B04, B03)',
    category: 'Optical Multispectral',
    satellite: 'Sentinel-2',
    description: 'Near-Infrared (NIR B8 842nm) composite. Dense healthy vegetation reflects vibrant infrared red, while muddy inundation appears dark/cyan.',
    resolution: '10m Ground Resolution',
    revisit: '5 days',
    dayNight: 'Daylight Only',
    penetratesClouds: false,
    filterStyle: {
      brightness: 1.08,
      contrast: 1.25,
      saturate: 1.4,
      hueRotate: 290,
      invert: 0,
      opacity: 0.95,
    },
    tintOverlay: 'rgba(236, 72, 153, 0.08)',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
  },
  {
    id: 'SENTINEL_2_NDWI_WATER',
    name: 'Normalized Difference Water Index (NDWI)',
    category: 'Optical Multispectral',
    satellite: 'Sentinel-2',
    description: 'NDWI = (Green - NIR) / (Green + NIR). Specifically isolates surface water bodies, waterlogged lowlands, and submerged urban corridors.',
    resolution: '10m Pixel Matrix',
    revisit: '5 days',
    dayNight: 'Daylight Only',
    penetratesClouds: false,
    filterStyle: {
      brightness: 1.1,
      contrast: 1.5,
      saturate: 1.6,
      hueRotate: 180,
      invert: 0,
      opacity: 0.95,
    },
    tintOverlay: 'rgba(14, 165, 233, 0.18)',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  },
  {
    id: 'SENTINEL_3_OLCI',
    name: 'Sentinel-3 OLCI Regional Terrestrial Color',
    category: 'Optical Multispectral',
    satellite: 'Sentinel-3',
    description: 'Ocean and Land Colour Instrument (21 spectral bands). Wide swath (1270 km) for synoptic basin-wide flood tracking and coastal river plumes.',
    resolution: '300m Synoptic Regional',
    revisit: '&lt; 2 days Revisit',
    dayNight: 'Daylight Only',
    penetratesClouds: false,
    filterStyle: {
      brightness: 1.05,
      contrast: 1.2,
      saturate: 1.1,
      hueRotate: 15,
      invert: 0,
      opacity: 0.9,
    },
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    id: 'COPERNICUS_DEM_TERRAIN',
    name: 'Copernicus GLO-30 Digital Elevation Model',
    category: 'Elevation / DEM',
    satellite: 'Copernicus DEM',
    description: 'High-precision 30m global digital surface model (DSM) derived from TanDEM-X radar interferometry, highlighting flood basin catchment contours.',
    resolution: '30m Global Coverage',
    revisit: 'Static Topographic Base',
    dayNight: 'Day & Night (All-Weather)',
    penetratesClouds: true,
    filterStyle: {
      brightness: 1.1,
      contrast: 1.35,
      saturate: 0.4,
      hueRotate: 35,
      invert: 0,
      opacity: 0.92,
    },
    tintOverlay: 'rgba(217, 119, 6, 0.10)',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  },
];

interface CopernicusMainViewProps {
  scenario: DisasterScenario;
  onOpenDetailedView?: () => void;
  onOpenTacticalGis?: () => void;
  onOpenCarto?: () => void;
  onOpenModal?: () => void;
  initialCollection?: 'SENTINEL-1' | 'SENTINEL-2';
}

export const CopernicusMainView: React.FC<CopernicusMainViewProps> = ({
  scenario,
  onOpenDetailedView,
  onOpenTacticalGis,
  onOpenCarto,
  onOpenModal,
}) => {
  // Leaflet Map Reference
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const swathLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const aoiLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  // Interactive Layer & Date Selection State
  const [activeLayer, setActiveLayer] = useState<CopernicusSatelliteLayer>('SENTINEL_1_SAR_IW');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [recentAcquisitions, setRecentAcquisitions] = useState<
    Array<{ id: string; name: string; date: string; time: string; platform: string; orbitDirection?: string; sizeMb?: number }>
  >([]);
  const [isLoadingFootprints, setIsLoadingFootprints] = useState<boolean>(false);
  const [layerOpacity, setLayerOpacity] = useState<number>(0.92);
  const [showAoiOverlay, setShowAoiOverlay] = useState<boolean>(true);
  const [showSwathFootprints, setShowSwathFootprints] = useState<boolean>(true);
  const [showLayerPicker, setShowLayerPicker] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(true);

  // Active layer metadata
  const currentLayerMeta = useMemo(() => {
    return COPERNICUS_LAYERS.find((l) => l.id === activeLayer) || COPERNICUS_LAYERS[0];
  }, [activeLayer]);

  // Available quick preset dates for disaster scenarios
  const presetDates = useMemo(() => {
    const today = new Date();
    const d1 = new Date(today.getTime() - 24 * 3600 * 1000);
    const d2 = new Date(today.getTime() - 48 * 3600 * 1000);
    const d3 = new Date(today.getTime() - 5 * 24 * 3600 * 1000);

    return [
      { label: 'Live Pass (Today)', value: today.toISOString().split('T')[0] },
      { label: 'T - 24h Pass', value: d1.toISOString().split('T')[0] },
      { label: 'T - 48h Pre-Event', value: d2.toISOString().split('T')[0] },
      { label: 'Baseline Archive', value: d3.toISOString().split('T')[0] },
    ];
  }, []);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (leafletMapRef.current) {
      try {
        swathLayerGroupRef.current.clearLayers();
        aoiLayerGroupRef.current.clearLayers();
      } catch (e) {
        // Safe ignore
      }
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: scenario.center,
      zoom: scenario.zoom || 12,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: false,
    });

    // Clear before adding to new map
    swathLayerGroupRef.current.clearLayers();
    aoiLayerGroupRef.current.clearLayers();

    // High-resolution satellite basemap
    const satelliteTile = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; Copernicus Data Space Ecosystem & Esri Satellite',
        maxZoom: 18,
      }
    );
    satelliteTile.addTo(map);
    baseTileLayerRef.current = satelliteTile;

    // Layer groups for swaths and 250 km² AOI boundaries
    swathLayerGroupRef.current.addTo(map);
    aoiLayerGroupRef.current.addTo(map);

    leafletMapRef.current = map;

    return () => {
      try {
        swathLayerGroupRef.current.clearLayers();
        aoiLayerGroupRef.current.clearLayers();
      } catch (e) {
        // Safe ignore
      }
      map.remove();
      leafletMapRef.current = null;
    };
  }, [scenario.id]);

  // 2. Render 250 km² Disaster Area Bounds Polygon
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const aoiGroup = aoiLayerGroupRef.current;
    aoiGroup.clearLayers();

    if (!showAoiOverlay) return;

    // Draw the 250 km² scenario rectangular bounds
    const bounds = scenario.bounds;
    const [south, west] = bounds[0];
    const [north, east] = bounds[1];

    const aoiPolygon = L.rectangle(
      [
        [south, west],
        [north, east],
      ],
      {
        color: '#6366f1',
        weight: 2,
        dashArray: '5, 6',
        fillColor: '#818cf8',
        fillOpacity: 0.08,
      }
    );

    aoiPolygon.bindTooltip(
      `<strong>${scenario.name}</strong><br/>` +
      `Copernicus AOI: <strong>${scenario.areaKm2} km²</strong><br/>` +
      `Sensor Target: <em>${scenario.satelliteSensor}</em>`,
      { sticky: true }
    );
    aoiPolygon.addTo(aoiGroup);

    // Epicenter Pulse Marker
    const epicenterMarker = L.circleMarker(scenario.epicenter, {
      radius: 7,
      color: '#ec4899',
      weight: 2,
      fillColor: '#f43f5e',
      fillOpacity: 0.9,
    });
    epicenterMarker.bindPopup(`
      <div style="font-family: inherit; color: #f8fafc; font-size: 12px; line-height: 1.4;">
        <span style="color: #fb7185; font-weight: 800; text-transform: uppercase; font-size: 10px;">
          ● SATELLITE DISASTER EPICENTER
        </span>
        <strong style="display: block; font-size: 13px; margin-top: 2px;">${scenario.riverBasin}</strong>
        <div style="color: #94a3b8; font-size: 11px; margin-top: 4px;">
          Max Inundation Center • Active Coverage: <strong style="color: #38bdf8;">${scenario.areaKm2} km²</strong>
        </div>
      </div>
    `);
    epicenterMarker.addTo(aoiGroup);
  }, [scenario, showAoiOverlay]);

  // 3. Fetch Real Copernicus Data Space Acquisitions for the Selected Layer & Date
  useEffect(() => {
    let isMounted = true;
    if (!leafletMapRef.current) return;
    const swathGroup = swathLayerGroupRef.current;
    swathGroup.clearLayers();

    if (!showSwathFootprints) return;

    setIsLoadingFootprints(true);
    const collection = activeLayer.startsWith('SENTINEL_2') ? 'SENTINEL-2' : 'SENTINEL-1';

    fetch(`/api/copernicus/search?scenario=${scenario.id}&collection=${collection}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted || !leafletMapRef.current) return;
        setIsLoadingFootprints(false);
        if (!json.success || !json.data?.value) return;

        const products = json.data.value;
        const mappedAcquisitions = products.slice(0, 6).map((p: any) => {
          const rawDate = p.ContentDate?.Start || p.OriginDate || '';
          const d = rawDate ? new Date(rawDate) : new Date();
          return {
            id: p.Id,
            name: p.Name,
            date: d.toISOString().split('T')[0],
            time: d.toTimeString().split(' ')[0],
            platform: collection,
            orbitDirection: p.Attributes?.find((a: any) => a.Name === 'orbitDirection')?.Value || 'ASCENDING',
            sizeMb: p.ContentLength ? +(p.ContentLength / (1024 * 1024)).toFixed(1) : 850,
          };
        });
        setRecentAcquisitions(mappedAcquisitions);

        // Render footprints as vector swaths across the scenario
        products.slice(0, 3).forEach((prod: any, idx: number) => {
          if (!isMounted || !leafletMapRef.current) return;
          if (!prod.Footprint) return;

          try {
            const rawCoordsMatch = prod.Footprint.match(/\(\((.*?)\)\)/);
            if (!rawCoordsMatch || !rawCoordsMatch[1]) return;

            const coordPairs = rawCoordsMatch[1].split(',').map((pair: string) => {
              const [lon, lat] = pair.trim().split(/\s+/).map(Number);
              return [lat, lon] as [number, number];
            });

            if (coordPairs.length < 3) return;

            const isPrimary = idx === 0;
            const swathColor = activeLayer.startsWith('SENTINEL_2') ? '#10b981' : '#6366f1';

            const swathPolygon = L.polygon(coordPairs, {
              color: swathColor,
              weight: isPrimary ? 2.5 : 1.2,
              dashArray: isPrimary ? undefined : '4, 4',
              fillColor: swathColor,
              fillOpacity: isPrimary ? 0.15 : 0.05,
            });

            swathPolygon.bindTooltip(
              `<strong>${prod.Name}</strong><br/>` +
              `Acquisition: <strong>${new Date(prod.ContentDate?.Start).toUTCString()}</strong><br/>` +
              `Sensor: <em>${collection}</em> • Size: ~${(prod.ContentLength / 1e6).toFixed(0)} MB`,
              { sticky: true }
            );

            if (isMounted && leafletMapRef.current) {
              swathPolygon.addTo(swathGroup);
            }
          } catch (e) {
            console.warn('[Copernicus Main View] Failed to parse swath footprint geometry', e);
          }
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsLoadingFootprints(false);
        console.warn('[Copernicus Main View] Failed to fetch Copernicus swaths', err);
      });

    return () => {
      isMounted = false;
      swathGroup.clearLayers();
    };
  }, [scenario.id, activeLayer, showSwathFootprints]);

  // Recenter map
  const handleRecenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyToBounds(scenario.bounds, { duration: 0.8 });
    }
  };

  const toggleFullscreen = () => {
    const el = document.getElementById('copernicus-main-map-root');
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Build the CSS filter string according to the active satellite sensor
  const mapFilterStyle = useMemo(() => {
    const f = currentLayerMeta.filterStyle;
    return `brightness(${f.brightness}) contrast(${f.contrast}) saturate(${f.saturate}) hue-rotate(${f.hueRotate}deg) invert(${f.invert})`;
  }, [currentLayerMeta]);

  return (
    <div
      id="copernicus-main-map-root"
      className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none"
    >
      {/* MAP CONTAINER CANVAS (Just the Map, No Third-Party Web Headers/Footers) */}
      <div
        className="w-full h-full z-0 relative transition-all duration-300"
        style={{
          filter: mapFilterStyle,
          opacity: layerOpacity,
        }}
      >
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* TINT OVERLAY FOR SPECTRAL BANDS (NDWI / SAR / NIR FALSE COLOR) */}
      {currentLayerMeta.tintOverlay && (
        <div
          className="absolute inset-0 pointer-events-none z-10 transition-colors duration-300"
          style={{ backgroundColor: currentLayerMeta.tintOverlay }}
        />
      )}

      {/* TOP FLOATING COMMAND BAR: Layer Selector & Date Picker Controls */}
      <div className="absolute top-3 left-3 right-3 z-30 pointer-events-none flex items-center justify-between gap-2 flex-wrap">
        {/* Left Control Group: Layer Options & Active Sensor Pill */}
        <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap">
          {/* Layer Options Dropdown Trigger Button */}
          <div className="relative">
            <button
              id="btn-copernicus-layer-picker"
              onClick={() => {
                setShowLayerPicker(!showLayerPicker);
                setShowDatePicker(false);
              }}
              className="flex items-center gap-2 bg-slate-900/95 hover:bg-slate-800 backdrop-blur-md px-3 py-1.5 rounded-xl border border-indigo-500/50 hover:border-indigo-400 text-slate-100 shadow-xl transition active:scale-95"
              title="Select Copernicus Satellite Sensor Layer"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase font-mono text-indigo-300 font-bold leading-tight">
                  Layer
                </span>
                <span className="text-xs font-bold text-white leading-tight max-w-[170px] sm:max-w-[210px] truncate">
                  {currentLayerMeta.name.split('(')[0]}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-indigo-400 transition-transform ${showLayerPicker ? 'rotate-180' : ''}`} />
            </button>

            {/* Layer Options Popover Menu */}
            {showLayerPicker && (
              <div
                id="copernicus-layer-options-menu"
                className="absolute left-0 mt-2 w-84 sm:w-96 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl p-2.5 shadow-2xl z-40 text-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 px-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <Radio className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Copernicus Sensor Layers</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {COPERNICUS_LAYERS.length} Available
                  </span>
                </div>

                <div className="space-y-1">
                  {COPERNICUS_LAYERS.map((layer) => {
                    const isSelected = layer.id === activeLayer;
                    return (
                      <button
                        key={layer.id}
                        id={`btn-select-layer-${layer.id}`}
                        onClick={() => {
                          setActiveLayer(layer.id);
                          setShowLayerPicker(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-indigo-950/80 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                            : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-bold flex items-center gap-1.5 ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`}>
                            {layer.penetratesClouds ? (
                              <Radio className="w-3 h-3 text-cyan-400" />
                            ) : (
                              <Satellite className="w-3 h-3 text-emerald-400" />
                            )}
                            {layer.name}
                          </span>
                          <span className={`text-[9px] uppercase font-mono px-1.5 py-0.2 rounded border font-semibold shrink-0 ${layer.badgeColor}`}>
                            {layer.satellite}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                          {layer.description}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-0.5 pt-1 border-t border-slate-800/60">
                          <span>{layer.resolution}</span>
                          <span>•</span>
                          <span className={layer.penetratesClouds ? 'text-cyan-400 font-semibold' : 'text-slate-400'}>
                            {layer.dayNight}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Select Date Control Button */}
          <div className="relative">
            <button
              id="btn-copernicus-date-picker"
              onClick={() => {
                setShowDatePicker(!showDatePicker);
                setShowLayerPicker(false);
              }}
              className="flex items-center gap-2 bg-slate-900/95 hover:bg-slate-800 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-100 shadow-xl transition active:scale-95"
              title="Select Acquisition Date"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase font-mono text-slate-400 font-bold leading-tight">
                  Pass Date
                </span>
                <span className="text-xs font-mono font-bold text-cyan-300 leading-tight">
                  {selectedDate}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
            </button>

            {/* Date Picker Popover */}
            {showDatePicker && (
              <div
                id="copernicus-date-picker-menu"
                className="absolute left-0 mt-2 w-72 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl p-3 shadow-2xl z-40 text-slate-100 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Select Acquisition Date</span>
                  </div>
                </div>

                {/* Calendar HTML5 Date Input */}
                <div className="mb-3">
                  <label className="text-[10px] text-slate-400 uppercase font-mono font-bold mb-1 block">
                    Custom Calendar Date
                  </label>
                  <input
                    id="input-copernicus-date"
                    type="date"
                    value={selectedDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedDate(e.target.value);
                        setShowDatePicker(false);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 text-cyan-300 text-xs rounded-lg px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Quick Presets */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block mb-1">
                    Preset Flight Windows
                  </span>
                  {presetDates.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => {
                        setSelectedDate(preset.value);
                        setShowDatePicker(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                        selectedDate === preset.value
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{preset.label}</span>
                      <span className="font-mono text-[11px] text-slate-400">{preset.value}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Disaster Area 250 km² Indicator Chip */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 text-slate-300 shadow-md">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs font-semibold text-slate-200">{scenario.name.split('(')[0]}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              {scenario.areaKm2} km² Disaster Area
            </span>
          </div>
        </div>

        {/* Right Control Group: Navigation to CARTO/Tactical, Opacity Slider & Tools */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-xl">
          {/* Layer Opacity Slider Dropdown */}
          <div className="relative group">
            <button
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Adjust Satellite Layer Transparency"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            </button>
            <div className="absolute right-0 mt-2 hidden group-hover:flex flex-col w-48 bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-xl p-3 shadow-2xl text-xs z-40">
              <div className="flex justify-between text-slate-300 mb-1 font-mono">
                <span>Opacity:</span>
                <span className="text-cyan-400 font-bold">{Math.round(layerOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={layerOpacity}
                onChange={(e) => setLayerOpacity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
              />
              <div className="mt-2.5 pt-2 border-t border-slate-800 space-y-1.5">
                <label className="flex items-center justify-between text-[11px] text-slate-300 cursor-pointer">
                  <span>250 km² AOI Border</span>
                  <input
                    type="checkbox"
                    checked={showAoiOverlay}
                    onChange={(e) => setShowAoiOverlay(e.target.checked)}
                    className="accent-indigo-500 rounded cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between text-[11px] text-slate-300 cursor-pointer">
                  <span>Swath Footprints</span>
                  <input
                    type="checkbox"
                    checked={showSwathFootprints}
                    onChange={(e) => setShowSwathFootprints(e.target.checked)}
                    className="accent-indigo-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {onOpenModal && (
            <button
              id="btn-copernicus-telemetry-modal"
              onClick={onOpenModal}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 transition active:scale-95"
              title="Inspect Sentinel-1 & Sentinel-2 metadata catalogue"
            >
              <Satellite className="w-3 h-3 text-indigo-400" />
              <span>Catalogue</span>
            </button>
          )}

          {onOpenDetailedView && (
            <button
              id="btn-switch-to-detailed-from-copernicus"
              onClick={onOpenDetailedView}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 transition active:scale-95"
              title="Switch to Google Maps Detailed View"
            >
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Detailed View</span>
            </button>
          )}

          <div className="w-px h-4 bg-slate-700/60 mx-0.5" />

          <button
            id="btn-copernicus-recenter"
            onClick={handleRecenter}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={`Recenter map on ${scenario.areaKm2} km² bounds`}
          >
            <Target className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-copernicus-fullscreen"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* TOP-LEFT SENSOR RADAR STATUS TICKER */}
      <div className="absolute top-16 left-3 z-20 pointer-events-none flex flex-col gap-1.5">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-indigo-500/40 text-[11px] font-mono text-indigo-300 shadow-xl">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
          <span>
            {currentLayerMeta.satellite} • {currentLayerMeta.name.split('(')[0]} • {scenario.areaKm2} km² Disaster AOI
          </span>
          {isLoadingFootprints && (
            <span className="text-cyan-400 text-[10px] animate-pulse">
              (Syncing CDSE Footprints...)
            </span>
          )}
        </div>
      </div>

      {/* BOTTOM-LEFT SCIENTIFIC GIS LEGEND */}
      <div className="absolute bottom-4 left-3 z-20 max-w-sm transition-all duration-200">
        {isLegendOpen ? (
          <div className="bg-slate-950/90 hover:bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl text-xs text-slate-200">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
              <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-300">
                <Compass className="w-3 h-3 text-cyan-400" />
                <span>Copernicus Satellite Canvas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-indigo-300 font-bold bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-500/30">
                  {scenario.areaKm2} km²
                </span>
                <button
                  onClick={() => setIsLegendOpen(false)}
                  className="text-slate-400 hover:text-white text-xs px-1 hover:bg-slate-800 rounded transition"
                  title="Collapse Legend"
                >
                  ─
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="w-2.5 h-2.5 rounded bg-indigo-500/80 border border-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">{currentLayerMeta.name}</span>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    {currentLayerMeta.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                <span>Pass Date: <strong className="text-cyan-300">{selectedDate}</strong></span>
                <span>{currentLayerMeta.resolution}</span>
              </div>

              <div className="flex items-center gap-3 pt-1 text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-slate-300">Epicenter</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-1 border-t border-dashed border-indigo-400" />
                  <span className="text-slate-300">250 km² AOI</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-1 bg-emerald-500" />
                  <span className="text-slate-300">Swath Footprint</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsLegendOpen(true)}
            className="bg-slate-950/85 hover:bg-slate-900 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white shadow-lg flex items-center gap-1.5 transition"
          >
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>Satellite Legend</span>
          </button>
        )}
      </div>

      {/* BOTTOM-RIGHT QUICK ACQUISITION STRIP */}
      {recentAcquisitions.length > 0 && (
        <div className="hidden lg:flex absolute bottom-4 right-3 z-20 items-center gap-1.5 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 text-[11px] font-mono text-slate-300 shadow-xl">
          <Clock className="w-3 h-3 text-indigo-400" />
          <span className="text-slate-400">Latest Pass:</span>
          <span className="text-indigo-300 font-bold">{recentAcquisitions[0].date} {recentAcquisitions[0].time} UTC</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Direction:</span>
          <span className="text-cyan-400">{recentAcquisitions[0].orbitDirection}</span>
        </div>
      )}
    </div>
  );
};
