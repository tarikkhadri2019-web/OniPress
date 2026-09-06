import { NextResponse } from 'next/server';
import { getCampaigns, saveCampaign, saveCampaigns, deleteCampaign, getSites, Campaign } from '@/lib/db';

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
      const { niche, siteName, count = 7 } = body;
      // Generate intelligent topic ideas tailored to the niche
      const generatedTopics = generateTopicIdeas(niche || 'Technology', siteName || 'WordPress', Number(count) || 7);
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

function generateTopicIdeas(niche: string, siteName: string, count: number) {
  const isFrench = /[éàèùâêîôûëïç]/i.test(niche) || /\b(le|la|les|un|une|des|pour|dans|avec)\b/i.test(niche);

  const templatesFrench = [
    { title: `Les Meilleurs Solutions de {niche} en 2026 : Guide et Prix`, kw: `{niche} 2026` },
    { title: `Comment Réduire Vos Coûts avec {niche} : Analyse & Études de Cas`, kw: `optimisation {niche}` },
    { title: `Comparatif Complet : Top 5 Outils et Systèmes de {niche}`, kw: `comparatif {niche}` },
    { title: `Guide du Débutant : Tout Comprendre sur {niche}`, kw: `guide {niche}` },
    { title: `Réglementation et Bonnes Pratiques pour {niche} en 2026`, kw: `réglementation {niche}` },
    { title: `Les Erreurs Fréquentes à Éviter lors du Choix de {niche}`, kw: `choisir {niche}` },
    { title: `L'Avenir de {niche} : Nouvelles Tendances et Technologies Émergentes`, kw: `avenir {niche}` },
    { title: `Installation et Configuration Facile de {niche} : Tutoriel Pas à Pas`, kw: `tutoriel {niche}` },
  ];

  const templatesEnglish = [
    { title: `Top Solutions for {niche} in 2026: Complete Buyer's Guide`, kw: `best {niche} 2026` },
    { title: `How to Cut Costs & Boost Efficiency Using {niche}`, kw: `optimize {niche}` },
    { title: `Comprehensive Comparison: 5 Leading Systems for {niche}`, kw: `{niche} comparison` },
    { title: `The Ultimate Beginner's Blueprint to {niche}`, kw: `{niche} guide` },
    { title: `Key Regulations & Best Practices in {niche}`, kw: `{niche} best practices` },
    { title: `Top 7 Costly Mistakes to Avoid with {niche}`, kw: `{niche} mistakes` },
    { title: `The Future of {niche}: AI & Emerging Breakthroughs`, kw: `future of {niche}` },
  ];

  const list = isFrench ? templatesFrench : templatesEnglish;
  const cleanNiche = niche.trim().split(/[,;]/)[0].trim();

  return list.slice(0, count).map((item, idx) => ({
    id: `topic-${Date.now()}-${idx + 1}`,
    title: item.title.replace(/{niche}/g, cleanNiche),
    focusKeyword: item.kw.replace(/{niche}/g, cleanNiche),
    scheduledDay: idx + 1,
    status: 'Pending' as const,
  }));
}
