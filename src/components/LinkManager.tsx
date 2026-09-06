'use client';

import { useState, useEffect } from 'react';
import { Backlink } from '@/lib/db';
import { 
  Link2, Plus, Trash2, ExternalLink, Globe2, 
  CheckCircle2, PauseCircle, ShieldAlert, Sparkles,
  Search, Filter
} from 'lucide-react';

export default function LinkManager() {
  const [links, setLinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'internal' | 'external'>('all');

  // Form state
  const [url, setUrl] = useState('');
  const [anchorText, setAnchorText] = useState('');
  const [type, setType] = useState<'internal' | 'external'>('internal');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLinksData = async () => {
    const res = await fetch('/api/backlinks');
    return res.json();
  };

  const loadLinks = () => {
    setLoading(true);
    fetchLinksData()
      .then(data => setLinks(Array.isArray(data) ? data : []))
      .catch(() => setLinks([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLinksData()
      .then(data => setLinks(Array.isArray(data) ? data : []))
      .catch(() => setLinks([]))
      .finally(() => setLoading(false));
  }, []);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anchorText.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/backlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          anchorText: anchorText.trim(),
          type,
          targetKeyword: targetKeyword.trim() || undefined,
          active: true,
        }),
      });

      if (res.ok) {
        setUrl('');
        setAnchorText('');
        setTargetKeyword('');
        setMessage({ type: 'success', text: 'Backlink added! It will now be automatically injected into generated posts.' });
        loadLinks();
        setTimeout(() => setMessage(null), 4000);
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Failed to save link.' });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setMessage({ type: 'error', text: errorMsg || 'Network error.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (link: Backlink) => {
    try {
      await fetch('/api/backlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...link,
          active: !link.active,
        }),
      });
      loadLinks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this backlink from automatic injection?')) return;
    try {
      await fetch(`/api/backlinks?id=${id}`, { method: 'DELETE' });
      loadLinks();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLinks = links.filter(l => {
    const matchesSearch = l.anchorText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || l.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const internalCount = links.filter(l => l.type === 'internal' && l.active).length;
  const externalCount = links.filter(l => l.type === 'external' && l.active).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 animate-fadeIn">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link2 className="w-5 h-5 text-[#ff7a18]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Backlinks &amp; Internal Link Manager</h1>
          </div>
          <p className="text-xs text-[#a09070]">
            Configure high-value internal URLs and authoritative external references. OniPress enforces them into every generated article for guaranteed RankMath 100/100 link scores.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Auto-Injection Enforced</span>
        </div>
      </div>

      {/* ── METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#a09070] uppercase tracking-wider block mb-1">Active Internal Links</span>
            <span className="text-2xl font-black text-cyan-400">{internalCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Globe2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#a09070] uppercase tracking-wider block mb-1">Active External Links</span>
            <span className="text-2xl font-black text-[#ff7a18]">{externalCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ff7a18]/10 border border-[#ff7a18]/20 flex items-center justify-center text-[#ff7a18]">
            <ExternalLink className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-[#a09070] uppercase tracking-wider block mb-1">Total Monitored Links</span>
            <span className="text-2xl font-black text-white">{links.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Link2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── ADD NEW BACKLINK FORM ── */}
      <div className="p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-[#ff7a18]" />
          Add Mandatory Backlink to Injected Pool
        </h2>

        {message && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleAddLink} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Target URL */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-semibold text-[#a09070] uppercase">Target URL *</label>
              <input
                type="url"
                required
                placeholder="https://yoursite.com/pillar-guide or /services"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl text-white bg-black/60 border border-white/10 focus:outline-none focus:border-[#ff7a18]"
              />
            </div>

            {/* Anchor Text */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-[#a09070] uppercase">Anchor Text *</label>
              <input
                type="text"
                required
                placeholder="e.g. comprehensive pricing guide"
                value={anchorText}
                onChange={e => setAnchorText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl text-white bg-black/60 border border-white/10 focus:outline-none focus:border-[#ff7a18]"
              />
            </div>

            {/* Link Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-[#a09070] uppercase">Link Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as 'internal' | 'external')}
                className="w-full px-3 py-2 text-xs rounded-xl text-white bg-black/60 border border-white/10 focus:outline-none focus:border-[#ff7a18]"
              >
                <option value="internal">Internal Link (Own Site)</option>
                <option value="external">External Link (Authority / Partner)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[10px] text-[#a09070]">
              ✨ The AI model will be instructed to weave this anchor text into article body paragraphs naturally.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#ff7a18] to-[#ff9940] text-black hover:opacity-90 transition-all shadow-[0_0_12px_rgba(255,122,24,0.4)] disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving…' : 'Add to Injection Pool'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a09070]" />
          <input
            type="text"
            placeholder="Search by anchor text or URL…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl text-white bg-black/40 border border-white/10 focus:outline-none focus:border-[#ff7a18]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-[#a09070]" />
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
              typeFilter === 'all' ? 'bg-[#ff7a18] text-black' : 'text-[#a09070] hover:text-white'
            }`}
          >
            All ({links.length})
          </button>
          <button
            onClick={() => setTypeFilter('internal')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
              typeFilter === 'internal' ? 'bg-cyan-500 text-black font-bold' : 'text-[#a09070] hover:text-white'
            }`}
          >
            Internal ({links.filter(l => l.type === 'internal').length})
          </button>
          <button
            onClick={() => setTypeFilter('external')}
            className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
              typeFilter === 'external' ? 'bg-[#ff9940] text-black font-bold' : 'text-[#a09070] hover:text-white'
            }`}
          >
            External ({links.filter(l => l.type === 'external').length})
          </button>
        </div>
      </div>

      {/* ── LINKS TABLE ── */}
      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#a09070]">Loading configured backlinks…</div>
        ) : filteredLinks.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Link2 className="w-8 h-8 text-[#a09070]/40 mx-auto" />
            <p className="text-xs font-semibold text-white">No backlinks configured yet</p>
            <p className="text-[11px] text-[#a09070] max-w-sm mx-auto">
              Add your key product pages, category hubs, or authority sources above. OniPress will ensure they are linked inside newly generated articles.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[#a09070] text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Anchor Text</th>
                  <th className="py-3 px-4">Target Destination URL</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLinks.map(link => (
                  <tr key={link.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-white group-hover:text-[#ff9940] transition-colors">
                        &ldquo;{link.anchorText}&rdquo;
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline max-w-md truncate"
                      >
                        <span className="truncate">{link.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                      </a>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        link.type === 'internal'
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          : 'bg-[#ff7a18]/15 text-[#ff9940] border border-[#ff7a18]/30'
                      }`}>
                        {link.type === 'internal' ? 'Internal' : 'External'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleActive(link)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          link.active
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-white/5 text-[#a09070] border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {link.active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <PauseCircle className="w-3 h-3" />
                            <span>Paused</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-1.5 rounded-lg text-[#a09070] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete backlink"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
