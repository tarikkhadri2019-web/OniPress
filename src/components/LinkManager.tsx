'use client';

import { useState, useEffect } from 'react';
import { 
  Link2, Plus, Trash2, Globe2, ExternalLink, Sparkles, 
  CheckCircle2, PauseCircle, Search, Filter, ShieldAlert 
} from 'lucide-react';
import { Backlink } from '@/lib/db';

export default function LinkManager() {
  const [links, setLinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [url, setUrl] = useState('');
  const [anchorText, setAnchorText] = useState('');
  const [type, setType] = useState<'internal' | 'external'>('internal');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'internal' | 'external'>('all');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/links');
      const data = await res.json();
      setLinks(Array.isArray(data) ? data : []);
    } catch {
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !anchorText) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, anchorText, type }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Backlink added to autonomous injection pool!' });
        setUrl('');
        setAnchorText('');
        fetchLinks();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add link' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network connection error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/links?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLinks(prev => prev.filter(l => l.id !== id));
      }
    } catch {
      // ignore
    }
  };

  const handleToggleActive = async (link: Backlink) => {
    try {
      const res = await fetch('/api/links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: link.id, active: !link.active }),
      });
      if (res.ok) {
        setLinks(prev => prev.map(l => l.id === link.id ? { ...l, active: !l.active } : l));
      }
    } catch {
      // ignore
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
    <div className="space-y-6 max-w-6xl mx-auto p-2 sm:p-4">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link2 className="w-5 h-5 text-[#0047FF]" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Backlinks &amp; Internal Link Silo</h1>
          </div>
          <p className="text-xs text-slate-500">
            Configure target internal URLs and authoritative external references. OniPress weaves them into generated articles for RankMath 100/100 link scores.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0047FF]/10 border border-[#0047FF]/20 text-[#0047FF] text-xs font-bold self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto-Injection Active</span>
        </div>
      </div>

      {/* ── METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Active Internal Links</span>
            <span className="text-2xl font-black text-slate-900">{internalCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0047FF]/10 border border-[#0047FF]/20 flex items-center justify-center text-[#0047FF]">
            <Globe2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Active External Links</span>
            <span className="text-2xl font-black text-[#0047FF]">{externalCount}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#0047FF]/10 border border-[#0047FF]/20 flex items-center justify-center text-[#0047FF]">
            <ExternalLink className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Total Monitored Links</span>
            <span className="text-2xl font-black text-slate-900">{links.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <Link2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── ADD NEW BACKLINK FORM ── */}
      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-2xs">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-[#0047FF]" />
          Add Mandatory Backlink to Injected Pool
        </h2>

        {message && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium' 
              : 'bg-red-50 border border-red-200 text-red-800 font-medium'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleAddLink} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Target URL */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Target URL *</label>
              <input
                type="url"
                required
                placeholder="https://yoursite.com/pillar-guide or /services"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl text-slate-900 bg-white border border-slate-200 focus:outline-none focus:border-[#0047FF] focus:ring-2 focus:ring-[#0047FF]/15 transition-all"
              />
            </div>

            {/* Anchor Text */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Anchor Text *</label>
              <input
                type="text"
                required
                placeholder="e.g. comprehensive pricing guide"
                value={anchorText}
                onChange={e => setAnchorText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl text-slate-900 bg-white border border-slate-200 focus:outline-none focus:border-[#0047FF] focus:ring-2 focus:ring-[#0047FF]/15 transition-all"
              />
            </div>

            {/* Link Type */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Link Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as 'internal' | 'external')}
                className="w-full px-3 py-2 text-xs rounded-xl text-slate-900 bg-white border border-slate-200 focus:outline-none focus:border-[#0047FF] cursor-pointer"
              >
                <option value="internal">Internal Link (Fleet Matrix)</option>
                <option value="external">External Link (High-Authority Reference)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-500">
              The AI engine naturally integrates these anchors and URLs into article body paragraphs.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-[#0047FF] hover:bg-[#0037cc] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving…' : 'Add to Pool'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by anchor text or URL…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl text-slate-900 bg-white border border-slate-200 focus:outline-none focus:border-[#0047FF]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
              typeFilter === 'all' ? 'bg-[#0047FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({links.length})
          </button>
          <button
            onClick={() => setTypeFilter('internal')}
            className={`px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
              typeFilter === 'internal' ? 'bg-[#0047FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Internal ({links.filter(l => l.type === 'internal').length})
          </button>
          <button
            onClick={() => setTypeFilter('external')}
            className={`px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
              typeFilter === 'external' ? 'bg-[#0047FF] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            External ({links.filter(l => l.type === 'external').length})
          </button>
        </div>
      </div>

      {/* ── LINKS TABLE ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading configured links…</div>
        ) : filteredLinks.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Link2 className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No links configured yet</p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Add your target URLs and anchor text above. OniPress will inject them into newly published articles.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Anchor Text</th>
                  <th className="py-3 px-4">Target Destination URL</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLinks.map(link => (
                  <tr key={link.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">
                        &ldquo;{link.anchorText}&rdquo;
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#0047FF] hover:underline max-w-md truncate font-medium"
                      >
                        <span className="truncate">{link.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                      </a>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0047FF]/10 text-[#0047FF] border border-[#0047FF]/20">
                        {link.type === 'internal' ? 'Internal' : 'External'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleActive(link)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          link.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {link.active ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <PauseCircle className="w-3 h-3 text-slate-400" />
                            <span>Paused</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
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
