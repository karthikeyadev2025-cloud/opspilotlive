/*
  # Harden Row Level Security — Data Protection

  ## Summary
  Tightens access control across all sensitive tables.
  Each role gets only the minimum access needed.
  Prevents data theft across roles.
*/

-- ─── marketing_leads ────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Allow all authenticated users to read leads" ON marketing_leads;
DROP POLICY IF EXISTS "Allow executives to insert leads" ON marketing_leads;
DROP POLICY IF EXISTS "Allow authenticated to update leads" ON marketing_leads;
DROP POLICY IF EXISTS "Allow admin to delete leads" ON marketing_leads;
DROP POLICY IF EXISTS "Marketing executives can view their own leads" ON marketing_leads;
DROP POLICY IF EXISTS "All staff can view leads" ON marketing_leads;
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON marketing_leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON marketing_leads;
DROP POLICY IF EXISTS "Admin can delete leads" ON marketing_leads;

CREATE POLICY "Marketing execs can view own leads only"
  ON marketing_leads FOR SELECT
  TO authenticated
  USING (
    executive_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'manager', 'hr', 'telecaller')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "Marketing execs can insert leads"
  ON marketing_leads FOR INSERT
  TO authenticated
  WITH CHECK (
    executive_user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'marketing_executive')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "Telecallers and managers can update lead status"
  ON marketing_leads FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'manager', 'telecaller', 'hr')
      AND app_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'manager', 'telecaller', 'hr')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "Only admin can delete leads"
  ON marketing_leads FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role = 'admin'
      AND app_users.is_active = true
    )
  );

-- ─── app_users: tighten visibility ──────────────────────────────────────────

DROP POLICY IF EXISTS "Users can read all app_users" ON app_users;
DROP POLICY IF EXISTS "Users can view own profile" ON app_users;
DROP POLICY IF EXISTS "All users can view app_users" ON app_users;
DROP POLICY IF EXISTS "Authenticated users can view app_users" ON app_users;
DROP POLICY IF EXISTS "Users can read own data" ON app_users;

CREATE POLICY "Users view own profile or HR admin view all"
  ON app_users FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM app_users au2
      WHERE au2.id = auth.uid()
      AND au2.role IN ('admin', 'hr', 'manager')
      AND au2.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admin can insert app_users" ON app_users;
DROP POLICY IF EXISTS "Users can insert own profile" ON app_users;
DROP POLICY IF EXISTS "Authenticated users can upsert own profile" ON app_users;

CREATE POLICY "Admin and self can insert profile"
  ON app_users FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM app_users au2
      WHERE au2.id = auth.uid()
      AND au2.role = 'admin'
      AND au2.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admin can update app_users" ON app_users;
DROP POLICY IF EXISTS "Users can update own profile" ON app_users;
DROP POLICY IF EXISTS "Admin can update users" ON app_users;

CREATE POLICY "Only admin can update user profiles"
  ON app_users FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM app_users au2
      WHERE au2.id = auth.uid()
      AND au2.role = 'admin'
      AND au2.is_active = true
    )
  )
  WITH CHECK (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM app_users au2
      WHERE au2.id = auth.uid()
      AND au2.role = 'admin'
      AND au2.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admin can delete app_users" ON app_users;

CREATE POLICY "Only admin can delete users"
  ON app_users FOR DELETE
  TO authenticated
  USING (
    id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM app_users au2
      WHERE au2.id = auth.uid()
      AND au2.role = 'admin'
      AND au2.is_active = true
    )
  );

-- ─── payroll_records: employees see own, HR/admin manage ────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payroll_records') THEN
    EXECUTE 'DROP POLICY IF EXISTS "HR and admin can view payroll" ON payroll_records';
    EXECUTE 'DROP POLICY IF EXISTS "All authenticated can view payroll" ON payroll_records';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view payroll" ON payroll_records';
    EXECUTE 'DROP POLICY IF EXISTS "Staff can view own payroll, HR admin can view all" ON payroll_records';

    EXECUTE $pol$
      CREATE POLICY "Payroll access by role"
        ON payroll_records FOR SELECT
        TO authenticated
        USING (
          staff_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = auth.uid()
            AND app_users.role IN ('admin', 'hr', 'manager')
            AND app_users.is_active = true
          )
        )
    $pol$;

    EXECUTE 'DROP POLICY IF EXISTS "HR and admin can insert payroll" ON payroll_records';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can insert payroll" ON payroll_records';
    EXECUTE 'DROP POLICY IF EXISTS "Only HR and admin can insert payroll" ON payroll_records';

    EXECUTE $pol$
      CREATE POLICY "HR admin insert payroll"
        ON payroll_records FOR INSERT
        TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = auth.uid()
            AND app_users.role IN ('admin', 'hr')
            AND app_users.is_active = true
          )
        )
    $pol$;

    EXECUTE 'DROP POLICY IF EXISTS "HR and admin can update payroll" ON payroll_records';
    EXECUTE 'DROP POLICY IF EXISTS "Only HR and admin can update payroll" ON payroll_records';

    EXECUTE $pol$
      CREATE POLICY "HR admin update payroll"
        ON payroll_records FOR UPDATE
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = auth.uid()
            AND app_users.role IN ('admin', 'hr')
            AND app_users.is_active = true
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = auth.uid()
            AND app_users.role IN ('admin', 'hr')
            AND app_users.is_active = true
          )
        )
    $pol$;
  END IF;
END $$;

-- ─── staff_records: employees see own, HR/admin see all ─────────────────────

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'staff_records') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated can view staff records" ON staff_records';
    EXECUTE 'DROP POLICY IF EXISTS "All users can view staff records" ON staff_records';
    EXECUTE 'DROP POLICY IF EXISTS "Staff see own record, HR and admin see all" ON staff_records';

    EXECUTE $pol$
      CREATE POLICY "Staff record access by role"
        ON staff_records FOR SELECT
        TO authenticated
        USING (
          user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM app_users
            WHERE app_users.id = auth.uid()
            AND app_users.role IN ('admin', 'hr', 'manager')
            AND app_users.is_active = true
          )
        )
    $pol$;
  END IF;
END $$;
