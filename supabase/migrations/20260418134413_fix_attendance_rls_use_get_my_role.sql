/*
  # Fix attendance_records RLS to use get_my_role()

  ## Changes
  - Replace subquery-based policies with get_my_role() function calls
  - This prevents potential RLS recursion issues when managers/HR view attendance
  - Manager can now reliably read attendance records
  - Preserves existing data - no destructive operations
*/

DROP POLICY IF EXISTS "Users can view own attendance or HR admin manager" ON attendance_records;
DROP POLICY IF EXISTS "Users can update own attendance or HR admin" ON attendance_records;
DROP POLICY IF EXISTS "Admin can delete attendance" ON attendance_records;

CREATE POLICY "attendance_select"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (
    staff_user_id = auth.uid()
    OR get_my_role() = ANY (ARRAY['admin', 'hr', 'manager'])
  );

CREATE POLICY "attendance_update"
  ON attendance_records FOR UPDATE
  TO authenticated
  USING (
    staff_user_id = auth.uid()
    OR (get_my_role() = ANY (ARRAY['admin', 'hr']) AND get_my_is_active() = true)
  )
  WITH CHECK (
    staff_user_id = auth.uid()
    OR (get_my_role() = ANY (ARRAY['admin', 'hr']) AND get_my_is_active() = true)
  );

CREATE POLICY "attendance_delete"
  ON attendance_records FOR DELETE
  TO authenticated
  USING (get_my_role() = 'admin' AND get_my_is_active() = true);
