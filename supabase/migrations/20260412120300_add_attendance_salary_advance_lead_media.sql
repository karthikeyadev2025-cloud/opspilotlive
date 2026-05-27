/*
  # Attendance, Salary Advance & Lead Media Tables

  ## Summary
  Adds support for:
  1. Selfie-based attendance with GPS coordinates (check-in/check-out)
  2. Salary advance requests by employees
  3. Lead photo/media uploads on executive lead entry
  4. Location tracking on marketing lead entries

  ## New Columns on marketing_leads
  - `lead_photo_url` (text) - Photo of customer/site uploaded by executive
  - `latitude` (numeric) - GPS latitude captured at time of lead entry
  - `longitude` (numeric) - GPS longitude captured at time of lead entry
  - `location_address` (text) - Reverse geocoded address string

  ## New Tables

  ### attendance_records
  Daily check-in/check-out records with selfie and GPS.
  - id, staff_id (FK app_users), attendance_date
  - check_in_time, check_in_selfie_url, check_in_lat, check_in_lng, check_in_address
  - check_out_time, check_out_selfie_url, check_out_lat, check_out_lng, check_out_address
  - status (present/half_day/absent/leave/holiday)
  - work_hours (computed), notes
  - created_at, updated_at

  ### salary_advance_requests
  Employee salary advance/loan requests.
  - id, staff_id (FK staff_records), app_user_id (FK app_users)
  - amount_requested, amount_approved
  - reason, purpose
  - status (pending/approved/rejected/disbursed/repaid)
  - approved_by, disbursal_date
  - repayment_month, repayment_year (when to deduct)
  - remarks, created_at, updated_at

  ## Security
  - RLS on all new tables
  - Employees can see/create their own attendance
  - HR/Admin can see all attendance, approve advances
  - Employees can only see their own salary advances
*/

-- ─── marketing_leads: add location & photo columns ───────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketing_leads' AND column_name = 'lead_photo_url') THEN
    ALTER TABLE marketing_leads ADD COLUMN lead_photo_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketing_leads' AND column_name = 'latitude') THEN
    ALTER TABLE marketing_leads ADD COLUMN latitude numeric(10,7);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketing_leads' AND column_name = 'longitude') THEN
    ALTER TABLE marketing_leads ADD COLUMN longitude numeric(10,7);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'marketing_leads' AND column_name = 'location_address') THEN
    ALTER TABLE marketing_leads ADD COLUMN location_address text;
  END IF;
END $$;

-- ─── attendance_records ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  attendance_date date NOT NULL DEFAULT CURRENT_DATE,
  check_in_time timestamptz,
  check_in_selfie_url text DEFAULT '',
  check_in_lat numeric(10,7),
  check_in_lng numeric(10,7),
  check_in_address text DEFAULT '',
  check_out_time timestamptz,
  check_out_selfie_url text DEFAULT '',
  check_out_lat numeric(10,7),
  check_out_lng numeric(10,7),
  check_out_address text DEFAULT '',
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present','half_day','absent','leave','holiday')),
  work_hours numeric(4,2) DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(staff_user_id, attendance_date)
);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own attendance"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (
    staff_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr', 'manager')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "Employees can insert own attendance"
  ON attendance_records FOR INSERT
  TO authenticated
  WITH CHECK (staff_user_id = auth.uid());

CREATE POLICY "Employees can update own attendance"
  ON attendance_records FOR UPDATE
  TO authenticated
  USING (
    staff_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr')
      AND app_users.is_active = true
    )
  )
  WITH CHECK (
    staff_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "Admin can delete attendance"
  ON attendance_records FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role = 'admin'
      AND app_users.is_active = true
    )
  );

-- ─── salary_advance_requests ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salary_advance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  staff_record_id uuid REFERENCES staff_records(id) ON DELETE SET NULL,
  amount_requested numeric(10,2) NOT NULL DEFAULT 0,
  amount_approved numeric(10,2) DEFAULT 0,
  reason text NOT NULL DEFAULT '',
  purpose text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','disbursed','repaid')),
  approved_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  disbursal_date date,
  repayment_month integer CHECK (repayment_month BETWEEN 1 AND 12),
  repayment_year integer,
  remarks text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE salary_advance_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view own salary advances"
  ON salary_advance_requests FOR SELECT
  TO authenticated
  USING (
    app_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr', 'manager')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "Employees can insert own salary advance request"
  ON salary_advance_requests FOR INSERT
  TO authenticated
  WITH CHECK (app_user_id = auth.uid());

CREATE POLICY "HR and admin can update salary advances"
  ON salary_advance_requests FOR UPDATE
  TO authenticated
  USING (
    app_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr')
      AND app_users.is_active = true
    )
  )
  WITH CHECK (
    app_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "Admin can delete salary advances"
  ON salary_advance_requests FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role = 'admin'
      AND app_users.is_active = true
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_staff_date ON attendance_records(staff_user_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(attendance_date);
CREATE INDEX IF NOT EXISTS idx_salary_advance_user ON salary_advance_requests(app_user_id);
CREATE INDEX IF NOT EXISTS idx_salary_advance_status ON salary_advance_requests(status);
