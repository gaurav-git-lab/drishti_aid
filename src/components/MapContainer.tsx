import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  DisasterScenario,
  ChangeDetectionResult,
  RiskAnalysisResult,
  RoutePlanningResult,
  LayerVisibility,
  SelectedFeature,
  ShelterPoint,
  BasemapStyle,
  MapFocusMode,
} from '../types';
import {
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  Info,
  ShieldAlert,
  Hospital,
  Building,
  Navigation,
  CheckCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Satellite,
  Mountain,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Target,
  SplitSquareVertical,
  Activity,
  AlertTriangle,
  Waves,
  CloudRain,
  Wind,
} from 'lucide-react';
import { fetchWeatherRadarApi, fetchWeatherWindApi } from '../services/api';
import { RadarDataResponse, WindDataResponse } from '../types';
import { WeatherWindHud } from './WeatherWindHud';

interface MapContainerProps {
  scenario: DisasterScenario;
  changeDetection: ChangeDetectionResult | null;
  riskZones: RiskAnalysisResult | null;
  routesResult: RoutePlanningResult | null;
  layerVisibility: LayerVisibility;
  onSelectFeature: (feature: SelectedFeature) => void;
  selectedFeature: SelectedFeature;
  isPostEventSimulated: boolean;
  timelineHour: number;
  onUpdateLayerVisibility?: (updated: Partial<LayerVisibility>) => void;
  onOpenCopernicusView?: () => void;
}

