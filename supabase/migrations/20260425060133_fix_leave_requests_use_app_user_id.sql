/*
  # Fix Leave Requests - Add app_user_id Support

  ## Problem
  leave_requests.staff_id references staff_records.id (HR profile table).
  Most app_users don't have a linked staff_records row, so:
  - Employees can't submit leave (no staffRecordId found)
  - HR can't see those leaves (leave_select RLS requires staff_records linkage)

  ## Changes
  1. Add `app_user_id` column (uuid, nullable) to leave_requests
  2. Update `leave_select` RLS to allow access via app_user_id OR staff_id linkage
  3. Update `leave_insert` RLS to allow authenticated active users
  4. Add `requester_name` (text) to store display name for HR view when no staff_record linked

  ## Notes
  - Existing data preserved (staff_id column remains, just nullable)
  - New submissions from EmployeePortal will use app_user_id
  - HRPortal can join app_users via app_user_id for display name
*/

-- Add app_user_id column to leave_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leave_requests' AND column_name = 'app_user_id'
  ) THEN
    ALTER TABLE leave_requests ADD COLUMN app_user_id uuid REFERENCES app_users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add requester_name for display when no staff_records link exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'leave_requests' AND column_name = 'requester_name'
  ) THEN
    ALTER TABLE leave_requests ADD COLUMN requester_name text;
  END IF;
END $$;

-- Make staff_id nullable (it was required before, now optional)
ALTER TABLE leave_requests ALTER COLUMN staff_id DROP NOT NULL;

-- Drop old leave_select policy
DROP POLICY IF EXISTS "leave_select" ON leave_requests;

-- New leave_select: allow own leaves (by app_user_id OR staff_records linkage) + HR/admin/manager
CREATE POLICY "leave_select"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (
    app_user_id = auth.uid()
    OR staff_id IN (
      SELECT id FROM staff_records WHERE user_id = auth.uid()
    )
    OR get_my_role() = ANY (ARRAY['admin', 'hr', 'manager'])
  );

-- Drop old leave_insert policy and replace with one that allows all active users
DROP POLICY IF EXISTS "leave_insert" ON leave_requests;

CREATE POLICY "leave_insert"
  ON leave_requests FOR INSERT
  TO authenticated
  WITH CHECK (get_my_is_active() = true);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS leave_requests_app_user_id_idx ON leave_requests(app_user_id);
