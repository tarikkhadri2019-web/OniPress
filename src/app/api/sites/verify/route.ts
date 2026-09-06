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
    const pingUrl = `${wpBaseUrl}/wp-json/onipress/v1/ping`;

    const res = await fetch(pingUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${site.applicationPassword}` }
    });

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
