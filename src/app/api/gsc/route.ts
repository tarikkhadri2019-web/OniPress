import { NextResponse } from 'next/server';
import { getGscConfig, saveGscConfig, getGscLogs, saveGscLog, getSites, GscConfig, GscIndexLog } from '@/lib/db';
import { submitToGoogleIndexing, querySearchAnalytics, getGoogleAccessToken } from '@/lib/gsc';
import { queryGa4Analytics } from '@/lib/ga4';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const config = getGscConfig();
    const logs = getGscLogs();

    // Mask private key for frontend display
    const maskedConfig = {
      ...config,
      hasPrivateKey: Boolean(config.privateKey && config.privateKey.length > 20),
      privateKeyPreview: config.privateKey
        ? `${config.privateKey.slice(0, 30)}...${config.privateKey.slice(-25)}`
        : '',
    };

    // Live performance will be fetched on-demand per site instead of globally on load
    let livePerformance = null;
    let performanceError = null;

    return NextResponse.json({
      success: true,
      config: maskedConfig,
      logs,
      livePerformance,
      performanceError,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errorMsg || 'Failed to fetch GSC settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // ── 1. SAVE CONFIG & VERIFY ──
    if (action === 'save_config') {
      const current = getGscConfig();
      const clientEmail = (body.clientEmail ?? current.clientEmail ?? '').trim();
      let privateKey = (body.privateKey ?? current.privateKey ?? '').trim();
      const autoIndexOnPublish = body.autoIndexOnPublish ?? current.autoIndexOnPublish ?? true;

      // Handle raw JSON service account file input
      if (body.rawJson) {
        try {
          const parsed = JSON.parse(body.rawJson);
          if (parsed.client_email) (body as Record<string, unknown>).clientEmail = parsed.client_email;
          if (parsed.private_key) privateKey = parsed.private_key;
        } catch {
          // ignore parsing error, proceed with direct fields
        }
      }

      let status: 'unconfigured' | 'connected' | 'error' = 'unconfigured';
      let lastError = '';

      if (clientEmail && privateKey) {
        try {
          // Verify JWT signing and token generation
          await getGoogleAccessToken(clientEmail, privateKey);
          status = 'connected';
        } catch (err: unknown) {
          status = 'error';
          const errorMsg = err instanceof Error ? err.message : String(err);
          lastError = errorMsg || 'Authentication failed. Check your private key and client email.';
        }
      }

      const updated: GscConfig = {
        clientEmail: (body as Record<string, unknown>).clientEmail as string || clientEmail,
        privateKey: privateKey || current.privateKey,
        autoIndexOnPublish,
        status,
        lastChecked: new Date().toISOString(),
        lastError: lastError || undefined,
      };

      saveGscConfig(updated);

      return NextResponse.json({
        success: true,
        status,
        lastError: lastError || null,
        message: status === 'connected' ? 'Google Search Console credentials verified!' : 'Credentials saved.',
      });
    }

    // ── 2. SUBMIT URL FOR INSTANT INDEXING ──
    if (action === 'index_url') {
      const { url, type = 'URL_UPDATED' } = body;
      if (!url) {
        return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
      }

      const config = getGscConfig();
      if (!config.clientEmail || !config.privateKey) {
        return NextResponse.json(
          { success: false, error: 'Google Search Console credentials not configured' },
          { status: 400 }
        );
      }

      const res = await submitToGoogleIndexing(config.clientEmail, config.privateKey, url, type);

      const logEntry: GscIndexLog = {
        id: `gsc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        url,
        type,
        status: res.success ? 'SUCCESS' : 'FAILED',
        submittedAt: new Date().toISOString(),
        responseMessage: res.message,
      };

      saveGscLog(logEntry);

      return NextResponse.json({
        success: res.success,
        message: res.message,
        log: logEntry,
      });
    }

    // ── 3. FETCH LIVE SEARCH METRICS ──
    if (action === 'fetch_metrics') {
      const config = getGscConfig();
      if (!config.clientEmail || !config.privateKey) {
        return NextResponse.json(
          { success: false, error: 'Incomplete GSC setup. Credentials required.' },
          { status: 400 }
        );
      }

      let queryUrl = body.siteUrl;
      if (body.siteId) {
        const sites = getSites();
        const site = sites.find(s => s.id === body.siteId);
        if (site) {
          queryUrl = site.gscUrl || site.url;
        }
      }

      if (!queryUrl) {
        return NextResponse.json({ success: false, error: 'Site URL required for metrics' }, { status: 400 });
      }

      const metrics = await querySearchAnalytics(
        config.clientEmail,
        config.privateKey,
        queryUrl,
        body.days || 28
      );

      return NextResponse.json({
        success: true,
        metrics,
      });
    }

    // ── 4. FETCH GA4 METRICS ──
    if (action === 'fetch_ga4_metrics') {
      const config = getGscConfig();
      if (!config.clientEmail || !config.privateKey) {
        return NextResponse.json({ success: false, error: 'GSC credentials required' }, { status: 400 });
      }

      if (!body.siteId) {
        return NextResponse.json({ success: false, error: 'Site ID required' }, { status: 400 });
      }

      const site = getSites().find(s => s.id === body.siteId);
      if (!site?.ga4PropertyId) {
        return NextResponse.json({ success: false, error: 'GA4 Property ID not set for this site' }, { status: 400 });
      }

      const ga4Metrics = await queryGa4Analytics(
        config.clientEmail,
        config.privateKey,
        site.ga4PropertyId,
        body.days || 28
      );

      return NextResponse.json({ success: true, metrics: ga4Metrics });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errorMsg || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
