'use client';

import { useState, useEffect } from 'react';
// Remove unused Input
import { Site } from '@/lib/db';
import { Trash2, Globe, CheckCircle, AlertCircle, Loader2, Plus, Download } from 'lucide-react';

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

  const verifySite = async (id: string) => {
    setSiteStatuses(prev => ({ ...prev, [id]: 'checking' }));
    const res  = await fetch('/api/sites/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteId: id }) });
    const data = await res.json();
    setSiteStatuses(prev => ({ ...prev, [id]: data.connected ? 'ok' : 'error' }));
  };

  const StatusIcon = ({ id }: { id: string }) => {
    const s = siteStatuses[id] || 'unknown';
    if (s === 'checking') return <Loader2 className="w-3.5 h-3.5 animate-spin text-[#a09070]" />;
    if (s === 'ok')       return <CheckCircle className="w-3.5 h-3.5 text-green-400" />;
    if (s === 'error')    return <AlertCircle className="w-3.5 h-3.5 text-red-400" />;
    return null;
  };

  const inputStyle = {
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#faf5ef',
    borderRadius: '10px',
    fontSize: '13px',
    padding: '8px 12px',
    width: '100%',
    outline: 'none',
    transition: 'border-color 0.2s',
  } as React.CSSProperties;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="pb-4 border-b border-white/[0.07]">
        <p className="oni-cursive text-[#ff9940] text-xl mb-0.5">Site Manager</p>
        <p className="text-[11px] text-[#a09070]">Connect your WordPress sites using the OniPress plugin token.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* ── ADD SITE FORM ── */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ background: 'rgba(0,0,0,0.45)', border: '1.5px solid rgba(255,122,24,0.22)', boxShadow: '0 0 30px rgba(255,100,0,0.06)' }}
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#ff7a18]/15 border border-[#ff7a18]/25 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-[#ff7a18]" />
              </div>
              <span className="text-sm font-bold text-white">Connect a WordPress Site</span>
            </div>
            <a
              href="/api/plugin/download?folder=onipress-ai"
              download="onipress-ai.zip"
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-lg bg-[#ff7a18]/15 text-[#ff9940] hover:bg-[#ff7a18]/25 border border-[#ff7a18]/30 transition-all"
              title="Download plugin ready to upload to WordPress"
            >
              <Download className="w-3 h-3" />
              Download Plugin (.zip)
            </a>
          </div>

          <p className="text-[11px] text-[#a09070]">
            1. Download the plugin above &rarr; 2. Upload it in WordPress <strong>Plugins &rarr; Add New &rarr; Upload Plugin</strong> &rarr; 3. Activate and paste your token below:
          </p>

          {/* Fields */}
          {[
            { label: 'Site Name', value: name, set: setName, placeholder: 'e.g. My Tech Blog', type: 'text' },
            { label: 'WordPress URL', value: url, set: setUrl, placeholder: 'https://example.com', type: 'text' },
            { label: 'Google Search Console URL (optional)', value: gscUrl, set: setGscUrl, placeholder: 'sc-domain:example.com', type: 'text' },
            { label: 'GA4 Property ID (optional)', value: ga4PropertyId, set: setGa4PropertyId, placeholder: 'e.g. 123456789', type: 'text' },
            { label: 'OniPress Token', value: token, set: setToken, placeholder: 'Paste token from WP Admin → OniPress', type: 'password' },
            { label: 'Tags (optional, comma separated)', value: tags, set: setTags, placeholder: 'tech, news, morocco', type: 'text' },
          ].map(({ label, value, set, placeholder, type }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#a09070] uppercase tracking-wide">{label}</label>
              <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e => set(e.target.value)}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = 'rgba(255,122,24,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,122,24,0.1)'; }}
                onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          ))}

          <button
            onClick={addSite}
            disabled={adding || !name || !url || !token}
            className="oni-btn w-full rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
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
            <p className="oni-cursive text-[#ff9940] text-lg">Connected Sites</p>
            <span className="text-[10px] text-[#a09070] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
              {sites.length} site{sites.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#a09070] p-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          )}

          {!loading && sites.length === 0 && (
            <div
              className="text-center p-8 rounded-xl space-y-2 text-xs text-[#a09070]"
              style={{ border: '1px dashed rgba(255,122,24,0.2)', background: 'rgba(0,0,0,0.25)' }}
            >
              <Globe className="w-8 h-8 mx-auto opacity-25 text-[#ff7a18]" />
              <p className="font-semibold text-[#a09070]">No sites connected yet.</p>
              <p>Install <span className="text-[#ff7a18]">OniPress Connect</span> on your WP site and add it here.</p>
            </div>
          )}

          <div className="space-y-2">
            {sites.map(site => (
              <div
                key={site.id}
                className="rounded-xl px-4 py-3"
                style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusIcon id={site.id} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-white truncate">{site.name}</p>
                      <p className="text-[11px] text-[#a09070] truncate">{site.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => verifySite(site.id)}
                      className="text-[11px] px-2.5 py-1 rounded-lg text-[#a09070] hover:text-[#ff7a18] hover:bg-[#ff7a18]/10 transition-all border border-white/10 font-semibold"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => deleteSite(site.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {Array.isArray(site.tags) && site.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {site.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-[#ff7a18]/10 text-[#ff9940] text-[10px] rounded-full font-semibold border border-[#ff7a18]/20">
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
    </div>
  );
}