// Custom High-DPI Markers for Shelters, Hospitals, Helipads, NDRF bases
function createCustomIcon(type: string, name: string, isSafe: boolean, occupancyPct: number) {
  let bgColor = '#0284c7';
  let badgeLabel = 'SHELTER';
  let iconSvg = '';

  if (type === 'hospital') {
    bgColor = '#e11d48'; // Rose red
    badgeLabel = 'HOSPITAL';
    iconSvg = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>`;
  } else if (type === 'helipad') {
    bgColor = '#d97706'; // Amber
    badgeLabel = 'HELIPAD';
    iconSvg = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 7v10"></path>
        <path d="M8 12h8"></path>
      </svg>`;
  } else if (type === 'ndrf_base') {
    bgColor = '#7c3aed'; // Purple
    badgeLabel = 'NDRF';
    iconSvg = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>`;
  } else {
    bgColor = '#059669'; // Emerald green
    badgeLabel = 'CAMP';
    iconSvg = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      </svg>`;
  }

  const borderRing = isSafe
    ? 'border: 2px solid #34d399; box-shadow: 0 0 14px rgba(52, 211, 153, 0.7);'
    : 'border: 2px solid #f87171; box-shadow: 0 0 14px rgba(248, 113, 113, 0.8);';

  const html = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 32px; height: 32px; border-radius: 50%; background-color: ${bgColor}; display: flex; align-items: center; justify-content: center; ${borderRing} cursor: pointer; transition: transform 0.15s ease;">
        ${iconSvg}
      </div>
      <div style="position: absolute; -top: 6px; font-size: 8px; font-weight: 800; font-family: monospace; background: #0f172a; color: #f8fafc; padding: 1px 4px; border-radius: 4px; border: 1px solid ${isSafe ? '#34d399' : '#f87171'}; white-space: nowrap; top: -7px;">
        ${occupancyPct}%
      </div>
      ${!isSafe ? '<div style="position: absolute; bottom: -2px; right: -2px; width: 10px; height: 10px; background: #ef4444; border: 1.5px solid white; border-radius: 50%;"></div>' : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-pin',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

// Centroid Risk Badge Icon for Zones
function createRiskCentroidIcon(name: string, score: number, category: string) {
  let color = '#22c55e';
  let border = '#16a34a';
  if (category === 'Critical') {
    color = '#ef4444';
    border = '#b91c1c';
  } else if (category === 'High') {
    color = '#f97316';
    border = '#c2410c';
  } else if (category === 'Medium') {
    color = '#eab308';
    border = '#a16207';
  }

  const html = `
    <div style="background: rgba(15, 23, 42, 0.9); border: 1.5px solid ${color}; border-radius: 6px; padding: 2px 6px; font-family: monospace; font-size: 10px; font-weight: bold; color: #f8fafc; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.5); pointer-events: none; display: flex; items-center; gap: 4px;">
      <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${color}; align-self: center;"></span>
      <span>${name}: ${score}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'risk-centroid-badge',
    iconSize: [100, 20],
    iconAnchor: [50, 10],
  });
}

// Epicenter Pulsing Radar Target
function createEpicenterIcon() {
  const html = `
    <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(239, 68, 68, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; border: 1.5px dashed rgba(255, 255, 255, 0.7); animation: spin 8s linear infinite;"></div>
      <div style="width: 22px; height: 22px; border-radius: 50%; background: #dc2626; border: 2.5px solid #ffffff; box-shadow: 0 0 20px rgba(239, 68, 68, 1); display: flex; align-items: center; justify-content: center;">
        <div style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></div>
      </div>
    </div>
  `;
  return L.divIcon({
    html,
    className: 'epicenter-pin',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

export const MapContainer: React.FC<MapContainerProps> = ({
  scenario,
  changeDetection,
  riskZones,
  routesResult,
  layerVisibility,
  onSelectFeature,
  selectedFeature,
  isPostEventSimulated,
  timelineHour,
  onUpdateLayerVisibility,
  onOpenCopernicusView,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);

  // Basemap Tile Layers
  const tileLayersRef = useRef<{ [key in BasemapStyle]?: L.TileLayer }>({});
  const activeBasemapRef = useRef<BasemapStyle>('dark');

    // Layer groups refs
    const floodLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
    const riskLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
    const riskLabelGroupRef = useRef<L.LayerGroup>(L.layerGroup());
    const routeLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
    const shelterLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
    const weatherPrecipLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
    const weatherWindLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
    const copernicusSentinelGroupRef = useRef<L.LayerGroup>(L.layerGroup());

    // Interactive UI States
    const [currentBasemap, setCurrentBasemap] = useState<BasemapStyle>(
      layerVisibility.basemapStyle || (layerVisibility.satelliteBase ? 'satellite' : 'dark')
    );
  const [focusMode, setFocusMode] = useState<MapFocusMode>('all');
  const [floodOpacity, setFloodOpacity] = useState<number>(layerVisibility.floodOpacity ?? 0.5);
  const [riskOpacity, setRiskOpacity] = useState<number>(layerVisibility.riskOpacity ?? 0.35);
  const [showLabels, setShowLabels] = useState<boolean>(layerVisibility.showRiskLabels ?? true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSwipeMode, setIsSwipeMode] = useState<boolean>(false);
  const [swipeSplit, setSwipeSplit] = useState<number>(50); // percentage 0 - 100

  // Weather Radar & Wind States
  const [radarData, setRadarData] = useState<RadarDataResponse | null>(null);
  const [radarFrameIdx, setRadarFrameIdx] = useState<number>(0);
  const [isRadarPlaying, setIsRadarPlaying] = useState<boolean>(false);
  const [radarOpacity, setRadarOpacity] = useState<number>(1.0);

  const [windData, setWindData] = useState<WindDataResponse | null>(null);
  const [windMode, setWindMode] = useState<'streamlines' | 'vectors' | 'both'>('both');
  const windCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const windAnimIdRef = useRef<number | null>(null);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapElementRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(mapElementRef.current, {
      center: scenario.center,
      zoom: scenario.zoom,
      minZoom: 5,
      maxZoom: 19,
      zoomControl: false, // We use custom crisp high-contrast controls
    });

    // 1. Create custom panes FIRST before adding ANY layers
    if (!map.getPane('weatherPane')) {
      const weatherPane = map.createPane('weatherPane');
      weatherPane.style.zIndex = '500';
      weatherPane.style.pointerEvents = 'none';
    }

    // Basemap definitions
    const darkTile = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; CARTO &copy; OpenStreetMap',
        maxZoom: 19,
        subdomains: 'abcd',
      }
    );

    const lightTile = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; CARTO &copy; OpenStreetMap',
        maxZoom: 19,
        subdomains: 'abcd',
      }
    );

    const satelliteTile = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri, Earthstar Geographics',
        maxZoom: 19,
      }
    );

    const terrainTile = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }
    );

    tileLayersRef.current = {
      dark: darkTile,
      light: lightTile,
      satellite: satelliteTile,
      terrain: terrainTile,
    };

    // Add active basemap
    const activeTile = tileLayersRef.current[currentBasemap] || darkTile;
    activeTile.addTo(map);
    activeBasemapRef.current = currentBasemap;

    // Clear stale layers from refs before attaching to map
    copernicusSentinelGroupRef.current.clearLayers();
    floodLayerGroupRef.current.clearLayers();
    riskLayerGroupRef.current.clearLayers();
    riskLabelGroupRef.current.clearLayers();
    routeLayerGroupRef.current.clearLayers();
    shelterLayerGroupRef.current.clearLayers();
    weatherPrecipLayerGroupRef.current.clearLayers();
    weatherWindLayerGroupRef.current.clearLayers();

    // Attach Layer Groups in logical order
    copernicusSentinelGroupRef.current.addTo(map);
    floodLayerGroupRef.current.addTo(map);
    riskLayerGroupRef.current.addTo(map);
    riskLabelGroupRef.current.addTo(map);
    routeLayerGroupRef.current.addTo(map);
    shelterLayerGroupRef.current.addTo(map);
    weatherPrecipLayerGroupRef.current.addTo(map);
    weatherWindLayerGroupRef.current.addTo(map);

    mapRef.current = map;

    return () => {
      try {
        copernicusSentinelGroupRef.current.clearLayers();
        floodLayerGroupRef.current.clearLayers();
        riskLayerGroupRef.current.clearLayers();
        riskLabelGroupRef.current.clearLayers();
        routeLayerGroupRef.current.clearLayers();
        shelterLayerGroupRef.current.clearLayers();
        weatherPrecipLayerGroupRef.current.clearLayers();
        weatherWindLayerGroupRef.current.clearLayers();
      } catch (e) {
        // Safe ignore
      }
      map.remove();
      mapRef.current = null;
    };
  }, [scenario.id]);

  // Handle Basemap Switch
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const tiles = tileLayersRef.current;

    Object.keys(tiles).forEach((key) => {
      const t = tiles[key as BasemapStyle];
      if (t && map.hasLayer(t)) {
        map.removeLayer(t);
      }
    });

    const targetTile = tiles[currentBasemap];
    if (targetTile) {
      targetTile.addTo(map);
      targetTile.bringToBack();
      activeBasemapRef.current = currentBasemap;
    }
  }, [currentBasemap]);

  // 2. Render Shelters & Epicenter Markers
  useEffect(() => {
    if (!mapRef.current) return;
    const group = shelterLayerGroupRef.current;
    group.clearLayers();

    if (!layerVisibility.shelters && focusMode !== 'shelters') return;

    // Add Epicenter marker
    const epicenterMarker = L.marker(scenario.epicenter, {
      icon: createEpicenterIcon(),
      title: 'Disaster Epicenter',
      zIndexOffset: 1000,
    });
    epicenterMarker.bindPopup(`
      <div style="font-size: 12px; line-height: 1.4; color: #f8fafc;">
        <div style="color: #f87171; text-transform: uppercase; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 4px;">
          <span>⚠️ DISASTER EPICENTER</span>
        </div>
        <strong style="font-size: 14px; color: #ffffff; display: block; margin-top: 2px;">${scenario.riverBasin}</strong>
        <div style="color: #94a3b8; margin-top: 4px; font-size: 11px;">
          Max Inundation Origin • 24h Rainfall: <strong style="color: #38bdf8;">${scenario.rainfall24hMm} mm</strong>
        </div>
      </div>
    `);
    epicenterMarker.addTo(group);

    // Add Shelters/Hospitals
    scenario.shelters.forEach((shelter) => {
      // If focus mode is shelters, only show medical/shelter points
      const occPct = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);
      const marker = L.marker(shelter.coordinates, {
        icon: createCustomIcon(shelter.type, shelter.name, shelter.floodSafe, occPct),
        title: shelter.name,
      });

      const availableBeds = shelter.capacity - shelter.currentOccupancy;

      marker.bindPopup(`
        <div style="min-width: 240px; font-family: inherit; color: #f8fafc;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: ${
              shelter.type === 'hospital'
                ? 'rgba(225, 29, 72, 0.25); color: #fb7185; border: 1px solid #fb7185;'
                : shelter.type === 'helipad'
                ? 'rgba(217, 119, 6, 0.25); color: #fbbf24; border: 1px solid #fbbf24;'
                : 'rgba(5, 150, 105, 0.25); color: #34d399; border: 1px solid #34d399;'
            }">
              ${shelter.type.toUpperCase()}
            </span>
            <span style="font-size: 10px; color: ${shelter.floodSafe ? '#34d399' : '#f87171'}; font-weight: 700;">
              ${shelter.floodSafe ? '● High Ground Safe' : '▲ Flood Fringe'}
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: bold; margin: 0 0 4px 0; color: #ffffff;">${shelter.name}</h4>
          <div style="font-size: 11px; color: #cbd5e1; margin-bottom: 6px; line-height: 1.5;">
            <strong>Available Beds:</strong> <span style="color: #38bdf8; font-weight: bold;">${availableBeds.toLocaleString()}</span> / ${shelter.capacity.toLocaleString()} (${occPct}% full)<br/>
            <strong>Staff On-Site:</strong> ${shelter.medicalStaff} doctors/personnel<br/>
            <strong>Supplies:</strong> ${shelter.supplies.foodPacks.toLocaleString()} rations • ${shelter.supplies.rescueBoats} rescue boats
          </div>
          <div style="font-size: 11px; color: #38bdf8; font-weight: 600;">
            📞 Direct Line: ${shelter.contact}
          </div>
        </div>
      `);

      marker.on('click', () => {
        onSelectFeature({ type: 'shelter', data: shelter });
      });

      marker.addTo(group);
    });
  }, [scenario, layerVisibility.shelters, focusMode, onSelectFeature]);

  // 3. Render Flood Polygons (High-Clarity Inundation)
  useEffect(() => {
    if (!mapRef.current) return;
    const group = floodLayerGroupRef.current;
    group.clearLayers();

    if ((!layerVisibility.floodExtent && focusMode !== 'flood') || !changeDetection) return;

    // Apply focus mode dimming
    const effectiveOpacity =
      focusMode === 'flood'
        ? Math.min(0.85, floodOpacity + 0.2)
        : focusMode === 'risk' || focusMode === 'routes'
        ? Math.max(0.15, floodOpacity * 0.4)
        : floodOpacity;

    changeDetection.geoJson.features.forEach((feat) => {
      const latLngs = feat.geometry.coordinates[0].map((coord) => [coord[1], coord[0]] as [number, number]);

      const polygon = L.polygon(latLngs, {
        color: '#00f2fe', // Electric glowing cyan border
        weight: focusMode === 'flood' ? 3 : 2,
        fillColor: '#0284c7', // Rich ocean water azure
        fillOpacity: effectiveOpacity,
        className: 'animate-pulse-flood',
      });

      polygon.bindTooltip(
        `<strong>🌊 ${feat.properties.zoneName}</strong><br/>` +
        `Flood Depth: <strong style="color:#38bdf8;">~${feat.properties.floodDepthM}m</strong><br/>` +
        `SAR dB Drop: <span style="color:#f43f5e;">${feat.properties.sarBackscatterDropDb} dB</span> • ` +
        `Conf: ${(feat.properties.confidenceScore * 100).toFixed(0)}%`,
        { sticky: true, className: 'map-tooltip' }
      );

      polygon.on('click', () => {
        onSelectFeature({ type: 'flood', data: feat.properties });
      });

      polygon.addTo(group);
    });
  }, [changeDetection, layerVisibility.floodExtent, focusMode, floodOpacity, onSelectFeature]);

  // 4. Render Risk Scoring Heatmap Zones + Centroid Labels
  useEffect(() => {
    if (!mapRef.current) return;
    const group = riskLayerGroupRef.current;
    const labelGroup = riskLabelGroupRef.current;
    group.clearLayers();
    labelGroup.clearLayers();

    if ((!layerVisibility.riskZones && focusMode !== 'risk') || !riskZones) return;

    const effectiveOpacity =
      focusMode === 'risk'
        ? Math.min(0.75, riskOpacity + 0.25)
        : focusMode === 'flood' || focusMode === 'routes'
        ? Math.max(0.1, riskOpacity * 0.3)
        : riskOpacity;

    riskZones.geoJson.features.forEach((feat) => {
      const latLngs = feat.geometry.coordinates[0].map((coord) => [coord[1], coord[0]] as [number, number]);
      const p = feat.properties;

      let fillColor = '#22c55e';
      let strokeColor = '#16a34a';

      if (p.category === 'Critical') {
        fillColor = '#ef4444';
        strokeColor = '#dc2626';
      } else if (p.category === 'High') {
        fillColor = '#f97316';
        strokeColor = '#ea580c';
      } else if (p.category === 'Medium') {
        fillColor = '#eab308';
        strokeColor = '#ca8a04';
      }

      const polygon = L.polygon(latLngs, {
        color: strokeColor,
        weight: focusMode === 'risk' ? 2.5 : 1.5,
        fillColor,
        fillOpacity: effectiveOpacity,
      });

      polygon.bindTooltip(
        `<strong>${p.zoneName}</strong><br/>` +
        `Risk Score: <strong style="color:${strokeColor};">${p.riskScore}/100 (${p.category})</strong><br/>` +
        `Population: ~${p.estimatedPopulation.toLocaleString()} citizens<br/>` +
        `Recommended: <em>${p.recommendedAction}</em>`,
        { sticky: true }
      );

      polygon.on('click', () => {
        onSelectFeature({ type: 'zone', data: p });
      });

      polygon.addTo(group);

      // Centroid label badge if enabled
      if (showLabels && (focusMode === 'all' || focusMode === 'risk')) {
        // Calculate simple centroid
        const avgLat = latLngs.reduce((acc, c) => acc + c[0], 0) / latLngs.length;
        const avgLng = latLngs.reduce((acc, c) => acc + c[1], 0) / latLngs.length;

        const labelMarker = L.marker([avgLat, avgLng], {
          icon: createRiskCentroidIcon(p.zoneName.replace(' Sector', ''), p.riskScore, p.category),
          interactive: false,
        });
        labelMarker.addTo(labelGroup);
      }
    });
  }, [riskZones, layerVisibility.riskZones, focusMode, riskOpacity, showLabels, onSelectFeature]);

  // 5. Render Safe A* Routes with High-Contrast Dual Casing
  useEffect(() => {
    if (!mapRef.current) return;
    const group = routeLayerGroupRef.current;
    group.clearLayers();

    if ((!layerVisibility.safeRoutes && focusMode !== 'routes') || !routesResult) return;

    routesResult.routes.forEach((route) => {
      const latLngs = route.geoJson.geometry.coordinates.map((c) => [c[1], c[0]] as [number, number]);

      let innerColor = '#10b981'; // vibrant emerald clear
      let dashArray: string | undefined = undefined;

      if (route.status === 'BLOCKED') {
        innerColor = '#ef4444'; // bright red
        dashArray = '5, 8';
      } else if (route.status === 'CAUTION_FRINGE') {
        innerColor = '#f59e0b'; // amber
        dashArray = '8, 5';
      }

      // 1. Dark casing line underneath for 100% contrast on any basemap
      const casingLine = L.polyline(latLngs, {
        color: '#020617',
        weight: focusMode === 'routes' ? 7 : 5.5,
        opacity: 0.9,
      });
      casingLine.addTo(group);

      // 2. Colored core route line
      const coreLine = L.polyline(latLngs, {
        color: innerColor,
        weight: focusMode === 'routes' ? 4.5 : 3.5,
        opacity: 1,
        dashArray,
      });

      coreLine.bindTooltip(
        `<strong>🛣️ Corridor: ${route.destinationName}</strong><br/>` +
        `Distance: <strong>${route.distanceKm} km</strong> • ETA: ~${route.travelTimeMinutes} mins<br/>` +
        `Status: <strong style="color:${innerColor};">${route.status} (${route.safetyScore}% safe)</strong><br/>` +
        `Destination Beds: ${route.availableCapacity.toLocaleString()}`,
        { sticky: true }
      );

      coreLine.on('click', () => {
        onSelectFeature({ type: 'route', data: route });
      });

      coreLine.on('mouseover', function () {
        coreLine.setStyle({ weight: 6 });
        casingLine.setStyle({ weight: 9 });
      });

      coreLine.on('mouseout', function () {
        coreLine.setStyle({ weight: focusMode === 'routes' ? 4.5 : 3.5 });
        casingLine.setStyle({ weight: focusMode === 'routes' ? 7 : 5.5 });
      });

      coreLine.addTo(group);
    });
  }, [routesResult, layerVisibility.safeRoutes, focusMode, onSelectFeature]);

  // 6A. Fetch RainViewer Doppler Radar Catalog
  useEffect(() => {
    let isMounted = true;
    if (!layerVisibility.weatherPrecipitation) return;

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
  }, [layerVisibility.weatherPrecipitation]);

  // 6B. Radar Frame Animation Loop
  useEffect(() => {
    if (!isRadarPlaying || !radarData || !radarData.past || radarData.past.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setRadarFrameIdx((prev) => (prev + 1) % radarData.past.length);
    }, 850);

    return () => clearInterval(interval);
  }, [isRadarPlaying, radarData]);

  // 6C. Render Precipitation Radar Layers (Live RainViewer)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Ensure weatherPane exists
    if (!map.getPane('weatherPane')) {
      const weatherPane = map.createPane('weatherPane');
      weatherPane.style.zIndex = '500';
      weatherPane.style.pointerEvents = 'none';
    }

    const precipGroup = weatherPrecipLayerGroupRef.current;
    precipGroup.clearLayers();

    if (!layerVisibility.weatherPrecipitation) return;

    if (radarData && radarData.past && radarData.past.length > 0) {
      const frame = radarData.past[radarFrameIdx] || radarData.past[radarData.past.length - 1];
      if (frame) {
        const tileUrl = `${radarData.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
        const precipTile = L.tileLayer(tileUrl, {
          attribution: '&copy; RainViewer Global Doppler Radar',
          opacity: radarOpacity,
          maxZoom: 18,
          pane: 'weatherPane',
        });
        precipTile.addTo(precipGroup);
      }
    }
  }, [
    layerVisibility.weatherPrecipitation,
    radarData,
    radarFrameIdx,
    radarOpacity,
    scenario,
  ]);

  // 6D. Fetch Meteorological Wind Telemetry
  useEffect(() => {
    let isMounted = true;
    if (!layerVisibility.weatherWind) return;

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
  }, [layerVisibility.weatherWind, scenario.id, scenario.center]);

  // 6E. Render Tactical Wind Vector Grid
  useEffect(() => {
    if (!mapRef.current) return;
    const group = weatherWindLayerGroupRef.current;
    group.clearLayers();

    if (!layerVisibility.weatherWind || !windData) return;
    if (windMode !== 'vectors' && windMode !== 'both') return;

    const [[s, w], [n, e]] = scenario.bounds;
    const latSpan = n - s;
    const lngSpan = e - w;

    // 4x4 Grid of tactical wind arrow markers across disaster AOI
    const rows = 4;
    const cols = 4;
    const speed = windData.windSpeedKmh;
    const baseDir = windData.windDirectionDeg;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lat = s + (latSpan * (r + 0.5)) / rows;
        const lng = w + (lngSpan * (c + 0.5)) / cols;

        // Slight micro-variation based on topography
        const seed = (r * 11 + c * 17) % 10;
        const localDir = (baseDir + (seed - 5) * 1.5 + 360) % 360;
        const localSpeed = Math.max(5, speed + (seed - 5) * 1.2);

        // Color based on velocity
        const strokeColor =
          localSpeed >= 65 ? '#f43f5e' : localSpeed >= 40 ? '#fbbf24' : localSpeed >= 20 ? '#34d399' : '#38bdf8';
        const bgColor =
          localSpeed >= 65 ? 'rgba(244, 63, 94, 0.25)' : localSpeed >= 40 ? 'rgba(251, 191, 36, 0.25)' : 'rgba(56, 189, 248, 0.25)';

        // Arrow marker with rotation
        const arrowIcon = L.divIcon({
          className: 'tactical-wind-marker',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; pointer-events: auto; cursor: pointer;">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: ${bgColor}; border: 1.5px solid ${strokeColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${strokeColor}66;">
                <div style="transform: rotate(${localDir}deg); display: flex; flex-direction: column; align-items: center; justify-content: center;">
                  <div style="width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 12px solid ${strokeColor};"></div>
                  <div style="width: 2px; height: 6px; background: ${strokeColor};"></div>
                </div>
              </div>
              <div style="margin-top: 2px; background: rgba(2, 6, 23, 0.9); border: 1px solid ${strokeColor}88; color: #f8fafc; font-size: 9px; font-family: monospace; font-weight: bold; padding: 1px 4px; border-radius: 4px; white-space: nowrap;">
                ${localSpeed.toFixed(0)} km/h
              </div>
            </div>
          `,
          iconSize: [40, 48],
          iconAnchor: [20, 24],
        });

        const marker = L.marker([lat, lng], { icon: arrowIcon, zIndexOffset: 200 });

        marker.bindPopup(`
          <div style="min-width: 190px; font-family: inherit; color: #f8fafc; font-size: 11px;">
            <div style="color: ${strokeColor}; font-weight: bold; text-transform: uppercase; font-size: 10px; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
              <span>💨 Wind Telemetry Node (${r+1},${c+1})</span>
            </div>
            <div><strong>Velocity:</strong> <span style="color:#ffffff; font-weight: bold;">${localSpeed.toFixed(1)} km/h</span> (${(localSpeed / 1.852).toFixed(1)} kt)</div>
            <div><strong>Heading:</strong> ${localDir.toFixed(0)}° (True Direction)</div>
            <div><strong>Peak Gusts:</strong> <span style="color:#fbbf24;">${(localSpeed * 1.38).toFixed(1)} km/h</span></div>
            <div><strong>Beaufort Scale:</strong> Force ${windData.beaufortScale} (${windData.beaufortDescription})</div>
            <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.1); color: #94a3b8; font-size: 10px;">
              Calibrated meteorological flow across ${scenario.riverBasin}.
            </div>
          </div>
        `);

        marker.addTo(group);
      }
    }
  }, [layerVisibility.weatherWind, windData, windMode, scenario]);

  // 6F. Animated Wind Particle Streamline Canvas Layer
  useEffect(() => {
    const canvas = windCanvasRef.current;
    if (!canvas || !layerVisibility.weatherWind || !windData) {
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

    // Resize canvas to match container
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    resizeCanvas();

    const speedKmh = windData.windSpeedKmh;
    const dirDeg = windData.windDirectionDeg;

    // Velocity vector (wind blowing towards dirDeg + 180)
    const rad = ((dirDeg + 180) % 360) * (Math.PI / 180);
    const speedFactor = Math.max(1.2, Math.min(6.5, speedKmh / 14));
    const vx = Math.sin(rad) * speedFactor;
    const vy = -Math.cos(rad) * speedFactor;

    const strokeColor =
      speedKmh >= 65
        ? 'rgba(244, 63, 94, 0.75)'
        : speedKmh >= 40
        ? 'rgba(251, 191, 36, 0.75)'
        : speedKmh >= 20
        ? 'rgba(52, 211, 153, 0.75)'
        : 'rgba(56, 189, 248, 0.75)';

    // Initialize streamline particles
    const particleCount = 180;
    interface WindParticle {
      x: number;
      y: number;
      oldX: number;
      oldY: number;
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
        oldX: x,
        oldY: y,
        age: Math.floor(Math.random() * 80),
        maxAge: 40 + Math.floor(Math.random() * 70),
        speedVar: 0.75 + Math.random() * 0.5,
      });
    }

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      // Soft fade trail
      ctx.fillStyle = 'rgba(2, 6, 23, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.strokeStyle = strokeColor;

      ctx.beginPath();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.oldX = p.x;
        p.oldY = p.y;

        p.x += vx * p.speedVar;
        p.y += vy * p.speedVar;
        p.age++;

        ctx.moveTo(p.oldX, p.oldY);
        ctx.lineTo(p.x, p.y);

        if (
          p.age >= p.maxAge ||
          p.x < -20 ||
          p.x > canvas.width + 20 ||
          p.y < -20 ||
          p.y > canvas.height + 20
        ) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.oldX = p.x;
          p.oldY = p.y;
          p.age = 0;
          p.maxAge = 40 + Math.floor(Math.random() * 70);
        }
      }
      ctx.stroke();

      windAnimIdRef.current = requestAnimationFrame(render);
    };

    windAnimIdRef.current = requestAnimationFrame(render);

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', handleResize);
      if (windAnimIdRef.current) {
        cancelAnimationFrame(windAnimIdRef.current);
        windAnimIdRef.current = null;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [layerVisibility.weatherWind, windData, windMode]);

  // 7. Render Copernicus Data Space Ecosystem (CDSE) Live Satellite Swaths & Acquisition Footprints
  useEffect(() => {
    let isMounted = true;
    if (!mapRef.current) return;
    const group = copernicusSentinelGroupRef.current;
    group.clearLayers();

    if (!layerVisibility.copernicusSentinel) return;

    // Fetch live Sentinel acquisitions for this scenario from Copernicus Data Space Ecosystem API
    fetch(`/api/copernicus/search?scenario=${scenario.id}&collection=SENTINEL-1`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted || !mapRef.current) return;
        if (!json.success || !json.data || !json.data.value) return;
        const products = json.data.value;

        products.forEach((prod: any, idx: number) => {
          if (!isMounted || !mapRef.current) return;
          let coordinates: [number, number][] = [];

          // 1. Try GeoFootprint GeoJSON if provided by OData
          if (prod.GeoFootprint && prod.GeoFootprint.coordinates) {
            const rawCoords = prod.GeoFootprint.coordinates[0];
            if (Array.isArray(rawCoords) && rawCoords.length > 0) {
              coordinates = rawCoords.map((c: number[]) => [c[1], c[0]]);
            }
          }

          // 2. Parse OData WKT Footprint: "geography'SRID=4326;POLYGON ((lon lat, ...))'"
          if (coordinates.length === 0 && prod.Footprint) {
            const match = prod.Footprint.match(/POLYGON\s*\(\((.*?)\)\)/i);
            if (match && match[1]) {
              coordinates = match[1]
                .split(',')
                .map((pair: string) => {
                  const [lonStr, latStr] = pair.trim().split(/\s+/);
                  const lat = parseFloat(latStr);
                  const lon = parseFloat(lonStr);
                  return !isNaN(lat) && !isNaN(lon) ? [lat, lon] as [number, number] : null;
                })
                .filter(Boolean) as [number, number][];
            }
          }

          // 3. Fallback to scenario bounds with slight offset per product pass
          if (coordinates.length === 0) {
            const [[minLat, minLon], [maxLat, maxLon]] = scenario.bounds;
            const offset = (idx - 1) * 0.04;
            coordinates = [
              [minLat - 0.08 + offset, minLon - 0.08 + offset],
              [minLat - 0.08 + offset, maxLon + 0.08 + offset],
              [maxLat + 0.08 + offset, maxLon + 0.08 + offset],
              [maxLat + 0.08 + offset, minLon - 0.08 + offset],
            ];
          }

          if (coordinates.length === 0) return;

          // Render SAR Swath Polygon
          const isLatest = idx === 0;
          const swathPolygon = L.polygon(coordinates, {
            color: isLatest ? '#6366f1' : '#818cf8',
            weight: isLatest ? 2 : 1.5,
            dashArray: isLatest ? undefined : '4, 4',
            fillColor: '#4f46e5',
            fillOpacity: isLatest ? 0.12 : 0.06,
          });

          // Custom Interactive Tooltip
          swathPolygon.bindTooltip(
            `<div class="p-1 text-left font-sans">
              <div class="flex items-center gap-1.5 font-bold text-indigo-300 text-xs">
                <span>🛰️ CDSE Sentinel SAR Swath</span>
              </div>
              <div class="text-[10px] text-slate-300 font-mono mt-0.5 max-w-xs truncate">${prod.Name}</div>
              <div class="text-[9px] text-slate-400 mt-1">Acquired: ${new Date(prod.ContentDate?.Start || prod.OriginDate || Date.now()).toLocaleDateString()}</div>
              <div class="text-[9px] text-indigo-400 mt-0.5">Click to inspect in CDSE Viewer</div>
            </div>`,
            { className: 'leaflet-tactical-tooltip', sticky: true }
          );

          // Click handler to select Copernicus product in Inspector drawer
          swathPolygon.on('click', () => {
            onSelectFeature({
              type: 'copernicus',
              data: prod,
            });
          });

          if (isMounted && mapRef.current) {
            swathPolygon.addTo(group);
          }

          // Render SAR Center Node / Satellite pass marker for the primary swath
          if (isLatest && isMounted && mapRef.current) {
            const bounds = swathPolygon.getBounds();
            const center = bounds.getCenter();

            const satelliteMarkerIcon = L.divIcon({
              className: 'copernicus-sat-marker',
              html: `
                <div class="relative flex items-center justify-center cursor-pointer group">
                  <div class="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/80 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
                    <div class="w-2.5 h-2.5 rounded-full bg-indigo-400"></div>
                  </div>
                  <div class="absolute -top-7 px-2 py-0.5 bg-indigo-950/90 border border-indigo-500/50 rounded text-[9px] font-mono text-indigo-200 font-bold whitespace-nowrap shadow-md pointer-events-none">
                    CDSE SAR Pass
                  </div>
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            const satMarker = L.marker(center, { icon: satelliteMarkerIcon });
            satMarker.on('click', () => {
              onSelectFeature({
                type: 'copernicus',
                data: prod,
              });
            });
            if (isMounted && mapRef.current) {
              satMarker.addTo(group);
            }
          }
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('[Copernicus Map Layer] Failed to fetch swath footprints:', err);
      });

    return () => {
      isMounted = false;
      group.clearLayers();
    };
  }, [scenario.id, layerVisibility.copernicusSentinel, onSelectFeature]);

  // Fit bounds when scenario changes
  useEffect(() => {
    if (!mapRef.current) return;
    if (scenario.bounds && scenario.bounds.length === 2) {
      mapRef.current.flyToBounds(scenario.bounds as L.LatLngBoundsExpression, {
        duration: 1.2,
        padding: [30, 30],
        maxZoom: 14,
      });
    } else if (scenario.center) {
      mapRef.current.flyTo(scenario.center, scenario.zoom || 12, { duration: 1.2 });
    }
  }, [scenario.id, scenario.bounds, scenario.center]);

  // Map Controls Helpers
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyToBounds(scenario.bounds, { duration: 0.8 });
    }
  };

  const handleBasemapChange = (style: BasemapStyle) => {
    setCurrentBasemap(style);
    if (onUpdateLayerVisibility) {
      onUpdateLayerVisibility({ basemapStyle: style, satelliteBase: style === 'satellite' });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapElementRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      {/* Actual Map Canvas */}
      <div ref={mapElementRef} className="w-full h-full z-0" />

      {/* Dynamic Animated Wind Particle Streamline Canvas */}
      <canvas
        ref={windCanvasRef}
        className="pointer-events-none absolute inset-0 z-10 w-full h-full"
      />

      {/* TOP FLOATING BAR: Focus Modes & Quick Clarity Filter */}
      <div className="absolute top-3 left-4 z-20 flex flex-wrap items-center gap-1 bg-slate-950/40 hover:bg-slate-950/75 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-slate-700/40 hover:border-slate-600/70 shadow-lg transition-all duration-200">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
          <Target className="w-3 h-3 text-cyan-400" />
          Focus:
        </span>

        {/* Focus Mode Segmented Pills */}
        <button
          onClick={() => setFocusMode('all')}
          className={`px-2 py-0.5 text-xs font-semibold rounded-lg transition ${
            focusMode === 'all'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          All
        </button>

        <button
          onClick={() => setFocusMode('flood')}
          className={`px-2 py-0.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition ${
            focusMode === 'flood'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <Waves className="w-3 h-3 text-cyan-300" />
          Flood
        </button>

        <button
          onClick={() => setFocusMode('risk')}
          className={`px-2 py-0.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition ${
            focusMode === 'risk'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <AlertTriangle className="w-3 h-3 text-amber-300" />
          Risk
        </button>

        <button
          onClick={() => setFocusMode('routes')}
          className={`px-2 py-0.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition ${
            focusMode === 'routes'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <Navigation className="w-3 h-3 text-emerald-950" />
          Corridors
        </button>

        <button
          onClick={() => setFocusMode('shelters')}
          className={`px-2 py-0.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition ${
            focusMode === 'shelters'
              ? 'bg-indigo-500 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <Hospital className="w-3 h-3 text-rose-300" />
          Shelters
        </button>
      </div>

      {/* TOP-RIGHT FLOATING UTILITIES: Basemap Picker, Opacity Slider & Navigation Tools */}
      <div className="absolute top-3 right-4 z-20 flex items-center gap-1.5">
        {/* Basemap Switcher Chips */}
        <div className="flex items-center bg-slate-950/40 hover:bg-slate-950/75 backdrop-blur-md p-0.5 rounded-2xl border border-slate-700/40 hover:border-slate-600/70 shadow-lg text-xs transition-all duration-200">
          <button
            onClick={() => handleBasemapChange('light')}
            className={`px-2 py-0.5 rounded-xl font-medium flex items-center gap-1 transition ${
              currentBasemap === 'light'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Clean Daylight Street Map - High contrast & readable labels"
          >
            <Sun className="w-3 h-3" />
            <span className="hidden sm:inline">Day</span>
          </button>

          <button
            onClick={() => handleBasemapChange('dark')}
            className={`px-2 py-0.5 rounded-xl font-medium flex items-center gap-1 transition ${
              currentBasemap === 'dark'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tactical Dark Map - Command center styling"
          >
            <Moon className="w-3 h-3" />
            <span className="hidden sm:inline">Dark</span>
          </button>

          <button
            onClick={() => handleBasemapChange('satellite')}
            className={`px-2 py-0.5 rounded-xl font-medium flex items-center gap-1 transition ${
              currentBasemap === 'satellite'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="High-Resolution Satellite Imagery"
          >
            <Satellite className="w-3 h-3" />
            <span className="hidden sm:inline">Sat</span>
          </button>

          <button
            onClick={() => handleBasemapChange('terrain')}
            className={`px-2 py-0.5 rounded-xl font-medium flex items-center gap-1 transition ${
              currentBasemap === 'terrain'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Topographic Elevation Map"
          >
            <Mountain className="w-3 h-3" />
            <span className="hidden sm:inline">Topo</span>
          </button>
        </div>

        {/* Layer Opacity & Settings Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`w-7 h-7 rounded-xl flex items-center justify-center border transition shadow-lg ${
              isSettingsOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-slate-950/40 hover:bg-slate-950/75 backdrop-blur-md text-slate-300 border-slate-700/40 hover:text-white hover:border-slate-600'
            }`}
            title="Adjust Layer Transparency & Labels"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-950/85 backdrop-blur-xl border border-slate-700 rounded-2xl p-3.5 shadow-2xl text-slate-100 z-30 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                  Layer Clarity Controls
                </span>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Flood Opacity Slider */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Flood Extent Opacity:</span>
                  <span className="font-mono text-cyan-400">{Math.round(floodOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={floodOpacity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setFloodOpacity(val);
                    onUpdateLayerVisibility?.({ floodOpacity: val });
                  }}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              {/* Risk Zones Opacity Slider */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Risk Heatmap Opacity:</span>
                  <span className="font-mono text-rose-400">{Math.round(riskOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={riskOpacity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setRiskOpacity(val);
                    onUpdateLayerVisibility?.({ riskOpacity: val });
                  }}
                  className="w-full accent-rose-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              {/* Toggle Risk Zone Centroid Labels */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">Show Sector Risk Badges</span>
                <button
                  onClick={() => {
                    setShowLabels(!showLabels);
                    onUpdateLayerVisibility?.({ showRiskLabels: !showLabels });
                  }}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-lg border transition ${
                    showLabels
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {showLabels ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Map Nav Buttons: Recenter & Zoom */}
        <div className="flex items-center bg-slate-950/40 hover:bg-slate-950/75 backdrop-blur-md rounded-2xl border border-slate-700/40 hover:border-slate-600/70 shadow-lg p-0.5 text-slate-300 transition-all duration-200">
          <button
            onClick={handleRecenter}
            className="w-7 h-7 flex items-center justify-center hover:text-cyan-400 rounded-xl hover:bg-slate-800/60 transition"
            title={`Recenter Map to ${scenario.areaKm2} km² AOI`}
          >
            <Target className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-slate-700/50 mx-0.5" />
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center hover:text-cyan-400 rounded-xl hover:bg-slate-800/60 transition"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center hover:text-cyan-400 rounded-xl hover:bg-slate-800/60 transition"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-slate-700/50 mx-0.5" />
          <button
            onClick={toggleFullscreen}
            className="w-7 h-7 flex items-center justify-center hover:text-cyan-400 rounded-xl hover:bg-slate-800/60 transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* SAR Radar Sensor Indicator Pill */}
      {isPostEventSimulated && (
        <div className="absolute top-16 left-4 z-20 pointer-events-none flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/40 text-[11px] font-mono text-cyan-300 shadow-xl">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Sentinel-1 SAR C-Band Synthetic Grid • Active {scenario.areaKm2} km² AOI</span>
        </div>
      )}

      {/* BOTTOM-LEFT COLLAPSIBLE GIS LEGEND */}
      <div className="absolute bottom-20 sm:bottom-4 left-4 z-20 max-w-xs transition-all duration-200">
        {isLegendOpen ? (
          <div className="bg-slate-950/40 hover:bg-slate-950/75 backdrop-blur-md border border-slate-700/40 hover:border-slate-600/70 rounded-2xl p-2.5 shadow-lg text-xs text-slate-200 transition-all duration-200">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/30 mb-2">
              <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-300">
                <Compass className="w-3 h-3 text-cyan-400" />
                GIS Classification
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-cyan-400 font-bold bg-cyan-950/40 px-1 py-0.2 rounded border border-cyan-500/20">
                  {scenario.areaKm2} km² AOI
                </span>
                <button
                  onClick={() => setIsLegendOpen(false)}
                  className="text-slate-400 hover:text-white text-xs px-1 hover:bg-slate-800/60 rounded transition"
                  title="Collapse Legend"
                >
                  ─
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-500/90 border border-cyan-300/80 shadow-sm shrink-0" />
                <span className="text-slate-300">Flood Extent (SAR)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90 border border-emerald-300/80 shrink-0" />
                <span className="text-slate-300">Safe Shelter Hub</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-500/80 border border-rose-400/80 shrink-0" />
                <span className="text-slate-300">Critical (&gt;75)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-orange-500/80 border border-orange-400/80 shrink-0" />
                <span className="text-slate-300">High (50-75)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-400/80 border border-amber-300/80 shrink-0" />
                <span className="text-slate-300">Medium (25-50)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500/80 border border-emerald-400/80 shrink-0" />
                <span className="text-slate-300">Low (&lt;25)</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <span className="w-2.5 h-2.5 rounded bg-indigo-600/60 border border-indigo-400 shrink-0" />
                <span className="text-indigo-300 font-mono text-[9.5px]">CDSE Sentinel Swath</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 pt-1 border-t border-slate-700/30 text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="w-4 h-0.5 bg-emerald-400 rounded-full" />
                  <span className="text-emerald-300">Clear</span>
                </div>
                <div className="flex items-center gap-1 ml-1.5">
                  <span className="w-4 h-0.5 bg-amber-400 rounded-full" />
                  <span className="text-amber-300">Caution</span>
                </div>
                <div className="flex items-center gap-1 ml-1.5">
                  <span className="w-4 h-0.5 bg-rose-500 rounded-full" />
                  <span className="text-rose-300">Blocked</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsLegendOpen(true)}
            className="bg-slate-950/40 hover:bg-slate-950/70 backdrop-blur-md border border-slate-700/40 rounded-xl px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white shadow-lg flex items-center gap-1.5 transition"
          >
            <Compass className="w-3 h-3 text-cyan-400" />
            Legend
          </button>
        )}
      </div>

      {/* RIGHT-SIDE FEATURE INSPECTION DRAWER */}
      {selectedFeature && (
        <div className="absolute top-16 right-4 z-20 w-84 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl text-slate-100 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
              {selectedFeature.type.toUpperCase()} INSPECTOR
            </span>
            <button
              onClick={() => onSelectFeature(null)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-800 transition"
            >
              ✕
            </button>
          </div>

          {selectedFeature.type === 'zone' && (
            <div>
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold text-white mb-1">
                  {selectedFeature.data.zoneName}
                </h3>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    selectedFeature.data.category === 'Critical'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : selectedFeature.data.category === 'High'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {selectedFeature.data.category} ({selectedFeature.data.riskScore}/100)
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Affected Population:</span>
                  <span className="font-mono text-amber-300 font-bold">
                    ~{selectedFeature.data.estimatedPopulation.toLocaleString()} citizens
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Road Impedance:</span>
                  <span className="font-mono text-cyan-300">
                    {selectedFeature.data.accessibilityScore}% delay factor
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Nearest Evacuation Hub:</span>
                  <span className="text-right text-slate-200 font-medium">
                    {selectedFeature.data.nearestShelterName} ({selectedFeature.data.distanceToShelterKm} km)
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-[11px] text-slate-400 font-semibold mb-1">
                    NDRF Tactical Action:
                  </p>
                  <p className="text-xs text-slate-200 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 leading-relaxed font-sans">
                    {selectedFeature.data.recommendedAction}
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedFeature.type === 'shelter' && (
            <div>
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold text-white mb-1">
                  {selectedFeature.data.name}
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    selectedFeature.data.floodSafe
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {selectedFeature.data.floodSafe ? 'Safe Ground' : 'Flood Fringe'}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Facility Type:</span>
                  <span className="uppercase font-mono text-cyan-300 font-bold">
                    {selectedFeature.data.type}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Capacity & Occupancy:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {(selectedFeature.data.capacity - selectedFeature.data.currentOccupancy).toLocaleString()} beds free (
                    {Math.round((selectedFeature.data.currentOccupancy / selectedFeature.data.capacity) * 100)}% filled)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Staff On-Site:</span>
                  <span className="font-mono text-white">
                    {selectedFeature.data.medicalStaff} personnel
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Rescue Assets:</span>
                  <span className="font-mono text-white">
                    {selectedFeature.data.supplies.rescueBoats} boats • {selectedFeature.data.supplies.ambulances} ambulances
                  </span>
                </div>
                <div className="pt-2">
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-400 block mb-0.5">Emergency Command Phone:</span>
                    <span className="font-mono text-cyan-400 font-bold text-sm">
                      {selectedFeature.data.contact}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedFeature.type === 'route' && (
            <div>
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold text-white mb-1">
                  Corridor to {selectedFeature.data.destinationName}
                </h3>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    selectedFeature.data.status === 'CLEAR'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : selectedFeature.data.status === 'CAUTION_FRINGE'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {selectedFeature.data.status}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Clearance Safety Score:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {selectedFeature.data.safetyScore}% verified
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Distance & ETA:</span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {selectedFeature.data.distanceKm} km (~{selectedFeature.data.travelTimeMinutes} mins)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Destination Beds Available:</span>
                  <span className="font-mono text-emerald-400">
                    {selectedFeature.data.availableCapacity.toLocaleString()} free
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-[11px] text-slate-400 font-semibold mb-1">
                    Route Turn-by-Turn Guidance:
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 text-[11px]">
                    {selectedFeature.data.steps.slice(0, 4).map((step, idx) => (
                      <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                        <span className="text-cyan-400 font-bold mr-1">#{idx + 1}</span>
                        {step.instruction}
                        <span className="text-slate-500 ml-1 font-mono">({step.distanceMeters}m)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedFeature.type === 'flood' && (
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                {selectedFeature.data.zoneName}
              </h3>
              <div className="mt-3 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Estimated Water Depth:</span>
                  <span className="font-mono text-cyan-300 font-bold text-sm">
                    ~{selectedFeature.data.floodDepthM} meters
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">SAR Backscatter Reduction:</span>
                  <span className="font-mono text-rose-400 font-bold">
                    {selectedFeature.data.sarBackscatterDropDb} dB drop
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Detection Reliability:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {(selectedFeature.data.confidenceScore * 100).toFixed(0)}% confidence
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Inundation Classification:</span>
                  <span className="font-mono text-slate-200 capitalize">
                    {selectedFeature.data.waterType?.replace('_', ' ') || 'Surface Inundation'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedFeature.type === 'copernicus' && (
            <div>
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold text-white mb-1">
                  CDSE Sentinel Satellite Acquisition
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono break-all mt-1 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                {selectedFeature.data.Name}
              </p>

              <div className="mt-3 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Constellation:</span>
                  <span className="font-mono text-indigo-300 font-bold">
                    {selectedFeature.data.Collection?.Name || 'SENTINEL-1 SAR'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Acquisition Date:</span>
                  <span className="font-mono text-cyan-300">
                    {selectedFeature.data.ContentDate?.Start
                      ? new Date(selectedFeature.data.ContentDate.Start).toLocaleString()
                      : selectedFeature.data.OriginDate || 'Recent'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Archive Size:</span>
                  <span className="font-mono text-slate-300">
                    {selectedFeature.data.ContentLength
                      ? `${(selectedFeature.data.ContentLength / (1024 * 1024)).toFixed(1)} MB`
                      : 'Standard StripMap / IW'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Data Origin:</span>
                  <span className="font-mono text-emerald-400 text-[11px]">
                    ESA / Copernicus Data Space
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCopernicusView) {
                      onOpenCopernicusView();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Show Orbit in Project Map</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weather Tactical Wind Telemetry HUD */}
      {layerVisibility.weatherWind && (
        <WeatherWindHud
          windData={windData}
          windMode={windMode}
          onChangeWindMode={setWindMode}
          onClose={() => onUpdateLayerVisibility?.({ weatherWind: false })}
        />
      )}
    </div>
  );
};
