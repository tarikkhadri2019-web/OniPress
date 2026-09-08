'use client';

import { useState } from 'react';
import Image from 'next/image';
import OniLogo from '@/components/OniLogo';
import LivePipeline from '@/components/LivePipeline';
import SiteManager from '@/components/SiteManager';
import ApiSettings from '@/components/ApiSettings';
import AutoBlogger from '@/components/AutoBlogger';
import ContentManager from '@/components/ContentManager';
import CampaignsManager from '@/components/CampaignsManager';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import LinkManager from '@/components/LinkManager';
import GscManager from '@/components/GscManager';
import SupportCenter from '@/components/SupportCenter';
import { 
  Bell, Sparkles, FileText, Target, BarChart3, 
  Globe, Sliders, LifeBuoy, Link2, SearchCheck,
  Cpu, BatteryCharging
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('pipeline');

  const navItems = [
    { id: 'pipeline', label: 'Pipeline', icon: Cpu, badge: 'LIVE' },
    { id: 'create', label: 'Write Blog', icon: Sparkles },
    { id: 'sites', label: 'Fleet Matrix', icon: Globe },
    { id: 'gsc', label: 'Fast Indexing', icon: SearchCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'links', label: 'Backlinks', icon: Link2 },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'content', label: 'Archive', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Sliders },
    { id: 'support', label: 'Diagnostics', icon: LifeBuoy },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col relative overflow-x-hidden selection:bg-[#0047FF]/20 selection:text-[#0047FF]">

      {/* ── AMBIENT ARCHITECTURAL BACKDROP ── */}
      <div className="orbital-ambient-grid" />

      {/* ══════════════════════════════════════════════════
          COMMAND HEADER & MEGA MENU (Swiss Minimalist)
      ══════════════════════════════════════════════════ */}
      <header className="relative z-30 sticky top-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-sm">
        
        {/* Left: Brand Logo & Subtitle */}
        <div 
          onClick={() => setActiveTab('pipeline')}
          className="cursor-pointer shrink-0"
        >
          <OniLogo size="md" />
        </div>

        {/* Center: Mega Menu Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 border border-slate-200/90 overflow-x-auto no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#0047FF] text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-[#0f172a] hover:bg-white/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && !isActive && (
                  <span className="text-[8px] font-sans font-bold px-1.5 py-0.2 rounded-full bg-[#0047FF]/10 text-[#0047FF] border border-[#0047FF]/20">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Telemetry Quota & Operator Pill */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Indexing Token Battery */}
          <div 
            onClick={() => setActiveTab('gsc')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono cursor-pointer hover:border-[#0047FF]/40 hover:bg-white transition-all shadow-2xs"
            title="Daily Google Indexing API Quota"
          >
            <BatteryCharging className="w-4 h-4 text-[#0047FF]" />
            <span className="text-slate-900 font-bold">184</span>
            <span className="text-slate-400">/200</span>
          </div>

          {/* Diagnostic Bell */}
          <button
            onClick={() => setActiveTab('support')}
            className={`relative p-2 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'support' 
                ? 'border-[#0047FF] bg-[#0047FF]/10 text-[#0047FF]' 
                : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-white'
            }`}
            title="System Diagnostics & Help"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0047FF]" />
          </button>

          {/* Operator Profile Pill */}
          <div 
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-lg bg-slate-50 border border-slate-200 hover:border-[#0047FF]/40 hover:bg-white cursor-pointer transition-all shadow-2xs"
            title="Operator Settings"
          >
            <div className="w-7 h-7 rounded-md overflow-hidden border border-slate-200 relative bg-white">
              <Image
                src="/oni_avatar.png"
                alt="System Operator"
                width={28}
                height={28}
                className="object-cover"
              />
            </div>
            <div className="hidden xl:block text-left">
              <span className="text-[11px] font-bold text-slate-900 block leading-tight">Operator</span>
              <span className="text-[9px] font-mono text-[#0047FF] block leading-tight">● Online</span>
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Nav Drawer Horizontal Row */}
      <div className="md:hidden sticky top-[57px] z-20 px-4 py-2 border-b border-slate-200 bg-white/95 backdrop-blur-md overflow-x-auto no-scrollbar flex items-center gap-1.5 shadow-2xs">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                isActive
                  ? 'bg-[#0047FF] text-white font-bold'
                  : 'text-slate-600 bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════
          MAIN VIEWPORT (Swiss Modernism Canvas)
      ══════════════════════════════════════════════════ */}
      <main className="relative z-10 flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: Live Node Pipeline */}
        {activeTab === 'pipeline' && (
          <LivePipeline onNavigateToBlogger={() => setActiveTab('create')} />
        )}

        {/* VIEW 2: AutoBlogger Content Engine */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <AutoBlogger />
            </div>
          </div>
        )}

        {/* VIEW 3: Multi-Site Fleet Matrix */}
        {activeTab === 'sites' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <SiteManager />
          </div>
        )}

        {/* VIEW 4: Google Search Console Indexing API */}
        {activeTab === 'gsc' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <GscManager />
          </div>
        )}

        {/* VIEW 5: Google Analytics (GA4) Telemetry */}
        {activeTab === 'analytics' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <AnalyticsDashboard />
          </div>
        )}

        {/* VIEW 6: Backlinks & Internal Link Silo */}
        {activeTab === 'links' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <LinkManager />
          </div>
        )}

        {/* VIEW 7: Automated Content Campaigns */}
        {activeTab === 'campaigns' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <CampaignsManager />
          </div>
        )}

        {/* VIEW 8: Published Content Archive */}
        {activeTab === 'content' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <ContentManager />
          </div>
        )}

        {/* VIEW 9: System & MCP Settings */}
        {activeTab === 'settings' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <ApiSettings />
          </div>
        )}

        {/* VIEW 10: Support & System Health */}
        {activeTab === 'support' && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <SupportCenter />
          </div>
        )}

      </main>

      {/* ══════════════════════════════════════════════════
          TACTICAL COMMAND FOOTER (Swiss Minimalist)
      ══════════════════════════════════════════════════ */}
      <footer className="relative z-20 border-t border-slate-200/80 bg-white px-4 lg:px-8 py-3.5 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 font-medium">
          <span className="text-slate-900 font-bold tracking-tight">ONIPRESS // ENTERPRISE</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Autonomous SEO Intelligence</span>
          <span className="text-slate-300">·</span>
          <span>MIT License</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-[#0047FF] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#0047FF]" />
            Node Engine: Online
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-700 font-medium">RankMath 100/100 Enforced</span>
        </div>
      </footer>

    </div>
  );
}
