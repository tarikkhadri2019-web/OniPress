import crypto from 'crypto';

export interface GscIndexingResponse {
  success: boolean;
  url: string;
  type: 'URL_UPDATED' | 'URL_DELETED';
  message: string;
  notifyTime?: string;
}

export interface GscPerformanceRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface GscPerformanceSummary {
  clicks: number;
  impressions: number;
  averageCtr: number;
  averagePosition: number;
  rows: GscPerformanceRow[];
}

/**
 * Base64URL encode a string or Buffer
 */
function base64UrlEncode(data: string | Buffer): string {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Generate and sign a Google Service Account JWT (RS256)
 */
export function createServiceAccountJwt(
  clientEmail: string,
  privateKey: string,
  scopes: string[]
): string {
  const cleanKey = privateKey.replace(/\\n/g, '\n').trim();

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: clientEmail,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
  const signingInput = `${encodedHeader}.${encodedClaimSet}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();

  const signature = signer.sign(cleanKey);
  const encodedSignature = base64UrlEncode(signature);

  return `${signingInput}.${encodedSignature}`;
}

/**
 * Exchange Signed JWT for OAuth2 Access Token
 */
export async function getGoogleAccessToken(
  clientEmail: string,
  privateKey: string,
  scopes: string[] = [
    'https://www.googleapis.com/auth/indexing',
    'https://www.googleapis.com/auth/webmasters.readonly',
  ]
): Promise<string> {
  const assertion = createServiceAccountJwt(clientEmail, privateKey, scopes);

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Failed to authenticate Google Service Account');
  }

  return data.access_token as string;
}

/**
 * Submit URL to Google Indexing API v3
 * Free quota: 200 URLs/day per project
 */
export async function submitToGoogleIndexing(
  clientEmail: string,
  privateKey: string,
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<GscIndexingResponse> {
  try {
    const token = await getGoogleAccessToken(clientEmail, privateKey, [
      'https://www.googleapis.com/auth/indexing',
    ]);

    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url,
        type,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data.error?.message || `HTTP ${res.status}: ${JSON.stringify(data)}`;
      return {
        success: false,
        url,
        type,
        message: errMsg,
      };
    }

    return {
      success: true,
      url,
      type,
      message: `Googlebot crawling requested at ${data.urlNotificationMetadata?.latestUpdate?.notifyTime || 'now'}`,
      notifyTime: data.urlNotificationMetadata?.latestUpdate?.notifyTime,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      url,
      type,
      message: errorMsg || 'Indexing request failed',
    };
  }
}

/**
 * Query Search Console Search Analytics API (Last 28 Days)
 */
export async function querySearchAnalytics(
  clientEmail: string,
  privateKey: string,
  siteUrl: string,
  days: number = 28
): Promise<GscPerformanceSummary> {
  const token = await getGoogleAccessToken(clientEmail, privateKey, [
    'https://www.googleapis.com/auth/webmasters.readonly',
  ]);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query'],
        rowLimit: 20,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || `Search Console API error: HTTP ${res.status}`);
  }

  const rows: GscPerformanceRow[] = data.rows || [];
  let totalClicks = 0;
  let totalImpressions = 0;
  let weightedPosition = 0;

  for (const r of rows) {
    totalClicks += r.clicks || 0;
    totalImpressions += r.impressions || 0;
    weightedPosition += (r.position || 0) * (r.impressions || 1);
  }

  const averageCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const averagePosition = totalImpressions > 0 ? weightedPosition / totalImpressions : 0;

  return {
    clicks: totalClicks,
    impressions: totalImpressions,
    averageCtr: Math.round(averageCtr * 100) / 100,
    averagePosition: Math.round(averagePosition * 10) / 10,
    rows,
  };
}
