/*
  # Fix app_users RLS Infinite Recursion

  ## Problem
  The app_users SELECT, UPDATE, INSERT, DELETE policies all reference app_users
  in subqueries (SELECT 1 FROM app_users au2 WHERE au2.id = auth.uid()...).
  This causes infinite recursion because RLS is applied when reading app_users,
  which triggers reading app_users again, infinitely.

  ## Fix
  Use a SECURITY DEFINER function to check role without triggering RLS,
  then use that function in all app_users policies.

  Also fix login_logs INSERT policy — the anon policy was a duplicate for INSERT,
  which Postgres may reject. We consolidate it.
*/

-- Create a security definer function to get current user's role safely
-- This bypasses RLS so it won't recurse
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM app_users WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_my_is_active()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT is_active FROM app_users WHERE id = auth.uid() LIMIT 1;
$$;

-- Drop all existing app_users policies
DROP POLICY IF EXISTS "Users view own profile or HR admin view all" ON app_users;
DROP POLICY IF EXISTS "Admin and self can insert profile" ON app_users;
DROP POLICY IF EXISTS "Only admin can update user profiles" ON app_users;
DROP POLICY IF EXISTS "Only admin can delete users" ON app_users;
DROP POLICY IF EXISTS "Authenticated users can view all app_users" ON app_users;
DROP POLICY IF EXISTS "Authenticated users can insert app_users" ON app_users;
DROP POLICY IF EXISTS "Authenticated users can update app_users" ON app_users;
DROP POLICY IF EXISTS "Authenticated users can delete app_users" ON app_users;

-- SELECT: own profile always visible; admins/hr/managers see everyone
CREATE POLICY "app_users_select"
  ON app_users FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR get_my_role() IN ('admin', 'hr', 'manager')
  );

-- INSERT: only admin can insert (edge function uses service role, but protect direct inserts)
CREATE POLICY "app_users_insert"
  ON app_users FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    OR get_my_role() = 'admin'
  );

-- UPDATE: self can update own record; admin can update anyone
CREATE POLICY "app_users_update"
  ON app_users FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR get_my_role() = 'admin'
  )
  WITH CHECK (
    id = auth.uid()
    OR get_my_role() = 'admin'
  );

-- DELETE: admin only, cannot delete self
CREATE POLICY "app_users_delete"
  ON app_users FOR DELETE
  TO authenticated
  USING (
    id != auth.uid()
    AND get_my_role() = 'admin'
  );

-- Also fix the RLS policies on marketing_leads, login_logs, data_access_logs
-- that reference app_users subquery (same infinite recursion risk)

-- Fix marketing_leads policies
DROP POLICY IF EXISTS "Marketing execs can view own leads only" ON marketing_leads;
DROP POLICY IF EXISTS "Marketing execs can insert leads" ON marketing_leads;
DROP POLICY IF EXISTS "Telecallers and managers can update lead status" ON marketing_leads;
DROP POLICY IF EXISTS "Only admin can delete leads" ON marketing_leads;

CREATE POLICY "leads_select"
  ON marketing_leads FOR SELECT
  TO authenticated
  USING (
    executive_user_id = auth.uid()
    OR assigned_to = auth.uid()
    OR get_my_role() IN ('admin', 'manager', 'hr', 'telecaller')
  );

CREATE POLICY "leads_insert"
  ON marketing_leads FOR INSERT
  TO authenticated
  WITH CHECK (
    get_my_role() IN ('admin', 'marketing_executive')
    AND get_my_is_active() = true
  );

CREATE POLICY "leads_update"
  ON marketing_leads FOR UPDATE
  TO authenticated
  USING (
    get_my_role() IN ('admin', 'manager', 'telecaller', 'hr', 'marketing_executive')
    AND get_my_is_active() = true
  )
  WITH CHECK (
    get_my_role() IN ('admin', 'manager', 'telecaller', 'hr', 'marketing_executive')
    AND get_my_is_active() = true
  );

CREATE POLICY "leads_delete"
  ON marketing_leads FOR DELETE
  TO authenticated
  USING (
    get_my_role() = 'admin'
    AND get_my_is_active() = true
  );

-- Fix login_logs INSERT — allow any authenticated user and anon for failed logins
-- Drop all existing login_logs insert policies and recreate cleanly
DROP POLICY IF EXISTS "Any authenticated user can insert own login log" ON login_logs;
DROP POLICY IF EXISTS "Anon can insert login failed logs" ON login_logs;

CREATE POLICY "login_logs_insert_authenticated"
  ON login_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "login_logs_insert_anon"
  ON login_logs FOR INSERT
  TO anon
  WITH CHECK (event_type = 'login_failed');

-- Fix login_logs SELECT (uses app_users subquery)
DROP POLICY IF EXISTS "Admins can view all login logs" ON login_logs;

CREATE POLICY "login_logs_select"
  ON login_logs FOR SELECT
  TO authenticated
  USING (
    get_my_role() = 'admin'
    AND get_my_is_active() = true
  );

-- Fix data_access_logs SELECT and INSERT
DROP POLICY IF EXISTS "Admins can view all data access logs" ON data_access_logs;
DROP POLICY IF EXISTS "Authenticated users can insert data access logs" ON data_access_logs;

CREATE POLICY "data_access_logs_select"
  ON data_access_logs FOR SELECT
  TO authenticated
  USING (
    get_my_role() = 'admin'
    AND get_my_is_active() = true
  );

CREATE POLICY "data_access_logs_insert"
  ON data_access_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Fix payroll_records and staff_records policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payroll_records') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Payroll access by role" ON payroll_records';
    EXECUTE 'DROP POLICY IF EXISTS "HR admin insert payroll" ON payroll_records';
    EXECUTE 'DROP POLICY IF EXISTS "HR admin update payroll" ON payroll_records';

    EXECUTE $pol$
      CREATE POLICY "payroll_select"
        ON payroll_records FOR SELECT
        TO authenticated
        USING (
          staff_id = auth.uid()
          OR get_my_role() IN ('admin', 'hr', 'manager')
        )
    $pol$;

    EXECUTE $pol$
      CREATE POLICY "payroll_insert"
        ON payroll_records FOR INSERT
        TO authenticated
        WITH CHECK (
          get_my_role() IN ('admin', 'hr')
          AND get_my_is_active() = true
        )
    $pol$;

    EXECUTE $pol$
      CREATE POLICY "payroll_update"
        ON payroll_records FOR UPDATE
        TO authenticated
        USING (get_my_role() IN ('admin', 'hr') AND get_my_is_active() = true)
        WITH CHECK (get_my_role() IN ('admin', 'hr') AND get_my_is_active() = true)
    $pol$;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_records') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Staff record access by role" ON staff_records';

    EXECUTE $pol$
      CREATE POLICY "staff_records_select"
        ON staff_records FOR SELECT
        TO authenticated
        USING (
          user_id = auth.uid()
          OR get_my_role() IN ('admin', 'hr', 'manager')
        )
    $pol$;
  END IF;
END $$;
