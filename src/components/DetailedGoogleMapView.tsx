import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Layers,
  Satellite,
  Compass,
  Navigation,
  Shield,
  Hospital,
  Flame,
  AlertTriangle,
  Key,
  ExternalLink,
  CheckCircle,
  Copy,
  Info,
  Maximize2,
  Minimize2,
  RefreshCw,
  Car,
  ChevronRight,
  Target,
  Sparkles,
  Search,
  CloudRain,
  Wind,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  DisasterScenario,
  ShelterPoint,
  RiskAnalysisResult,
  RoutePlanningResult,
  LayerVisibility,
  RadarDataResponse,
  WindDataResponse,
} from '../types';
import { fetchWeatherRadarApi, fetchWeatherWindApi } from '../services/api';
import { WeatherWindHud } from './WeatherWindHud';

interface DetailedGoogleMapViewProps {
  scenario: DisasterScenario;
  riskZones?: RiskAnalysisResult | null;
  routesResult?: RoutePlanningResult | null;
  layerVisibility?: LayerVisibility;
  onToggleLayer?: (layer: keyof LayerVisibility) => void;
  onUpdateLayerVisibility?: (updates: Partial<LayerVisibility>) => void;
  onOpenCopernicusView?: () => void;
}

// Controller component inside APIProvider that smoothly handles panTo and strictly guards max zoom
function MapCameraController({
  scenario,
  mapTypeId,
  showTraffic,
}: {
  scenario: DisasterScenario;
  mapTypeId: string;
  showTraffic: boolean;
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const [trafficLayer, setTrafficLayer] = useState<google.maps.TrafficLayer | null>(null);

  // Maximum safe zoom level: 18 for satellite/hybrid in non-metro/river basins, 19 for roadmap
  const maxAllowedZoom = mapTypeId === 'satellite' || mapTypeId === 'hybrid' ? 18 : 19;

  // Smooth camera fly / pan when scenario center or zoom changes
  useEffect(() => {
    if (!map) return;
    const target = { lat: scenario.center[0], lng: scenario.center[1] };
    const safeZoom = Math.min(scenario.zoom || 12, maxAllowedZoom);
    map.panTo(target);
    map.setZoom(safeZoom);
  }, [map, scenario.id, scenario.center, scenario.zoom, maxAllowedZoom]);

  // Handle map type and enforce strict zoom bounds to prevent "Zoom level not supported" errors
  useEffect(() => {
    if (!map) return;
    map.setMapTypeId(mapTypeId);
    map.setOptions({
      minZoom: 4,
      maxZoom: maxAllowedZoom,
    });

    // Guard against any external zoom-in action attempting to exceed imagery availability
    const listener = map.addListener('zoom_changed', () => {
      const currentZoom = map.getZoom();
      if (currentZoom !== undefined && currentZoom > maxAllowedZoom) {
        map.setZoom(maxAllowedZoom);
      }
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, mapTypeId, maxAllowedZoom]);

  // Handle live traffic layer
  useEffect(() => {
    if (!map || !mapsLib) return;

    if (showTraffic) {
      const traffic = new google.maps.TrafficLayer();
      traffic.setMap(map);
      setTrafficLayer(traffic);
      return () => {
        traffic.setMap(null);
      };
    } else {
      if (trafficLayer) {
        trafficLayer.setMap(null);
        setTrafficLayer(null);
      }
    }
  }, [map, mapsLib, showTraffic]);

  return null;
}

// Google Maps Radar Layer (Live Doppler Tiles & Disaster Convective Cells)
function GoogleMapRadarOverlay({
  visible,
  radarMode,
  radarData,
  currentFrameIndex,
  opacity,
  scenario,
}: {
  visible: boolean;
  radarMode: 'live' | 'disaster';
  radarData: RadarDataResponse | null;
  currentFrameIndex: number;
  opacity: number;
  scenario: DisasterScenario;
}) {
  const map = useMap();

  // 1. Live Doppler Radar MapType Overlay
  useEffect(() => {
    if (!map) return;

    // Clear existing radar overlayMapTypes
    map.overlayMapTypes.clear();

    if (!visible || radarMode !== 'live' || !radarData?.past?.length) {
      return;
    }

    const frame = radarData.past[currentFrameIndex] || radarData.past[radarData.past.length - 1];
    if (!frame) return;

    const radarMapType = new google.maps.ImageMapType({
      getTileUrl: (coord: google.maps.Point, zoom: number) => {
        const maxTiles = 1 << zoom;
        if (coord.y < 0 || coord.y >= maxTiles) return null;
        let x = coord.x % maxTiles;
        if (x < 0) x += maxTiles;
        return `${radarData.host}${frame.path}/256/${zoom}/${x}/${coord.y}/2/1_1.png`;
      },
      tileSize: new google.maps.Size(256, 256),
      opacity: 1.0,
      name: 'RainViewerRadar',
      maxZoom: 18,
    });

    map.overlayMapTypes.push(radarMapType);

    return () => {
      map.overlayMapTypes.clear();
    };
  }, [map, visible, radarMode, radarData, currentFrameIndex, opacity]);

  // 2. Disaster Extreme Cloudburst Convective Cell Circles (Transparent overlays that preserve map visibility)
  useEffect(() => {
    if (!map || !visible || radarMode !== 'disaster' || !scenario.epicenter) return;

    const [epiLat, epiLng] = scenario.epicenter;
    const center = { lat: epiLat, lng: epiLng };

    const circles = [
      // Outer stratiform precipitation ring (32 dBZ)
      new google.maps.Circle({
        center,
        radius: 18000,
        fillColor: '#06b6d4',
        fillOpacity: opacity * 0.22,
        strokeColor: '#22d3ee',
        strokeWeight: 1.5,
        map,
      }),
      // Intense convective band (45 dBZ)
      new google.maps.Circle({
        center,
        radius: 9500,
        fillColor: '#f59e0b',
        fillOpacity: opacity * 0.35,
        strokeColor: '#fbbf24',
        strokeWeight: 2,
        map,
      }),
      // Cloudburst core (60 dBZ)
      new google.maps.Circle({
        center,
        radius: 4500,
        fillColor: '#e11d48',
        fillOpacity: opacity * 0.5,
        strokeColor: '#f43f5e',
        strokeWeight: 2.5,
        map,
      }),
      // Upstream Feeder Cell Alpha
      new google.maps.Circle({
        center: { lat: epiLat + 0.042, lng: epiLng - 0.038 },
        radius: 3800,
        fillColor: '#ea580c',
        fillOpacity: opacity * 0.42,
        strokeColor: '#f97316',
        strokeWeight: 1.5,
        map,
      }),
      // Feeder Cell Bravo
      new google.maps.Circle({
        center: { lat: epiLat - 0.032, lng: epiLng + 0.035 },
        radius: 3200,
        fillColor: '#f97316',
        fillOpacity: opacity * 0.4,
        strokeColor: '#ea580c',
        strokeWeight: 1.5,
        map,
      }),
    ];

    return () => {
      circles.forEach((c) => c.setMap(null));
    };
  }, [map, visible, radarMode, opacity, scenario.epicenter]);

  return null;
}

export const DetailedGoogleMapView: React.FC<DetailedGoogleMapViewProps> = ({
  scenario,
  riskZones,
  routesResult,
  layerVisibility,
  onToggleLayer,
  onUpdateLayerVisibility,
  onOpenCopernicusView,
}) => {
  // Env API key with fallback to localStorage
  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const [customKey, setCustomKey] = useState<string>(() => {
    return localStorage.getItem('drishti_gmaps_custom_key') || '';
  });
  const activeKey = (customKey.trim() || envKey.trim());

  // Key manager modal state
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>(customKey || envKey);

  // Map state controls
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('hybrid');
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [showShelters, setShowShelters] = useState<boolean>(true);
  const [showEpicenter, setShowEpicenter] = useState<boolean>(true);
  const [selectedShelter, setSelectedShelter] = useState<ShelterPoint | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'shelter' | 'hospital' | 'ndrf_base'>('all');

  // Embed Mode Zoom State strictly bounded between 4 and 17 (prevents "Zoom level not supported" errors)
  const maxEmbedZoom = mapTypeId === 'satellite' || mapTypeId === 'hybrid' ? 17 : 18;
  const minEmbedZoom = 4;
  const [embedZoom, setEmbedZoom] = useState<number>(() => Math.min(scenario.zoom || 12, 16));

  useEffect(() => {
    setEmbedZoom(Math.min(scenario.zoom || 12, 16));
  }, [scenario.id, scenario.zoom]);

  // Internal layer visibility fallback if not controlled by parent
  const [localVisibility, setLocalVisibility] = useState<{
    weatherPrecipitation: boolean;
    weatherWind: boolean;
  }>({
    weatherPrecipitation: false,
    weatherWind: false,
  });

  const isRainRadarActive = layerVisibility?.weatherPrecipitation ?? localVisibility.weatherPrecipitation;
  const isWindActive = layerVisibility?.weatherWind ?? localVisibility.weatherWind;

  const handleTogglePrecipitation = () => {
    if (onToggleLayer) {
      onToggleLayer('weatherPrecipitation');
    } else {
      setLocalVisibility((prev) => ({ ...prev, weatherPrecipitation: !prev.weatherPrecipitation }));
    }
  };

  const handleToggleWind = () => {
    if (onToggleLayer) {
      onToggleLayer('weatherWind');
    } else {
      setLocalVisibility((prev) => ({ ...prev, weatherWind: !prev.weatherWind }));
    }
  };

  const handleCloseRadar = () => {
    if (onUpdateLayerVisibility) {
      onUpdateLayerVisibility({ weatherPrecipitation: false });
    } else if (onToggleLayer && isRainRadarActive) {
      onToggleLayer('weatherPrecipitation');
    } else {
      setLocalVisibility((prev) => ({ ...prev, weatherPrecipitation: false }));
    }
  };

  const handleCloseWind = () => {
    if (onUpdateLayerVisibility) {
      onUpdateLayerVisibility({ weatherWind: false });
    } else if (onToggleLayer && isWindActive) {
      onToggleLayer('weatherWind');
    } else {
      setLocalVisibility((prev) => ({ ...prev, weatherWind: false }));
    }
  };

  // Weather Radar state
  const [radarMode, setRadarMode] = useState<'live' | 'disaster'>('live');
  const [radarData, setRadarData] = useState<RadarDataResponse | null>(null);
  const [radarFrameIdx, setRadarFrameIdx] = useState<number>(0);
  const [isRadarPlaying, setIsRadarPlaying] = useState<boolean>(false);
  const [radarOpacity, setRadarOpacity] = useState<number>(1.0);

  // Weather Wind state
  const [windData, setWindData] = useState<WindDataResponse | null>(null);
  const [windMode, setWindMode] = useState<'streamlines' | 'vectors' | 'both'>('streamlines');
  const [selectedWindNode, setSelectedWindNode] = useState<{
    lat: number;
    lng: number;
    speed: number;
    dir: number;
    row: number;
    col: number;
  } | null>(null);

  // Canvas ref for animated streamlines
  const windCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const windAnimIdRef = useRef<number | null>(null);

  // 1. Fetch Doppler Radar Catalog when active
  useEffect(() => {
    let isMounted = true;
    if (!isRainRadarActive) return;

    fetchWeatherRadarApi()
      .then((data) => {
        if (!isMounted) return;
        setRadarData(data as any);
        if (data.past && data.past.length > 0) {
          setRadarFrameIdx(data.past.length - 1);
        }
      })
      .catch((err) => {
        console.warn('Radar fetch notice:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isRainRadarActive]);

  // 2. Radar Playback Loop (850ms cycle)
  useEffect(() => {
    if (!isRadarPlaying || !radarData?.past?.length || radarMode !== 'live') {
      return;
    }
    const interval = setInterval(() => {
      setRadarFrameIdx((prev) => (prev + 1) % radarData.past.length);
    }, 850);
    return () => clearInterval(interval);
  }, [isRadarPlaying, radarData, radarMode]);

  // 3. Fetch Wind Telemetry when active
  useEffect(() => {
    let isMounted = true;
    if (!isWindActive) return;

    const [lat, lon] = scenario.center;
    fetchWeatherWindApi(scenario.id, lat, lon)
      .then((data) => {
        if (!isMounted) return;
        setWindData(data);
      })
      .catch((err) => {
        console.warn('Wind fetch notice:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isWindActive, scenario.id, scenario.center]);

  // 4. Animated Wind Particle Streamlines Canvas (CRITICAL: 100% transparent background so map is always visible)
  useEffect(() => {
    const canvas = windCanvasRef.current;
    if (!canvas || !isWindActive || !windData) {
      if (windAnimIdRef.current) {
        cancelAnimationFrame(windAnimIdRef.current);
        windAnimIdRef.current = null;
      }
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    if (windMode !== 'streamlines' && windMode !== 'both') {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (windAnimIdRef.current) {
        cancelAnimationFrame(windAnimIdRef.current);
        windAnimIdRef.current = null;
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const speedKmh = windData.windSpeedKmh;
    const dirDeg = windData.windDirectionDeg;

    // Velocity vector (wind blowing towards dirDeg + 180)
    const rad = ((dirDeg + 180) % 360) * (Math.PI / 180);
    const speedFactor = Math.max(1.0, Math.min(5.0, speedKmh / 16));
    const vx = Math.sin(rad) * speedFactor;
    const vy = -Math.cos(rad) * speedFactor;

    const strokeColor =
      speedKmh >= 65
        ? 'rgba(244, 63, 94, 0.9)'
        : speedKmh >= 40
        ? 'rgba(251, 191, 36, 0.9)'
        : speedKmh >= 20
        ? 'rgba(52, 211, 153, 0.9)'
        : 'rgba(56, 189, 248, 0.9)';

    const particleCount = 140;
    interface WindParticle {
      x: number;
      y: number;
      trail: Array<{ x: number; y: number }>;
      age: number;
      maxAge: number;
      speedVar: number;
    }

    const particles: WindParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      particles.push({
        x,
        y,
        trail: [{ x, y }],
        age: Math.floor(Math.random() * 80),
        maxAge: 40 + Math.floor(Math.random() * 60),
        speedVar: 0.8 + Math.random() * 0.4,
      });
    }

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      // CRITICAL FIX: Clear canvas to 100% transparent on EVERY frame.
      // NEVER use fillRect with dark colors here, otherwise alpha accumulates and completely hides the map!
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.strokeStyle = strokeColor;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 7) {
          p.trail.shift();
        }

        p.x += vx * p.speedVar;
        p.y += vy * p.speedVar;
        p.age++;

        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let j = 1; j < p.trail.length; j++) {
            ctx.lineTo(p.trail[j].x, p.trail[j].y);
          }
          ctx.stroke();
        }

        if (
          p.age >= p.maxAge ||
          p.x < -20 ||
          p.x > canvas.width + 20 ||
          p.y < -20 ||
          p.y > canvas.height + 20
        ) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.trail = [{ x: p.x, y: p.y }];
          p.age = 0;
          p.maxAge = 40 + Math.floor(Math.random() * 60);
        }
      }

      windAnimIdRef.current = requestAnimationFrame(render);
    };

    windAnimIdRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', resizeCanvas);
      if (windAnimIdRef.current) {
        cancelAnimationFrame(windAnimIdRef.current);
      }
      if (canvas) {
        const c = canvas.getContext('2d');
        if (c) c.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [isWindActive, windData, windMode]);

  // 5. Tactical Wind Vector Grid for Google Maps Markers
  const windVectorNodes = useMemo(() => {
    if (!isWindActive || !windData || (windMode !== 'vectors' && windMode !== 'both')) {
      return [];
    }
    const [[s, w], [n, e]] = scenario.bounds;
    const latSpan = n - s;
    const lngSpan = e - w;
    const rows = 4;
    const cols = 4;
    const speed = windData.windSpeedKmh;
    const baseDir = windData.windDirectionDeg;

    const nodes = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lat = s + (latSpan * (r + 0.5)) / rows;
        const lng = w + (lngSpan * (c + 0.5)) / cols;
        const seed = (r * 11 + c * 17) % 10;
        const localDir = (baseDir + (seed - 5) * 1.5 + 360) % 360;
        const localSpeed = Math.max(5, speed + (seed - 5) * 1.2);

        const strokeColor =
          localSpeed >= 65 ? '#f43f5e' : localSpeed >= 40 ? '#fbbf24' : localSpeed >= 20 ? '#34d399' : '#38bdf8';
        const bgColor =
          localSpeed >= 65
            ? 'rgba(244, 63, 94, 0.25)'
            : localSpeed >= 40
            ? 'rgba(251, 191, 36, 0.25)'
            : 'rgba(56, 189, 248, 0.25)';

        nodes.push({
          id: `wind-node-${r}-${c}`,
          lat,
          lng,
          speed: localSpeed,
          dir: localDir,
          strokeColor,
          bgColor,
          row: r + 1,
          col: c + 1,
        });
      }
    }
    return nodes;
  }, [isWindActive, windData, windMode, scenario.bounds]);

  // Filtered shelters
  const filteredShelters = useMemo(() => {
    if (!scenario.shelters) return [];
    if (selectedFilter === 'all') return scenario.shelters;
    return scenario.shelters.filter((s) => s.type === selectedFilter);
  }, [scenario.shelters, selectedFilter]);

  const handleSaveKey = (keyVal: string) => {
    const trimmed = keyVal.trim();
    localStorage.setItem('drishti_gmaps_custom_key', trimmed);
    setCustomKey(trimmed);
    setShowKeyModal(false);
  };

  const handleFullscreenToggle = () => {
    const rootEl = document.getElementById('detailed-gmap-container');
    if (!document.fullscreenElement) {
      rootEl?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      id="detailed-gmap-container"
      className="relative w-full h-full flex flex-col bg-slate-950 overflow-hidden select-none"
    >
      {/* Top Quick Bar: Map Mode Pill, Map Types, Layer Toggles, Radar/Wind buttons, Recenter */}
      <div className="absolute top-3 left-3 right-3 z-30 pointer-events-none flex items-center justify-between gap-2 flex-wrap">
        {/* Left: Location details, Map Types, Traffic, Radar, Wind, Shelter filter */}
        <div className="pointer-events-auto flex items-center gap-1.5 flex-wrap bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-2xl">
          {/* City & Basin badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-xs">{scenario.name}</span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              ({scenario.riverBasin})
            </span>
          </div>

          {/* Map Type Buttons */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            {(
              [
                { id: 'hybrid', label: 'Hybrid' },
                { id: 'roadmap', label: 'Roadmap' },
                { id: 'satellite', label: 'Satellite' },
                { id: 'terrain', label: 'Terrain' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setMapTypeId(t.id)}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition ${
                  mapTypeId === t.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Traffic Toggle */}
          <button
            onClick={() => setShowTraffic((prev) => !prev)}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg border transition ${
              showTraffic
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Live Traffic Flow"
          >
            <Car className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Traffic</span>
          </button>

          {/* Rain Radar Toggle */}
          <button
            onClick={handleTogglePrecipitation}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg border transition ${
              isRainRadarActive
                ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400 font-bold shadow-sm shadow-cyan-500/20'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Live Precipitation Doppler Radar"
          >
            <CloudRain className={`w-3.5 h-3.5 ${isRainRadarActive ? 'text-cyan-300 animate-pulse' : 'text-slate-400'}`} />
            <span>Rain Radar</span>
            {isRainRadarActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping hidden sm:inline-block" />
            )}
          </button>

          {/* Wind Telemetry Toggle */}
          <button
            onClick={handleToggleWind}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-lg border transition ${
              isWindActive
                ? 'bg-purple-500/25 text-purple-200 border-purple-400 font-bold shadow-sm shadow-purple-500/20'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Tactical Wind Streamlines & Vectors"
          >
            <Wind className={`w-3.5 h-3.5 ${isWindActive ? 'text-purple-300 animate-pulse' : 'text-slate-400'}`} />
            <span>Wind</span>
            {isWindActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping hidden sm:inline-block" />
            )}
          </button>

          {/* Shelter Filter Buttons */}
          <div className="hidden xl:flex items-center gap-1 pl-1 border-l border-slate-800 text-[11px]">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-1.5 py-0.5 rounded ${selectedFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All ({scenario.shelters?.length || 0})
            </button>
            <button
              onClick={() => setSelectedFilter('shelter')}
              className={`px-1.5 py-0.5 rounded ${selectedFilter === 'shelter' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Shelters
            </button>
            <button
              onClick={() => setSelectedFilter('hospital')}
              className={`px-1.5 py-0.5 rounded ${selectedFilter === 'hospital' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Hospitals
            </button>
          </div>
        </div>

        {/* Right: API Key Config, Zoom Level & Fullscreen */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-2xl">
          {/* Key status button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
              activeKey
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/80'
                : 'bg-amber-950/90 text-amber-300 border-amber-500/60 hover:bg-amber-900 animate-pulse'
            }`}
            title={activeKey ? 'Google Maps API Key Active (Click to update)' : 'Click to configure VITE_GOOGLE_MAPS_API_KEY'}
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {activeKey ? 'Maps Key Active' : 'Configure Maps Key'}
            </span>
          </button>

          {/* Fullscreen button */}
          <button
            onClick={handleFullscreenToggle}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div id="detailed-gmap-canvas" className="w-full h-full relative z-0 flex-1">
        {/* Animated Wind Particle Streamline Canvas (100% transparent overlay that NEVER blocks the map) */}
        <canvas
          ref={windCanvasRef}
          className="absolute inset-0 pointer-events-none z-10 w-full h-full"
        />

        {activeKey ? (
          /* Full Interactive Google Maps Platform with @vis.gl/react-google-maps */
          <APIProvider apiKey={activeKey}>
            <Map
              id="main-detailed-gmap"
              defaultCenter={{ lat: scenario.center[0], lng: scenario.center[1] }}
              defaultZoom={Math.min(scenario.zoom || 12, 17)}
              minZoom={4}
              maxZoom={mapTypeId === 'satellite' || mapTypeId === 'hybrid' ? 18 : 19}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              gestureHandling="greedy"
              disableDefaultUI={false}
              fullscreenControl={false}
              streetViewControl={true}
              mapTypeControl={false}
              zoomControl={true}
              style={{ width: '100%', height: '100%' }}
              className="w-full h-full"
            >
              {/* Dynamic Camera Pan Controller with Zoom Guard */}
              <MapCameraController
                scenario={scenario}
                mapTypeId={mapTypeId}
                showTraffic={showTraffic}
              />

              {/* Rain Radar Doppler Tiles & Disaster Storm Cells */}
              <GoogleMapRadarOverlay
                visible={isRainRadarActive}
                radarMode={radarMode}
                radarData={radarData}
                currentFrameIndex={radarFrameIdx}
                opacity={radarOpacity}
                scenario={scenario}
              />

              {/* Epicenter Pulse Marker */}
              {showEpicenter && scenario.epicenter && (
                <AdvancedMarker
                  position={{ lat: scenario.epicenter[0], lng: scenario.epicenter[1] }}
                  title={`${scenario.name} Disaster Epicenter`}
                >
                  <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
                    <span className="absolute animate-ping h-8 w-8 rounded-full bg-rose-500 opacity-60"></span>
                    <div className="relative flex items-center justify-center h-7 w-7 rounded-full bg-rose-600 border-2 border-white shadow-lg text-white">
                      <Flame className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                </AdvancedMarker>
              )}

              {/* Evacuation Shelters & Emergency Points */}
              {showShelters &&
                filteredShelters.map((point) => {
                  const isSelected = selectedShelter?.id === point.id;
                  const isHospital = point.type === 'hospital';
                  const isNdrf = point.type === 'ndrf_base';

                  const pinBg = isHospital ? '#ef4444' : isNdrf ? '#3b82f6' : '#10b981';
                  const pinBorder = '#ffffff';

                  return (
                    <AdvancedMarker
                      key={point.id}
                      position={{ lat: point.coordinates[0], lng: point.coordinates[1] }}
                      onClick={() => setSelectedShelter(point)}
                      title={point.name}
                    >
                      <Pin
                        background={pinBg}
                        borderColor={pinBorder}
                        glyphColor="#ffffff"
                        scale={isSelected ? 1.3 : 1.0}
                      />
                    </AdvancedMarker>
                  );
                })}

              {/* Tactical Wind Vector Markers (4x4 Grid across Disaster AOI) */}
              {isWindActive &&
                (windMode === 'vectors' || windMode === 'both') &&
                windVectorNodes.map((node) => (
                  <AdvancedMarker
                    key={node.id}
                    position={{ lat: node.lat, lng: node.lng }}
                    onClick={() => setSelectedWindNode(node)}
                    title={`Wind: ${node.speed.toFixed(1)} km/h @ ${node.dir.toFixed(0)}°`}
                  >
                    <div className="flex flex-col items-center cursor-pointer pointer-events-auto group -translate-x-1/2 -translate-y-1/2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center border transition transform group-hover:scale-110 shadow-lg"
                        style={{
                          backgroundColor: node.bgColor,
                          borderColor: node.strokeColor,
                          boxShadow: `0 0 10px ${node.strokeColor}66`,
                        }}
                      >
                        <div
                          style={{ transform: `rotate(${node.dir}deg)` }}
                          className="flex flex-col items-center justify-center"
                        >
                          <div
                            style={{
                              width: 0,
                              height: 0,
                              borderLeft: '4px solid transparent',
                              borderRight: '4px solid transparent',
                              borderBottom: `10px solid ${node.strokeColor}`,
                            }}
                          />
                          <div
                            style={{
                              width: '2px',
                              height: '4px',
                              backgroundColor: node.strokeColor,
                            }}
                          />
                        </div>
                      </div>
                      <div
                        className="mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white shadow"
                        style={{
                          backgroundColor: 'rgba(2, 6, 23, 0.92)',
                          border: `1px solid ${node.strokeColor}88`,
                        }}
                      >
                        {node.speed.toFixed(0)} km/h
                      </div>
                    </div>
                  </AdvancedMarker>
                ))}

              {/* Selected Wind Node InfoWindow */}
              {selectedWindNode && (
                <InfoWindow
                  position={{ lat: selectedWindNode.lat, lng: selectedWindNode.lng }}
                  onCloseClick={() => setSelectedWindNode(null)}
                >
                  <div className="p-1 min-w-[210px] text-slate-900 font-sans">
                    <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-slate-200">
                      <Wind className="w-4 h-4 text-purple-600" />
                      <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900">
                        Wind Telemetry Node ({selectedWindNode.row}, {selectedWindNode.col})
                      </h4>
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-1">
                      <div className="flex justify-between border-b pb-0.5">
                        <span>Velocity:</span>
                        <span className="font-bold text-slate-900">
                          {selectedWindNode.speed.toFixed(1)} km/h
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-0.5">
                        <span>Knots:</span>
                        <span className="font-bold">{(selectedWindNode.speed / 1.852).toFixed(1)} kt</span>
                      </div>
                      <div className="flex justify-between border-b pb-0.5">
                        <span>Heading:</span>
                        <span className="font-bold">{selectedWindNode.dir.toFixed(0)}° (True Direction)</span>
                      </div>
                      <div className="flex justify-between border-b pb-0.5">
                        <span>Peak Gusts:</span>
                        <span className="font-bold text-amber-600">
                          {(selectedWindNode.speed * 1.38).toFixed(1)} km/h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Beaufort Scale:</span>
                        <span className="font-bold text-purple-700">
                          Force {windData?.beaufortScale || 5} ({windData?.beaufortDescription || 'Moderate'})
                        </span>
                      </div>
                    </div>
                  </div>
                </InfoWindow>
              )}

              {/* Selected Shelter InfoWindow */}
              {selectedShelter && (
                <InfoWindow
                  position={{
                    lat: selectedShelter.coordinates[0],
                    lng: selectedShelter.coordinates[1],
                  }}
                  onCloseClick={() => setSelectedShelter(null)}
                >
                  <div className="p-1 min-w-[220px] max-w-[280px] text-slate-900 font-sans">
                    <div className="flex items-center gap-1.5 mb-1">
                      {selectedShelter.type === 'hospital' ? (
                        <Hospital className="w-4 h-4 text-rose-600" />
                      ) : (
                        <Shield className="w-4 h-4 text-emerald-600" />
                      )}
                      <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900">
                        {selectedShelter.name}
                      </h4>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-1 mb-2">
                      <div className="flex justify-between border-b pb-0.5">
                        <span>Type:</span>
                        <span className="font-semibold capitalize">{selectedShelter.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between border-b pb-0.5">
                        <span>Occupancy:</span>
                        <span className="font-semibold">
                          {selectedShelter.currentOccupancy} / {selectedShelter.capacity}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-0.5">
                        <span>Medical Staff:</span>
                        <span className="font-semibold">{selectedShelter.medicalStaff} on duty</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Flood Safe:</span>
                        <span className={`font-semibold ${selectedShelter.floodSafe ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {selectedShelter.floodSafe ? 'Verified Safe Elevation' : 'In Flood Zone'}
                        </span>
                      </div>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedShelter.coordinates[0]},${selectedShelter.coordinates[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center py-1 px-2 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition shadow-sm"
                    >
                      Open in Google Maps App
                    </a>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          /* Live Interactive Embedded Google Map with Controlled Safe Zoom to prevent "Zoom level not supported" errors */
          <div className="w-full h-full relative flex flex-col bg-slate-950">
            {/* Embedded Google Map iframe with zoom clamped strictly to max safe imagery level */}
            <iframe
              title={`Google Map - ${scenario.name}`}
              className="w-full h-full border-0 absolute inset-0 z-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${scenario.center[0]},${scenario.center[1]}&t=${
                mapTypeId === 'satellite' || mapTypeId === 'hybrid' ? 'k' : 'm'
              }&z=${Math.min(embedZoom, maxEmbedZoom)}&output=embed`}
            />

            {/* Simulated Radar Convective Cell Overlay on Embed Mode when Rain Radar is active (Non-blocking transparent) */}
            {isRainRadarActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 overflow-hidden">
                <div className="relative flex items-center justify-center">
                  <div
                    className="absolute rounded-full border-2 border-cyan-400/60 animate-ping"
                    style={{ width: '260px', height: '260px', opacity: radarOpacity * 0.35 }}
                  />
                  <div
                    className="absolute rounded-full bg-cyan-500/15 border border-cyan-400/40"
                    style={{ width: '220px', height: '220px', opacity: radarOpacity }}
                  />
                  <div
                    className="absolute rounded-full bg-amber-500/20 border border-amber-400/50"
                    style={{ width: '130px', height: '130px', opacity: radarOpacity }}
                  />
                  <div
                    className="absolute rounded-full bg-rose-500/30 border border-rose-400 animate-pulse"
                    style={{ width: '60px', height: '60px', opacity: radarOpacity }}
                  />
                  <div className="relative px-2 py-1 bg-slate-950/85 backdrop-blur-sm border border-cyan-400/70 rounded-md text-[10px] font-mono text-cyan-300 font-bold shadow-xl">
                    🌧️ Doppler Radar Active ({radarMode === 'live' ? 'Composite' : '58 dBZ Cell'})
                  </div>
                </div>
              </div>
            )}

            {/* Controlled Zoom Widget for Embed Mode (Prevents zooming past satellite limits) */}
            <div className="absolute top-16 right-4 z-20 flex flex-col items-center bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl p-1 gap-1">
              <button
                onClick={() => setEmbedZoom((prev) => Math.min(maxEmbedZoom, prev + 1))}
                disabled={embedZoom >= maxEmbedZoom}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:hover:bg-slate-800 transition text-sm font-bold shadow"
                title={embedZoom >= maxEmbedZoom ? 'Maximum safe satellite resolution (17x)' : 'Zoom in'}
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <div
                className="text-[10px] font-mono px-1 py-0.5 rounded font-bold text-center text-cyan-300"
                title="Zoom level (capped at max resolution to prevent 'Zoom not supported' error)"
              >
                {embedZoom}x
              </div>
              <button
                onClick={() => setEmbedZoom((prev) => Math.max(minEmbedZoom, prev - 1))}
                disabled={embedZoom <= minEmbedZoom}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:hover:bg-slate-800 transition text-sm font-bold shadow"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Non-blocking API Key Setup Notification Badge at bottom-left */}
            <div className="absolute bottom-6 left-6 z-20 max-w-md bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-amber-500/50 shadow-2xl text-slate-200">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                  <Key className="w-5 h-5" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-100 text-sm">
                      Google Maps Detailed View Active
                    </h5>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      Embed Mode
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    Panning is synced with <strong>{scenario.name}</strong>. Zoom is protected up to {maxEmbedZoom}x safe resolution. Add your{' '}
                    <code className="text-amber-300 font-mono text-[11px]">VITE_GOOGLE_MAPS_API_KEY</code>{' '}
                    to enable direct vector overlays, Advanced Markers, and native Web Mercator tile layers.
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      onClick={() => setShowKeyModal(true)}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold rounded-lg transition active:scale-95 shadow-md flex items-center gap-1"
                    >
                      <Key className="w-3 h-3" />
                      <span>Configure API Key</span>
                    </button>
                    <a
                      href="https://console.cloud.google.com/google/maps-apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition flex items-center gap-1 text-[11px]"
                    >
                      <span>Get Free Key</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Tactical Wind Telemetry HUD */}
      {isWindActive && (
        <WeatherWindHud
          windData={windData}
          windMode={windMode}
          onChangeWindMode={setWindMode}
          onClose={handleCloseWind}
        />
      )}

      {/* Floating Scenario Telemetry Card (Bottom-Right) */}
      <div className="absolute bottom-6 right-6 z-20 hidden md:block bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 shadow-2xl text-xs max-w-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tactical Coordinates</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold">
            {scenario.state}
          </span>
        </div>
        <div className="space-y-1 text-slate-400 font-mono text-[11px]">
          <div className="flex justify-between">
            <span>Center Lat/Lng:</span>
            <span className="text-slate-200">
              {scenario.center[0].toFixed(3)}°N, {scenario.center[1].toFixed(3)}°E
            </span>
          </div>
          <div className="flex justify-between">
            <span>24h Rainfall:</span>
            <span className="text-emerald-400 font-bold">{scenario.rainfall24hMm} mm</span>
          </div>
          <div className="flex justify-between">
            <span>Disaster Extent:</span>
            <span className="text-rose-400 font-bold">{scenario.areaKm2} km²</span>
          </div>
          <div className="flex justify-between">
            <span>Shelter Points:</span>
            <span className="text-cyan-300 font-bold">{scenario.shelters?.length || 0} locations</span>
          </div>
          {isWindActive && windData && (
            <div className="flex justify-between border-t border-slate-800/80 pt-1 text-purple-300">
              <span>Wind:</span>
              <span className="font-bold">{windData.windSpeedKmh.toFixed(0)} km/h ({windData.windDirectionDeg}°)</span>
            </div>
          )}
        </div>
      </div>

      {/* API Key Modal & Guide */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Google Maps API Key Setup</h3>
                  <p className="text-xs text-slate-400">Enable Google Maps JavaScript API for Detailed View</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Step-by-step instructions */}
            <div className="space-y-3 mb-5 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  How to get your free VITE_GOOGLE_MAPS_API_KEY:
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300 leading-relaxed">
                  <li>
                    Visit{' '}
                    <a
                      href="https://console.cloud.google.com/google/maps-apis/credentials"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 underline hover:text-cyan-300 font-semibold"
                    >
                      Google Cloud Console &gt; Credentials
                    </a>
                  </li>
                  <li>
                    Click <strong>Create Credentials &gt; API Key</strong>.
                  </li>
                  <li>
                    Go to <strong>APIs &amp; Services &gt; Library</strong>, search for{' '}
                    <strong>"Maps JavaScript API"</strong>, and click <strong>Enable</strong>.
                  </li>
                  <li>
                    Paste your API key in the box below or add it to your project environment as{' '}
                    <code className="text-emerald-400 font-mono">VITE_GOOGLE_MAPS_API_KEY</code>.
                  </li>
                </ol>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter Google Maps API Key (Starts with <code className="text-amber-400">AIzaSy...</code>):
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleSaveKey(keyInput)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md"
                  >
                    Save &amp; Apply
                  </button>
                </div>
              </div>

              {customKey && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Key saved in local session
                  </span>
                  <button
                    onClick={() => handleSaveKey('')}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Clear custom key
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
