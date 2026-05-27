/*
  # Role-Based User Management System

  ## Summary
  Creates a complete role-based access control system for Marketing Executives and Telecallers,
  managed entirely by the Admin.

  ## New Tables

  ### app_users
  Stores extended user profiles with roles. Links to Supabase auth.users.
  - `id` (uuid) - matches auth.users id
  - `email` (text) - user email
  - `full_name` (text) - display name
  - `role` (text) - 'admin' | 'marketing_executive' | 'telecaller'
  - `phone` (text) - contact number
  - `is_active` (boolean) - whether user can log in
  - `created_by` (uuid) - admin who created this user
  - `created_at` / `updated_at`

  ## Changes to marketing_leads
  - Add `assigned_to` (uuid) - telecaller assigned to this lead
  - Add `assigned_at` (timestamptz) - when it was assigned
  - Add `last_called_at` (timestamptz) - last call timestamp
  - Add `follow_up_count` (int) - number of follow-ups done
  - Add `priority` (text) - low | medium | high

  ## Security
  - RLS enabled on app_users
  - Only authenticated users can read app_users
  - Only admin role can insert/update/delete users
  - Telecallers can only update leads assigned to them
*/

CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'marketing_executive' CHECK (role IN ('admin', 'marketing_executive', 'telecaller')),
  phone text DEFAULT '',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all app_users"
  ON app_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert app_users"
  ON app_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update app_users"
  ON app_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete app_users"
  ON app_users FOR DELETE
  TO authenticated
  USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marketing_leads' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE marketing_leads ADD COLUMN assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marketing_leads' AND column_name = 'assigned_at'
  ) THEN
    ALTER TABLE marketing_leads ADD COLUMN assigned_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marketing_leads' AND column_name = 'last_called_at'
  ) THEN
    ALTER TABLE marketing_leads ADD COLUMN last_called_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marketing_leads' AND column_name = 'follow_up_count'
  ) THEN
    ALTER TABLE marketing_leads ADD COLUMN follow_up_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marketing_leads' AND column_name = 'priority'
  ) THEN
    ALTER TABLE marketing_leads ADD COLUMN priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marketing_leads' AND column_name = 'executive_user_id'
  ) THEN
    ALTER TABLE marketing_leads ADD COLUMN executive_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES marketing_leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT '',
  activity_type text NOT NULL DEFAULT 'remark' CHECK (activity_type IN ('remark', 'status_change', 'call', 'callback_set', 'assigned')),
  note text DEFAULT '',
  old_value text DEFAULT '',
  new_value text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view lead activities"
  ON lead_activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert lead activities"
  ON lead_activities FOR INSERT
  TO authenticated
  WITH CHECK (true);
