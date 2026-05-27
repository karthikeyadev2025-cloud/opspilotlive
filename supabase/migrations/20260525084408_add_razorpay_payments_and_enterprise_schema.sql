/*
  # Razorpay Payments & Enterprise Schema

  ## New Tables
  - `razorpay_orders`: Stores Razorpay order creation records with amount, currency, plan, status
  - `razorpay_payments`: Stores verified payment records with Razorpay IDs, signature, receipt
  - `plan_change_requests`: Tracks tenant plan upgrade/downgrade requests
  - `support_tickets`: Basic support ticket system managed from super admin panel

  ## Modified Tables
  - `tenants`: Add `razorpay_customer_id` column
  - `tenant_subscriptions`: Add `razorpay_order_id`, `razorpay_payment_id` columns

  ## Security
  - RLS enabled on all new tables
  - Tenants can only see their own payment records
  - Super admins have full access via is_super_admin() helper
*/

-- Add Razorpay customer ID to tenants
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'razorpay_customer_id') THEN
    ALTER TABLE tenants ADD COLUMN razorpay_customer_id text DEFAULT '';
  END IF;
END $$;

-- Razorpay orders (created before payment)
CREATE TABLE IF NOT EXISTS razorpay_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  razorpay_order_id text NOT NULL UNIQUE,
  plan_id uuid REFERENCES saas_plans(id),
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'attempted', 'paid', 'failed')),
  months integer NOT NULL DEFAULT 1,
  receipt text NOT NULL,
  notes jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE razorpay_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant can view own razorpay orders"
  ON razorpay_orders FOR SELECT
  TO authenticated
  USING (tenant_id IN (SELECT id FROM tenants WHERE auth_user_id = auth.uid()));

CREATE POLICY "Super admin full access to razorpay_orders"
  ON razorpay_orders FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Razorpay payments (verified after payment)
CREATE TABLE IF NOT EXISTS razorpay_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  razorpay_order_id text NOT NULL,
  razorpay_payment_id text NOT NULL UNIQUE,
  razorpay_signature text NOT NULL,
  plan_id uuid REFERENCES saas_plans(id),
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  months integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'captured' CHECK (status IN ('captured', 'refunded', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE razorpay_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant can view own razorpay payments"
  ON razorpay_payments FOR SELECT
  TO authenticated
  USING (tenant_id IN (SELECT id FROM tenants WHERE auth_user_id = auth.uid()));

CREATE POLICY "Super admin full access to razorpay_payments"
  ON razorpay_payments FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Add Razorpay fields to tenant_subscriptions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenant_subscriptions' AND column_name = 'razorpay_order_id') THEN
    ALTER TABLE tenant_subscriptions ADD COLUMN razorpay_order_id text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenant_subscriptions' AND column_name = 'razorpay_payment_id') THEN
    ALTER TABLE tenant_subscriptions ADD COLUMN razorpay_payment_id text DEFAULT '';
  END IF;
END $$;

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  admin_notes text DEFAULT '',
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant can view own support tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (tenant_id IN (SELECT id FROM tenants WHERE auth_user_id = auth.uid()));

CREATE POLICY "Tenant can create support tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id IN (SELECT id FROM tenants WHERE auth_user_id = auth.uid()));

CREATE POLICY "Super admin full access to support_tickets"
  ON support_tickets FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_razorpay_orders_tenant_id ON razorpay_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_razorpay_payments_tenant_id ON razorpay_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_id ON support_tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
