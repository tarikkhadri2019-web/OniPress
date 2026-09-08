'use client';

import { useState, useEffect } from 'react';
import { Site } from '@/lib/db';
import { Trash2, Globe, CheckCircle, AlertCircle, Loader2, Plus, Download, Edit2, Check, X } from 'lucide-react';

type SiteStatus = 'unknown' | 'checking' | 'ok' | 'error';

export default function SiteManager() {
  const [sites, setSites]       = useState<Site[]>([]);
  const [loading, setLoading]   = useState(true);
  const [siteStatuses, setSiteStatuses] = useState<Record<string, SiteStatus>>({});
  const [name, setName]   = useState('');
  const [url, setUrl]     = useState('');
  const [gscUrl, setGscUrl] = useState('');
  const [ga4PropertyId, setGa4PropertyId] = useState('');
  const [token, setToken] = useState('');
  const [tags, setTags]   = useState('');
  const [adding, setAdding] = useState(false);

  // Edit site state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editGscUrl, setEditGscUrl] = useState('');
  const [editGa4PropertyId, setEditGa4PropertyId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSitesData = async () => {
    const res = await fetch('/api/sites');
    return res.json();
  };

  const loadSites = () => {
    setLoading(true);
    fetchSitesData()
      .then(data => setSites(Array.isArray(data) ? data : []))
      .catch(() => setSites([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSitesData()
      .then(data => setSites(Array.isArray(data) ? data : []))
      .catch(() => setSites([]))
      .finally(() => setLoading(false));
  }, []);

  const addSite = async () => {
    if (!name || !url || !token) return;
    setAdding(true);
    await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url, gscUrl, ga4PropertyId, username: 'onipress', applicationPassword: token, tags: tags.split(',').map(t => t.trim()).filter(Boolean) })
    });
    setName(''); setUrl(''); setGscUrl(''); setGa4PropertyId(''); setToken(''); setTags('');
    setAdding(false);
    loadSites();
  };

  const deleteSite = async (id: string) => {
    await fetch(`/api/sites?id=${id}`, { method: 'DELETE' });
    loadSites();
  };

  const startEdit = (site: Site) => {
    setEditingId(site.id);
    setEditGscUrl(site.gscUrl || '');
    setEditGa4PropertyId(site.ga4PropertyId || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditGscUrl('');
    setEditGa4PropertyId('');
  };

  const saveEdit = async (siteId: string) => {
    setIsUpdating(true);
    try {
      await fetch('/api/sites', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: siteId,
          gscUrl: editGscUrl.trim(),
          ga4PropertyId: editGa4PropertyId.trim(),
        }),
      });
      setEditingId(null);
      loadSites();
    } catch {
      alert('Failed to update site configuration');
    } finally {
      setIsUpdating(false);
    }
  };

  const verifySite = async (id: string) => {
    setSiteStatuses(prev => ({ ...prev, [id]: 'checking' }));
    const res  = await fetch('/api/sites/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteId: id }) });
    const data = await res.json();
    setSiteStatuses(prev => ({ ...prev, [id]: data.connected ? 'ok' : 'error' }));
  };

  const StatusIcon = ({ id }: { id: string }) => {
    const s = siteStatuses[id] || 'unknown';
    if (s === 'checking') return <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />;
    if (s === 'ok')       return <CheckCircle className="w-3.5 h-3.5 text-[#0047FF]" />;
    if (s === 'error')    return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    return null;
  };

  const inputStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    color: '#0f172a',
    borderRadius: '10px',
    fontSize: '13px',
    padding: '8px 12px',
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s',
  } as React.CSSProperties;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-0.5">Fleet Site Manager</h2>
        <p className="text-xs text-slate-500">Connect and orchestrate your WordPress fleet with direct token authorization.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── ADD SITE FORM ── */}
        <div className="rounded-xl p-5 space-y-4 bg-slate-50 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#0047FF]/10 border border-[#0047FF]/20 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-[#0047FF]" />
              </div>
              <span className="text-sm font-bold text-slate-900">Connect a WordPress Site</span>
            </div>
            <a
              href="/api/plugin/download?folder=onipress-ai"
              download="onipress-ai.zip"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-lg bg-[#0047FF]/10 text-[#0047FF] hover:bg-[#0047FF]/20 border border-[#0047FF]/25 transition-all"
              title="Download plugin ready to upload to WordPress"
            >
              <Download className="w-3 h-3" />
              Download Plugin (.zip)
            </a>
          </div>

          <p className="text-[11px] text-slate-500">
            1. Download the plugin above &rarr; 2. Upload in WP <strong>Plugins &rarr; Add New &rarr; Upload</strong> &rarr; 3. Paste the generated token below:
          </p>

          {/* Fields */}
          {[
            { label: 'Site Name', value: name, set: setName, placeholder: 'e.g. Tech Insight Magazine', type: 'text' },
            { label: 'WordPress URL', value: url, set: setUrl, placeholder: 'https://example.com', type: 'text' },
            { label: 'Google Search Console URL (optional)', value: gscUrl, set: setGscUrl, placeholder: 'sc-domain:example.com', type: 'text' },
            { label: 'GA4 Property ID (optional)', value: ga4PropertyId, set: setGa4PropertyId, placeholder: 'e.g. 123456789', type: 'text' },
            { label: 'OniPress Token', value: token, set: setToken, placeholder: 'Paste token from WP Admin → OniPress', type: 'password' },
            { label: 'Tags (optional, comma separated)', value: tags, set: setTags, placeholder: 'tech, ai, hardware', type: 'text' },
          ].map(({ label, value, set, placeholder, type }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e => set(e.target.value)}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#0047FF'; e.target.style.boxShadow = '0 0 0 3px rgba(0, 71, 255, 0.12)'; }}
                onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          ))}

          <button
            onClick={addSite}
            disabled={adding || !name || !url || !token}
            className="w-full rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 text-white bg-[#0047FF] hover:bg-[#0037cc] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            {adding
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting…</>
              : <><Globe className="w-3.5 h-3.5" /> Connect Site</>
            }
          </button>
        </div>

        {/* ── CONNECTED SITES ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Connected Sites</h3>
            <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 font-semibold">
              {sites.length} site{sites.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 p-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading fleet…
            </div>
          )}

          {!loading && sites.length === 0 && (
            <div className="text-center p-8 rounded-xl space-y-2 text-xs text-slate-500 border border-dashed border-slate-300 bg-slate-50">
              <Globe className="w-8 h-8 mx-auto opacity-30 text-[#0047FF]" />
              <p className="font-semibold text-slate-700">No sites connected yet.</p>
              <p>Install <span className="text-[#0047FF] font-semibold">OniPress Connect</span> on your WordPress site and add it here.</p>
            </div>
          )}

            {sites.map(site => (
              <div
                key={site.id}
                className="rounded-xl p-4 bg-white border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <StatusIcon id={site.id} />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">{site.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{site.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => (editingId === site.id ? cancelEdit() : startEdit(site))}
                      className="text-[11px] px-2.5 py-1 rounded-lg text-slate-600 hover:text-[#0047FF] hover:bg-[#0047FF]/10 transition-all border border-slate-200 font-semibold cursor-pointer flex items-center gap-1"
                      title="Edit Telemetry & GA4"
                    >
                      <Edit2 className="w-3 h-3" />
                      {editingId === site.id ? 'Cancel' : 'Edit'}
                    </button>
                    <button
                      onClick={() => verifySite(site.id)}
                      className="text-[11px] px-2.5 py-1 rounded-lg text-slate-600 hover:text-[#0047FF] hover:bg-[#0047FF]/10 transition-all border border-slate-200 font-semibold cursor-pointer"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => deleteSite(site.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Telemetry Status Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {site.ga4PropertyId ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0047FF]/10 text-[#0047FF] border border-[#0047FF]/25">
                      ● GA4: {site.ga4PropertyId}
                    </span>
                  ) : (
                    <button
                      onClick={() => startEdit(site)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer"
                    >
                      + Set GA4 Property ID
                    </button>
                  )}

                  {site.gscUrl ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200">
                      GSC: {site.gscUrl}
                    </span>
                  ) : (
                    <button
                      onClick={() => startEdit(site)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 cursor-pointer"
                    >
                      + Set GSC URL
                    </button>
                  )}
                </div>

                {/* Inline Edit Form */}
                {editingId === site.id && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-[#0047FF]/20 space-y-2.5">
                    <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0047FF]" />
                      Edit Google Telemetry for {site.name}
                    </p>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">GA4 Property ID (e.g. 123456789)</label>
                      <input
                        type="text"
                        placeholder="e.g. 123456789"
                        value={editGa4PropertyId}
                        onChange={e => setEditGa4PropertyId(e.target.value)}
                        style={inputStyle}
                      />
                      <p className="text-[10px] text-slate-400">Numeric Property ID from Google Analytics Admin &rarr; Property Settings</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Google Search Console URL</label>
                      <input
                        type="text"
                        placeholder="sc-domain:example.com or https://example.com/"
                        value={editGscUrl}
                        onChange={e => setEditGscUrl(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => saveEdit(site.id)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-lg bg-[#0047FF] text-white text-xs font-bold hover:bg-[#0037cc] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Save Configuration
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {Array.isArray(site.tags) && site.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                    {site.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded-full font-semibold border border-slate-200">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
