/*
  # SaaS Multi-Tenant Subscription System

  ## Overview
  Creates all tables needed to run FieldPulse (the SaaS product) as a multi-tenant
  platform where each client organisation is a "tenant".

  ## New Tables

  ### 1. saas_plans
  Defines the subscription tiers (Starter, Business).
  - id, name, price_monthly, max_users, features (jsonb), is_active

  ### 2. tenants
  Each paying client company is a tenant.
  - id, company_name, company_email, company_phone, industry
  - owner_name, owner_email, owner_phone
  - slug (unique URL identifier)
  - status: trial | active | expired | suspended
  - trial_ends_at, subscription_starts_at, subscription_ends_at
  - plan_id (FK saas_plans), created_at

  ### 3. tenant_subscriptions
  Full history of subscription events per tenant.
  - id, tenant_id, plan_id, status, amount_paid
  - starts_at, ends_at, payment_reference, created_at

  ### 4. super_admins
  Platform owners (K2 Adexos staff) who manage all tenants.
  - id (matches auth.users), email, full_name, is_active, created_at

  ### 5. tenant_users
  Links existing app_users to their tenant, scoping all data.
  - id, tenant_id, auth_user_id, email, full_name, role
  - phone, is_active, profile_photo_url, created_at

  ## Security
  - RLS enabled on all tables
  - Super admins can read/write everything
  - Tenants can only read their own data
  - tenant_users scoped to their tenant
*/

-- ─────────────────────────────────────────
-- 1. saas_plans
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saas_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price_monthly numeric(10,2) NOT NULL DEFAULT 0,
  max_users integer NOT NULL DEFAULT 10,
  features jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE saas_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage plans"
  ON saas_plans FOR SELECT
  TO authenticated
  USING (true);

-- Seed plans
INSERT INTO saas_plans (name, slug, price_monthly, max_users, features) VALUES
(
  'Starter',
  'starter',
  999.00,
  10,
  '["Lead CRM","Telecaller Portal","Field Executive Portal","Basic Attendance","Manager Dashboard","Up to 10 staff"]'::jsonb
),
(
  'Business',
  'business',
  2499.00,
  -1,
  '["Everything in Starter","Full HR Portal","Leave & Salary Advance","Advanced Analytics","Security Audit Logs","Custom Roles & Permissions","Priority Support","Unlimited staff"]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────
-- 2. tenants
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  company_email text NOT NULL,
  company_phone text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  owner_name text NOT NULL,
  owner_email text UNIQUE NOT NULL,
  owner_phone text NOT NULL DEFAULT '',
  slug text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'trial' CHECK (status IN ('trial','active','expired','suspended')),
  plan_id uuid REFERENCES saas_plans(id),
  trial_ends_at timestamptz NOT NULL DEFAULT (now() + interval '3 days'),
  subscription_starts_at timestamptz,
  subscription_ends_at timestamptz,
  auth_user_id uuid,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant owner can view own tenant"
  ON tenants FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Tenant owner can update own tenant"
  ON tenants FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- ─────────────────────────────────────────
-- 3. tenant_subscriptions
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES saas_plans(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled','refunded')),
  amount_paid numeric(10,2) NOT NULL DEFAULT 0,
  payment_reference text NOT NULL DEFAULT '',
  payment_method text NOT NULL DEFAULT '',
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tenant_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant owner can view own subscriptions"
  ON tenant_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenants t
      WHERE t.id = tenant_id AND t.auth_user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- 4. super_admins
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS super_admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view super_admins table"
  ON super_admins FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- ─────────────────────────────────────────
-- 5. tenant_users
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  auth_user_id uuid,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('admin','manager','hr','marketing_executive','telecaller','employee')),
  phone text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  profile_photo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, email)
);

ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant admin can view tenant users"
  ON tenant_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenants t
      WHERE t.id = tenant_id AND t.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant admin can insert tenant users"
  ON tenant_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenants t
      WHERE t.id = tenant_id AND t.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant admin can update tenant users"
  ON tenant_users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenants t
      WHERE t.id = tenant_id AND t.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenants t
      WHERE t.id = tenant_id AND t.auth_user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- 6. super_admin helper function
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM super_admins
    WHERE id = auth.uid() AND is_active = true
  );
$$;

-- Super admin policies (bypass all tenant restrictions)
CREATE POLICY "Super admin full access to tenants"
  ON tenants FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "Super admin full access to tenant_subscriptions"
  ON tenant_subscriptions FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "Super admin full access to tenant_users"
  ON tenant_users FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "Super admin full access to super_admins"
  ON super_admins FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ─────────────────────────────────────────
-- 7. Indexes
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tenants_auth_user_id ON tenants(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_tenant_id ON tenant_subscriptions(tenant_id);
