'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Send,
  RefreshCw,
  Key,
  Globe,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  FileJson,
  TrendingUp,
  MousePointer,
  Eye,
  Percent
} from 'lucide-react';

interface GscConfig {
  clientEmail: string;
  privateKey: string;
  autoIndexOnPublish: boolean;
  status: 'unconfigured' | 'connected' | 'error';
  lastChecked?: string;
  lastError?: string;
  hasPrivateKey?: boolean;
  privateKeyPreview?: string;
}

interface GscLog {
  id: string;
  url: string;
  type: 'URL_UPDATED' | 'URL_DELETED';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  submittedAt: string;
  responseMessage?: string;
}

interface PerformanceRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface PerformanceSummary {
  clicks: number;
  impressions: number;
  averageCtr: number;
  averagePosition: number;
  rows: PerformanceRow[];
}

interface Ga4PerformanceSummary {
  screenPageViews: number;
  activeUsers: number;
  bounceRate: number;
  averageSessionDuration: number;
  topPages: { path: string; views: number }[];
}

export default function GscManager() {
  const [config, setConfig] = useState<GscConfig>({
    clientEmail: '',
    privateKey: '',
    autoIndexOnPublish: true,
    status: 'unconfigured',
  });
  const [rawJsonInput, setRawJsonInput] = useState('');
  const [testUrl, setTestUrl] = useState('');
  const [logs, setLogs] = useState<GscLog[]>([]);
  const [performance, setPerformance] = useState<PerformanceSummary | null>(null);
  const [perfError, setPerfError] = useState<string | null>(null);
  const [ga4Performance, setGa4Performance] = useState<Ga4PerformanceSummary | null>(null);
  const [ga4PerfError, setGa4PerfError] = useState<string | null>(null);
  
  const [sites, setSites] = useState<{id: string, name: string, url: string, gscUrl?: string}[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [indexingLoading, setIndexingLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchSites = async () => {
    const res = await fetch('/api/sites');
    return res.json();
  };

  const fetchGscData = async () => {
    const res = await fetch('/api/gsc');
    return res.json();
  };

  const loadData = () => {
    setLoading(true);
    fetchGscData()
      .then(data => {
        if (data.success) {
          setConfig(data.config || {});
          setLogs(data.logs || []);
        }
      })
      .catch(() => {
        setFeedback({ type: 'error', msg: 'Failed to load Search Console configuration' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchLivePerformanceForSite = async (siteId: string) => {
    try {
      const res = await fetch('/api/gsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch_metrics', siteId })
      });
      const data = await res.json();
      if (data.success) {
        setPerformance(data.metrics || null);
        setPerfError(null);
      } else {
        setPerfError(data.error);
        setPerformance(null);
      }
    } catch (e) {
      setPerfError('Failed to load GSC performance');
    }

    try {
      const res = await fetch('/api/gsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch_ga4_metrics', siteId })
      });
      const data = await res.json();
      if (data.success) {
        setGa4Performance(data.metrics || null);
        setGa4PerfError(null);
      } else {
        setGa4PerfError(data.error);
        setGa4Performance(null);
      }
    } catch (e) {
      setGa4PerfError('Failed to load GA4 performance');
    }
  };

  useEffect(() => {
    fetchSites().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setSites(data);
        setSelectedSiteId(data[0].id);
        fetchLivePerformanceForSite(data[0].id);
      }
    });

    fetchGscData()
      .then(data => {
        if (data.success) {
          setConfig(data.config || {});
          setLogs(data.logs || []);
        }
      })
      .catch(() => {
        setFeedback({ type: 'error', msg: 'Failed to load Search Console configuration' });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.client_email && parsed.private_key) {
          setConfig((prev) => ({
            ...prev,
            clientEmail: parsed.client_email,
            privateKey: parsed.private_key,
          }));
          setRawJsonInput(text);
          setFeedback({ type: 'success', msg: 'Service account JSON parsed successfully!' });
        } else {
          setFeedback({ type: 'error', msg: 'Invalid JSON file. Missing client_email or private_key.' });
        }
      } catch {
        setFeedback({ type: 'error', msg: 'Failed to parse JSON file' });
      }
    };
    reader.readAsText(file);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setFeedback(null);

      const res = await fetch('/api/gsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_config',
          clientEmail: config.clientEmail,
          privateKey: config.privateKey,
          autoIndexOnPublish: config.autoIndexOnPublish,
          rawJson: rawJsonInput || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', msg: data.message });
        loadData();
      } else {
        setFeedback({ type: 'error', msg: data.lastError || data.error || 'Failed to verify credentials' });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({ type: 'error', msg: errorMsg || 'Error saving settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleIndexUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl.trim()) return;

    try {
      setIndexingLoading(true);
      setFeedback(null);

      const res = await fetch('/api/gsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'index_url',
          url: testUrl.trim(),
          type: 'URL_UPDATED',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', msg: data.message || 'Indexing request submitted to Google!' });
        setTestUrl('');
        loadData();
      } else {
        setFeedback({ type: 'error', msg: data.error || data.message || 'Indexing request rejected by Google' });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({ type: 'error', msg: errorMsg || 'Failed to submit indexing request' });
    } finally {
      setIndexingLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#0047FF]/20 to-[#0047FF]/10 border border-[#0047FF]/30">
              <Search className="w-6 h-6 text-[#0047FF]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Google Search Console &amp; Fast Indexing
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  100% Free Official API
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct Googlebot indexing within minutes + Search Analytics telemetry with zero middleman.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#0047FF] hover:text-slate-900 px-3 py-1.5 rounded-lg border border-[#0047FF]/30 hover:border-[#0047FF] transition-all bg-slate-50"
          >
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showGuide ? 'Hide Setup Guide' : 'Setup Guide (5 Mins)'}
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── NOTIFICATIONS ── */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span className="flex-1 font-mono">{feedback.msg}</span>
        </div>
      )}

      {/* ── STEP-BY-STEP SETUP GUIDE (EXPANDABLE) ── */}
      {showGuide && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0047FF]" />
              How to Link Google Search Console for Free (Step-by-Step)
            </h3>
            <a
              href="https://console.cloud.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#0047FF] hover:underline flex items-center gap-1"
            >
              Open Google Cloud Console <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-[#0047FF] text-white text-[11px] flex items-center justify-center font-extrabold">1</span>
                Create Project &amp; Enable Free APIs
              </div>
              <p className="text-slate-500 leading-relaxed">
                Go to <strong>Google Cloud Console</strong> &rarr; Create a project (e.g. <code className="text-[#0047FF]">OniPress-SEO</code>). Under <strong>APIs &amp; Services &rarr; Library</strong>, search and enable both:
              </p>
              <ul className="list-disc list-inside text-slate-900 space-y-1 font-mono text-[11px]">
                <li>Web Search Indexing API</li>
                <li>Google Search Console API</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-[#0047FF] text-white text-[11px] flex items-center justify-center font-extrabold">2</span>
                Create Service Account &amp; Download Key
              </div>
              <p className="text-slate-500 leading-relaxed">
                Navigate to <strong>IAM &amp; Admin &rarr; Service Accounts</strong> &rarr; Click <strong>Create Service Account</strong>. Name it <code className="text-[#0047FF]">onipress-bot</code>. Open the newly created account &rarr; <strong>Keys</strong> tab &rarr; <strong>Add Key &rarr; Create New Key (JSON)</strong>. Save this file to your computer.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-[#0047FF] text-white text-[11px] flex items-center justify-center font-extrabold">3</span>
                Add Service Account to Search Console
              </div>
              <p className="text-slate-500 leading-relaxed">
                Open <a href="https://search.google.com/search-console" target="_blank" className="text-[#0047FF] underline">Google Search Console</a>. Select your property &rarr; <strong>Settings &rarr; Users and permissions</strong> &rarr; <strong>Add user</strong>. Enter the Service Account Email (e.g. <code className="text-emerald-400">...@...iam.gserviceaccount.com</code>) and set Permission to <strong>Owner</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span className="w-5 h-5 rounded-full bg-[#0047FF] text-white text-[11px] flex items-center justify-center font-extrabold">4</span>
                Connect &amp; Test Live Indexing
              </div>
              <p className="text-slate-500 leading-relaxed">
                Upload your downloaded JSON key below (or paste its content) and click <strong>Verify &amp; Save</strong>. Then, go to the <strong>Sites</strong> tab to add the specific Google Search Console URLs for each of your connected WordPress sites!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── CONNECTION STATUS BADGE ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${
            config.status === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {config.status === 'connected' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-semibold">GSC Auth Status</div>
            <div className="text-sm font-bold text-slate-900 capitalize flex items-center gap-1.5">
              {config.status === 'connected' ? 'Connected & Verified' : config.status === 'error' ? 'Auth Error' : 'Not Configured'}
              {config.status === 'connected' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Auto-Indexing on Publish</div>
            <div className="text-sm font-bold text-slate-900">
              {config.autoIndexOnPublish ? 'Enabled (Instant)' : 'Disabled'}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN SETTINGS & MANUAL INDEXER GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Credentials Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#0047FF]" />
              Google Service Account Credentials
            </h3>

            {/* JSON File Upload Button */}
            <div className="p-3.5 rounded-xl border border-dashed border-[#0047FF]/40 bg-[#0047FF]/5 flex flex-col items-center justify-center text-center gap-2">
              <UploadCloud className="w-6 h-6 text-[#0047FF]" />
              <div className="text-xs text-slate-900 font-medium">
                Upload Google Cloud Service Account JSON Key
              </div>
              <label className="cursor-pointer px-3.5 py-1.5 rounded-lg bg-[#0047FF] hover:bg-[#0037cc] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm">
                <FileJson className="w-3.5 h-3.5" />
                Select .json Key File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleJsonUpload}
                  className="hidden"
                />
              </label>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  Service Account Client Email
                </label>
                <input
                  type="email"
                  value={config.clientEmail}
                  onChange={(e) => setConfig({ ...config, clientEmail: e.target.value })}
                  placeholder="onipress-bot@your-project-id.iam.gserviceaccount.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0047FF] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1 flex items-center justify-between">
                  <span>RSA Private Key (PEM format)</span>
                  {config.hasPrivateKey && (
                    <span className="text-[10px] text-emerald-400 font-mono">Key Loaded in Database</span>
                  )}
                </label>
                <textarea
                  rows={4}
                  value={config.privateKey}
                  onChange={(e) => setConfig({ ...config, privateKey: e.target.value })}
                  placeholder="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0047FF] font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-900 font-medium">
                  <input
                    type="checkbox"
                    checked={config.autoIndexOnPublish}
                    onChange={(e) => setConfig({ ...config, autoIndexOnPublish: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 text-[#0047FF] focus:ring-[#0047FF] bg-white"
                  />
                  <span>Auto-Ping Google Indexing API when post is published</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#0047FF] hover:bg-[#0037cc] text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Verify &amp; Save GSC Credentials
                </button>
              </div>
            </form>
          </div>

          {/* Manual URL Fast Indexer */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              Instant Googlebot Indexing Request
            </h3>
            <p className="text-xs text-slate-500">
              Submit any published post or page URL directly to Google Web Search Indexing API v3. Googlebot will crawl the page within minutes.
            </p>

            <form onSubmit={handleIndexUrl} className="flex gap-2">
              <input
                type="url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://myblog.com/new-article-slug/"
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                required
              />
              <button
                type="submit"
                disabled={indexingLoading || config.status !== 'connected'}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                {indexingLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Ping Googlebot
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Search Performance Telemetry */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900">Google Search Analytics</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={selectedSiteId}
                  onChange={(e) => {
                    setSelectedSiteId(e.target.value);
                    if (e.target.value) fetchLivePerformanceForSite(e.target.value);
                  }}
                  className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs text-slate-900 outline-none focus:border-[#0047FF]"
                >
                  <option value="">Select a Site...</option>
                  {sites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <span className="text-[10px] font-mono text-slate-500">Last 28 Days</span>
              </div>
            </div>

            {performance ? (
              <div className="space-y-4">
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Clicks</span>
                      <MousePointer className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-1">{performance.clicks.toLocaleString()}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Impressions</span>
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-1">{performance.impressions.toLocaleString()}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Average CTR</span>
                      <Percent className="w-3.5 h-3.5 text-[#0047FF]" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-1">{performance.averageCtr}%</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Avg Position</span>
                      <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-1">#{performance.averagePosition}</div>
                  </div>
                </div>

                {/* Top Ranking Queries */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase mb-2">
                    Top Ranking Queries on Google
                  </div>
                  {performance.rows && performance.rows.length > 0 ? (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {performance.rows.slice(0, 8).map((row, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                        >
                          <span className="text-slate-900 font-medium truncate max-w-[170px]">{row.keys[0]}</span>
                          <div className="flex items-center gap-2.5 text-[11px] font-mono text-slate-500">
                            <span className="text-emerald-400">{row.clicks} clicks</span>
                            <span>pos #{Math.round(row.position)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No query impressions recorded yet in the last 28 days.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                <Globe className="w-8 h-8 text-slate-900/20 mx-auto" />
                <p>
                  {perfError ? (
                    <span className="text-rose-400 font-mono text-[11px]">{perfError}</span>
                  ) : (
                    'Connect your Google Service Account to view live Google clicks and search rankings.'
                  )}
                </p>
              </div>
            )}
          </div>

          {/* GA4 Telemetry */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900">Google Analytics (GA4)</h3>
            </div>

            {ga4Performance ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Page Views</span>
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-1">{ga4Performance.screenPageViews.toLocaleString()}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Active Users</span>
                      <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-1">{ga4Performance.activeUsers.toLocaleString()}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Bounce Rate</span>
                      <Percent className="w-3.5 h-3.5 text-[#0047FF]" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-1">{ga4Performance.bounceRate}%</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Avg Session</span>
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="text-xl font-bold text-slate-900 mt-1">{ga4Performance.averageSessionDuration}s</div>
                  </div>
                </div>

                {/* Top GA4 Pages */}
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase mb-2">
                    Top Pages (Views)
                  </div>
                  {ga4Performance.topPages && ga4Performance.topPages.length > 0 ? (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {ga4Performance.topPages.map((page, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                          <span className="text-slate-900 font-medium truncate max-w-[200px]">{page.path}</span>
                          <div className="flex items-center gap-2.5 text-[11px] font-mono text-slate-500">
                            <span className="text-emerald-400">{page.views} views</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No page views recorded yet in the last 28 days.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                <Globe className="w-8 h-8 text-slate-900/20 mx-auto" />
                <p>
                  {ga4PerfError ? (
                    <span className="text-rose-400 font-mono text-[11px]">{ga4PerfError}</span>
                  ) : (
                    'Add a GA4 Property ID in the Site Manager to view traffic.'
                  )}
                </p>
              </div>
            )}
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Recent Indexing Submissions
            </h3>
            {logs.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                {logs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {log.status}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.submittedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-slate-900 font-mono truncate text-[11px]">{log.url}</div>
                    {log.responseMessage && (
                      <div className="text-[10px] text-slate-500 truncate">{log.responseMessage}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                No URLs submitted yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
