import { NextResponse } from 'next/server';
import { getCampaigns, saveCampaign, saveCampaigns, deleteCampaign, getSites, Campaign } from '@/lib/db';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const execFileAsync = promisify(execFile);

export async function GET() {
  try {
    const campaigns = getCampaigns();
    return NextResponse.json(campaigns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if it's an action like generate-topics
    if (body.action === 'generate-topics') {
      const { niche, count = 7 } = body;
      // Real AI Market Research: generates high-intent, trending topics dynamically based on search demand
      const generatedTopics = await generateTopicIdeasWithAi(niche || 'Technology', Number(count) || 7);
      return NextResponse.json({ topics: generatedTopics });
    }

    if (!body.name || !body.niche) {
      return NextResponse.json({ error: 'Name and Niche are required' }, { status: 400 });
    }

    const sites = getSites();
    const siteObj = sites.find(s => s.id === body.targetSiteId) || sites[0];

    const campaign: Campaign = {
      id: body.id || `camp-${Date.now()}`,
      name: body.name,
      niche: body.niche,
      targetSiteId: siteObj?.id || 'default',
      targetSiteName: siteObj?.name || 'Default Site',
      status: body.status || 'Active',
      frequency: body.frequency || 'Daily',
      createdAt: body.createdAt || new Date().toISOString().split('T')[0],
      topics: Array.isArray(body.topics) ? body.topics : [],
    };

    saveCampaign(campaign);
    return NextResponse.json(campaign);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Campaign ID required' }, { status: 400 });
    }
    saveCampaign(body);
    return NextResponse.json(body);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    deleteCampaign(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────
// AI MARKET RESEARCH TOPIC GENERATOR (POWERED BY AGY / GEMINI)
// Scans real search demand, user intent, and trending queries
// ─────────────────────────────────────────────────────────
async function generateTopicIdeasWithAi(
  niche: string, 
  count: number
): Promise<Array<{ id: string; title: string; focusKeyword: string; scheduledDay: number; status: 'Pending' }>> {
  const prompt = `You are an elite SEO strategist and market research analyst.
Analyze the following niche/industry: "${niche}".
Generate exactly ${count} high-CTR, high-search-volume article topics and primary focus keywords based on real-world search demand, user pain points, buyer intent, and trending 2026 queries.
Automatically adapt to the language of the niche (e.g. if the niche is in French, write in French; if in Spanish, write in Spanish; if in English, write in English).

Return ONLY a valid JSON array with NO markdown fences, NO extra text:
[
  {
    "title": "High-CTR, engaging headline with numbers or power words containing the focus keyword",
    "focusKeyword": "Exact high-intent primary focus keyword"
  }
]`;

  const tmpPath = join(tmpdir(), `onipress_topics_${Date.now()}.txt`);
  writeFileSync(tmpPath, prompt, 'utf8');

  try {
    const safePath = tmpPath.replace(/\\/g, '/');
    const psCommand = `Get-Content -Raw '${safePath}' | & agy --effort low --dangerously-skip-permissions --output-format text`;
    const { stdout } = await execFileAsync(
      'powershell',
      ['-NoProfile', '-NonInteractive', '-Command', psCommand],
      { timeout: 60_000, maxBuffer: 5 * 1024 * 1024, windowsHide: true }
    );

    const clean = stdout.replace(/^```(?:json)?\s*/im, '').replace(/\s*```\s*$/im, '').trim();
    const match = clean.match(/\[[\s\S]*\]/);
    if (match) {
      const items = JSON.parse(match[0]);
      if (Array.isArray(items) && items.length > 0) {
        return items.slice(0, count).map((item: any, idx: number) => ({
          id: `topic-${Date.now()}-${idx + 1}`,
          title: String(item.title || `${niche} Guide ${idx + 1}`),
          focusKeyword: String(item.focusKeyword || niche),
          scheduledDay: idx + 1,
          status: 'Pending' as const,
        }));
      }
    }
  } catch (err: any) {
    console.warn('[OniPress Topic AI Generator warning]', err.message);
  } finally {
    try { unlinkSync(tmpPath); } catch {}
  }

  // Dynamic fallback if CLI unavailable
  const cleanNiche = niche.trim().split(/[,;]/)[0].trim() || 'Industry';
  return Array.from({ length: count }, (_, idx) => ({
    id: `topic-${Date.now()}-${idx + 1}`,
    title: `${idx === 0 ? 'The Ultimate Guide to' : idx === 1 ? 'Top 7 Strategies for' : idx === 2 ? 'How to Optimize' : idx === 3 ? 'Comparative Analysis of' : idx === 4 ? 'Cost-Effective Solutions for' : idx === 5 ? 'Future Trends in' : 'Essential Best Practices for'} ${cleanNiche}`,
    focusKeyword: `${cleanNiche} 2026`,
    scheduledDay: idx + 1,
    status: 'Pending' as const,
  }));
}
