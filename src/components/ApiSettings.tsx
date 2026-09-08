'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, ExternalLink } from 'lucide-react';

const FIELDS = [
  {
    key: 'geminiApiKey',
    label: 'Google Gemini Key (Free with Gmail)',
    group: 'Google Cloud / Gemini',
    placeholder: 'AIza...',
    type: 'password',
    helpLink: 'https://aistudio.google.com/app/apikey',
    helpText: 'Get Free Key with Gmail (0$ / No Credit Card)',
  },
  {
    key: 'openRouterApiKey',
    label: 'OpenRouter API Key (Supports :free Models)',
    group: 'OpenRouter Aggregator',
    placeholder: 'sk-or-v1-...',
    type: 'password',
    helpLink: 'https://openrouter.ai/keys',
    helpText: 'Get Free Key for Llama 3.1, Mistral & Qwen :free models',
  },
  {
    key: 'openaiApiKey',
    label: 'OpenAI API Key',
    group: 'OpenAI',
    placeholder: 'sk-...',
    type: 'password',
    helpLink: 'https://platform.openai.com/api-keys',
    helpText: 'OpenAI Developer Dashboard',
  },
  {
    key: 'anthropicApiKey',
    label: 'Anthropic (Claude) Key',
    group: 'Anthropic',
    placeholder: 'sk-ant-...',
    type: 'password',
    helpLink: 'https://console.anthropic.com/',
    helpText: 'Anthropic Console',
  },
  {
    key: 'customApiUrl',
    label: 'Custom Endpoint URL (e.g. Ollama)',
    group: 'Local Engine / Ollama',
    placeholder: 'http://localhost:11434/v1',
    type: 'text',
    helpText: 'Use Ollama or LM Studio running locally on your computer',
  },
  {
    key: 'customApiKey',
    label: 'Custom API Key (Optional)',
    group: 'Local Engine / Ollama',
    placeholder: 'sk-... (leave blank if local Ollama)',
    type: 'password',
  },
];

export default function ApiSettings() {
  const [keys, setKeys]       = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setKeys({
        openRouterApiKey: d.openRouterApiKey || '',
        openaiApiKey:     d.openaiApiKey     || '',
        anthropicApiKey:  d.anthropicApiKey  || '',
        geminiApiKey:     d.geminiApiKey     || '',
        customApiUrl:     d.customApiUrl     || '',
        customApiKey:     d.customApiKey     || '',
      });
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keys),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputStyle = {
    background:   '#ffffff',
    border:       '1px solid #e2e8f0',
    color:        '#0f172a',
    borderRadius: '10px',
    fontSize:     '13px',
    padding:      '8px 12px',
    width:        '100%',
    outline:      'none',
    transition:   'border-color 0.2s',
  } as React.CSSProperties;

  if (loading) return (
    <div className="flex items-center gap-2 text-xs text-slate-500 p-6">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading settings…
    </div>
  );

  const groups = [...new Set(FIELDS.map(f => f.group))];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-0.5">Model &amp; API Configuration</h2>
        <p className="text-xs text-slate-500">
          Connect external AI inference endpoints. The default Antigravity engine functions locally with zero subscription requirements.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map(group => {
          const groupFields = FIELDS.filter(f => f.group === group);
          return (
            <div
              key={group}
              className="rounded-xl p-4 space-y-3 bg-slate-50 border border-slate-200"
            >
              {/* Group label */}
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0047FF]" />
                <span className="text-xs font-bold text-slate-900">{group}</span>
              </div>

              {groupFields.map(({ key, label, placeholder, type, helpLink, helpText }) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">{label}</label>
                    {helpLink && (
                      <a
                        href={helpLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-[#0047FF] hover:underline font-semibold"
                      >
                        {helpText || 'Get Key'} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={keys[key] || ''}
                    onChange={e => setKeys(prev => ({ ...prev, [key]: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#0047FF'; e.target.style.boxShadow = '0 0 0 3px rgba(0, 71, 255, 0.12)'; }}
                    onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                  {!helpLink && helpText && (
                    <p className="text-[10px] text-slate-400 pl-1">{helpText}</p>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-xl px-8 py-2.5 text-xs font-bold flex items-center gap-2 text-white bg-[#0047FF] hover:bg-[#0037cc] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {saving
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
            : 'Save All Credentials'
          }
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Saved successfully!
          </span>
        )}
      </div>

      {/* Info note */}
      <p className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-200 pt-4">
        🔒 Credentials are encrypted and stored locally in <code className="text-[#0047FF] font-mono">data/settings.json</code> on your machine. They are never transmitted to any central telemetry server.
      </p>
    </div>
  );
}
