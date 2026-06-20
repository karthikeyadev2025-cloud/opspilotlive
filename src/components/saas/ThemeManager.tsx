import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, RefreshCw, Palette, Type, Square, Code, CheckCircle, AlertCircle, Eye } from 'lucide-react';

interface Theme {
  id: string;
  color_primary: string;
  color_primary_hover: string;
  color_accent: string;
  color_bg_base: string;
  color_bg_surface: string;
  color_bg_elevated: string;
  color_text_primary: string;
  color_text_secondary: string;
  color_text_muted: string;
  color_border: string;
  color_border_strong: string;
  color_success: string;
  color_warning: string;
  color_error: string;
  font_family: string;
  font_size_base: string;
  border_radius_sm: string;
  border_radius_md: string;
  border_radius_lg: string;
  border_radius_xl: string;
  custom_css: string;
  updated_at: string;
}

const DEFAULT_THEME: Omit<Theme, 'id' | 'updated_at'> = {
  color_primary: '#06b6d4',
  color_primary_hover: '#22d3ee',
  color_accent: '#3b82f6',
  color_bg_base: '#020617',
  color_bg_surface: '#0f172a',
  color_bg_elevated: '#1e293b',
  color_text_primary: '#f8fafc',
  color_text_secondary: '#94a3b8',
  color_text_muted: '#475569',
  color_border: '#1e293b',
  color_border_strong: '#334155',
  color_success: '#10b981',
  color_warning: '#f59e0b',
  color_error: '#ef4444',
  font_family: 'Inter, system-ui, sans-serif',
  font_size_base: '14px',
  border_radius_sm: '8px',
  border_radius_md: '12px',
  border_radius_lg: '16px',
  border_radius_xl: '20px',
  custom_css: '',
};

const PRESETS = [
  {
    name: 'OpsPilot Dark',
    desc: 'Default dark blue theme',
    values: { ...DEFAULT_THEME },
  },
  {
    name: 'Midnight Green',
    desc: 'Deep dark with emerald accent',
    values: {
      ...DEFAULT_THEME,
      color_primary: '#10b981',
      color_primary_hover: '#34d399',
      color_accent: '#059669',
      color_bg_base: '#020c07',
      color_bg_surface: '#071a0f',
      color_bg_elevated: '#0d2e1a',
      color_border: '#0d2e1a',
      color_border_strong: '#14532d',
    },
  },
  {
    name: 'Slate Professional',
    desc: 'Neutral dark, slate blue accent',
    values: {
      ...DEFAULT_THEME,
      color_primary: '#60a5fa',
      color_primary_hover: '#93c5fd',
      color_accent: '#2563eb',
      color_bg_base: '#0b0f19',
      color_bg_surface: '#111827',
      color_bg_elevated: '#1f2937',
      color_border: '#1f2937',
      color_border_strong: '#374151',
    },
  },
  {
    name: 'Warm Business',
    desc: 'Dark amber, warm tones',
    values: {
      ...DEFAULT_THEME,
      color_primary: '#f59e0b',
      color_primary_hover: '#fbbf24',
      color_accent: '#d97706',
      color_bg_base: '#0f0a00',
      color_bg_surface: '#1a1200',
      color_bg_elevated: '#292000',
      color_border: '#292000',
      color_border_strong: '#3d2e00',
      color_text_secondary: '#a78a50',
      color_text_muted: '#6b5a2e',
    },
  },
];

const FONT_OPTIONS = [
  'Inter, system-ui, sans-serif',
  'Geist, Inter, system-ui, sans-serif',
  "'DM Sans', system-ui, sans-serif",
  "'Plus Jakarta Sans', system-ui, sans-serif",
  "'Outfit', system-ui, sans-serif",
  "'Nunito', system-ui, sans-serif",
  'system-ui, sans-serif',
  "'Courier New', monospace",
];

