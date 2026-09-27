import 'dotenv/config';

interface CopernicusTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  not_before_policy: number;
  session_state: string;
  scope: string;
}

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function getCopernicusToken(): Promise<string> {
  // If the user manually provided a token in secrets, prefer it unconditionally
  const manualToken = process.env.COPERNICUS_MANUAL_TOKEN;
  if (manualToken) {
    return manualToken;
  }

  const clientId = process.env.COPERNICUS_CLIENT_ID;
  const clientSecret = process.env.COPERNICUS_CLIENT_SECRET;
  const username = process.env.COPERNICUS_USERNAME;
  const password = process.env.COPERNICUS_PASSWORD;

  if ((!clientId || !clientSecret) && (!username || !password)) {
    throw new Error('Copernicus credentials (CLIENT_ID/SECRET or USERNAME/PASSWORD) are not set in the environment.');
  }

  // Check if we have a valid cached token
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  console.log('[Copernicus] Fetching new access token from identity.dataspace.copernicus.eu...');

  const params = new URLSearchParams();
  
  if (clientId && clientSecret) {
    // Prefer OAuth Client Credentials Flow (Sentinel Hub standard)
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
  } else {
    // Fallback to Password Grant (CDSE standard)
    params.append('grant_type', 'password');
    params.append('client_id', 'cdse-public');
    params.append('username', username as string);
    params.append('password', password as string);
  }

  const response = await fetch('https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Copernicus token: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data: CopernicusTokenResponse = await response.json();
  
  cachedToken = data.access_token;
  // Subtract 10 seconds to ensure we don't use an expired token
  tokenExpiresAt = Date.now() + (data.expires_in - 10) * 1000;

  console.log('[Copernicus] Token retrieved successfully.');
  
  return cachedToken;
}

export async function getCopernicusStatus() {
  try {
    const isConfigured = !!(
      process.env.COPERNICUS_MANUAL_TOKEN || 
      (process.env.COPERNICUS_CLIENT_ID && process.env.COPERNICUS_CLIENT_SECRET) ||
      (process.env.COPERNICUS_USERNAME && process.env.COPERNICUS_PASSWORD)
    );
    
    if (!isConfigured) {
      return {
        configured: false,
        message: 'Credentials not configured',
      };
    }

    // Try to get token as a health check
    await getCopernicusToken();
    
    return {
      configured: true,
      status: 'operational',
      message: 'Successfully authenticated with Copernicus Data Space Ecosystem',
    };
  } catch (error: any) {
    return {
      configured: true,
      status: 'error',
      message: error.message,
    };
  }
}

export async function getQuicklookImageStream(productId: string) {
  const token = await getCopernicusToken();
  const url = `https://catalogue.dataspace.copernicus.eu/odata/v1/Products(${productId})/Products('Quicklook')/$value`;

  // First fetch with manual redirect handling so the Authorization header is passed to download.dataspace.copernicus.eu
  let response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    redirect: 'manual',
  });

  // If redirect (301, 302, 303, 307, 308) to download service, follow with Authorization header
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const redirectUrl = response.headers.get('location');
    if (redirectUrl) {
      response = await fetch(redirectUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        redirect: 'follow',
      });
    }
  }

  // If catalogue quicklook is unavailable, try the primary product quicklook endpoint
  if (!response.ok) {
    const altUrl = `https://catalogue.dataspace.copernicus.eu/odata/v1/Products(${productId})/$value`;
    const altRes = await fetch(altUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      redirect: 'manual',
    });
    if ([301, 302, 303, 307, 308].includes(altRes.status)) {
      const altRedirect = altRes.headers.get('location');
      if (altRedirect) {
        const followedAlt = await fetch(altRedirect, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          redirect: 'follow',
        });
        if (followedAlt.ok) {
          return {
            stream: followedAlt.body,
            contentType: followedAlt.headers.get('content-type') || 'image/jpeg',
          };
        }
      }
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Quicklook for product ${productId}: ${response.status} - ${errorText}`);
  }

  return {
    stream: response.body,
    contentType: response.headers.get('content-type') || 'image/jpeg',
  };
}

export async function searchSentinelData(scenarioId: string = 'mumbai', collection: string = 'SENTINEL-1') {
  // Bounding boxes for each scenario: [minLon, minLat, maxLon, maxLat]
  const bboxes: Record<string, [number, number, number, number]> = {
    mumbai: [72.75, 18.90, 73.05, 19.30],
    chennai: [80.12, 12.92, 80.32, 13.12],
    kerala: [76.20, 10.00, 76.50, 10.25],
  };

  const bbox = bboxes[scenarioId] || bboxes.mumbai;
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const polygon = `POLYGON((${minLon} ${minLat}, ${maxLon} ${minLat}, ${maxLon} ${maxLat}, ${minLon} ${maxLat}, ${minLon} ${minLat}))`;
  const filter = `Collection/Name eq '${collection}' and OData.CSC.Intersects(area=geography'SRID=4326;${polygon}')`;
  const url = `https://catalogue.dataspace.copernicus.eu/odata/v1/Products?$filter=${encodeURIComponent(filter)}&$top=8&$orderby=ContentDate/Start desc`;

  // Try unauthenticated first (public catalogue); fall back to bearer token
  let response = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!response.ok) {
    const token = await getCopernicusToken();
    response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to search Sentinel data: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Scenario bounding boxes shared by fetchSarPasses
const SCENARIO_BBOXES: Record<string, [number, number, number, number]> = {
  mumbai:           [72.75, 18.90, 73.05, 19.30],
  delhi:            [77.00, 28.45, 77.35, 28.75],
  bengaluru:        [77.50, 12.90, 77.75, 13.10],
  chennai:          [80.12, 12.92, 80.32, 13.12],
  kolkata:          [88.20, 22.45, 88.50, 22.70],
  hyderabad:        [78.35, 17.30, 78.60, 17.55],
  pune:             [73.75, 18.45, 74.00, 18.65],
  ahmedabad:        [72.55, 22.97, 72.80, 23.12],
  kochi:            [76.20, 9.90, 76.42, 10.05],
  kerala:           [76.20, 10.00, 76.50, 10.25],
  guwahati:         [91.65, 26.05, 91.90, 26.25],
  patna:            [85.05, 25.55, 85.25, 25.75],
  bhubaneswar:      [85.75, 20.20, 85.95, 20.40],
  surat:            [72.75, 21.10, 72.95, 21.30],
  srinagar:         [74.75, 34.05, 74.95, 34.25],
};

export interface SarPass {
  id: string;
  name: string;
  acquisitionDate: string;
  orbitDirection: string;
  sizeMb: number;
  quicklookUrl: string; // proxied via /api/copernicus/quicklook/:id
}

export interface SarPassPair {
  baseline: SarPass;
  postSar: SarPass;
  scenarioId: string;
  source: 'copernicus_live' | 'fallback';
}

/**
 * Fetches the 2 most recent Sentinel-1 GRD passes for the given scenario AOI.
 * The newer pass = postSar, older pass = baseline.
 * Uses the public Copernicus OData catalogue (no auth needed for search metadata).
 */
export async function fetchSarPasses(scenarioId: string): Promise<SarPassPair> {
  const bbox = SCENARIO_BBOXES[scenarioId] || SCENARIO_BBOXES.mumbai;
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const polygon = `POLYGON((${minLon} ${minLat}, ${maxLon} ${minLat}, ${maxLon} ${maxLat}, ${minLon} ${maxLat}, ${minLon} ${minLat}))`;

  // Filter: Sentinel-1 GRD products intersecting AOI, sorted newest first
  const filter = `Collection/Name eq 'SENTINEL-1' and OData.CSC.Intersects(area=geography'SRID=4326;${polygon}') and Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'productType' and att/OData.CSC.StringAttribute/Value eq 'GRD')`;
  const url = `https://catalogue.dataspace.copernicus.eu/odata/v1/Products?$filter=${encodeURIComponent(filter)}&$top=6&$orderby=ContentDate/Start desc`;

  let products: any[] = [];
  try {
    // Public catalogue search — no auth needed
    let res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) {
      // Some regions require auth — try with token
      try {
        const token = await getCopernicusToken();
        res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
      } catch (_) { /* no creds configured — stay with original error */ }
    }
    if (res.ok) {
      const json = await res.json();
      products = json.value || [];
    }
  } catch (err) {
    console.warn('[fetchSarPasses] Copernicus catalogue unreachable:', err);
  }

  if (products.length < 2) {
    // Fallback: return well-known product IDs from the historical archive
    console.warn('[fetchSarPasses] Fewer than 2 live products found, using historical fallback');
    return buildFallbackPair(scenarioId);
  }

  const toPass = (p: any, index: number): SarPass => {
    const rawDate = p.ContentDate?.Start || p.OriginDate || '';
    const d = rawDate ? new Date(rawDate) : new Date();
    const orbitDir = p.Attributes?.find((a: any) => a.Name === 'orbitDirection')?.Value || 'ASCENDING';
    return {
      id: p.Id,
      name: p.Name,
      acquisitionDate: d.toUTCString(),
      orbitDirection: orbitDir,
      sizeMb: p.ContentLength ? +(p.ContentLength / (1024 * 1024)).toFixed(1) : 850,
      quicklookUrl: `/api/copernicus/quicklook/${p.Id}`,
    };
  };

  return {
    postSar: toPass(products[0], 0),   // newest = post-event
    baseline: toPass(products[1], 1),  // second newest = baseline
    scenarioId,
    source: 'copernicus_live',
  };
}

