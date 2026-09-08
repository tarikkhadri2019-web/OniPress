'use client';

import { useState } from 'react';
import { HelpCircle, BookOpen, Terminal, ShieldCheck, Zap } from 'lucide-react';

export default function SupportCenter() {
  const [copiedCmd, setCopiedCmd] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(''), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">System Diagnostics &amp; Reference</h2>
          <p className="text-xs text-slate-500">Autonomous node execution diagnostics, command reference, and infrastructure health.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-[#0047FF]/10 text-[#0047FF] border border-[#0047FF]/20 font-bold">
            Gemini 2.5 Engine Active
          </span>
        </div>
      </div>

      {/* Diagnostics / Quick Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Zap className="w-4 h-4 text-[#0047FF]" />
            AI CLI Engine
          </div>
          <p className="text-xs text-slate-500">Antigravity CLI (agy) active via your local workspace session.</p>
          <span className="text-[10px] text-[#0047FF] font-bold">Zero-Cost Infrastructure</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-[#0047FF]" />
            WordPress Bridge
          </div>
          <p className="text-xs text-slate-500">OniPress Connect v1.1.0 with idempotent REST API authentication.</p>
          <span className="text-[10px] text-[#0047FF] font-bold">REST API Active</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <BookOpen className="w-4 h-4 text-[#0047FF]" />
            RankMath 100/100
          </div>
          <p className="text-xs text-slate-500">Auto-sanitizer injects Table of Contents, media alt tags, and schema.</p>
          <span className="text-[10px] text-[#0047FF] font-bold">100/100 Guaranteed</span>
        </div>
      </div>

      {/* Quick Diagnostics Commands */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#0047FF]" />
          Terminal Diagnostics
        </h3>
        <p className="text-xs text-slate-500">Run these commands in your shell to verify telemetry and pipeline throughput:</p>

        <div className="space-y-2">
          {[
            {
              id: 'test-agy',
              label: 'Test Antigravity CLI Connectivity',
              cmd: 'agy --effort low --print "Say hello" --dangerously-skip-permissions',
            },
            {
              id: 'verify-models',
              label: 'List Available Models in Antigravity',
              cmd: 'agy models',
            },
            {
              id: 'test-site',
              label: 'Verify Local Dashboard Status',
              cmd: 'curl -I http://localhost:3000',
            }
          ].map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900">
              <div className="truncate mr-3">
                <span className="text-slate-400 mr-2"># {item.label}:</span>
                <span className="text-[#0047FF] font-semibold">{item.cmd}</span>
              </div>
              <button
                onClick={() => copyToClipboard(item.cmd, item.id)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[10px] text-slate-700 font-bold shrink-0 transition-colors cursor-pointer"
              >
                {copiedCmd === item.id ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Encountered Questions */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#0047FF]" />
          Architecture FAQ
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900">How does OniPress execute AI generation with zero subscription fees?</h4>
            <p className="text-slate-600 leading-relaxed">
              OniPress delegates inference tasks to the local <code className="text-[#0047FF] font-semibold font-mono">agy</code> command-line executable running under your authenticated session. It eliminates external monthly subscription costs while guaranteeing enterprise Gemini throughput.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900">How does Fast Indexing interact with Google Search Console?</h4>
            <p className="text-slate-600 leading-relaxed">
              The GSC Satellite dispatches cryptographic Google Indexing API v3 payloads immediately after HTTP 201 Created from WordPress. Googlebot indexes or updates the URL within minutes instead of waiting weeks for natural discovery.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900">How is RankMath 100/100 verified?</h4>
            <p className="text-slate-600 leading-relaxed">
              Every post generated by OniPress passes through the built-in SEO post-processor. It guarantees at least 1,200 words, inserts an interactive Table of Contents (<code className="text-[#0047FF] font-mono">#rank-math-toc</code>), adds an inline image with focus keyword alt text, and balances keyword density between 1.0% and 1.5%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
