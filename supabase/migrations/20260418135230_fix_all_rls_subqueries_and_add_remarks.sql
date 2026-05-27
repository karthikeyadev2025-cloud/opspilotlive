/*
  # Fix all RLS subquery policies + add lead_remarks table

  ## Changes
  1. salary_advance_requests - Replace subquery-based SELECT/UPDATE/DELETE with get_my_role()
  2. leave_requests - Replace subquery-based SELECT/UPDATE/DELETE with get_my_role()  
  3. Add lead_remarks table for per-role remarks visible to all authorized users
  4. Allow manager to update salary advances

  ## Notes
  - No data is deleted - purely additive migration
  - get_my_role() is a SECURITY DEFINER function that avoids RLS recursion
*/

-- Fix salary_advance_requests RLS
DROP POLICY IF EXISTS "Users can view own salary advances or HR admin manager" ON salary_advance_requests;
DROP POLICY IF EXISTS "HR and admin can update any salary advance, user can update own" ON salary_advance_requests;
DROP POLICY IF EXISTS "Admin can delete salary advances" ON salary_advance_requests;

CREATE POLICY "advance_select"
  ON salary_advance_requests FOR SELECT
  TO authenticated
  USING (
    app_user_id = auth.uid()
    OR get_my_role() = ANY (ARRAY['admin','hr','manager'])
  );

CREATE POLICY "advance_update"
  ON salary_advance_requests FOR UPDATE
  TO authenticated
  USING (
    app_user_id = auth.uid()
    OR (get_my_role() = ANY (ARRAY['admin','hr','manager']) AND get_my_is_active() = true)
  )
  WITH CHECK (
    app_user_id = auth.uid()
    OR (get_my_role() = ANY (ARRAY['admin','hr','manager']) AND get_my_is_active() = true)
  );

CREATE POLICY "advance_delete"
  ON salary_advance_requests FOR DELETE
  TO authenticated
  USING (get_my_role() = 'admin' AND get_my_is_active() = true);

-- Fix leave_requests RLS
DROP POLICY IF EXISTS "HR and admin can select leave requests" ON leave_requests;
DROP POLICY IF EXISTS "HR and admin can update leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Admin can delete leave requests" ON leave_requests;

CREATE POLICY "leave_select"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (
    staff_id IN (
      SELECT id FROM staff_records WHERE user_id = auth.uid()
    )
    OR get_my_role() = ANY (ARRAY['admin','hr','manager'])
  );

CREATE POLICY "leave_update"
  ON leave_requests FOR UPDATE
  TO authenticated
  USING (get_my_role() = ANY (ARRAY['admin','hr','manager']) AND get_my_is_active() = true)
  WITH CHECK (get_my_role() = ANY (ARRAY['admin','hr','manager']) AND get_my_is_active() = true);

CREATE POLICY "leave_delete"
  ON leave_requests FOR DELETE
  TO authenticated
  USING (get_my_role() = 'admin' AND get_my_is_active() = true);

-- Also allow employees to insert leave requests
DROP POLICY IF EXISTS "HR and admin can insert leave requests" ON leave_requests;
CREATE POLICY "leave_insert"
  ON leave_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    get_my_is_active() = true
  );

-- Create lead_remarks table for per-role remarks
CREATE TABLE IF NOT EXISTS lead_remarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES marketing_leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT '',
  user_role text NOT NULL DEFAULT '',
  remark text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lead_remarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "remarks_select"
  ON lead_remarks FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR get_my_role() = ANY (ARRAY['admin','hr','manager','telecaller','marketing_executive'])
  );

CREATE POLICY "remarks_insert"
  ON lead_remarks FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND get_my_is_active() = true
  );

CREATE POLICY "remarks_update"
  ON lead_remarks FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "remarks_delete"
  ON lead_remarks FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR get_my_role() = 'admin'
  );

CREATE INDEX IF NOT EXISTS idx_lead_remarks_lead_id ON lead_remarks(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_remarks_user_id ON lead_remarks(user_id);
