/**
 * Weather & Meteorological Service
 * Integrates RainViewer Global Doppler Radar & Open-Meteo Wind Vector Engine
 */

export interface RadarFrame {
  time: number;
  path: string;
}

export interface RadarResponse {
  host: string;
  generated: number;
  past: RadarFrame[];
  nowcast: RadarFrame[];
  latestTileUrl: string;
}

export interface WindResponse {
  latitude: number;
  longitude: number;
  scenarioId: string;
  windSpeedKmh: number;
  windDirectionDeg: number;
  windGustsKmh: number;
  temperatureC: number;
  pressureHpa: number;
  beaufortScale: number;
  beaufortDescription: string;
  source: 'live_open_meteo' | 'scenario_calibrated';
  updatedAt: string;
}

// In-memory caches to prevent rate limiting
let cachedRadar: { data: RadarResponse; expires: number } | null = null;
const cachedWind: Map<string, { data: WindResponse; expires: number }> = new Map();

// Scenario-calibrated severe weather defaults for disaster context
const SCENARIO_CALIBRATED_WEATHER: Record<string, { windSpeed: number; windDir: number; gusts: number; temp: number; pressure: number }> = {
  mumbai: {
    windSpeed: 42.5,
    windDir: 245, // WSW monsoon gale
    gusts: 64.0,
    temp: 27.5,
    pressure: 996.0,
  },
  chennai: {
    windSpeed: 78.0,
    windDir: 45, // NE cyclone gale
    gusts: 105.0,
    temp: 25.8,
    pressure: 988.0,
  },
  kerala: {
    windSpeed: 48.0,
    windDir: 285, // WNW heavy monsoon squall
    gusts: 72.0,
    temp: 26.2,
    pressure: 994.0,
  },
};

export function calculateBeaufort(speedKmh: number): { scale: number; description: string } {
  if (speedKmh < 1) return { scale: 0, description: 'Calm' };
  if (speedKmh <= 5) return { scale: 1, description: 'Light Air' };
  if (speedKmh <= 11) return { scale: 2, description: 'Light Breeze' };
  if (speedKmh <= 19) return { scale: 3, description: 'Gentle Breeze' };
  if (speedKmh <= 28) return { scale: 4, description: 'Moderate Breeze' };
  if (speedKmh <= 38) return { scale: 5, description: 'Fresh Breeze' };
  if (speedKmh <= 49) return { scale: 6, description: 'Strong Breeze' };
  if (speedKmh <= 61) return { scale: 7, description: 'Near Gale' };
  if (speedKmh <= 74) return { scale: 8, description: 'Gale' };
  if (speedKmh <= 88) return { scale: 9, description: 'Strong Gale' };
  if (speedKmh <= 102) return { scale: 10, description: 'Storm' };
  if (speedKmh <= 117) return { scale: 11, description: 'Violent Storm' };
  return { scale: 12, description: 'Hurricane Force' };
}

/**
 * Fetch latest global radar composite frames from RainViewer API
 */
export async function getRainViewerRadar(): Promise<RadarResponse> {
  const now = Date.now();
  if (cachedRadar && cachedRadar.expires > now) {
    return cachedRadar.data;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json', {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DRISHTI-AID-Disaster-Response/1.0',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`RainViewer HTTP ${res.status}`);
    }

    const data = await res.json();
    const host = data.host || 'https://tilecache.rainviewer.com';
    const past = data.radar?.past || [];
    const nowcast = data.radar?.nowcast || [];

    const latest = past[past.length - 1] || nowcast[0] || { path: '/v2/radar/latest', time: Math.floor(now / 1000) };
    const latestTileUrl = `${host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`;

    const result: RadarResponse = {
      host,
      generated: data.generated || Math.floor(now / 1000),
      past,
      nowcast,
      latestTileUrl,
    };

    // Cache for 3 minutes
    cachedRadar = {
      data: result,
      expires: now + 3 * 60 * 1000,
    };

    return result;
  } catch (err: any) {
    console.warn('[WeatherService] RainViewer fetch error, using fallback:', err.message);

    // If cache exists even if expired, reuse it
    if (cachedRadar) {
      return cachedRadar.data;
    }

    // Static fallback using direct tilecache URL structure
    const fallbackTime = Math.floor(now / 1000);
    return {
      host: 'https://tilecache.rainviewer.com',
      generated: fallbackTime,
      past: [{ time: fallbackTime, path: '/v2/radar/now' }],
      nowcast: [],
      latestTileUrl: 'https://tilecache.rainviewer.com/v2/radar/now/256/{z}/{x}/{y}/2/1_1.png',
    };
  }
}

/**
 * Fetch live meteorological wind from Open-Meteo or fallback to scenario calibration
 */
export async function getMeteorologicalWind(
  scenarioId: string = 'mumbai',
  lat: number = 19.076,
  lon: number = 72.877
): Promise<WindResponse> {
  const cacheKey = `${scenarioId}_${lat.toFixed(3)}_${lon.toFixed(3)}`;
  const now = Date.now();

  const cached = cachedWind.get(cacheKey);
  if (cached && cached.expires > now) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const current = data.current || {};
      const windSpeedKmh = Number(current.wind_speed_10m ?? 24.5);
      const windDirectionDeg = Math.round(Number(current.wind_direction_10m ?? 240));
      const windGustsKmh = Number(current.wind_gusts_10m ?? windSpeedKmh * 1.4);
      const temperatureC = Number(current.temperature_2m ?? 28.0);
      const pressureHpa = Number(current.surface_pressure ?? 1008.0);

      const { scale, description } = calculateBeaufort(windSpeedKmh);

      const result: WindResponse = {
        latitude: lat,
        longitude: lon,
        scenarioId,
        windSpeedKmh,
        windDirectionDeg,
        windGustsKmh,
        temperatureC,
        pressureHpa,
        beaufortScale: scale,
        beaufortDescription: description,
        source: 'live_open_meteo',
        updatedAt: new Date().toISOString(),
      };

      cachedWind.set(cacheKey, { data: result, expires: now + 5 * 60 * 1000 });
      return result;
    }
  } catch (err: any) {
    console.warn('[WeatherService] Open-Meteo fetch failed, using scenario calibration:', err.message);
  }

  // Fallback to calibrated scenario weather
  const cal = SCENARIO_CALIBRATED_WEATHER[scenarioId] || SCENARIO_CALIBRATED_WEATHER.mumbai;
  const { scale, description } = calculateBeaufort(cal.windSpeed);

  const fallbackResult: WindResponse = {
    latitude: lat,
    longitude: lon,
    scenarioId,
    windSpeedKmh: cal.windSpeed,
    windDirectionDeg: cal.windDir,
    windGustsKmh: cal.gusts,
    temperatureC: cal.temp,
    pressureHpa: cal.pressure,
    beaufortScale: scale,
    beaufortDescription: description,
    source: 'scenario_calibrated',
    updatedAt: new Date().toISOString(),
  };

  cachedWind.set(cacheKey, { data: fallbackResult, expires: now + 5 * 60 * 1000 });
  return fallbackResult;
}
