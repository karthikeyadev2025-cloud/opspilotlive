/*
  # Fix RLS Policies for CRM and Marketing Leads

  ## Changes
  1. office_crm_contacts - Replace subquery-based policies with get_my_role() 
     function calls to fix INSERT/UPDATE failures for HR users
  2. Ensure manager can also insert/update CRM contacts (read was already allowed)
  3. Fix duplicate/conflicting marketing_leads policies

  ## Why
  The old INSERT/UPDATE policies used subqueries against app_users table.
  When HR user inserts a CRM contact, the WITH CHECK subquery 
  `SELECT 1 FROM app_users WHERE id = auth.uid() AND role IN (...)` 
  might fail due to RLS on app_users table itself (circular dependency).
  Using get_my_role() security definer function avoids this issue.
*/

-- Drop old CRM policies that use subqueries
DROP POLICY IF EXISTS "HR and admin can insert crm contacts" ON office_crm_contacts;
DROP POLICY IF EXISTS "HR and admin can update crm contacts" ON office_crm_contacts;
DROP POLICY IF EXISTS "HR admin manager can select crm contacts" ON office_crm_contacts;
DROP POLICY IF EXISTS "Admin can delete crm contacts" ON office_crm_contacts;

-- Recreate using get_my_role() to avoid subquery RLS issues
CREATE POLICY "crm_select"
  ON office_crm_contacts FOR SELECT
  TO authenticated
  USING (get_my_role() = ANY (ARRAY['admin', 'hr', 'manager']) AND get_my_is_active() = true);

CREATE POLICY "crm_insert"
  ON office_crm_contacts FOR INSERT
  TO authenticated
  WITH CHECK (get_my_role() = ANY (ARRAY['admin', 'hr', 'manager']) AND get_my_is_active() = true);

CREATE POLICY "crm_update"
  ON office_crm_contacts FOR UPDATE
  TO authenticated
  USING (get_my_role() = ANY (ARRAY['admin', 'hr', 'manager']) AND get_my_is_active() = true)
  WITH CHECK (get_my_role() = ANY (ARRAY['admin', 'hr', 'manager']) AND get_my_is_active() = true);

CREATE POLICY "crm_delete"
  ON office_crm_contacts FOR DELETE
  TO authenticated
  USING (get_my_role() = 'admin' AND get_my_is_active() = true);

-- Drop the conflicting old marketing_leads policies that have USING (true) 
-- which override the proper restrictive ones
DROP POLICY IF EXISTS "Authenticated users can view marketing leads" ON marketing_leads;
DROP POLICY IF EXISTS "Authenticated users can update marketing leads" ON marketing_leads;
DROP POLICY IF EXISTS "Authenticated users can delete marketing leads" ON marketing_leads;