function applyThemeToDOM(t: Partial<Theme>) {
  const root = document.documentElement;
  if (t.color_primary) root.style.setProperty('--color-primary', t.color_primary);
  if (t.color_primary_hover) root.style.setProperty('--color-primary-hover', t.color_primary_hover);
  if (t.color_accent) root.style.setProperty('--color-accent', t.color_accent);
  if (t.color_bg_base) root.style.setProperty('--color-bg-base', t.color_bg_base);
  if (t.color_bg_surface) root.style.setProperty('--color-bg-surface', t.color_bg_surface);
  if (t.color_bg_elevated) root.style.setProperty('--color-bg-elevated', t.color_bg_elevated);
  if (t.color_text_primary) root.style.setProperty('--color-text-primary', t.color_text_primary);
  if (t.color_text_secondary) root.style.setProperty('--color-text-secondary', t.color_text_secondary);
  if (t.color_text_muted) root.style.setProperty('--color-text-muted', t.color_text_muted);
  if (t.color_border) root.style.setProperty('--color-border', t.color_border);
  if (t.color_border_strong) root.style.setProperty('--color-border-strong', t.color_border_strong);
  if (t.color_success) root.style.setProperty('--color-success', t.color_success);
  if (t.color_warning) root.style.setProperty('--color-warning', t.color_warning);
  if (t.color_error) root.style.setProperty('--color-error', t.color_error);
  if (t.font_family) root.style.setProperty('--font-family', t.font_family);
  if (t.font_size_base) root.style.setProperty('--font-size-base', t.font_size_base);
  if (t.border_radius_sm) root.style.setProperty('--radius-sm', t.border_radius_sm);
  if (t.border_radius_md) root.style.setProperty('--radius-md', t.border_radius_md);
  if (t.border_radius_lg) root.style.setProperty('--radius-lg', t.border_radius_lg);
  if (t.border_radius_xl) root.style.setProperty('--radius-xl', t.border_radius_xl);

  // Inject custom CSS
  let el = document.getElementById('ops-custom-css');
  if (!el) { el = document.createElement('style'); el.id = 'ops-custom-css'; document.head.appendChild(el); }
  el.textContent = t.custom_css || '';
}

