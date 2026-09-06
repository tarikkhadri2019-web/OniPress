'use client';

import { useState } from 'react';
import { HelpCircle, BookOpen, Terminal, CheckCircle2, MessageSquare, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

export default function SupportCenter() {
  const [copiedCmd, setCopiedCmd] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(''), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <p className="oni-cursive text-[#ff9940] text-2xl mb-1">Support &amp; Troubleshooting</p>
          <p className="text-xs text-[#a09070]">Guides, command reference, and direct help for your OniPress automation environment.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-[#ff7a18]/10 text-[#ff9940] border border-[#ff7a18]/30 font-semibold">
            Antigravity Gemini 2.5 Ready
          </span>
        </div>
      </div>

      {/* Diagnostics / Quick Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Zap className="w-4 h-4 text-green-400" />
            AI CLI Engine
          </div>
          <p className="text-xs text-[#a09070]">Antigravity CLI (agy) active via your IDE login.</p>
          <span className="text-[10px] text-green-400 font-semibold">No API Keys Needed</span>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-[#ff7a18]" />
            WordPress Plugin
          </div>
          <p className="text-xs text-[#a09070]">OniPress Connect plugin v1.1.0 with TOC whitelisting.</p>
          <span className="text-[10px] text-[#ff7a18] font-semibold">REST API Active</span>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <BookOpen className="w-4 h-4 text-blue-400" />
            RankMath Compliance
          </div>
          <p className="text-xs text-[#a09070]">Auto-sanitizer injects Table of Contents, table, and links.</p>
          <span className="text-[10px] text-blue-400 font-semibold">100/100 Guaranteed</span>
        </div>
      </div>

      {/* Quick Diagnostics Commands */}
      <div className="p-5 rounded-2xl bg-black/30 border border-white/[0.06] space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#ff7a18]" />
          Terminal Diagnostic Commands
        </h3>
        <p className="text-xs text-[#a09070]">If you ever experience a generation delay, run these commands in your terminal to test Antigravity:</p>

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
            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-black/50 border border-white/5 font-mono text-xs text-[#faf5ef]">
              <div className="truncate mr-3">
                <span className="text-[#a09070] mr-2"># {item.label}:</span>
                <span className="text-[#ff9940]">{item.cmd}</span>
              </div>
              <button
                onClick={() => copyToClipboard(item.cmd, item.id)}
                className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-[10px] text-white shrink-0 transition-colors"
              >
                {copiedCmd === item.id ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Frequently Encountered Questions */}
      <div className="p-5 rounded-2xl bg-black/30 border border-white/[0.06] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#ff7a18]" />
          Frequently Asked Questions
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <h4 className="font-bold text-white">How does Antigravity generate articles without API keys?</h4>
            <p className="text-[#a09070] leading-relaxed">
              OniPress communicates directly with the local <code className="text-[#ff9940]">agy</code> command-line executable installed on your machine. Because your Antigravity IDE is authenticated with your Google account, it automatically signs each AI inference call without needing third-party API subscriptions.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <h4 className="font-bold text-white">Can I generate images using Antigravity?</h4>
            <p className="text-[#a09070] leading-relaxed">
              The Antigravity CLI binary is designed for text and code generation. For blog images, you can now enter a custom <strong>Image Prompt</strong> in the Write Blog tab or paste an image URL from Google Nano Banana or your WordPress media library.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <h4 className="font-bold text-white">How do I verify 100/100 RankMath compliance?</h4>
            <p className="text-[#a09070] leading-relaxed">
              Every post generated by OniPress passes through the built-in SEO post-processor. It guarantees at least 1,200 words, inserts an interactive Table of Contents (<code className="text-[#ff9940]">#rank-math-toc</code>), adds an inline image with focus keyword alt text, and balances keyword density between 1.0% and 1.5%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
