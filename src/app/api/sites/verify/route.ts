import { NextResponse } from 'next/server';
import { getSites } from '@/lib/db';

/**
 * Verify a site connection using the OniPress Connect plugin's /ping endpoint.
 */
export async function POST(request: Request) {
  try {
    const { siteId } = await request.json();

    const sites = getSites();
    const site = sites.find(s => s.id === siteId);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const wpBaseUrl = site.url.replace(/\/$/, '');
    let res: Response | null = null;
    let lastError = '';

    const endpointsToTry = [
      `${wpBaseUrl}/index.php?rest_route=/onipress/v1/ping`,
      `${wpBaseUrl}/wp-json/onipress/v1/ping`,
    ];

    for (const endpoint of endpointsToTry) {
      try {
        const attemptRes = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${site.applicationPassword}` }
        });
        if (attemptRes.ok || attemptRes.status !== 404) {
          res = attemptRes;
          break;
        }
      } catch (e) {
        lastError = e instanceof Error ? e.message : String(e);
      }
    }

    if (!res) {
      return NextResponse.json({
        connected: false,
        error: `Could not connect to ${wpBaseUrl} (${lastError || 'Connection failed'}). Check site URL.`
      }, { status: 200 });
    }

    if (!res.ok) {
      return NextResponse.json({
        connected: false,
        error: `Plugin responded with HTTP ${res.status}. Is OniPress Connect plugin installed and activated?`
      }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json({ connected: true, ...data });
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ connected: false, error: errorMsg }, { status: 200 });
  }
}