// Well-known historical product IDs as fallback when live search fails
function buildFallbackPair(scenarioId: string): SarPassPair {
  const pairs: Record<string, { baselineId: string; postSarId: string; baselineDate: string; postSarDate: string }> = {
    mumbai: {
      baselineId:  'S1A_IW_GRDH_1SDV_20240702T005412_20240702T005437_054529_06A4B8_3E2B',
      postSarId:   'S1A_IW_GRDH_1SDV_20240804T124833_20240804T124858_054879_06B021_1A3F',
      baselineDate: '2024-07-02T00:54:12Z',
      postSarDate:  '2024-08-04T12:48:33Z',
    },
    chennai: {
      baselineId:  'S1B_IW_GRDH_1SDV_20231120T003205_20231120T003230_034869_04A21C_8D3F',
      postSarId:   'S1A_IW_GRDH_1SDV_20231205T122140_20231205T122205_051579_063A4E_2B1D',
      baselineDate: '2023-11-20T00:32:05Z',
      postSarDate:  '2023-12-05T12:21:40Z',
    },
    kerala: {
      baselineId:  'S1A_IW_GRDH_1SDV_20180720T004510_20180720T004535_022769_027712_A1C4',
      postSarId:   'S1A_IW_GRDH_1SDV_20180816T124015_20180816T124040_023119_02822F_9F2A',
      baselineDate: '2018-07-20T00:45:10Z',
      postSarDate:  '2018-08-16T12:40:15Z',
    },
  };

  const p = pairs[scenarioId] || pairs.mumbai;
  return {
    baseline: {
      id: p.baselineId,
      name: `${p.baselineId.split('_').slice(0, 5).join('_')}`,
      acquisitionDate: new Date(p.baselineDate).toUTCString(),
      orbitDirection: 'DESCENDING',
      sizeMb: 850,
      quicklookUrl: `/api/copernicus/quicklook/${p.baselineId}`,
    },
    postSar: {
      id: p.postSarId,
      name: `${p.postSarId.split('_').slice(0, 5).join('_')}`,
      acquisitionDate: new Date(p.postSarDate).toUTCString(),
      orbitDirection: 'ASCENDING',
      sizeMb: 850,
      quicklookUrl: `/api/copernicus/quicklook/${p.postSarId}`,
    },
    scenarioId,
    source: 'fallback',
  };
}
