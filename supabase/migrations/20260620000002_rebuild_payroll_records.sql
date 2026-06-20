/*
  # Rebuild payroll_records (tenant-scoped, keyed to app_users)

  ## Why
  The original payroll_records referenced staff_records(id), which was
  dropped in the multi-tenant retrofit (it was a redundant HR profile
  table — app_users is the single staff identity table). "Payroll" is an
  explicitly marketed OpsPilot feature (Attendance & Payroll), so it is
  rebuilt here rather than dropped, this time keyed directly to
  app_users(id) and tenant-scoped from creation via the same trigger
  pattern as the rest of the multi-tenant retrofit.

  Requires 20260620000001_multitenant_core_retrofit.sql to have run first
  (needs get_my_tenant_id(), get_my_role(), set_tenant_id_from_caller()).
*/

CREATE TABLE IF NOT EXISTS payroll_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  app_user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
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
  UNIQUE(app_user_id, month, year)
);

ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_payroll_records_tenant ON payroll_records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_app_user ON payroll_records(app_user_id);

DROP TRIGGER IF EXISTS trg_set_tenant_payroll_records ON payroll_records;
CREATE TRIGGER trg_set_tenant_payroll_records
  BEFORE INSERT ON payroll_records
  FOR EACH ROW EXECUTE FUNCTION set_tenant_id_from_caller();

CREATE POLICY "payroll_records_select"
  ON payroll_records FOR SELECT
  TO authenticated
  USING (
    tenant_id = get_my_tenant_id()
    AND (app_user_id = auth.uid() OR get_my_role() IN ('admin', 'hr', 'manager'))
  );

CREATE POLICY "payroll_records_insert"
  ON payroll_records FOR INSERT
  TO authenticated
  WITH CHECK (get_my_role() IN ('admin', 'hr'));

CREATE POLICY "payroll_records_update"
  ON payroll_records FOR UPDATE
  TO authenticated
  USING (tenant_id = get_my_tenant_id() AND get_my_role() IN ('admin', 'hr'))
  WITH CHECK (tenant_id = get_my_tenant_id() AND get_my_role() IN ('admin', 'hr'));

CREATE POLICY "payroll_records_delete"
  ON payroll_records FOR DELETE
  TO authenticated
  USING (tenant_id = get_my_tenant_id() AND get_my_role() = 'admin');

CREATE POLICY "payroll_records_select_super_admin"
  ON payroll_records FOR SELECT
  TO authenticated
  USING (is_super_admin());
