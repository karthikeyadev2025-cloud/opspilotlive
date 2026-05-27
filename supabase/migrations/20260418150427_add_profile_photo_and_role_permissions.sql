/*
  # Add Profile Photo, Role Permissions, and Custom Roles

  ## Summary
  This migration adds:
  1. `profile_photo_url` column to `app_users` - allows every staff member to upload their own profile photo
  2. `role_permissions` table - admin can define custom roles with granular permissions
  3. `custom_role` column to `app_users` - links user to a custom role if applicable
  
  ## New Tables
  - `role_permissions`: Stores custom role definitions with permission flags
    - id, role_name, description, permissions (jsonb), created_by, created_at
  
  ## Modified Tables
  - `app_users`: Added `profile_photo_url` (text, nullable) and `custom_role_id` (uuid, nullable)

  ## Permission Flags (stored in jsonb)
  - can_view_leads, can_manage_leads, can_assign_leads
  - can_view_staff, can_manage_staff
  - can_view_attendance, can_manage_attendance
  - can_view_payroll, can_manage_payroll
  - can_approve_leaves, can_approve_advances
  - can_view_reports, can_export_data
  - can_manage_users, can_manage_roles
  - can_view_crm, can_manage_crm

  ## Security
  - RLS enabled on role_permissions
  - Admin can manage role_permissions
  - Authenticated users can read role_permissions (to know their own permissions)
*/

-- Add profile photo URL to app_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_users' AND column_name = 'profile_photo_url'
  ) THEN
    ALTER TABLE app_users ADD COLUMN profile_photo_url text;
  END IF;
END $$;

-- Create role_permissions table for custom roles
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text NOT NULL UNIQUE,
  description text DEFAULT '',
  color text DEFAULT 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  permissions jsonb NOT NULL DEFAULT '{
    "can_view_leads": false,
    "can_manage_leads": false,
    "can_assign_leads": false,
    "can_add_lead_remarks": false,
    "can_view_staff": false,
    "can_manage_staff": false,
    "can_view_attendance": false,
    "can_manage_attendance": false,
    "can_view_payroll": false,
    "can_manage_payroll": false,
    "can_approve_leaves": false,
    "can_approve_advances": false,
    "can_view_reports": false,
    "can_export_data": false,
    "can_manage_users": false,
    "can_manage_roles": false,
    "can_view_crm": false,
    "can_manage_crm": false,
    "can_view_website_content": false,
    "can_manage_website_content": false
  }',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES app_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add custom_role_id to app_users for custom role assignment
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'app_users' AND column_name = 'custom_role_id'
  ) THEN
    ALTER TABLE app_users ADD COLUMN custom_role_id uuid REFERENCES role_permissions(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on role_permissions
CREATE POLICY "Admin can manage role_permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (get_my_role() = 'admin');

CREATE POLICY "Admin can insert role_permissions"
  ON role_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "Admin can update role_permissions"
  ON role_permissions
  FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "Admin can delete role_permissions"
  ON role_permissions
  FOR DELETE
  TO authenticated
  USING (get_my_role() = 'admin');

-- Allow authenticated users to read role_permissions (so they know their permissions)
CREATE POLICY "Authenticated users can read active role_permissions"
  ON role_permissions
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Allow users to update their own profile photo
CREATE POLICY "Users can update own profile photo"
  ON app_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create storage bucket for profile photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile photos
CREATE POLICY "Anyone can view profile photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated users can upload own profile photo"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own profile photo in storage"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own profile photo"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
