'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Image as ImageIcon, Video, Globe, Satellite, 
  Activity, Zap, ShieldCheck, CheckCircle2, AlertCircle, Play, 
  Cpu, ArrowRight, Gauge, Radio
} from 'lucide-react';

interface LivePipelineProps {
  onNavigateToBlogger?: () => void;
}

export default function LivePipeline({ onNavigateToBlogger }: LivePipelineProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [latency, setLatency] = useState<number>(42);
  const [quotaCount, setQuotaCount] = useState<number>(184);
  const [wordCount] = useState<number>(1480);
  const [sitesCount] = useState<number>(3);

  // Periodic latency fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => Math.max(38, Math.min(48, prev + Math.floor(Math.random() * 5) - 2)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(1);

    const timeouts = [
      setTimeout(() => setActiveStep(2), 1200),
      setTimeout(() => setActiveStep(3), 2400),
      setTimeout(() => setActiveStep(4), 3600),
      setTimeout(() => setActiveStep(5), 4800),
      setTimeout(() => {
        setIsSimulating(false);
        setQuotaCount(q => Math.max(0, q - 1));
      }, 6000),
    ];

    return () => timeouts.forEach(clearTimeout);
  };

  return (
    <div className="space-y-6">
      {/* ── TOP ACTION BAR: Pipeline Header & Dispatch Button ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0047FF]/10 border border-[#0047FF]/25 flex items-center justify-center text-[#0047FF]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Autonomous Neural Pipeline
              <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-[#0047FF]/10 text-[#0047FF] border border-[#0047FF]/20">
                ● Active
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Multi-agent execution telemetry: Copywriting → Vision → Video → CMS → Indexing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0047FF] hover:bg-[#0037cc] active:scale-95 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Executing Pipeline…' : 'Pulse Simulation'}</span>
          </button>

          {onNavigateToBlogger && (
            <button
              onClick={onNavigateToBlogger}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            >
              <span>Open Writer</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0047FF]" />
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN 3-COLUMN SWISS ARCHITECTURAL GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT COLUMN: Latency Meter & Daily Quota Battery Gauge (3 cols) ── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Live Latency Telemetry */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-sans font-semibold tracking-wider text-slate-500 uppercase">Live Latency</span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0047FF]/10 text-[#0047FF] border border-[#0047FF]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0047FF]" />
                Live
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{latency}</span>
              <span className="text-sm font-semibold text-slate-500">ms</span>
            </div>
            {/* Latency progress bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Node P95: 38ms</span>
                <span>Max: 54ms</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0047FF] rounded-full transition-all duration-500"
                  style={{ width: `${(latency / 60) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Telemetry Metrics Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <span className="text-[11px] font-sans font-semibold tracking-wider text-slate-500 uppercase block">
              Node Telemetry
            </span>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">AI Model</span>
                <span className="text-[#0047FF] font-semibold">Gemini 2.5 Flash</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Target Length</span>
                <span className="text-slate-900 font-semibold">{wordCount} words</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Keyword Target</span>
                <span className="text-[#0047FF] font-semibold">1.1% (RankMath)</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">Media Streamer</span>
                <span className="text-slate-900 font-semibold">Multipart Binary</span>
              </div>
            </div>
          </div>

          {/* Daily Google Indexing Quota Circular Gauge */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-[11px] font-sans font-semibold tracking-wider text-slate-500 uppercase">
                Daily Indexing Quota
              </span>
              <Gauge className="w-4 h-4 text-[#0047FF]" />
            </div>

            {/* Circular Gauge Graphic (Clean Swiss Electric Cobalt) */}
            <div className="relative w-32 h-32 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#0047FF"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * quotaCount) / 200}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900 font-mono">{quotaCount}</span>
                <span className="text-[10px] font-medium text-slate-500">/ 200 tokens</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 font-medium mt-2">
              {quotaCount > 0 ? '✓ Fast Indexing Ready' : '⚠️ Quota Resets 00:00 UTC'}
            </p>
          </div>
        </div>

        {/* ── CENTER STAGE: Live Interactive Visual Pipeline (6 cols) ── */}
        <div className="lg:col-span-6 rounded-2xl bg-white border border-slate-200/90 p-6 relative overflow-hidden flex flex-col justify-between shadow-sm min-h-[540px]">
          
          {/* Subtle Grid lines background */}
          <div 
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-sans font-bold tracking-wider text-[#0047FF] uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Live Node Topology
              </span>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Autonomous publishing stream with zero blocking locks
              </p>
            </div>
            <span className="text-[11px] font-sans font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
              DAG Pipeline v2
            </span>
          </div>

          {/* ── THE NODES NETWORK ── */}
          <div className="relative z-10 my-8 space-y-5">

            {/* NODE 1: Gemini Copywriting */}
            <div className={`p-4 rounded-xl border transition-all duration-300 relative flex items-center justify-between ${
              activeStep === 1 
                ? 'bg-[#0047FF]/5 border-[#0047FF] shadow-sm ring-2 ring-[#0047FF]/20' 
                : activeStep > 1
                ? 'bg-slate-50 border-slate-300'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  activeStep >= 1 ? 'bg-[#0047FF] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    Gemini AI Copywriting Engine
                    {activeStep === 1 && <span className="text-[9px] font-bold text-[#0047FF] animate-pulse">STREAMING TOKENS…</span>}
                    {activeStep > 1 && <span className="text-[9px] font-bold text-emerald-600">COMPLETED (1,480w)</span>}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    H2/H3 semantic structure, 1.1% density, standalone FAQs, TOC
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                Node: AI-01
              </span>
            </div>

            {/* Connecting Conduit 1 -> 2 */}
            <div className="flex justify-center -my-2">
              <div className={`w-0.5 h-6 transition-all duration-300 ${activeStep >= 1 ? 'bg-[#0047FF]' : 'bg-slate-200'}`} />
            </div>

            {/* TWO PARALLEL NODES: Imagen 3 & YouTube */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* NODE 2: Imagen 3 */}
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${
                activeStep === 2
                  ? 'bg-[#0047FF]/5 border-[#0047FF] ring-2 ring-[#0047FF]/20'
                  : activeStep > 2
                  ? 'bg-slate-50 border-slate-300'
                  : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    activeStep >= 2 ? 'bg-[#0047FF] text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Imagen 3 Visuals</h4>
                </div>
                <p className="text-[10px] text-slate-500">
                  16:9 featured visual + focus keyword ALT tag
                </p>
              </div>

              {/* NODE 3: YouTube Scraper */}
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${
                activeStep === 3
                  ? 'bg-[#0047FF]/5 border-[#0047FF] ring-2 ring-[#0047FF]/20'
                  : activeStep > 3
                  ? 'bg-slate-50 border-slate-300'
                  : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    activeStep >= 3 ? 'bg-[#0047FF] text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Video className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">YouTube Embed</h4>
                </div>
                <p className="text-[10px] text-slate-500">
                  Top-ranking tutorial scrape (24h cache)
                </p>
              </div>
            </div>

            {/* Connecting Conduit 2/3 -> 4 */}
            <div className="flex justify-center -my-2">
              <div className={`w-0.5 h-6 transition-all duration-300 ${activeStep >= 3 ? 'bg-[#0047FF]' : 'bg-slate-200'}`} />
            </div>

            {/* NODE 4: WordPress Sideload */}
            <div className={`p-4 rounded-xl border transition-all duration-300 relative flex items-center justify-between ${
              activeStep === 4
                ? 'bg-[#0047FF]/5 border-[#0047FF] shadow-sm ring-2 ring-[#0047FF]/20'
                : activeStep > 4
                ? 'bg-slate-50 border-slate-300'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  activeStep >= 4 ? 'bg-[#0047FF] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    WordPress Multi-Site Sideload
                    {activeStep === 4 && <span className="text-[9px] font-bold text-[#0047FF] animate-pulse">TRANSACTING REST API…</span>}
                    {activeStep > 4 && <span className="text-[9px] font-bold text-emerald-600">HTTP 201 CREATED</span>}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Idempotent SHA256 check, media attachments, RankMath schema
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                Node: CMS-WP
              </span>
            </div>

            {/* Connecting Conduit 4 -> 5 */}
            <div className="flex justify-center -my-2">
              <div className={`w-0.5 h-6 transition-all duration-300 ${activeStep >= 4 ? 'bg-[#0047FF]' : 'bg-slate-200'}`} />
            </div>

            {/* NODE 5: Google Fast Indexing Satellites */}
            <div className={`p-4 rounded-xl border transition-all duration-300 relative flex items-center justify-between ${
              activeStep === 5
                ? 'bg-[#0047FF]/10 border-[#0047FF] shadow-sm ring-2 ring-[#0047FF]/20'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  activeStep === 5 ? 'bg-[#0047FF] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Satellite className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    Google Search Console Fast Indexing Satellite
                    {activeStep === 5 && <span className="text-[9px] font-bold text-[#0047FF] animate-pulse">GOOGLEBOT PINGED!</span>}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Direct Web Search Indexing v3 payload, immediate URL crawl
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#0047FF] bg-[#0047FF]/10 px-2 py-1 rounded border border-[#0047FF]/20">
                GSC-SAT
              </span>
            </div>

          </div>

          {/* Footer status bar */}
          <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-[#0047FF]" />
              System Status: Nominal
            </span>
            <span className="font-mono text-slate-400">Zero-Cost Infrastructure</span>
          </div>
        </div>

        {/* ── RIGHT COLUMN: RankMath 100/100 Dials & Fleet Matrix (3 cols) ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* RankMath 100/100 Circular Score Dials */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-sans font-semibold tracking-wider text-slate-500 uppercase">
                RankMath 100/100
              </span>
              <ShieldCheck className="w-4 h-4 text-[#0047FF]" />
            </div>

            {/* 4 Circular Dials Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Dial 1: Overall SEO */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-13 h-13 rounded-full border-2 border-[#0047FF] flex items-center justify-center font-mono font-black text-[#0047FF] text-base">
                  100
                </div>
                <span className="text-[10px] font-medium text-slate-600 mt-1.5">Audit Score</span>
              </div>

              {/* Dial 2: Content Length */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-13 h-13 rounded-full border-2 border-slate-900 flex items-center justify-center font-mono font-black text-slate-900 text-base">
                  100
                </div>
                <span className="text-[10px] font-medium text-slate-600 mt-1.5">Word Length</span>
              </div>

              {/* Dial 3: Media & Video */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-13 h-13 rounded-full border-2 border-[#0047FF] flex items-center justify-center font-mono font-black text-[#0047FF] text-base">
                  100
                </div>
                <span className="text-[10px] font-medium text-slate-600 mt-1.5">Media &amp; Alt</span>
              </div>

              {/* Dial 4: Indexing */}
              <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-13 h-13 rounded-full border-2 border-slate-900 flex items-center justify-center font-mono font-black text-slate-900 text-base">
                  100
                </div>
                <span className="text-[10px] font-medium text-slate-600 mt-1.5">Fast Index</span>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-1.5 text-[11px] pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0047FF]" />
                <span>Primary Keyword in Title</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0047FF]" />
                <span>Featured Image ALT keyword</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0047FF]" />
                <span>Responsive YouTube 16:9</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0047FF]" />
                <span>Internal &amp; Wiki Links</span>
              </div>
            </div>
          </div>

          {/* Multi-Site Fleet Status Matrix */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-sans font-semibold tracking-wider text-slate-500 uppercase">
                Multi-Site Fleet
              </span>
              <span className="text-[10px] font-bold text-[#0047FF] bg-[#0047FF]/10 px-2 py-0.5 rounded border border-[#0047FF]/20">
                {sitesCount} Connected
              </span>
            </div>

            {/* Sites Health Rows */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0047FF]" />
                  <span className="text-slate-900 font-semibold">maroc-gps.net</span>
                </div>
                <span className="text-[10px] font-mono text-[#0047FF] font-bold">42ms</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0047FF]" />
                  <span className="text-slate-900 font-semibold">tech-insights.io</span>
                </div>
                <span className="text-[10px] font-mono text-[#0047FF] font-bold">68ms</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-slate-900 font-semibold">auto-review.ma</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Standby</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
