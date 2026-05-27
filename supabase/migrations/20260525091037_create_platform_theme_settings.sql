/*
  # Platform Theme Settings

  ## New Table
  - `platform_theme`: Stores a single row of CSS design token values
    - primary color, accent color, background, surface, text colors
    - border radius, font family, custom CSS
    - Only super admins can read/write this table

  ## Notes
  - Single-row table (id = 'default') — always upsert to this row
  - RLS: only super_admins can access
  - Public read allowed for theme loading on frontend (unauthenticated visitors need theme)
*/

CREATE TABLE IF NOT EXISTS platform_theme (
  id text PRIMARY KEY DEFAULT 'default',
  -- Brand colors
  color_primary text NOT NULL DEFAULT '#06b6d4',
  color_primary_hover text NOT NULL DEFAULT '#22d3ee',
  color_accent text NOT NULL DEFAULT '#3b82f6',
  -- Background layers
  color_bg_base text NOT NULL DEFAULT '#020617',
  color_bg_surface text NOT NULL DEFAULT '#0f172a',
  color_bg_elevated text NOT NULL DEFAULT '#1e293b',
  -- Text
  color_text_primary text NOT NULL DEFAULT '#f8fafc',
  color_text_secondary text NOT NULL DEFAULT '#94a3b8',
  color_text_muted text NOT NULL DEFAULT '#475569',
  -- Border
  color_border text NOT NULL DEFAULT '#1e293b',
  color_border_strong text NOT NULL DEFAULT '#334155',
  -- Status colors
  color_success text NOT NULL DEFAULT '#10b981',
  color_warning text NOT NULL DEFAULT '#f59e0b',
  color_error text NOT NULL DEFAULT '#ef4444',
  -- Typography
  font_family text NOT NULL DEFAULT 'Inter, system-ui, sans-serif',
  font_size_base text NOT NULL DEFAULT '14px',
  -- Shape
  border_radius_sm text NOT NULL DEFAULT '8px',
  border_radius_md text NOT NULL DEFAULT '12px',
  border_radius_lg text NOT NULL DEFAULT '16px',
  border_radius_xl text NOT NULL DEFAULT '20px',
  -- Custom CSS injected into <head>
  custom_css text NOT NULL DEFAULT '',
  -- Meta
  updated_at timestamptz DEFAULT now(),
  updated_by text DEFAULT ''
);

ALTER TABLE platform_theme ENABLE ROW LEVEL SECURITY;

-- Anyone can read theme (needed for public landing page styling)
CREATE POLICY "Public can read platform theme"
  ON platform_theme FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only super admins can update
CREATE POLICY "Super admin can update platform theme"
  ON platform_theme FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "Super admin can insert platform theme"
  ON platform_theme FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

-- Seed the default theme row
INSERT INTO platform_theme (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;
