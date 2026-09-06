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
  siteUrl: string;
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

export default function GscManager() {
  const [config, setConfig] = useState<GscConfig>({
    siteUrl: '',
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
  
  const [loading, setLoading] = useState(false);
  const [indexingLoading, setIndexingLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

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
          setPerformance(data.livePerformance || null);
          setPerfError(data.performanceError || null);
        }
      })
      .catch(() => {
        setFeedback({ type: 'error', msg: 'Failed to load Search Console configuration' });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGscData()
      .then(data => {
        if (data.success) {
          setConfig(data.config || {});
          setLogs(data.logs || []);
          setPerformance(data.livePerformance || null);
          setPerfError(data.performanceError || null);
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
          siteUrl: config.siteUrl,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#ff7a18]/20 to-[#ff9940]/10 border border-[#ff7a18]/30">
              <Search className="w-6 h-6 text-[#ff7a18]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Google Search Console &amp; Fast Indexing
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  100% Free Official API
                </span>
              </h2>
              <p className="text-xs text-[#a09070] mt-0.5">
                Direct Googlebot indexing within minutes + Search Analytics telemetry with zero middleman.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#ff9940] hover:text-white px-3 py-1.5 rounded-lg border border-[#ff7a18]/30 hover:border-[#ff7a18] transition-all bg-white/[0.03]"
          >
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showGuide ? 'Hide Setup Guide' : 'Setup Guide (5 Mins)'}
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg border border-white/10 text-[#a09070] hover:text-white hover:bg-white/5 transition-all"
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
        <div className="p-5 rounded-2xl bg-black/60 border border-[#ff7a18]/30 space-y-4 shadow-[0_0_30px_rgba(255,122,24,0.1)]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#ff7a18]" />
              How to Link Google Search Console for Free (Step-by-Step)
            </h3>
            <a
              href="https://console.cloud.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#ff9940] hover:underline flex items-center gap-1"
            >
              Open Google Cloud Console <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <span className="w-5 h-5 rounded-full bg-[#ff7a18] text-black text-[11px] flex items-center justify-center font-extrabold">1</span>
                Create Project &amp; Enable Free APIs
              </div>
              <p className="text-[#a09070] leading-relaxed">
                Go to <strong>Google Cloud Console</strong> &rarr; Create a project (e.g. <code className="text-[#ff9940]">OniPress-SEO</code>). Under <strong>APIs &amp; Services &rarr; Library</strong>, search and enable both:
              </p>
              <ul className="list-disc list-inside text-white/90 space-y-1 font-mono text-[11px]">
                <li>Web Search Indexing API</li>
                <li>Google Search Console API</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <span className="w-5 h-5 rounded-full bg-[#ff7a18] text-black text-[11px] flex items-center justify-center font-extrabold">2</span>
                Create Service Account &amp; Download Key
              </div>
              <p className="text-[#a09070] leading-relaxed">
                Navigate to <strong>IAM &amp; Admin &rarr; Service Accounts</strong> &rarr; Click <strong>Create Service Account</strong>. Name it <code className="text-[#ff9940]">onipress-bot</code>. Open the newly created account &rarr; <strong>Keys</strong> tab &rarr; <strong>Add Key &rarr; Create New Key (JSON)</strong>. Save this file to your computer.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <span className="w-5 h-5 rounded-full bg-[#ff7a18] text-black text-[11px] flex items-center justify-center font-extrabold">3</span>
                Add Service Account to Search Console
              </div>
              <p className="text-[#a09070] leading-relaxed">
                Open <a href="https://search.google.com/search-console" target="_blank" className="text-[#ff9940] underline">Google Search Console</a>. Select your property &rarr; <strong>Settings &rarr; Users and permissions</strong> &rarr; <strong>Add user</strong>. Enter the Service Account Email (e.g. <code className="text-emerald-400">...@...iam.gserviceaccount.com</code>) and set Permission to <strong>Owner</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <span className="w-5 h-5 rounded-full bg-[#ff7a18] text-black text-[11px] flex items-center justify-center font-extrabold">4</span>
                Connect &amp; Test Live Indexing
              </div>
              <p className="text-[#a09070] leading-relaxed">
                Upload your downloaded JSON key below (or paste its content). Enter your verified Site URL. Click <strong>Verify &amp; Save</strong>. Once connected, your articles will automatically ping Google Indexing API on publish!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── CONNECTION STATUS BADGE ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${
            config.status === 'connected' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {config.status === 'connected' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[11px] text-[#a09070] uppercase font-semibold">GSC Auth Status</div>
            <div className="text-sm font-bold text-white capitalize flex items-center gap-1.5">
              {config.status === 'connected' ? 'Connected & Verified' : config.status === 'error' ? 'Auth Error' : 'Not Configured'}
              {config.status === 'connected' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#a09070] uppercase font-semibold">Active Search Property</div>
            <div className="text-sm font-mono text-white truncate max-w-[200px]">
              {config.siteUrl || 'None set'}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/20 text-purple-400">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[#a09070] uppercase font-semibold">Auto-Indexing on Publish</div>
            <div className="text-sm font-bold text-white">
              {config.autoIndexOnPublish ? 'Enabled (Instant)' : 'Disabled'}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN SETTINGS & MANUAL INDEXER GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Credentials Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-[#ff7a18]" />
              Google Service Account Credentials
            </h3>

            {/* JSON File Upload Button */}
            <div className="p-3.5 rounded-xl border border-dashed border-[#ff7a18]/40 bg-[#ff7a18]/5 flex flex-col items-center justify-center text-center gap-2">
              <UploadCloud className="w-6 h-6 text-[#ff7a18]" />
              <div className="text-xs text-white font-medium">
                Upload Google Cloud Service Account JSON Key
              </div>
              <label className="cursor-pointer px-3.5 py-1.5 rounded-lg bg-[#ff7a18] text-black text-xs font-bold hover:bg-[#ff9940] transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,122,24,0.4)]">
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
                <label className="block text-[#a09070] font-medium mb-1">
                  Google Search Console Property URL
                </label>
                <input
                  type="text"
                  value={config.siteUrl}
                  onChange={(e) => setConfig({ ...config, siteUrl: e.target.value })}
                  placeholder="https://example.com/ or sc-domain:example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#ff7a18] font-mono"
                  required
                />
                <p className="text-[10px] text-[#a09070]/70 mt-1">
                  Must match exactly the property format registered in Google Search Console.
                </p>
              </div>

              <div>
                <label className="block text-[#a09070] font-medium mb-1">
                  Service Account Client Email
                </label>
                <input
                  type="email"
                  value={config.clientEmail}
                  onChange={(e) => setConfig({ ...config, clientEmail: e.target.value })}
                  placeholder="onipress-bot@your-project-id.iam.gserviceaccount.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#ff7a18] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[#a09070] font-medium mb-1 flex items-center justify-between">
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
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-[#ff7a18] font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-white font-medium">
                  <input
                    type="checkbox"
                    checked={config.autoIndexOnPublish}
                    onChange={(e) => setConfig({ ...config, autoIndexOnPublish: e.target.checked })}
                    className="w-4 h-4 rounded border-white/20 text-[#ff7a18] focus:ring-[#ff7a18] bg-black"
                  />
                  <span>Auto-Ping Google Indexing API when post is published</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#ff7a18] to-[#ff9940] text-black font-bold text-xs hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,122,24,0.4)]"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  Verify &amp; Save GSC Credentials
                </button>
              </div>
            </form>
          </div>

          {/* Manual URL Fast Indexer */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              Instant Googlebot Indexing Request
            </h3>
            <p className="text-xs text-[#a09070]">
              Submit any published post or page URL directly to Google Web Search Indexing API v3. Googlebot will crawl the page within minutes.
            </p>

            <form onSubmit={handleIndexUrl} className="flex gap-2">
              <input
                type="url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://myblog.com/new-article-slug/"
                className="flex-1 px-3.5 py-2 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-emerald-500 font-mono text-xs"
                required
              />
              <button
                type="submit"
                disabled={indexingLoading || config.status !== 'connected'}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                {indexingLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Ping Googlebot
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Search Performance Telemetry */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Google Search Analytics (Last 28 Days)
              </h3>
              <span className="text-[10px] font-mono text-[#a09070]">Official GSC Data</span>
            </div>

            {performance ? (
              <div className="space-y-4">
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center justify-between text-[11px] text-[#a09070]">
                      <span>Clicks</span>
                      <MousePointer className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-xl font-bold text-white mt-1">{performance.clicks.toLocaleString()}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center justify-between text-[11px] text-[#a09070]">
                      <span>Impressions</span>
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-xl font-bold text-white mt-1">{performance.impressions.toLocaleString()}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center justify-between text-[11px] text-[#a09070]">
                      <span>Average CTR</span>
                      <Percent className="w-3.5 h-3.5 text-[#ff7a18]" />
                    </div>
                    <div className="text-xl font-bold text-white mt-1">{performance.averageCtr}%</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center justify-between text-[11px] text-[#a09070]">
                      <span>Avg Position</span>
                      <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="text-xl font-bold text-white mt-1">#{performance.averagePosition}</div>
                  </div>
                </div>

                {/* Top Ranking Queries */}
                <div>
                  <div className="text-[11px] font-bold text-[#a09070] uppercase mb-2">
                    Top Ranking Queries on Google
                  </div>
                  {performance.rows && performance.rows.length > 0 ? (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {performance.rows.slice(0, 8).map((row, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5 text-xs"
                        >
                          <span className="text-white font-medium truncate max-w-[170px]">{row.keys[0]}</span>
                          <div className="flex items-center gap-2.5 text-[11px] font-mono text-[#a09070]">
                            <span className="text-emerald-400">{row.clicks} clicks</span>
                            <span>pos #{Math.round(row.position)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-[#a09070]">
                      No query impressions recorded yet in the last 28 days.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#a09070] space-y-2">
                <Globe className="w-8 h-8 text-white/20 mx-auto" />
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

          {/* Recent Indexing Logs */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#a09070]" />
              Recent Indexing Submissions
            </h3>
            {logs.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                {logs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {log.status}
                      </span>
                      <span className="text-[10px] text-[#a09070]">
                        {new Date(log.submittedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-white font-mono truncate text-[11px]">{log.url}</div>
                    {log.responseMessage && (
                      <div className="text-[10px] text-[#a09070] truncate">{log.responseMessage}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-[#a09070]">
                No URLs submitted yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
