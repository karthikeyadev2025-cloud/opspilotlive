/*
  # Add Manager and HR Roles with Supporting Tables

  ## Summary
  Adds two new roles (manager, hr) to the app_users role constraint and creates
  all tables needed for HR and office CRM functionality.

  ## New Roles
  - `manager`: Can view/manage marketing leads, view reports/dashboard
  - `hr`: Can manage staff records, payroll, leave, and office CRM

  ## New Tables

  ### staff_records
  Master record for all employees in the organization.
  - id, user_id (links to app_users), employee_code
  - department, designation, date_of_joining, date_of_birth
  - salary_basic, salary_hra, salary_allowances, salary_deductions
  - bank_account, bank_ifsc, pan_number, aadhar_number
  - emergency_contact_name, emergency_contact_phone
  - address, status (active/inactive/on_leave/terminated)
  - notes, created_at, updated_at

  ### payroll_records
  Monthly payroll entries per employee.
  - id, staff_id (FK staff_records), month, year
  - basic_pay, hra, allowances, gross_pay
  - pf_deduction, tds_deduction, other_deductions, total_deductions
  - net_pay, payment_date, payment_mode, payment_status
  - remarks, created_by, created_at

  ### leave_requests
  Employee leave applications and approvals.
  - id, staff_id, leave_type (casual/sick/earned/unpaid)
  - from_date, to_date, days_count
  - reason, status (pending/approved/rejected)
  - approved_by, remarks, created_at, updated_at

  ### office_crm_contacts
  Office CRM for managing vendor/partner/client contacts.
  - id, contact_type (vendor/client/partner/other)
  - company_name, contact_person, phone, alternate_phone
  - email, address, city, state
  - category (e.g., Electricals, IT, Logistics)
  - notes, is_active, created_by, created_at, updated_at

  ### office_tasks
  Internal task/todo tracking for office operations.
  - id, title, description, assigned_to (staff_id)
  - due_date, priority (high/medium/low)
  - status (pending/in_progress/completed/cancelled)
  - category, created_by, created_at, updated_at

  ## Security
  - RLS enabled on all new tables
  - HR users can perform all operations on HR tables
  - Managers can read (not modify) staff/payroll data
  - Admins have full access
*/

-- Update role check to include manager and hr
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_role_check;
ALTER TABLE app_users ADD CONSTRAINT app_users_role_check 
  CHECK (role IN ('admin', 'marketing_executive', 'telecaller', 'manager', 'hr'));

-- ─── staff_records ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  employee_code text UNIQUE,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  department text NOT NULL DEFAULT '',
  designation text NOT NULL DEFAULT '',
  date_of_joining date,
  date_of_birth date,
  salary_basic numeric(10,2) DEFAULT 0,
  salary_hra numeric(10,2) DEFAULT 0,
  salary_allowances numeric(10,2) DEFAULT 0,
  salary_deductions numeric(10,2) DEFAULT 0,
  bank_account text DEFAULT '',
  bank_ifsc text DEFAULT '',
  pan_number text DEFAULT '',
  aadhar_number text DEFAULT '',
  emergency_contact_name text DEFAULT '',
  emergency_contact_phone text DEFAULT '',
  address text DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','on_leave','terminated')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE staff_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR and admin can select staff records"
  ON staff_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr', 'manager')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "HR and admin can insert staff records"
  ON staff_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "HR and admin can update staff records"
  ON staff_records FOR UPDATE
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
  );

CREATE POLICY "Admin can delete staff records"
  ON staff_records FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role = 'admin'
      AND app_users.is_active = true
    )
  );

-- ─── payroll_records ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payroll_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff_records(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  year integer NOT NULL,
  basic_pay numeric(10,2) DEFAULT 0,
  hra numeric(10,2) DEFAULT 0,
  allowances numeric(10,2) DEFAULT 0,
  gross_pay numeric(10,2) GENERATED ALWAYS AS (basic_pay + hra + allowances) STORED,
  pf_deduction numeric(10,2) DEFAULT 0,
  tds_deduction numeric(10,2) DEFAULT 0,
  other_deductions numeric(10,2) DEFAULT 0,
  total_deductions numeric(10,2) GENERATED ALWAYS AS (pf_deduction + tds_deduction + other_deductions) STORED,
  net_pay numeric(10,2) GENERATED ALWAYS AS (basic_pay + hra + allowances - pf_deduction - tds_deduction - other_deductions) STORED,
  payment_date date,
  payment_mode text DEFAULT 'bank_transfer' CHECK (payment_mode IN ('bank_transfer','cash','cheque','upi')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','hold')),
  remarks text DEFAULT '',
  created_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(staff_id, month, year)
);

ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR and admin can select payroll"
  ON payroll_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr', 'manager')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "HR and admin can insert payroll"
  ON payroll_records FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "HR and admin can update payroll"
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
  );

CREATE POLICY "Admin can delete payroll"
  ON payroll_records FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role = 'admin'
      AND app_users.is_active = true
    )
  );

-- ─── leave_requests ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff_records(id) ON DELETE CASCADE,
  leave_type text NOT NULL DEFAULT 'casual' CHECK (leave_type IN ('casual','sick','earned','unpaid')),
  from_date date NOT NULL,
  to_date date NOT NULL,
  days_count integer NOT NULL DEFAULT 1,
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  remarks text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR and admin can select leave requests"
  ON leave_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr', 'manager')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "HR and admin can insert leave requests"
  ON leave_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "HR and admin can update leave requests"
  ON leave_requests FOR UPDATE
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
  );

CREATE POLICY "Admin can delete leave requests"
  ON leave_requests FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role = 'admin'
      AND app_users.is_active = true
    )
  );

-- ─── office_crm_contacts ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS office_crm_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_type text NOT NULL DEFAULT 'vendor' CHECK (contact_type IN ('vendor','client','partner','other')),
  company_name text NOT NULL DEFAULT '',
  contact_person text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  alternate_phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  category text DEFAULT '',
  notes text DEFAULT '',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE office_crm_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR admin manager can select crm contacts"
  ON office_crm_contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr', 'manager')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "HR and admin can insert crm contacts"
  ON office_crm_contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "HR and admin can update crm contacts"
  ON office_crm_contacts FOR UPDATE
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
  );

CREATE POLICY "Admin can delete crm contacts"
  ON office_crm_contacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role = 'admin'
      AND app_users.is_active = true
    )
  );

-- ─── office_tasks ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS office_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  assigned_to uuid REFERENCES staff_records(id) ON DELETE SET NULL,
  due_date date,
  priority text DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  status text DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  category text DEFAULT '',
  created_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE office_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR admin manager can select tasks"
  ON office_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr', 'manager')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "HR and admin can insert tasks"
  ON office_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role IN ('admin', 'hr')
      AND app_users.is_active = true
    )
  );

CREATE POLICY "HR and admin can update tasks"
  ON office_tasks FOR UPDATE
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
  );

CREATE POLICY "Admin can delete tasks"
  ON office_tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.id = auth.uid()
      AND app_users.role = 'admin'
      AND app_users.is_active = true
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_records_status ON staff_records(status);
CREATE INDEX IF NOT EXISTS idx_staff_records_department ON staff_records(department);
CREATE INDEX IF NOT EXISTS idx_payroll_records_staff_id ON payroll_records(staff_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_month_year ON payroll_records(month, year);
CREATE INDEX IF NOT EXISTS idx_leave_requests_staff_id ON leave_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_office_crm_contacts_type ON office_crm_contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_office_tasks_status ON office_tasks(status);
CREATE INDEX IF NOT EXISTS idx_office_tasks_assigned_to ON office_tasks(assigned_to);
