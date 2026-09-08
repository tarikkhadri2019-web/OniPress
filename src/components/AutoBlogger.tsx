'use client';

import { useState, useEffect, useRef } from 'react';
import { Site, PostRecord } from '@/lib/db';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import {
  FileText, Mail, Share2, Sparkles, Plus, Loader2,
  CheckCircle2, AlertCircle, ExternalLink, Trash2, Globe, KeyRound, Image as ImageIcon, Clock
} from 'lucide-react';

type StatusType = 'idle' | 'generating' | 'success' | 'error';
type ProjectType = 'Blog Post' | 'Newsletter' | 'Social Post' | 'SEO Optimized Article';

const PROJECT_TYPES: { type: ProjectType; icon: React.ElementType; desc: string }[] = [
  { type: 'Blog Post', icon: FileText, desc: 'Long-form SEO article' },
  { type: 'Newsletter', icon: Mail, desc: 'Conversational email copy' },
  { type: 'Social Post', icon: Share2, desc: 'High-engagement viral post' },
  { type: 'SEO Optimized Article', icon: Sparkles, desc: 'RankMath & Yoast tuned' },
];

export default function AutoBlogger() {
  const [sites, setSites] = useState<Site[]>([]);
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [prompt, setPrompt] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [postStatus, setPostStatus] = useState<'publish' | 'draft'>('publish');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [selectedType, setSelectedType] = useState<ProjectType>('Blog Post');
  const [showForm, setShowForm] = useState(true);
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Status, Timer & Progress Tracking
  const [status, setStatus] = useState<StatusType>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [resultLink, setResultLink] = useState('');
  const [publishedTitle, setPublishedTitle] = useState('');

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
    setStatusMsg('Antigravity Gemini engine is orchestrating content pipeline…');
    setResultLink('');
    setPublishedTitle('');
    setSecondsElapsed(0);

    timerRef.current = setInterval(() => {
      setSecondsElapsed(s => s + 1);
    }, 1000);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: selectedSite,
          model: 'google:gemini-2.5-flash',
          prompt,
          focusKeyword,
          postStatus,
          featuredImageUrl,
          imagePrompt,
          autoGenerateImage: true,
          projectType: selectedType,
          youtubeUrl,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (timerRef.current) clearInterval(timerRef.current);

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setStatusMsg(data.message || 'Article published to WordPress successfully!');
        if (data.postUrl) setResultLink(data.postUrl);
        if (data.title) setPublishedTitle(data.title);

        setPrompt('');
        setFocusKeyword('');
        setFeaturedImageUrl('');
        setImagePrompt('');
        setYoutubeUrl('');

        fetch('/api/posts')
          .then(r => r.json())
          .then(d => setPosts(Array.isArray(d) ? d : []))
          .catch(() => { });
      } else {
        setStatus('error');
        setStatusMsg(data.error || `Server error (${res.status} ${res.statusText})`);
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (timerRef.current) clearInterval(timerRef.current);
      setStatus('error');
      if ((err as Error).name === 'AbortError') {
        setStatusMsg('Generation took longer than 5 minutes. The Antigravity CLI process may need to be restarted.');
      } else {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setStatusMsg(`Error: ${errorMsg || 'Network connection failed'}`);
      }
    }
  };

  const handleDeletePost = async (id: string) => {
    await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const activeSite = sites.find(s => s.id === selectedSite);

  return (
    <div className="space-y-5">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Copywriting Engine</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Autonomous multi-agent blog writer with automatic RankMath &amp; Yoast SEO optimization.
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 text-white bg-[#0047FF] hover:bg-[#0037cc] transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          {showForm ? 'New Project' : '+ New Project'}
        </button>
      </div>

      {/* ── TWO COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ═══ LEFT COLUMN — Project Types & Stats ═══ */}
        <div className="lg:col-span-4 space-y-4">

          <h3 className="font-bold text-slate-900 text-sm">Project Type</h3>

          <div className="rounded-xl p-2 space-y-1 bg-slate-50 border border-slate-200">
            {PROJECT_TYPES.map(({ type, icon: Icon, desc }) => (
              <button
                key={type}
                onClick={() => { setSelectedType(type); setShowForm(true); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-left transition-all cursor-pointer ${
                  selectedType === type
                    ? 'bg-[#0047FF] text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${selectedType === type ? 'text-white' : 'text-slate-400'}`} />
                <div>
                  <div className="font-semibold">{type}</div>
                  <div className={`text-[10px] ${selectedType === type ? 'text-white/80' : 'text-slate-400'}`}>{desc}</div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3] text-[#0047FF]" /> Create New Document
          </button>

          {/* Quick Metrics Panel */}
          <div className="rounded-xl p-4 space-y-2.5 text-xs bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5 font-medium"><Globe className="w-3.5 h-3.5 text-[#0047FF]" /> Connected Sites</span>
              <span className="text-slate-900 font-bold">{sites.length}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5 font-medium"><Sparkles className="w-3.5 h-3.5 text-[#0047FF]" /> RankMath SEO</span>
              <span className="text-[#0047FF] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0047FF]" /> Active 100/100
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5 font-medium"><KeyRound className="w-3.5 h-3.5 text-[#0047FF]" /> Protocol</span>
              <span className="text-slate-700 font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">MCP REST API</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200">
              <span className="font-medium">Articles Published</span>
              <span className="text-slate-900 font-bold">{posts.filter(p => p.status === 'Live').length}</span>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN — Generator Form & Recent Activity ═══ */}
        <div className="lg:col-span-8 space-y-5">

          {/* ── GENERATOR FORM ── */}
          {showForm && (
            <div className="rounded-xl p-5 space-y-4 bg-slate-50 border border-slate-200/90 shadow-2xs">
              {/* Form header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0047FF]" />
                  <span className="text-sm font-bold text-slate-900">
                    Draft Article: <span className="text-[#0047FF]">{selectedType}</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-600 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 font-semibold">
                  RankMath 100/100 Tuned
                </span>
              </div>

              {/* Row 1: Target Site & AI Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                    Target Site {activeSite && <span className="text-[#0047FF] font-normal normal-case">({activeSite.url.replace(/^https?:\/\//, '')})</span>}
                  </label>
                  <Select value={selectedSite} onValueChange={(val) => setSelectedSite(val || '')}>
                    <SelectTrigger className="h-9 text-xs w-full bg-white border border-slate-200 text-slate-900">
                      <span className="truncate text-slate-900 font-medium">
                        {activeSite ? `${activeSite.name} (${activeSite.url.replace(/^https?:\/\//, '')})` : 'Select WordPress site…'}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {sites.length === 0
                        ? <SelectItem value="__none__" disabled>No sites added yet — go to Fleet Matrix</SelectItem>
                        : sites.map(s => (
                          <SelectItem key={s.id} value={s.id} className="text-xs">
                            {s.name} ({s.url.replace(/^https?:\/\//, '')})
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                {/* AI Engine Badge */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">AI Engine</label>
                  <div className="flex items-center gap-2 h-9 px-3 rounded-xl bg-white border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-[#0047FF] inline-block shrink-0" />
                    <span className="text-xs text-slate-900 font-medium">Antigravity (Zero-Cost Gemini)</span>
                    <span className="ml-auto text-[10px] text-[#0047FF] font-bold">● Active</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Focus Keyword + Post Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                    Focus Keyword <span className="text-slate-400 font-normal">(RankMath target)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. best productivity tools for remote teams"
                    value={focusKeyword}
                    onChange={e => setFocusKeyword(e.target.value)}
                    className="w-full rounded-xl text-xs text-slate-900 px-3 py-2 bg-white border border-slate-200 focus:outline-none focus:border-[#0047FF] focus:ring-2 focus:ring-[#0047FF]/15 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Publish Status</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPostStatus('publish')}
                      className={`flex-1 py-2 text-xs rounded-xl font-bold transition-all cursor-pointer ${
                        postStatus === 'publish'
                          ? 'bg-[#0047FF] text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Publish Live
                    </button>
                    <button
                      type="button"
                      onClick={() => setPostStatus('draft')}
                      className={`flex-1 py-2 text-xs rounded-xl font-bold transition-all cursor-pointer ${
                        postStatus === 'draft'
                          ? 'bg-[#0047FF] text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Save as Draft
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 3: Topic / Prompt */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Article Topic / Directives</label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl text-xs text-slate-900 resize-none p-3 bg-white border border-slate-200 focus:outline-none focus:border-[#0047FF] focus:ring-2 focus:ring-[#0047FF]/15 transition-all"
                  placeholder="e.g. 'Write an authoritative 2,000-word comparison on modern GPS tracking fleet platforms in 2026. Include technical features, pricing comparison, pros/cons, and FAQ.'"
                />
              </div>

              {/* Row 4: Featured Image Options */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#0047FF]" />
                    Featured Image <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <span className="text-[10px] text-[#0047FF] font-medium">Automatic 16:9 8K Generator</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-medium">Image Prompt (tailored visual)</label>
                    <input
                      type="text"
                      placeholder="e.g. 'Modern minimalist workspace, cobalt accents, 8k'"
                      value={imagePrompt}
                      onChange={e => setImagePrompt(e.target.value)}
                      className="w-full rounded-xl text-xs text-slate-900 px-3 py-2 bg-white border border-slate-200 focus:outline-none focus:border-[#0047FF] focus:ring-2 focus:ring-[#0047FF]/15 transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-medium">Direct Image URL</label>
                    <input
                      type="url"
                      placeholder="https://... (direct URL from media library)"
                      value={featuredImageUrl}
                      onChange={e => setFeaturedImageUrl(e.target.value)}
                      className="w-full rounded-xl text-xs text-slate-900 px-3 py-2 bg-white border border-slate-200 focus:outline-none focus:border-[#0047FF] focus:ring-2 focus:ring-[#0047FF]/15 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: YouTube Video Link */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                  YouTube Video Link <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  className="w-full rounded-xl text-xs text-slate-900 px-3 py-2 bg-white border border-slate-200 focus:outline-none focus:border-[#0047FF] focus:ring-2 focus:ring-[#0047FF]/15 transition-all"
                />
              </div>

              {/* Status Alert with Live Feedback */}
              {status !== 'idle' && (
                <div
                  className={`p-4 rounded-xl text-xs space-y-2 transition-all ${
                    status === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : status === 'error'
                      ? 'bg-red-50 border border-red-200 text-red-800'
                      : 'bg-[#0047FF]/5 border border-[#0047FF]/20 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {status === 'generating' && <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[#0047FF]" />}
                      {status === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
                      {status === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />}
                      <span className="font-bold">{statusMsg}</span>
                    </div>

                    {status === 'generating' && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#0047FF] bg-white px-2 py-0.5 rounded border border-[#0047FF]/20">
                        <Clock className="w-3 h-3 animate-pulse" /> {secondsElapsed}s
                      </span>
                    )}
                  </div>

                  {status === 'generating' && (
                    <p className="text-[10px] text-slate-500 pl-6">
                      Gemini is generating deep structure and sideloading directly into your WordPress REST API.
                    </p>
                  )}

                  {publishedTitle && (
                    <p className="text-slate-900 text-xs pl-6">
                      Title: <strong>{publishedTitle}</strong>
                    </p>
                  )}

                  {resultLink && (
                    <div className="pt-1 pl-6">
                      <a
                        href={resultLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 underline text-[#0047FF] hover:underline font-bold text-xs"
                      >
                        View live post on WordPress <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Submit Action */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Target Site: <strong className="text-slate-900">{activeSite?.name || 'No site selected'}</strong>
                </span>
                <button
                  onClick={handleGenerate}
                  disabled={status === 'generating' || !selectedSite || !prompt.trim()}
                  className="rounded-xl px-7 py-2.5 text-xs font-bold flex items-center gap-2 text-white bg-[#0047FF] hover:bg-[#0037cc] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  {status === 'generating' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating ({secondsElapsed}s)…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate &amp; Sideload Post
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── RECENT CONTENT TABLE ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Recent Content Activity</h3>
              <span className="text-[11px] text-slate-500 font-medium">{posts.length} posts recorded</span>
            </div>

            <div className="rounded-xl overflow-hidden bg-white border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-2.5 px-4 text-slate-600 font-semibold">Post</th>
                    <th className="py-2.5 px-3 text-slate-600 font-semibold">Status</th>
                    <th className="py-2.5 px-3 text-slate-600 font-semibold">Date</th>
                    <th className="py-2.5 px-3 text-slate-600 font-semibold">SEO</th>
                    <th className="py-2.5 px-3 text-right text-slate-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        No posts published yet. Select a site and generate your first article above!
                      </td>
                    </tr>
                  ) : (
                    posts.map(post => (
                      <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-lg bg-[#0047FF]/10 border border-[#0047FF]/20 flex items-center justify-center shrink-0">
                              <FileText className="w-3 h-3 text-[#0047FF]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-[240px]">{post.title}</p>
                              <p className="text-[10px] text-slate-400 truncate">{post.siteName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            {post.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap text-[11px]">{post.date}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-bold text-[#0047FF] text-[11px]">{post.performance}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {post.postUrl && (
                              <a
                                href={post.postUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-slate-100 text-slate-400 hover:text-[#0047FF] transition-colors"
                                title="View on WordPress"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
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
