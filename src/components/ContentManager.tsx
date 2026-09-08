'use client';

import { useState, useEffect } from 'react';
import { FileText, ExternalLink, Calendar, Search, Trash2 } from 'lucide-react';
import { PostRecord } from '@/lib/db';

export default function ContentManager() {
  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const loadPosts = () => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(d => setPosts(Array.isArray(d) ? d : []))
      .catch(() => setPosts([]));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const filtered = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                          p.siteName.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || p.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Content Archive</h2>
          <p className="text-xs text-slate-500">Manage, inspect, and verify all articles published across your WordPress fleet.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-[#0047FF]/10 text-[#0047FF] border border-[#0047FF]/20 font-bold">
            {posts.length} Total Articles
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by article title or target site..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0047FF] focus:ring-2 focus:ring-[#0047FF]/15 bg-white border border-slate-200 transition-all"
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0047FF] bg-white border border-slate-200 cursor-pointer"
        >
          <option value="all">All Content Types</option>
          <option value="Blog Post">Blog Post</option>
          <option value="SEO Optimized Article">SEO Optimized Article</option>
          <option value="Newsletter">Newsletter</option>
          <option value="Social Post">Social Post</option>
        </select>
      </div>

      {/* Content List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-300 rounded-2xl bg-slate-50">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No content found</p>
            <p className="text-xs text-slate-500">Use the Write Blog tab to generate and sideload your first article.</p>
          </div>
        ) : (
          filtered.map(post => (
            <div
              key={post.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-3 transition-all hover:border-[#0047FF]/40 bg-white border border-slate-200 shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#0047FF]/10 text-[#0047FF]">
                    {post.type || 'Blog Post'}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {post.date}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {post.performance || '100% SEO'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 hover:text-[#0047FF] transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500">Target Site: <strong className="text-slate-800">{post.siteName}</strong></p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {post.postUrl && (
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0047FF] bg-[#0047FF]/10 hover:bg-[#0047FF]/20 transition-all border border-[#0047FF]/20"
                  >
                    View Post <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Remove from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
