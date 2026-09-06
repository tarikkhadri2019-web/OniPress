'use client';

import { useState, useEffect, useRef } from 'react';
import { Site, PostRecord } from '@/lib/db';
import { Input } from './ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger } from './ui/select';
import {
  FileText, Mail, Share2, Sparkles, Plus, Loader2,
  CheckCircle2, AlertCircle, ExternalLink, Trash2, Globe, KeyRound, Image as ImageIcon, Clock
} from 'lucide-react';

type StatusType = 'idle' | 'generating' | 'success' | 'error';
type ProjectType = 'Blog Post' | 'Newsletter' | 'Social Post' | 'SEO Optimized Article';

const MODELS = [
  {
    group: 'OpenRouter (100% Free Models)',
    provider: 'openrouter',
    items: [
      { value: 'openrouter:meta-llama/llama-3.1-70b-instruct:free', label: 'Llama 3.1 70B (100% Free)' },
      { value: 'openrouter:google/gemini-2.0-flash-exp:free',       label: 'Gemini 2.0 Flash (100% Free)' },
      { value: 'openrouter:mistralai/mistral-7b-instruct:free',     label: 'Mistral 7B (100% Free)' },
      { value: 'openrouter:qwen/qwen-2.5-72b-instruct:free',        label: 'Qwen 2.5 72B (100% Free)' },
    ],
  },
  {
    group: 'Google Gemini (Free with Gmail)',
    provider: 'google',
    items: [
      { value: 'google:models/gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash (Ultra Fast / Free)' },
      { value: 'google:models/gemini-1.5-pro-latest',   label: 'Gemini 1.5 Pro (Deep Research / Free)' },
      { value: 'google:models/gemini-2.0-flash-exp',    label: 'Gemini 2.0 Flash (Next-Gen Free)' },
    ],
  },
  {
    group: 'OpenAI (Native)',
    provider: 'openai',
    items: [
      { value: 'openai:gpt-4o',         label: 'GPT-4o — Recommended' },
      { value: 'openai:gpt-4-turbo',   label: 'GPT-4 Turbo' },
      { value: 'openai:gpt-3.5-turbo', label: 'GPT-3.5 Turbo — Fast' },
    ],
  },
  {
    group: 'Anthropic (Native)',
    provider: 'anthropic',
    items: [
      { value: 'anthropic:claude-3-5-sonnet-20240620', label: 'Claude 3.5 Sonnet' },
      { value: 'anthropic:claude-3-opus-20240229',      label: 'Claude 3 Opus' },
      { value: 'anthropic:claude-3-haiku-20240307',     label: 'Claude 3 Haiku — Fast' },
    ],
  },
  {
    group: 'Custom / Local (Ollama - 100% Free)',
    provider: 'custom',
    items: [
      { value: 'custom', label: '⚙️ Local Ollama / LM Studio (Free on PC)' },
    ],
  },
];

const PROJECT_TYPES: { type: ProjectType; icon: any; desc: string }[] = [
  { type: 'Blog Post',            icon: FileText, desc: 'Long-form SEO article' },
  { type: 'Newsletter',           icon: Mail,     desc: 'Conversational email copy' },
  { type: 'Social Post',          icon: Share2,   desc: 'High-engagement viral post' },
  { type: 'SEO Optimized Article',icon: Sparkles, desc: 'RankMath & Yoast tuned' },
];

