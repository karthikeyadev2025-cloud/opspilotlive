/*
  # Extend app_users with HR profile fields

  ## Why
  staff_records was dropped as part of the multi-tenant retrofit (it was a
  redundant, sometimes-unlinked "HR profile" sitting next to app_users —
  the real login identity table). Rather than re-create a second table and
  the linking UI it required, the handful of genuinely useful HR fields
  (salary structure, bank/identity, emergency contact, join date, dept,
  designation, employee code) move directly onto app_users. One staff
  identity table, one row per person, no linking step.

  Salary fields here represent the *current* configured structure for an
  employee; payroll_records remains the per-month generated record (which
  can differ from the current structure if it was edited after the fact).
*/

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS employee_code text;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS department text DEFAULT '';
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS designation text DEFAULT '';
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS date_of_joining date;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS salary_basic numeric(10,2) DEFAULT 0;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS salary_hra numeric(10,2) DEFAULT 0;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS salary_allowances numeric(10,2) DEFAULT 0;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS salary_deductions numeric(10,2) DEFAULT 0;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS bank_account text;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS bank_ifsc text;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS pan_number text;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS aadhar_number text;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS employment_status text DEFAULT 'active'
  CHECK (employment_status IN ('active','inactive','on_leave','terminated'));
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS notes text;

-- Employee codes should be unique per tenant (not globally), so a partial
-- unique index scoped by tenant rather than a table-wide UNIQUE constraint.
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_tenant_employee_code
  ON app_users(tenant_id, employee_code)
  WHERE employee_code IS NOT NULL AND employee_code <> '';
