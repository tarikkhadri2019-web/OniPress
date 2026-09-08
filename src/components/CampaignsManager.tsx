'use client';

import { useState, useEffect } from 'react';
import { 
  Play, Pause, Plus, Target, Sparkles, Globe, Calendar, 
  CheckCircle2, AlertCircle, ExternalLink, Trash2, 
  ChevronDown, ChevronUp, RefreshCw, Zap
} from 'lucide-react';
import { Site, Campaign, TopicIdea } from '@/lib/db';

export default function CampaignsManager() {
  const [sites, setSites] = useState<Site[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // New campaign form state
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignNiche, setNewCampaignNiche] = useState('');
  const [newCampaignFrequency, setNewCampaignFrequency] = useState<'Daily' | 'Twice Daily' | 'Weekly'>('Daily');
  const [isCreating, setIsCreating] = useState(false);

  // Active generation tracking
  const [runningTopicId, setRunningTopicId] = useState<string | null>(null);
  const [generatingStatusMsg, setGeneratingStatusMsg] = useState('');
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);

  // Manual topic add form
  const [topicInputs, setTopicInputs] = useState<{ [campaignId: string]: { title: string; focusKeyword: string } }>({});

  const fetchCampaignsData = async () => {
    const [sitesRes, campsRes] = await Promise.all([
      fetch('/api/sites'),
      fetch('/api/campaigns')
    ]);
    const sitesData = await sitesRes.json();
    const campsData = await campsRes.json();
    return { sitesData, campsData };
  };

  const loadData = () => {
    setIsLoading(true);
    fetchCampaignsData()
      .then(({ sitesData, campsData }) => {
        const sitesArr = Array.isArray(sitesData) ? sitesData : [];
        const campsArr = Array.isArray(campsData) ? campsData : [];
        setSites(sitesArr);
        setCampaigns(campsArr);
        if (sitesArr.length > 0 && !selectedSiteId) {
          setSelectedSiteId(sitesArr[0].id);
        }
        if (campsArr.length > 0 && !expandedCampaignId) {
          setExpandedCampaignId(campsArr[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCampaignsData()
      .then(({ sitesData, campsData }) => {
        const sitesArr = Array.isArray(sitesData) ? sitesData : [];
        const campsArr = Array.isArray(campsData) ? campsData : [];
        setSites(sitesArr);
        setCampaigns(campsArr);
        if (sitesArr.length > 0 && !selectedSiteId) {
          setSelectedSiteId(sitesArr[0].id);
        }
        if (campsArr.length > 0 && !expandedCampaignId) {
          setExpandedCampaignId(campsArr[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const saveCampaignToServer = async (camp: Campaign) => {
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(camp),
      });
    } catch (e) {
      console.error('Failed to sync campaign:', e);
    }
  };

  // Create new campaign with auto-generated 5-day topic ideas
  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim() || !newCampaignNiche.trim()) return;
    setIsCreating(true);

    const targetSiteObj = sites.find(s => s.id === selectedSiteId) || sites[0];

    // Fetch intelligent topic ideas for this niche
    let initialTopics: TopicIdea[] = [];
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-topics',
          niche: newCampaignNiche,
          siteName: targetSiteObj?.name || 'WordPress',
          count: 5,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.topics)) {
        initialTopics = data.topics;
      }
    } catch {}

    const newCamp: Campaign = {
      id: `camp-${Date.now()}`,
      name: newCampaignName,
      niche: newCampaignNiche,
      targetSiteId: targetSiteObj?.id || 'default',
      targetSiteName: targetSiteObj?.name || 'WordPress',
      status: 'Active',
      frequency: newCampaignFrequency,
      createdAt: new Date().toISOString().split('T')[0],
      topics: initialTopics,
    };

    await saveCampaignToServer(newCamp);
    setCampaigns([newCamp, ...campaigns]);
    setExpandedCampaignId(newCamp.id);
    setNewCampaignName('');
    setNewCampaignNiche('');
    setIsCreating(false);
  };

  // Run next pending topic in the campaign queue
  const handleRunNextTopic = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const nextPending = campaign.topics.find(t => t.status === 'Pending');
    if (!nextPending) {
      alert('All topic ideas in this campaign are already published! Add more topics below.');
      return;
    }

    await executeTopicGeneration(campaign, nextPending);
  };

  // Execute generation for a specific topic
  const executeTopicGeneration = async (campaign: Campaign, topic: TopicIdea) => {
    setRunningTopicId(topic.id);
    setGeneratingStatusMsg(`Calling Antigravity AI for "${topic.title}"...`);

    const updatedTopics = campaign.topics.map(t => 
      t.id === topic.id ? { ...t, status: 'Generating' as const, error: undefined } : t
    );
    const updatedCampaign = { ...campaign, topics: updatedTopics };
    setCampaigns(prev => prev.map(c => c.id === campaign.id ? updatedCampaign : c));

    try {
      setGeneratingStatusMsg('Generating 1,500+ word RankMath 100/100 article...');
      
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Write an authoritative, comprehensive RankMath 100/100 SEO blog post about: "${topic.title}". Target industry niche: ${campaign.niche}.`,
          focusKeyword: topic.focusKeyword,
          siteId: campaign.targetSiteId,
          contentType: 'Blog Post',
          postStatus: 'publish',
          model: 'antigravity-gemini',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setGeneratingStatusMsg('Published successfully to WordPress!');

      const publishedTopics = campaign.topics.map(t => 
        t.id === topic.id ? {
          ...t,
          status: 'Published' as const,
          publishedPostId: String(data.postId || ''),
          publishedUrl: data.link || '',
          publishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        } : t
      );

      const finalCampaign = { ...campaign, topics: publishedTopics };
      setCampaigns(prev => prev.map(c => c.id === campaign.id ? finalCampaign : c));
      await saveCampaignToServer(finalCampaign);

    } catch (err: unknown) {
      console.error('Topic generation error:', err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      const failedTopics = campaign.topics.map(t => 
        t.id === topic.id ? { ...t, status: 'Failed' as const, error: errorMsg || 'Failed' } : t
      );
      const failedCampaign = { ...campaign, topics: failedTopics };
      setCampaigns(prev => prev.map(c => c.id === campaign.id ? failedCampaign : c));
      await saveCampaignToServer(failedCampaign);
    } finally {
      setRunningTopicId(null);
      setGeneratingStatusMsg('');
    }
  };

  const handleAddTopic = (campaignId: string) => {
    const input = topicInputs[campaignId];
    if (!input || !input.title.trim()) return;

    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const newTopic: TopicIdea = {
      id: `topic-${Date.now()}`,
      title: input.title.trim(),
      focusKeyword: input.focusKeyword.trim() || input.title.trim().split(':')[0].trim(),
      scheduledDay: campaign.topics.length + 1,
      status: 'Pending',
    };

    const updated = {
      ...campaign,
      topics: [...campaign.topics, newTopic]
    };

    setCampaigns(prev => prev.map(c => c.id === campaignId ? updated : c));
    saveCampaignToServer(updated);

    setTopicInputs(prev => ({ ...prev, [campaignId]: { title: '', focusKeyword: '' } }));
  };

  const handleSuggestMoreTopics = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-topics',
          niche: campaign.niche,
          siteName: campaign.targetSiteName,
          count: 5,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.topics)) {
        const offset = campaign.topics.length;
        const mapped = data.topics.map((t: TopicIdea, i: number) => ({
          ...t,
          id: `topic-${Date.now()}-${i + 1}`,
          scheduledDay: offset + i + 1,
        }));
        const updated = {
          ...campaign,
          topics: [...campaign.topics, ...mapped]
        };
        setCampaigns(prev => prev.map(c => c.id === campaignId ? updated : c));
        saveCampaignToServer(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    await fetch(`/api/campaigns?id=${id}`, { method: 'DELETE' });
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const toggleCampaignStatus = async (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;
    const updated = {
      ...campaign,
      status: campaign.status === 'Active' ? ('Paused' as const) : ('Active' as const),
    };
    setCampaigns(prev => prev.map(c => c.id === id ? updated : c));
    await saveCampaignToServer(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Automated Topic Campaigns</h2>
          <p className="text-xs text-slate-500">
            Generate programmatic editorial clusters, manage topic pipelines, and sideload with zero manual copywriting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
            title="Refresh Campaigns"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0047FF]' : ''}`} />
          </button>
          <span className="text-xs px-3 py-1 rounded-full bg-[#0047FF]/10 text-[#0047FF] border border-[#0047FF]/20 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0047FF]" />
            {campaigns.filter(c => c.status === 'Active').length} Active Campaigns
          </span>
        </div>
      </div>

      {/* Launch New Campaign Form */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Sparkles className="w-4 h-4 text-[#0047FF]" />
          Create New Automated Topic Campaign
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Campaign Name</label>
            <input
              type="text"
              placeholder="e.g. Clean Energy Fleet Solutions"
              value={newCampaignName}
              onChange={e => setNewCampaignName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl text-slate-900 bg-white border border-slate-200 focus:outline-none focus:border-[#0047FF] focus:ring-2 focus:ring-[#0047FF]/15"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Target Niche &amp; Keywords</label>
            <input
              type="text"
              placeholder="e.g. Eco logistics, solar fleet, EV trucks"
              value={newCampaignNiche}
              onChange={e => setNewCampaignNiche(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl text-slate-900 bg-white border border-slate-200 focus:outline-none focus:border-[#0047FF] focus:ring-2 focus:ring-[#0047FF]/15"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Target WordPress Site</label>
            <select
              value={selectedSiteId}
              onChange={e => setSelectedSiteId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl text-slate-900 bg-white border border-slate-200 focus:outline-none cursor-pointer focus:border-[#0047FF]"
            >
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.url})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600">Publish Frequency:</span>
            {(['Daily', 'Twice Daily', 'Weekly'] as const).map(freq => (
              <button
                key={freq}
                type="button"
                onClick={() => setNewCampaignFrequency(freq)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  newCampaignFrequency === freq
                    ? 'bg-[#0047FF] text-white shadow-2xs'
                    : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
          <button
            onClick={handleCreateCampaign}
            disabled={isCreating || !newCampaignName.trim() || !newCampaignNiche.trim()}
            className="px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white bg-[#0047FF] hover:bg-[#0037cc] transition-all disabled:opacity-40 cursor-pointer shadow-sm"
          >
            {isCreating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {isCreating ? 'Generating Topic Queue...' : 'Create Campaign with 5 Topics'}
          </button>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-dashed border-slate-300 space-y-3">
            <Calendar className="w-10 h-10 text-[#0047FF] mx-auto opacity-70" />
            <p className="text-sm font-bold text-slate-700">No campaigns created yet</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Fill out the form above to launch your first automated topic cluster.
            </p>
          </div>
        ) : (
          campaigns.map(camp => {
            const completedCount = camp.topics.filter(t => t.status === 'Published').length;
            const totalCount = camp.topics.length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const isExpanded = expandedCampaignId === camp.id;
            const nextPendingTopic = camp.topics.find(t => t.status === 'Pending');

            return (
              <div
                key={camp.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden transition-all duration-200"
              >
                {/* Campaign Header Bar */}
                <div className="p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-slate-900">{camp.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          camp.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {camp.status}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {camp.frequency}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-[#0047FF]" /> Niche: <strong className="text-slate-800">{camp.niche}</strong>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-[#0047FF]" /> Site: <strong className="text-slate-800">{camp.targetSiteName}</strong>
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRunNextTopic(camp.id)}
                        disabled={runningTopicId !== null || !nextPendingTopic}
                        className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white bg-[#0047FF] hover:bg-[#0037cc] transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                        title={nextPendingTopic ? `Publish next topic: ${nextPendingTopic.title}` : 'All topics published'}
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        {nextPendingTopic ? 'Start / Publish Next Topic' : 'Cluster Completed'}
                      </button>

                      <button
                        onClick={() => toggleCampaignStatus(camp.id)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                      >
                        {camp.status === 'Active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleDeleteCampaign(camp.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Campaign"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setExpandedCampaignId(isExpanded ? null : camp.id)}
                        className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Toggle Topics Queue"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>
                        Editorial Queue: <strong className="text-slate-900">{completedCount} of {totalCount}</strong> articles published
                      </span>
                      <span className="font-bold text-[#0047FF]">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-[#0047FF] rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Topics Queue (Expandable) */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 text-[#0047FF]" />
                        Topic Queue &amp; Sideload Pipeline
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSuggestMoreTopics(camp.id)}
                          className="px-3 py-1 rounded-lg bg-[#0047FF]/10 hover:bg-[#0047FF]/20 text-[11px] font-bold text-[#0047FF] border border-[#0047FF]/25 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          Suggest 5 More Topics
                        </button>
                      </div>
                    </div>

                    {/* Topic Items Table/List */}
                    <div className="space-y-2">
                      {camp.topics.map((topic, idx) => {
                        const isGeneratingThis = runningTopicId === topic.id;

                        return (
                          <div
                            key={topic.id}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isGeneratingThis
                                ? 'bg-[#0047FF]/10 border-[#0047FF] animate-pulse'
                                : topic.status === 'Published'
                                ? 'bg-white border-slate-200'
                                : topic.status === 'Failed'
                                ? 'bg-red-50 border-red-200'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-600">
                                  Day {topic.scheduledDay || idx + 1}
                                </span>
                                <p className="text-xs font-bold text-slate-900">
                                  {topic.title}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                                <span>Focus Keyword: <strong className="text-[#0047FF]">{topic.focusKeyword}</strong></span>
                                {topic.publishedAt && (
                                  <span>Published: <strong className="text-emerald-600">{topic.publishedAt}</strong></span>
                                )}
                                {topic.error && (
                                  <span className="text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {topic.error}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isGeneratingThis ? (
                                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0047FF]/10 text-[#0047FF] text-xs font-bold">
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Generating Post...</span>
                                </div>
                              ) : topic.status === 'Published' ? (
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1 border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Published
                                  </span>
                                  {topic.publishedUrl && (
                                    <a
                                      href={topic.publishedUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0047FF] transition-colors"
                                      title="Open published post on WordPress"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => executeTopicGeneration(camp, topic)}
                                  disabled={runningTopicId !== null}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0047FF]/10 hover:bg-[#0047FF]/20 text-[#0047FF] border border-[#0047FF]/20 flex items-center gap-1 transition-colors disabled:opacity-40 cursor-pointer"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  Generate Now
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Active Live Status Bar */}
                    {runningTopicId && (
                      <div className="p-3 rounded-xl bg-[#0047FF]/10 border border-[#0047FF]/25 flex items-center gap-2 text-xs text-[#0047FF] font-bold">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{generatingStatusMsg}</span>
                      </div>
                    )}

                    {/* Add Custom Topic Input */}
                    <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        placeholder="Add custom daily topic title"
                        value={topicInputs[camp.id]?.title || ''}
                        onChange={e => setTopicInputs(prev => ({
                          ...prev,
                          [camp.id]: { ...(prev[camp.id] || { title: '', focusKeyword: '' }), title: e.target.value }
                        }))}
                        className="flex-1 w-full px-3 py-2 text-xs rounded-xl text-slate-900 bg-white border border-slate-200 focus:outline-none focus:border-[#0047FF]"
                      />
                      <input
                        type="text"
                        placeholder="Focus Keyword"
                        value={topicInputs[camp.id]?.focusKeyword || ''}
                        onChange={e => setTopicInputs(prev => ({
                          ...prev,
                          [camp.id]: { ...(prev[camp.id] || { title: '', focusKeyword: '' }), focusKeyword: e.target.value }
                        }))}
                        className="w-full sm:w-48 px-3 py-2 text-xs rounded-xl text-slate-900 bg-white border border-slate-200 focus:outline-none focus:border-[#0047FF]"
                      />
                      <button
                        onClick={() => handleAddTopic(camp.id)}
                        disabled={!topicInputs[camp.id]?.title?.trim()}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-[#0047FF] hover:bg-[#0037cc] text-white flex items-center justify-center gap-1 transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add to Queue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
