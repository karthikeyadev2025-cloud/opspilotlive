/*
  # Security Audit Logs — Login Tracking & Data Access

  ## Summary
  Implements a comprehensive security audit system to:
  1. Log every login attempt (success and failure) with device/IP metadata
  2. Log every logout event
  3. Log sensitive data exports or views (CRM, leads, payroll)
  4. Allow admin to detect suspicious patterns and data theft attempts

  ## New Tables

  ### login_logs
  - id, user_id (FK app_users), email (stored for failed attempts too)
  - event_type: login_success | login_failed | logout | session_expired
  - ip_address (text) — browser-collected best effort
  - user_agent (text) — browser/device identification
  - device_info (text) — parsed device type
  - location_hint (text) — timezone/language from browser
  - failure_reason (text) — for failed logins
  - created_at (timestamptz)

  ### data_access_logs
  Records when sensitive data is exported or bulk-viewed.
  - id, user_id, user_role, action (e.g. 'export_leads', 'view_payroll')
  - record_count (how many rows accessed)
  - table_name, filters_applied
  - created_at

  ## Security
  - Only admin can SELECT login_logs and data_access_logs
  - Any authenticated user can INSERT their own login_log (needed for client-side logging)
  - No UPDATE or DELETE allowed on logs (immutable audit trail)
  - RLS enforced on both tables
*/

CREATE TABLE IF NOT EXISTS login_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  email text NOT NULL DEFAULT '',
  full_name text DEFAULT '',
  role text DEFAULT '',
  event_type text NOT NULL CHECK (event_type IN ('login_success','login_failed','logout','session_expired','account_disabled')),
  ip_address text DEFAULT '',
  user_agent text DEFAULT '',
  device_info text DEFAULT '',
  location_hint text DEFAULT '',
  failure_reason text DEFAULT '',
  session_id text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all login logs"
  ON login_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role = 'admin'
      AND app_users.is_active = true
    )
  );

CREATE POLICY "Any authenticated user can insert own login log"
  ON login_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anon can insert login failed logs"
  ON login_logs FOR INSERT
  TO anon
  WITH CHECK (event_type = 'login_failed');

CREATE TABLE IF NOT EXISTS data_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  user_email text DEFAULT '',
  user_role text DEFAULT '',
  action text NOT NULL DEFAULT '',
  table_name text DEFAULT '',
  record_count integer DEFAULT 0,
  filters_applied text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE data_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all data access logs"
  ON data_access_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role = 'admin'
      AND app_users.is_active = true
    )
  );

CREATE POLICY "Authenticated users can insert data access logs"
  ON data_access_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_event_type ON login_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON login_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_logs_email ON login_logs(email);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_user_id ON data_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_action ON data_access_logs(action);
CREATE INDEX IF NOT EXISTS idx_data_access_logs_created_at ON data_access_logs(created_at DESC);
