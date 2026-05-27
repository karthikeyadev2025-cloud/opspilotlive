/*
  # Create Employee Portal Support Tables

  ## New Tables
  - `attendance_logs` — punch-by-punch log for employee check-ins/outs (used by EmployeePortal)
  - `leave_balances` — tracks casual/sick/earned leave balances per user per year
  - `notifications` — in-app notifications per user (advance approved, leave approved, etc.)

  ## Security
  - RLS enabled on all three tables
  - Employees can read their own records
  - HR/Admin/Manager can read all records
  - HR/Admin can insert/update notifications and leave_balances
*/

-- ── attendance_logs ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_user_id   uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  attendance_date date NOT NULL DEFAULT CURRENT_DATE,
  punch_time      timestamptz NOT NULL DEFAULT now(),
  punch_type      text NOT NULL DEFAULT 'check_in' CHECK (punch_type IN ('check_in', 'check_out', 'break_start', 'break_end')),
  selfie_url      text,
  lat             numeric,
  lng             numeric,
  address         text,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own attendance logs"
  ON attendance_logs FOR SELECT
  TO authenticated
  USING (
    staff_user_id = (SELECT id FROM app_users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM app_users WHERE id = auth.uid() AND role IN ('admin', 'hr', 'manager')
    )
  );

CREATE POLICY "Users can insert own attendance logs"
  ON attendance_logs FOR INSERT
  TO authenticated
  WITH CHECK (staff_user_id = (SELECT id FROM app_users WHERE id = auth.uid()));

-- ── leave_balances ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_balances (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id     uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  year            integer NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  casual_total    integer NOT NULL DEFAULT 12,
  casual_used     integer NOT NULL DEFAULT 0,
  sick_total      integer NOT NULL DEFAULT 6,
  sick_used       integer NOT NULL DEFAULT 0,
  earned_total    integer NOT NULL DEFAULT 15,
  earned_used     integer NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(app_user_id, year)
);

ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own leave balances"
  ON leave_balances FOR SELECT
  TO authenticated
  USING (
    app_user_id = (SELECT id FROM app_users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM app_users WHERE id = auth.uid() AND role IN ('admin', 'hr', 'manager')
    )
  );

CREATE POLICY "HR and admin can insert leave balances"
  ON leave_balances FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

CREATE POLICY "HR and admin can update leave balances"
  ON leave_balances FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users WHERE id = auth.uid() AND role IN ('admin', 'hr')
    )
  );

-- ── notifications ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  message     text NOT NULL,
  type        text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read     boolean NOT NULL DEFAULT false,
  link        text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (SELECT id FROM app_users WHERE id = auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT id FROM app_users WHERE id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM app_users WHERE id = auth.uid()));

CREATE POLICY "Admin and HR can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users WHERE id = auth.uid() AND role IN ('admin', 'hr', 'manager')
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_logs_user_date ON attendance_logs(staff_user_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_leave_balances_user_year ON leave_balances(app_user_id, year);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