export default function AutoBlogger() {
  const [sites, setSites] = useState<Site[]>([]);
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [configuredKeys, setConfiguredKeys] = useState<Record<string, boolean>>({});

  const [selectedSite, setSelectedSite]         = useState('');
  const [selectedModel, setSelectedModel]       = useState('openrouter:meta-llama/llama-3.1-70b-instruct:free');
  const [customModelName, setCustomModelName]   = useState('');
  const [prompt, setPrompt]                     = useState('');
  const [focusKeyword, setFocusKeyword]         = useState('');
  const [postStatus, setPostStatus]             = useState<'publish' | 'draft'>('publish');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [imagePrompt, setImagePrompt]           = useState('');
  const [autoGenerateImage, setAutoGenerateImage] = useState(true);
  const [selectedType, setSelectedType]         = useState<ProjectType>('Blog Post');
  const [showForm, setShowForm]                 = useState(true);

  // Status, Timer & Progress Tracking
  const [status, setStatus]                     = useState<StatusType>('idle');
  const [statusMsg, setStatusMsg]               = useState('');
  const [secondsElapsed, setSecondsElapsed]     = useState(0);
  const [resultLink, setResultLink]             = useState('');
  const [publishedTitle, setPublishedTitle]     = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = () => {
    fetch('/api/sites')
      .then(r => r.json())
      .then(d => {
        const arr = Array.isArray(d) ? d : [];
        setSites(arr);
        if (arr.length > 0 && !selectedSite) setSelectedSite(arr[0].id);
      })
      .catch(() => setSites([]));

    fetch('/api/posts')
      .then(r => r.json())
      .then(d => setPosts(Array.isArray(d) ? d : []))
      .catch(() => setPosts([]));

    // Check which keys are set to intelligently choose default model
    fetch('/api/settings')
      .then(r => r.json())
      .then(s => {
        const hasOpenRouter = Boolean(s.openRouterApiKey);
        const hasOpenAI     = Boolean(s.openaiApiKey);
        const hasAnthropic  = Boolean(s.anthropicApiKey);
        const hasGemini     = Boolean(s.geminiApiKey);

        setConfiguredKeys({
          openrouter: hasOpenRouter,
          openai:     hasOpenAI,
          anthropic:  hasAnthropic,
          google:     hasGemini,
          custom:     Boolean(s.customApiUrl),
        });

        // Automatically choose the best ready model
        if (hasOpenRouter && !hasOpenAI) {
          setSelectedModel('openrouter:meta-llama/llama-3.1-70b-instruct:free');
        } else if (hasGemini && !hasOpenAI && !hasOpenRouter) {
          setSelectedModel('google:models/gemini-1.5-flash-latest');
        } else if (hasOpenAI) {
          setSelectedModel('openai:gpt-4o');
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleGenerate = async () => {
    if (!selectedSite || !prompt.trim()) return;
    setStatus('generating');
    setSecondsElapsed(0);
    setResultLink('');
    setPublishedTitle('');
    setStatusMsg('1/3 Connecting to Antigravity (Gemini via Gmail)…');

    // Start live elapsed timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsElapsed(sec => {
        const next = sec + 1;
        if (next === 12) {
          setStatusMsg('2/3 Writing deep H2/H3 body content & SEO FAQs via Gemini…');
        } else if (next === 32) {
          setStatusMsg('3/3 Publishing directly to WordPress via OniPress…');
        }
        return next;
      });
    }, 1000);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 300s (5 minutes) safety timeout

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          siteId: selectedSite,
          prompt,
          focusKeyword,
          postStatus,
          contentType: selectedType,
          featuredImageUrl: featuredImageUrl.trim() || undefined,
          imagePrompt: imagePrompt.trim() || undefined,
          autoGenerateImage,
        }),
      });

      clearTimeout(timeoutId);
      if (timerRef.current) clearInterval(timerRef.current);

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: `Server returned non-JSON response (${res.status} ${res.statusText})` };
      }

      if (res.ok) {
        setStatus('success');
        setPublishedTitle(data.title || 'Untitled Post');
        setStatusMsg(`Published to WordPress! (Post #${data.postId})`);
        setResultLink(data.link || '');
        setPrompt('');
        setFocusKeyword('');
        setFeaturedImageUrl('');
        setImagePrompt('');
        fetch('/api/posts')
          .then(r => r.json())
          .then(d => setPosts(Array.isArray(d) ? d : []))
          .catch(() => {});
      } else {
        setStatus('error');
        setStatusMsg(data.error || `Server error (${res.status} ${res.statusText})`);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (timerRef.current) clearInterval(timerRef.current);
      setStatus('error');
      if (err.name === 'AbortError') {
        setStatusMsg('Generation took longer than 5 minutes. The Antigravity CLI process may need to be restarted.');
      } else {
        setStatusMsg(`Error: ${err.message || 'Network connection failed'}`);
      }
    }
  };

  const handleDeletePost = async (id: string) => {
    await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const activeSite = sites.find(s => s.id === selectedSite);
  const activeModelLabel = MODELS.flatMap(g => g.items).find(m => m.value === selectedModel)?.label || selectedModel;

  return (
    <div className="space-y-5">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">Write Blog</h2>
          <p className="text-[11px] text-[#a09070] mt-0.5">
            Universal AI Auto-Blogger with automatic RankMath &amp; Yoast SEO integration.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="oni-btn rounded-full px-4 py-2 text-xs font-bold flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          {showForm ? 'New Project' : '+ New Project'}
        </button>
      </div>

      {/* ── TWO COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ═══ LEFT COLUMN — Project Types & Stats ═══ */}
        <div className="lg:col-span-4 space-y-3">

          <p className="oni-cursive text-[#ff9940] text-lg px-1">New Project</p>

          <div
            className="rounded-xl p-3 space-y-1"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {PROJECT_TYPES.map(({ type, icon: Icon, desc }) => (
              <button
                key={type}
                onClick={() => { setSelectedType(type); setShowForm(true); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-left transition-all ${
                  selectedType === type
                    ? 'bg-white/[0.1] border border-[#ff7a18]/30 text-white font-bold shadow-[0_0_12px_rgba(255,122,24,0.15)]'
                    : 'text-[#a09070] hover:bg-white/[0.05] hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${selectedType === type ? 'text-[#ff7a18]' : 'opacity-50'}`} />
                <div>
                  <div className="font-semibold">{type}</div>
                  <div className="text-[10px] opacity-60">{desc}</div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="oni-btn w-full rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" /> Create New
          </button>

          {/* Quick Metrics Panel */}
          <div
            className="rounded-xl p-3.5 space-y-2 text-xs"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="flex justify-between items-center text-[#a09070]">
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-[#ff7a18]" /> Connected Sites</span>
              <span className="text-[#ff7a18] font-bold">{sites.length}</span>
            </div>
            <div className="flex justify-between items-center text-[#a09070]">
              <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-green-400" /> RankMath SEO</span>
              <span className="text-green-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Active
              </span>
            </div>
            <div className="flex justify-between items-center text-[#a09070]">
              <span className="flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5 text-[#ff9940]" /> MCP Endpoint</span>
              <span className="text-[#ff9940] font-mono text-[10px]">/api/mcp</span>
            </div>
            <div className="flex justify-between items-center text-[#a09070]">
              <span>Posts Published</span>
              <span className="text-white font-bold">{posts.filter(p => p.status === 'Live').length}</span>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN — Generator Form & Recent Activity ═══ */}
        <div className="lg:col-span-8 space-y-5">

          {/* ── GENERATOR FORM ── */}
          {showForm && (
            <div
              className="rounded-xl p-5 space-y-4"
              style={{
                background: 'rgba(0,0,0,0.45)',
                border: '1.5px solid rgba(255, 122, 24, 0.25)',
                boxShadow: '0 0 30px rgba(255, 100, 0, 0.08)',
              }}
            >
              {/* Form header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#ff7a18]" />
                  <span className="text-sm font-bold text-white">
                    Generate: <span className="text-[#ff7a18]">{selectedType}</span>
                  </span>
                </div>
                <span className="text-[10px] text-[#a09070] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  🌿 RankMath &amp; Yoast Ready
                </span>
              </div>

              {/* Row 1: Target Site & AI Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#a09070] uppercase tracking-wide">
                    Target Site {activeSite && <span className="text-[#ff7a18] normal-case">({activeSite.url.replace(/^https?:\/\//, '')})</span>}
                  </label>
                  <Select value={selectedSite} onValueChange={(val) => setSelectedSite(val || '')}>
                    <SelectTrigger className="oni-input h-9 text-xs w-full">
                      <span className="truncate text-white font-medium">
                        {activeSite ? `${activeSite.name} (${activeSite.url.replace(/^https?:\/\//, '')})` : 'Select WordPress site…'}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {sites.length === 0
                        ? <SelectItem value="__none__" disabled>No sites added yet — go to Site Manager</SelectItem>
                        : sites.map(s => (
                          <SelectItem key={s.id} value={s.id} className="text-xs">
                            {s.name} ({s.url.replace(/^https?:\/\//, '')})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                  {/* AI Engine Badge — No API Key Needed */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#a09070] uppercase tracking-wide">AI Engine</label>
                  <div
                    className="flex items-center gap-2 h-9 px-3 rounded-xl"
                    style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block', flexShrink: 0 }}></span>
                    <span className="text-xs text-white font-medium">Antigravity (Gemini via Gmail)</span>
                    <span className="ml-auto text-[10px] text-green-400 font-semibold">● Ready — No API Key</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Focus Keyword + Post Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#a09070] uppercase tracking-wide">
                    Focus Keyword <span className="text-[#a09070]/60 font-normal">(RankMath target)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. best productivity tools for remote teams"
                    value={focusKeyword}
                    onChange={e => setFocusKeyword(e.target.value)}
                    className="w-full rounded-xl text-xs text-white px-3 py-2 focus:outline-none transition-all"
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#faf5ef',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(255,122,24,0.5)'; }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#a09070] uppercase tracking-wide">Publish Status</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPostStatus('publish')}
                      className={`flex-1 py-2 text-xs rounded-xl font-bold transition-all ${
                        postStatus === 'publish'
                          ? 'bg-[#ff7a18] text-black shadow-[0_0_12px_rgba(255,122,24,0.4)]'
                          : 'bg-black/40 text-[#a09070] border border-white/10 hover:text-white'
                      }`}
                    >
                      Publish Live
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostStatus('draft')}
                      className={`flex-1 py-2 text-xs rounded-xl font-bold transition-all ${
                        postStatus === 'draft'
                          ? 'bg-[#ff7a18] text-black shadow-[0_0_12px_rgba(255,122,24,0.4)]'
                          : 'bg-black/40 text-[#a09070] border border-white/10 hover:text-white'
                      }`}
                    >
                      Save as Draft
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Topic / Prompt */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-[#a09070] uppercase tracking-wide">Topic / Prompt Instructions</label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl text-xs text-white resize-none focus:outline-none transition-all"
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '10px 12px',
                    color: '#faf5ef',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(255,122,24,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,122,24,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                  placeholder="e.g. 'Write a comprehensive guide comparing the top 7 productivity tools for remote teams in 2026. Highlight key features, pricing comparison, pros and cons table, and FAQ.'"
                />
              </div>

              {/* Row 4: Featured Image Options */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#a09070] uppercase tracking-wide flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#ff7a18]" />
                    Featured Image <span className="text-[#a09070]/60 font-normal">(Optional)</span>
                  </label>
                  <span className="text-[10px] text-[#ff9940]">Antigravity IDE Google Imagen or Direct URL</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#a09070]">Image Prompt (generate tailored image for this article)</label>
                    <input
                      type="text"
                      placeholder="e.g. 'Modern minimalist workspace with laptop and notebook, warm ambient sunlight, 8k'"
                      value={imagePrompt}
                      onChange={e => setImagePrompt(e.target.value)}
                      className="w-full rounded-xl text-xs text-white px-3 py-2 focus:outline-none transition-all"
                      style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#faf5ef',
                      }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(255,122,24,0.5)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-[#a09070]">Direct Image URL (or leave blank to use Image Prompt / smart topic)</label>
                    <input
                      type="url"
                      placeholder="https://... (direct URL from media library or CDN)"
                      value={featuredImageUrl}
                      onChange={e => setFeaturedImageUrl(e.target.value)}
                      className="w-full rounded-xl text-xs text-white px-3 py-2 focus:outline-none transition-all"
                      style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#faf5ef',
                      }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(255,122,24,0.5)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    />
                  </div>
                </div>

                <p className="text-[10px] text-[#a09070] pl-1">
                  ✨ Leave both blank for an automated topic-matched visual, enter an <strong>Image Prompt</strong> to generate a tailored image, or paste an exact <strong>Image URL</strong>.
                </p>
              </div>

              {/* Status Alert with Live Timer and Progressive Feedback */}
              {status !== 'idle' && (
                <div
                  className="p-4 rounded-xl text-xs space-y-2 transition-all"
                  style={{
                    background: status === 'success' ? 'rgba(34,197,94,0.1)' : status === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(255,122,24,0.1)',
                    border: `1px solid ${status === 'success' ? 'rgba(34,197,94,0.35)' : status === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(255,122,24,0.35)'}`,
                    color: status === 'success' ? '#86efac' : status === 'error' ? '#fca5a5' : '#ffb266',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {status === 'generating' && <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#ff7a18]" />}
                      {status === 'success'    && <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />}
                      {status === 'error'      && <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
                      <span className="font-semibold text-white">{statusMsg}</span>
                    </div>

                    {status === 'generating' && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#ff7a18] bg-black/40 px-2 py-0.5 rounded-md border border-[#ff7a18]/20">
                        <Clock className="w-3 h-3 animate-pulse" /> {secondsElapsed}s
                      </span>
                    )}
                  </div>

                  {status === 'generating' && (
                    <p className="text-[10px] text-[#a09070] pl-6">
                      ✨ Antigravity (Gemini via Gmail) is writing a 1,500+ word SEO article. This takes 30–60 seconds — please keep this tab open!
                    </p>
                  )}

                  {publishedTitle && (
                    <p className="text-white text-xs pl-6">
                      Title: <strong>{publishedTitle}</strong>
                    </p>
                  )}

                  {resultLink && (
                    <div className="pt-1 pl-6">
                      <a
                        href={resultLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 underline text-[#ff7a18] hover:text-[#ffa04d] font-bold text-xs"
                      >
                        View live post on WordPress <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Action */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#a09070]">
                  Target Site: <strong className="text-white">{activeSite?.name || 'No site selected'}</strong>
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={status === 'generating' || !selectedSite || !prompt.trim()}
                  className="oni-btn rounded-xl px-7 py-2.5 text-xs font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {status === 'generating' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating ({secondsElapsed}s)…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate &amp; Publish
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── RECENT CONTENT TABLE ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="oni-cursive text-[#ff9940] text-lg">Recent Content Activity</p>
              <span className="text-[10px] text-[#a09070]">{posts.length} posts recorded</span>
            </div>

            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}
            >
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th className="py-2.5 px-4 text-[#a09070] font-medium">Post</th>
                    <th className="py-2.5 px-3 text-[#a09070] font-medium">Status</th>
                    <th className="py-2.5 px-3 text-[#a09070] font-medium">Date</th>
                    <th className="py-2.5 px-3 text-[#a09070] font-medium">SEO</th>
                    <th className="py-2.5 px-3 text-right text-[#a09070] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#a09070] text-xs">
                        No posts published yet. Select a site and generate your first article above!
                      </td>
                    </tr>
                  ) : (
                    posts.map((post, i) => (
                      <tr
                        key={post.id}
                        style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-lg bg-[#ff7a18]/10 border border-[#ff7a18]/20 flex items-center justify-center shrink-0">
                              <FileText className="w-3 h-3 text-[#ff7a18]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate max-w-[220px]">{post.title}</p>
                              <p className="text-[10px] text-[#a09070] truncate">{post.siteName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            post.status === 'Live'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${post.status === 'Live' ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
                            {post.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[#a09070] whitespace-nowrap text-[11px]">{post.date}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-bold text-[#ff7a18] text-[11px]">{post.performance}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {post.postUrl && (
                              <a
                                href={post.postUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-white/10 text-[#a09070] hover:text-white transition-colors"
                                title="View on WordPress"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-red-500/20 text-[#a09070] hover:text-red-400 transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>{/* /right col */}
      </div>{/* /grid */}
    </div>
  );
}
