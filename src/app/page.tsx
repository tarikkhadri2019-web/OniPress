'use client';

import { useState } from 'react';
import SiteManager from '@/components/SiteManager';
import ApiSettings from '@/components/ApiSettings';
import AutoBlogger from '@/components/AutoBlogger';
import ContentManager from '@/components/ContentManager';
import CampaignsManager from '@/components/CampaignsManager';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import LinkManager from '@/components/LinkManager';
import SupportCenter from '@/components/SupportCenter';
import { 
  Bell, User, Sparkles, FileText, Target, BarChart3, 
  Globe, Sliders, LifeBuoy, Link2
} from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [activeTab, setActiveTab] = useState('create');

  const navItems = [
    { id: 'create', label: 'Write Blog', icon: Sparkles },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'links', label: 'Backlinks', icon: Link2 },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'sites', label: 'Site Manager', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Sliders },
    { id: 'support', label: 'Support', icon: LifeBuoy },
  ];

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-[#0c0a08]">

      {/* ── FULL-PAGE BG GLOW ── */}
      <div className="oni-bg-light fixed inset-0 pointer-events-none z-0" />

      {/* ══════════════════════════════════════════════════
          OUTER DASHBOARD FRAME — single orange glowing border
      ══════════════════════════════════════════════════ */}
      <div className="relative min-h-screen oni-frame mx-auto max-w-[1280px] my-0 sm:my-3 sm:rounded-3xl overflow-hidden flex flex-col">

        {/* ── FRUIT DECORATIONS (mix-blend-mode: screen floats over the dark bg) ── */}
        <div className="fruit-img fruit-tr">
          <Image src="/fruit_orange.jpg" alt="" width={340} height={340} className="w-full h-full object-cover rounded-full" />
        </div>
        <div className="fruit-img fruit-bl">
          <Image src="/fruit_strawberry.jpg" alt="" width={300} height={300} className="w-full h-full object-cover rounded-full" />
        </div>
        <div className="fruit-img fruit-ml">
          <Image src="/fruit_orange.jpg" alt="" width={180} height={180} className="w-full h-full object-cover rounded-full" />
        </div>
        <div className="fruit-img fruit-mr">
          <Image src="/fruit_strawberry.jpg" alt="" width={200} height={200} className="w-full h-full object-cover rounded-full" />
        </div>

        {/* ══════════════════════════════════════════════════
            CONTENT — z-index 10+ so it sits above fruits
        ══════════════════════════════════════════════════ */}
        <div className="relative z-10 flex flex-col min-h-screen flex-1">

          {/* ── HEADER WITH UNIFIED SINGLE NAVIGATION ── */}
          <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.08] bg-black/50 backdrop-blur-2xl shrink-0 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => setActiveTab('create')}>
              <div
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#ff7a18] shadow-[0_0_12px_rgba(255,122,24,0.7)]"
                style={{ backgroundImage: "url('/fruit_orange.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-black tracking-tight text-[#ff7a18]">Oni</span>
                <span className="text-xl font-black tracking-tight text-white">Press</span>
              </div>
              <span className="hidden md:block oni-cursive text-[#ff9940] text-sm ml-1">— fresh &amp; fruity</span>
            </div>

            {/* Header Navigation Pills — definitive, non-duplicated nav bar */}
            <nav className="flex items-center gap-1 overflow-x-auto py-1 px-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md max-w-full no-scrollbar">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-btn-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#ff7a18] to-[#ff9940] text-black font-extrabold shadow-[0_0_18px_rgba(255,122,24,0.6)]'
                        : 'text-[#a09070] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-[#ff9940]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('support')}
                className={`relative p-2 rounded-full transition-colors ${
                  activeTab === 'support' ? 'bg-[#ff7a18]/20 text-[#ff9940]' : 'hover:bg-white/5 text-[#a09070] hover:text-white'
                }`}
                title="Support Center &amp; Diagnostics"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff7a18] shadow-[0_0_6px_#ff7a18]" />
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                  activeTab === 'settings' 
                    ? 'border-[#ff7a18] bg-[#ff7a18]/20 text-[#ff9940]' 
                    : 'border-white/15 bg-white/[0.07] text-[#a09070] hover:text-white'
                }`}
                title="API Settings &amp; AI Models"
              >
                <User className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* ── COMPACT HERO SECTION (shown on blog creator) ── */}
          {activeTab === 'create' && (
            <section className="text-center py-5 px-6 shrink-0 space-y-1">
              <p className="oni-cursive text-2xl sm:text-3xl text-[#ff7a18] drop-shadow-[0_0_20px_rgba(255,122,24,0.7)]">
                fruity &amp; fresh
              </p>
              <h1 className="oni-display text-3xl sm:text-4xl lg:text-5xl leading-tight text-[#ff7a18] drop-shadow-[0_4px_40px_rgba(255,122,24,0.4)]">
                AI Content. Fresh Publish.
              </h1>
              <p className="text-[#a09070] text-xs max-w-xl mx-auto leading-relaxed">
                RankMath 100/100 automated content engine powered by local Antigravity Gemini AI.
              </p>
            </section>
          )}

          {/* ── MAIN CONTENT CONTAINER (Controlled by Header Nav) ── */}
          <div className="px-4 sm:px-6 flex-1 flex flex-col min-h-0 mt-3">
            <div
              className="flex-1 overflow-y-auto rounded-2xl mb-4"
              style={{
                background: 'rgba(20, 16, 10, 0.88)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                boxShadow: '0 12px 60px rgba(0,0,0,0.6)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="p-4 sm:p-6">
                {activeTab === 'create' && <AutoBlogger />}
                {activeTab === 'content' && <ContentManager />}
                {activeTab === 'links' && <LinkManager />}
                {activeTab === 'campaigns' && <CampaignsManager />}
                {activeTab === 'analytics' && <AnalyticsDashboard />}
                {activeTab === 'sites' && <SiteManager />}
                {activeTab === 'settings' && <ApiSettings />}
                {activeTab === 'support' && <SupportCenter />}
              </div>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <footer className="shrink-0 px-6 py-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#a09070]">
            <div className="flex items-center gap-2">
              <span className="text-[#ff7a18] font-black tracking-tight">OniPress</span>
              <span className="text-white/30">|</span>
              <span className="oni-cursive text-[#ff9940] text-sm">Onifresh</span>
              <span className="text-white/30">·</span>
              <span className="text-[#a09070]/70">Open Source MIT</span>
            </div>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational &amp; Connected
            </span>
          </footer>

        </div>{/* /content z-10 */}
      </div>{/* /oni-frame */}
    </div>
  );
}
