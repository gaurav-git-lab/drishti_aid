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
  const token = await getCopernicusToken();

  // Bounding boxes for each scenario: [minLon, minLat, maxLon, maxLat]
  const bboxes: Record<string, [number, number, number, number]> = {
    mumbai: [72.75, 18.90, 73.05, 19.30],
    chennai: [80.12, 12.92, 80.32, 13.12],
    kerala: [76.20, 10.00, 76.50, 10.25],
  };

  const bbox = bboxes[scenarioId] || bboxes.mumbai;
  const [minLon, minLat, maxLon, maxLat] = bbox;
  // Format as OData spatial polygon: SRID=4326;POLYGON((lon lat, ...))
  const polygon = `POLYGON((${minLon} ${minLat}, ${maxLon} ${minLat}, ${maxLon} ${maxLat}, ${minLon} ${maxLat}, ${minLon} ${minLat}))`;

  const filter = `Collection/Name eq '${collection}' and OData.CSC.Intersects(area=geography'SRID=4326;${polygon}')`;
  const url = `https://catalogue.dataspace.copernicus.eu/odata/v1/Products?$filter=${encodeURIComponent(filter)}&$top=8&$orderby=ContentDate/Start desc`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to search Sentinel data: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
}
