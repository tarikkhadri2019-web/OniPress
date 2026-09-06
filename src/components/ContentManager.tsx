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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <p className="oni-cursive text-[#ff9940] text-2xl mb-1">Content Library</p>
          <p className="text-xs text-[#a09070]">Manage, track, and inspect all articles published across your WordPress sites.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-[#ff7a18]/10 text-[#ff9940] border border-[#ff7a18]/30 font-semibold">
            {posts.length} Total Articles
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a09070]" />
          <input
            type="text"
            placeholder="Search by article title or target site..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs text-white placeholder:text-[#a09070]/60 focus:outline-none"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs text-white focus:outline-none cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
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
          <div className="text-center py-12 border border-white/[0.06] rounded-2xl bg-black/20">
            <FileText className="w-8 h-8 text-[#a09070]/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No content found</p>
            <p className="text-xs text-[#a09070]">Use the Write Blog tab to generate your first AI article.</p>
          </div>
        ) : (
          filtered.map(post => (
            <div
              key={post.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl gap-3 transition-all hover:border-[#ff7a18]/30"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#ff7a18]/20 text-[#ff9940]">
                    {post.type || 'Blog Post'}
                  </span>
                  <span className="text-xs text-[#a09070] flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {post.date}
                  </span>
                  <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                    {post.performance || '100% SEO'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white hover:text-[#ff9940] transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-[#a09070]">Target Site: <strong className="text-white/80">{post.siteName}</strong></p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {post.postUrl && (
                  <a
                    href={post.postUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#ff7a18] bg-[#ff7a18]/10 hover:bg-[#ff7a18]/20 transition-all border border-[#ff7a18]/30"
                  >
                    View Post <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-1.5 rounded-lg text-[#a09070] hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
