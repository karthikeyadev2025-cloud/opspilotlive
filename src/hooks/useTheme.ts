import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

function applyTheme(t: Record<string, string>) {
  const root = document.documentElement;
  const map: Record<string, string> = {
    color_primary: '--color-primary',
    color_primary_hover: '--color-primary-hover',
    color_accent: '--color-accent',
    color_bg_base: '--color-bg-base',
    color_bg_surface: '--color-bg-surface',
    color_bg_elevated: '--color-bg-elevated',
    color_text_primary: '--color-text-primary',
    color_text_secondary: '--color-text-secondary',
    color_text_muted: '--color-text-muted',
    color_border: '--color-border',
    color_border_strong: '--color-border-strong',
    color_success: '--color-success',
    color_warning: '--color-warning',
    color_error: '--color-error',
    font_family: '--font-family',
    font_size_base: '--font-size-base',
    border_radius_sm: '--radius-sm',
    border_radius_md: '--radius-md',
    border_radius_lg: '--radius-lg',
    border_radius_xl: '--radius-xl',
  };
  Object.entries(map).forEach(([key, cssVar]) => {
    if (t[key]) root.style.setProperty(cssVar, t[key]);
  });
  // Inject custom CSS
  let el = document.getElementById('ops-custom-css');
  if (!el) { el = document.createElement('style'); el.id = 'ops-custom-css'; document.head.appendChild(el); }
  el.textContent = t.custom_css || '';
}

export function useTheme() {
  useEffect(() => {
    supabase
      .from('platform_theme')
      .select('*')
      .eq('id', 'default')
      .maybeSingle()
      .then(({ data }) => {
        if (data) applyTheme(data as Record<string, string>);
      });
  }, []);
}
