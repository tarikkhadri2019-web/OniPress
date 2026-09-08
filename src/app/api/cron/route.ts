import { NextResponse } from 'next/server';
import { getCampaigns, saveCampaign, getSites, Campaign, TopicIdea } from '@/lib/db';

export async function GET(request: Request) {
  return handleCronExecution(request);
}

export async function POST(request: Request) {
  return handleCronExecution(request);
}

async function handleCronExecution(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedCampaignId = searchParams.get('campaignId');

  try {
    const campaigns = getCampaigns();
    const sites = getSites();

    // Filter campaigns to execute: either specific campaign or all Active campaigns
    const eligibleCampaigns = campaigns.filter(c => {
      if (requestedCampaignId) return c.id === requestedCampaignId;
      return c.status === 'Active';
    });

    if (eligibleCampaigns.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active campaigns require automated execution at this time.',
        processed: 0,
        timestamp: new Date().toISOString(),
      });
    }

    const executionResults: Array<{
      campaignId: string;
      campaignName: string;
      topicId: string;
      topicTitle: string;
      status: 'Published' | 'Failed' | 'Skipped';
      postId?: string;
      url?: string;
      error?: string;
    }> = [];

    // Process each eligible campaign
    for (const camp of eligibleCampaigns) {
      const nextPendingTopic = camp.topics.find(t => t.status === 'Pending');

      if (!nextPendingTopic) {
        // All topics completed, automatically mark campaign Completed
        camp.status = 'Completed';
        saveCampaign(camp);
        executionResults.push({
          campaignId: camp.id,
          campaignName: camp.name,
          topicId: 'none',
          topicTitle: 'All topics already published',
          status: 'Skipped',
        });
        continue;
      }

      const site = sites.find(s => s.id === camp.targetSiteId) || sites[0];
      if (!site) {
        executionResults.push({
          campaignId: camp.id,
          campaignName: camp.name,
          topicId: nextPendingTopic.id,
          topicTitle: nextPendingTopic.title,
          status: 'Failed',
          error: 'No target WordPress site connected.',
        });
        continue;
      }

      // Mark topic as Generating
      nextPendingTopic.status = 'Generating';
      saveCampaign(camp);

      try {
        // Call internal generate endpoint via baseUrl
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const generateUrl = `${protocol}://${host}/api/generate`;

        const generateRes = await fetch(generateUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Write an authoritative, comprehensive RankMath 100/100 SEO blog post about: "${nextPendingTopic.title}". Target industry niche: ${camp.niche}.`,
            focusKeyword: nextPendingTopic.focusKeyword,
            siteId: site.id,
            contentType: 'Blog Post',
            postStatus: 'publish',
          }),
        });

        const genData = await generateRes.json();

        if (!generateRes.ok) {
          throw new Error(genData.error || 'Generation failed');
        }

        // Update topic to Published
        nextPendingTopic.status = 'Published';
        nextPendingTopic.publishedPostId = String(genData.postId || '');
        nextPendingTopic.publishedUrl = genData.link || '';
        nextPendingTopic.publishedAt = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        });

        saveCampaign(camp);

        executionResults.push({
          campaignId: camp.id,
          campaignName: camp.name,
          topicId: nextPendingTopic.id,
          topicTitle: nextPendingTopic.title,
          status: 'Published',
          postId: nextPendingTopic.publishedPostId,
          url: nextPendingTopic.publishedUrl,
        });

      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        nextPendingTopic.status = 'Failed';
        nextPendingTopic.error = errorMsg;
        saveCampaign(camp);

        executionResults.push({
          campaignId: camp.id,
          campaignName: camp.name,
          topicId: nextPendingTopic.id,
          topicTitle: nextPendingTopic.title,
          status: 'Failed',
          error: errorMsg,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cron: 'OniPress Automated Sideload Engine',
      campaignsEvaluated: eligibleCampaigns.length,
      processed: executionResults.filter(r => r.status === 'Published').length,
      results: executionResults,
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