function ColorRow({ label, field, value, onChange }: { label: string; field: string; value: string; onChange: (f: string, v: string) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-800/50 last:border-0">
      <div className="text-slate-300 text-sm">{label}</div>
      <div className="flex items-center gap-2.5">
        <span className="text-slate-500 font-mono text-xs">{value}</span>
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={e => onChange(field, e.target.value)}
            className="w-8 h-8 rounded-lg cursor-pointer border border-slate-700 bg-transparent p-0.5"
            style={{ backgroundColor: value }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ThemeManager() {
  const [theme, setTheme] = useState<Omit<Theme, 'id' | 'updated_at'>>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeSection, setActiveSection] = useState<'colors' | 'typography' | 'shape' | 'presets' | 'custom'>('colors');
  const [lastSaved, setLastSaved] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('platform_theme').select('*').eq('id', 'default').maybeSingle();
    if (data) {
      const rest: Omit<Theme, 'id' | 'updated_at'> = { ...data };
      setTheme(rest);
      setLastSaved(data.updated_at ? new Date(data.updated_at).toLocaleString('en-IN') : '');
      applyThemeToDOM(rest);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = (field: string, value: string) => {
    setTheme(prev => {
      const next = { ...prev, [field]: value };
      applyThemeToDOM({ [field]: value });
      return next;
    });
  };

  const save = async () => {
    setSaving(true); setMsg(null);
    const { error } = await supabase.from('platform_theme').upsert({
      id: 'default',
      ...theme,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) { setMsg({ type: 'error', text: error.message }); return; }
    setLastSaved(new Date().toLocaleString('en-IN'));
    setMsg({ type: 'success', text: 'Theme saved and applied to all users.' });
    setTimeout(() => setMsg(null), 3000);
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTheme(preset.values);
    applyThemeToDOM(preset.values);
  };

  const resetToDefault = () => {
    setTheme(DEFAULT_THEME);
    applyThemeToDOM(DEFAULT_THEME);
  };

  const SECTIONS = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'shape', label: 'Shape', icon: Square },
    { id: 'presets', label: 'Presets', icon: Eye },
    { id: 'custom', label: 'Custom CSS', icon: Code },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-bold">Theme Manager</div>
          <div className="text-slate-500 text-xs mt-0.5">
            Changes apply site-wide instantly for all users.
            {lastSaved && <span className="ml-2">Last saved: {lastSaved}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={resetToDefault}
            className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-2 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 text-xs bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold px-4 py-2 rounded-lg transition-colors">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* Live preview strip */}
      <div className="rounded-xl overflow-hidden border border-slate-800">
        <div className="text-xs text-slate-500 px-4 py-2 bg-slate-800/40 border-b border-slate-800">Live Preview</div>
        <div className="p-4 flex items-center gap-4 flex-wrap" style={{ backgroundColor: theme.color_bg_surface, fontFamily: theme.font_family }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.color_primary + '20' }}>
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: theme.color_primary }} />
            </div>
            <span className="text-sm font-bold" style={{ color: theme.color_text_primary, fontFamily: theme.font_family }}>OpsPilot</span>
          </div>
          <button className="text-xs font-bold px-4 py-2 rounded-lg" style={{ backgroundColor: theme.color_primary, color: theme.color_bg_base, borderRadius: theme.border_radius_sm }}>
            Primary Button
          </button>
          <button className="text-xs font-semibold px-4 py-2 rounded-lg border" style={{ borderColor: theme.color_border_strong, color: theme.color_text_secondary, borderRadius: theme.border_radius_sm }}>
            Secondary
          </button>
          <div className="text-xs px-3 py-1.5 rounded-md border" style={{ backgroundColor: theme.color_success + '18', color: theme.color_success, borderColor: theme.color_success + '30', borderRadius: theme.border_radius_sm }}>
            Active
          </div>
          <div className="text-xs px-3 py-1.5 rounded-md border" style={{ backgroundColor: theme.color_warning + '18', color: theme.color_warning, borderColor: theme.color_warning + '30', borderRadius: theme.border_radius_sm }}>
            Trial
          </div>
          <span className="text-xs" style={{ color: theme.color_text_secondary }}>Secondary text</span>
          <span className="text-xs" style={{ color: theme.color_text_muted }}>Muted text</span>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 overflow-x-auto">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeSection === s.id ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
            <s.icon className="w-3.5 h-3.5" /> {s.label}
          </button>
        ))}
      </div>

      {/* COLORS */}
      {activeSection === 'colors' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Brand</div>
            <ColorRow label="Primary" field="color_primary" value={theme.color_primary} onChange={update} />
            <ColorRow label="Primary Hover" field="color_primary_hover" value={theme.color_primary_hover} onChange={update} />
            <ColorRow label="Accent" field="color_accent" value={theme.color_accent} onChange={update} />
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Backgrounds</div>
            <ColorRow label="Base (deepest)" field="color_bg_base" value={theme.color_bg_base} onChange={update} />
            <ColorRow label="Surface (cards)" field="color_bg_surface" value={theme.color_bg_surface} onChange={update} />
            <ColorRow label="Elevated (modals)" field="color_bg_elevated" value={theme.color_bg_elevated} onChange={update} />
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Text</div>
            <ColorRow label="Primary Text" field="color_text_primary" value={theme.color_text_primary} onChange={update} />
            <ColorRow label="Secondary Text" field="color_text_secondary" value={theme.color_text_secondary} onChange={update} />
            <ColorRow label="Muted Text" field="color_text_muted" value={theme.color_text_muted} onChange={update} />
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Borders</div>
            <ColorRow label="Border (subtle)" field="color_border" value={theme.color_border} onChange={update} />
            <ColorRow label="Border Strong" field="color_border_strong" value={theme.color_border_strong} onChange={update} />
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Status Colors</div>
            <ColorRow label="Success" field="color_success" value={theme.color_success} onChange={update} />
            <ColorRow label="Warning" field="color_warning" value={theme.color_warning} onChange={update} />
            <ColorRow label="Error" field="color_error" value={theme.color_error} onChange={update} />
          </div>
        </div>
      )}

      {/* TYPOGRAPHY */}
      {activeSection === 'typography' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Font Family</label>
            <select value={theme.font_family} onChange={e => update('font_family', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500">
              {FONT_OPTIONS.map(f => <option key={f} value={f}>{f.split(',')[0].replace(/'/g, '')}</option>)}
            </select>
            <p className="text-xs text-slate-500 mt-2" style={{ fontFamily: theme.font_family }}>
              Preview: The quick brown fox jumps over the lazy dog. 1234567890
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Base Font Size</label>
            <div className="flex gap-2">
              {['12px', '13px', '14px', '15px', '16px'].map(sz => (
                <button key={sz} onClick={() => update('font_size_base', sz)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-all ${theme.font_size_base === sz ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SHAPE */}
      {activeSection === 'shape' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="text-xs text-slate-400 mb-1">Controls the roundness of buttons, cards, modals, and inputs.</div>
          {[
            { label: 'Small (buttons, pills)', field: 'border_radius_sm', value: theme.border_radius_sm },
            { label: 'Medium (inputs, dropdowns)', field: 'border_radius_md', value: theme.border_radius_md },
            { label: 'Large (cards)', field: 'border_radius_lg', value: theme.border_radius_lg },
            { label: 'Extra Large (modals, panels)', field: 'border_radius_xl', value: theme.border_radius_xl },
          ].map(item => (
            <div key={item.field}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-300">{item.label}</label>
                <span className="text-slate-500 font-mono text-xs">{item.value}</span>
              </div>
              <div className="flex gap-2">
                {['0px', '4px', '6px', '8px', '12px', '16px', '20px', '24px', '9999px'].map(r => (
                  <button key={r} onClick={() => update(item.field, r)}
                    className={`flex-1 py-2 text-xs font-semibold rounded border transition-all ${item.value === r ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}
                    style={{ borderRadius: r }}>
                    {r === '9999px' ? 'pill' : r}
                  </button>
                ))}
              </div>
              {/* Visual preview */}
              <div className="mt-2 h-8 rounded flex items-center justify-center text-xs text-slate-400 border border-slate-800" style={{ borderRadius: item.value, backgroundColor: theme.color_bg_elevated }}>
                Preview
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PRESETS */}
      {activeSection === 'presets' && (
        <div className="space-y-3">
          <p className="text-slate-500 text-sm">Apply a complete preset theme. You can still customise individual values after applying.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRESETS.map(preset => (
              <button key={preset.name} onClick={() => applyPreset(preset)}
                className="group bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 text-left transition-all hover:-translate-y-0.5">
                {/* Color swatches */}
                <div className="flex gap-1.5 mb-3">
                  {[preset.values.color_primary, preset.values.color_accent, preset.values.color_bg_elevated, preset.values.color_bg_surface].map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-md border border-white/10" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="font-bold text-white text-sm">{preset.name}</div>
                <div className="text-slate-500 text-xs mt-0.5">{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOM CSS */}
      {activeSection === 'custom' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Custom CSS</label>
            <p className="text-slate-500 text-xs mb-3">Injected into <code className="bg-slate-800 px-1 rounded">&lt;head&gt;</code> globally. Use CSS variables like <code className="bg-slate-800 px-1 rounded">var(--color-primary)</code>.</p>
            <textarea
              rows={14}
              value={theme.custom_css}
              onChange={e => update('custom_css', e.target.value)}
              spellCheck={false}
              placeholder={`/* Example: override nav height */\nnav { height: 60px; }\n\n/* Use theme variables */\n.hero-title { color: var(--color-primary); }\n\n/* Animations */\n@keyframes my-anim { from { opacity: 0; } to { opacity: 1; } }`}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
            />
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-400 mb-2">Available CSS Variables</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {[
                '--color-primary', '--color-primary-hover', '--color-accent',
                '--color-bg-base', '--color-bg-surface', '--color-bg-elevated',
                '--color-text-primary', '--color-text-secondary', '--color-text-muted',
                '--color-border', '--color-border-strong',
                '--color-success', '--color-warning', '--color-error',
                '--font-family', '--font-size-base',
                '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl',
              ].map(v => (
                <code key={v} className="text-slate-500 text-[10px] py-0.5">{v}</code>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom save bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-5 py-4">
        <div className="text-slate-500 text-xs">Changes are previewed live. Click "Save & Publish" to persist for all users.</div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-1.5 text-sm bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition-colors">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save & Publish'}
        </button>
      </div>
    </div>
  );
}
