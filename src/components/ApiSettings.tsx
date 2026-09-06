'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, ExternalLink } from 'lucide-react';

const FIELDS = [
  {
    key: 'geminiApiKey',
    label: 'Google Gemini Key (Free with Gmail)',
    group: 'Google',
    placeholder: 'AIza...',
    type: 'password',
    helpLink: 'https://aistudio.google.com/app/apikey',
    helpText: 'Get Free Key with Gmail (0$ / No Credit Card)',
  },
  {
    key: 'openRouterApiKey',
    label: 'OpenRouter API Key (Supports :free Models)',
    group: 'OpenRouter',
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
    group: 'Custom (100% Free / Local)',
    placeholder: 'http://localhost:11434/v1',
    type: 'text',
    helpText: 'Use Ollama or LM Studio running locally on your computer',
  },
  {
    key: 'customApiKey',
    label: 'Custom API Key (Optional)',
    group: 'Custom (100% Free / Local)',
    placeholder: 'sk-... (leave blank if local Ollama)',
    type: 'password',
  },
];

const GROUP_COLORS: Record<string, string> = {
  Google:                       '#3b82f6',
  OpenRouter:                   '#ff7a18',
  OpenAI:                       '#10b981',
  Anthropic:                    '#8b5cf6',
  'Custom (100% Free / Local)': '#eab308',
};

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
    background:   'rgba(0,0,0,0.5)',
    border:       '1px solid rgba(255,255,255,0.1)',
    color:        '#faf5ef',
    borderRadius: '10px',
    fontSize:     '13px',
    padding:      '8px 12px',
    width:        '100%',
    outline:      'none',
    transition:   'border-color 0.2s',
  } as React.CSSProperties;

  if (loading) return (
    <div className="flex items-center gap-2 text-xs text-[#a09070] p-6">
      <Loader2 className="w-4 h-4 animate-spin" /> Loading settings…
    </div>
  );

  const groups = [...new Set(FIELDS.map(f => f.group))];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="pb-4 border-b border-white/[0.07]">
        <p className="oni-cursive text-[#ff9940] text-xl mb-0.5">API Settings</p>
        <p className="text-[11px] text-[#a09070]">
          Connect any AI provider. Free options include Google Gemini with your Gmail account or OpenRouter :free models.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map(group => {
          const groupFields = FIELDS.filter(f => f.group === group);
          const color = GROUP_COLORS[group] || '#a09070';
          return (
            <div
              key={group}
              className="rounded-xl p-4 space-y-3"
              style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${color}25` }}
            >
              {/* Group label */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                <span className="text-xs font-bold" style={{ color }}>{group}</span>
              </div>

              {groupFields.map(({ key, label, placeholder, type, helpLink, helpText }) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#a09070] uppercase tracking-wide">{label}</label>
                    {helpLink && (
                      <a
                        href={helpLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-[#ff7a18] hover:underline"
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
                    onFocus={e => { e.target.style.borderColor = `${color}80`; e.target.style.boxShadow = `0 0 0 3px ${color}15`; }}
                    onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                  />
                  {!helpLink && helpText && (
                    <p className="text-[10px] text-[#a09070]/70 pl-1">{helpText}</p>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Save button full width */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="oni-btn rounded-xl px-8 py-2.5 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
        >
          {saving
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
            : 'Save All API Keys'
          }
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-green-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Saved successfully!
          </span>
        )}
      </div>

      {/* Info note */}
      <p className="text-[10px] text-[#604030] leading-relaxed border-t border-white/[0.05] pt-4">
        🔒 All API keys are stored locally in <code className="text-[#ff7a18]">data/settings.json</code> on your computer only.
        They are never sent to any external server other than the AI provider you select.
      </p>
    </div>
  );
}
