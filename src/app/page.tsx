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
  Cpu, BatteryCharging, LayoutGrid, ChevronDown, X, ArrowUpRight
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const navGroups = [
    {
      title: 'Content & Publishing Studio',
      description: 'Autonomous multi-agent writing, vision, and scheduling',
      items: [
        { id: 'pipeline', label: 'Neural Pipeline', icon: Cpu, badge: 'LIVE', desc: 'Real-time multi-agent execution stream' },
        { id: 'create', label: 'AI Copywriting', icon: Sparkles, badge: '100% Free', desc: 'RankMath 100/100 blog & article studio' },
        { id: 'campaigns', label: 'Topic Campaigns', icon: Target, desc: 'Automated daily topic clusters & queues' },
        { id: 'content', label: 'Published Archive', icon: FileText, desc: 'Inspect, audit, and manage published articles' },
      ]
    },
    {
      title: 'Fleet & Indexing Satellites',
      description: 'Multi-site distribution and instant search indexing',
      items: [
        { id: 'sites', label: 'Fleet Matrix', icon: Globe, desc: 'Multi-site WordPress REST API orchestration' },
        { id: 'gsc', label: 'Fast Indexing', icon: SearchCheck, badge: 'Googlebot', desc: 'Web Search Indexing API v3 satellite' },
        { id: 'links', label: 'Backlink Silo', icon: Link2, desc: 'Mandatory internal & external authority anchors' },
      ]
    },
    {
      title: 'Telemetry & Operations',
      description: 'Auditing, credentials, and local node diagnostics',
      items: [
        { id: 'analytics', label: 'SEO Telemetry', icon: BarChart3, desc: 'Live Search Console & GA4 performance audit' },
        { id: 'settings', label: 'API & MCP Keys', icon: Sliders, desc: 'Configure models, endpoints, and MCP tokens' },
        { id: 'support', label: 'Diagnostics', icon: LifeBuoy, desc: 'Local CLI health check and troubleshooting' },
      ]
    }
  ];

  const allNavItems = navGroups.flatMap(g => g.items);

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    setMegaMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col relative overflow-x-hidden selection:bg-[#0047FF]/20 selection:text-[#0047FF]">

      {/* ── AMBIENT ARCHITECTURAL BACKDROP ── */}
      <div className="orbital-ambient-grid" />

      {/* ══════════════════════════════════════════════════
          COMMAND HEADER (Swiss Minimalist)
      ══════════════════════════════════════════════════ */}
      <header className="relative z-40 sticky top-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 lg:px-8 py-3 flex items-center justify-between gap-4 shadow-sm">
        
        {/* Left: Brand Logo & Subtitle */}
        <div 
          onClick={() => handleSelectTab('pipeline')}
          className="cursor-pointer shrink-0"
        >
          <OniLogo size="md" />
        </div>

        {/* Center: Navigation Bar with Mega Menu Trigger */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 shadow-2xs">
          
          {/* Mega Menu Dropdown Trigger */}
          <button
            onClick={() => setMegaMenuOpen(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              megaMenuOpen 
                ? 'bg-[#0047FF] text-white shadow-sm' 
                : 'text-slate-700 hover:text-slate-900 hover:bg-white'
            }`}
            title="Open Complete Suite Mega Menu"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Suite Menu</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          <div className="w-px h-4 bg-slate-300 mx-0.5" />

          {/* Direct Core Action Pills */}
          {[
            { id: 'pipeline', label: 'Pipeline', icon: Cpu, badge: 'LIVE' },
            { id: 'create', label: 'Write Blog', icon: Sparkles },
            { id: 'sites', label: 'Fleet Matrix', icon: Globe },
            { id: 'gsc', label: 'Fast Indexing', icon: SearchCheck },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-btn-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#0047FF] text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-[#0f172a] hover:bg-white'
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
        </div>

        {/* Right: Telemetry Quota & Operator Pill */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Mobile Mega Menu Toggle */}
          <button
            onClick={() => setMegaMenuOpen(v => !v)}
            className="lg:hidden p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white cursor-pointer"
            title="Open Navigation Menu"
          >
            {megaMenuOpen ? <X className="w-4 h-4 text-[#0047FF]" /> : <LayoutGrid className="w-4 h-4 text-[#0047FF]" />}
          </button>

          {/* Indexing Token Battery */}
          <div 
            onClick={() => handleSelectTab('gsc')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono cursor-pointer hover:border-[#0047FF]/40 hover:bg-white transition-all shadow-2xs"
            title="Daily Google Indexing API Quota"
          >
            <BatteryCharging className="w-4 h-4 text-[#0047FF]" />
            <span className="text-slate-900 font-bold">184</span>
            <span className="text-slate-400">/200</span>
          </div>

          {/* Diagnostic Bell */}
          <button
            onClick={() => handleSelectTab('support')}
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
            onClick={() => handleSelectTab('settings')}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-lg bg-slate-50 border border-slate-200 hover:border-[#0047FF]/40 hover:bg-white cursor-pointer transition-all shadow-2xs"
            title="Operator Settings"
          >
            <div className="w-7 h-7 rounded-md overflow-hidden border border-slate-200 relative bg-white p-0.5">
              <Image
                src="/operator_avatar.png"
                alt="System Operator"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div className="hidden xl:block text-left">
              <span className="text-[11px] font-bold text-slate-900 block leading-tight">Operator</span>
              <span className="text-[9px] font-mono text-[#0047FF] block leading-tight">● Online</span>
            </div>
          </div>

        </div>
      </header>

      {/* ══════════════════════════════════════════════════
          ARCHITECTURAL SWISS MEGA MENU OVERLAY
      ══════════════════════════════════════════════════ */}
      {megaMenuOpen && (
        <div className="fixed inset-0 z-50 pt-[65px] bg-slate-900/25 backdrop-blur-sm transition-all flex justify-center animate-fadeIn">
          <div 
            className="w-full max-w-5xl mx-4 my-4 bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mega Menu Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0047FF]/10 text-[#0047FF] flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">OniPress Complete Suite</h3>
                  <p className="text-xs text-slate-500">Autonomous WordPress publishing, indexing, and fleet matrix</p>
                </div>
              </div>
              <button
                onClick={() => setMegaMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3 Mega Menu Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {navGroups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0047FF] mb-0.5">
                      {group.title}
                    </h4>
                    <p className="text-[11px] text-slate-400">{group.description}</p>
                  </div>

                  <div className="space-y-1.5">
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectTab(item.id)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer group flex items-start justify-between gap-2 ${
                            isActive
                              ? 'bg-[#0047FF]/5 border-[#0047FF] shadow-2xs'
                              : 'bg-slate-50 border-slate-200 hover:border-[#0047FF]/40 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                              isActive ? 'bg-[#0047FF] text-white' : 'bg-white text-slate-600 border border-slate-200 group-hover:text-[#0047FF]'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs font-bold ${isActive ? 'text-[#0047FF]' : 'text-slate-900 group-hover:text-[#0047FF]'}`}>
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-[#0047FF]/10 text-[#0047FF] border border-[#0047FF]/20">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.desc}</p>
                            </div>
                          </div>
                          <ArrowUpRight className={`w-3.5 h-3.5 shrink-0 transition-opacity ${isActive ? 'text-[#0047FF] opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Mega Menu Footer Note */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
              <span>Zero-cost Google Gemini 2.5 Flash + Imagen 3 binary multi-agent stack</span>
              <span className="font-mono text-[11px] text-[#0047FF]">RankMath 100/100 Enforced</span>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Nav Pills Strip */}
      <div className="lg:hidden sticky top-[57px] z-20 px-4 py-2 border-b border-slate-200 bg-white/95 backdrop-blur-md overflow-x-auto no-scrollbar flex items-center gap-1.5 shadow-2xs">
        {allNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
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
          <LivePipeline onNavigateToBlogger={() => handleSelectTab('create')} />
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
          COMMAND FOOTER (Swiss Minimalist)
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
