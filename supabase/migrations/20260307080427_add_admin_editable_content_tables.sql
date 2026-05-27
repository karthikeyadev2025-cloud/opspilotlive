/*
  # Add Admin Editable Content Tables

  1. New Tables
    - `solar_benefits` - Store solar benefit cards
      - `id` (uuid, primary key)
      - `icon` (text) - Icon name from lucide-react
      - `title` (text)
      - `description` (text)
      - `order_index` (integer) - For sorting
      - `created_at` (timestamp)
      
    - `solar_types` - Store solar system types (Residential, Commercial, Industrial)
      - `id` (uuid, primary key)
      - `icon` (text)
      - `title` (text)
      - `size` (text)
      - `features` (jsonb) - Array of features
      - `order_index` (integer)
      - `created_at` (timestamp)
      
    - `solar_best_practices` - Store solar installation best practices
      - `id` (uuid, primary key)
      - `practice` (text)
      - `order_index` (integer)
      - `created_at` (timestamp)
      
    - `cctv_packages` - Store CCTV packages
      - `id` (uuid, primary key)
      - `title` (text)
      - `cameras` (text)
      - `price` (text)
      - `features` (jsonb) - Array of features
      - `is_popular` (boolean)
      - `order_index` (integer)
      - `created_at` (timestamp)
      
    - `cctv_brands` - Store authorized CCTV brands
      - `id` (uuid, primary key)
      - `name` (text)
      - `order_index` (integer)
      - `created_at` (timestamp)
      
    - `technicians` - Store technician profiles
      - `id` (uuid, primary key)
      - `name` (text)
      - `role` (text)
      - `experience` (text)
      - `specialization` (text)
      - `image_url` (text)
      - `order_index` (integer)
      - `created_at` (timestamp)
      
    - `company_benefits` - Store company benefits/advantages
      - `id` (uuid, primary key)
      - `icon` (text)
      - `title` (text)
      - `description` (text)
      - `gradient` (text) - CSS gradient classes
      - `order_index` (integer)
      - `created_at` (timestamp)
      
    - `why_choose_us` - Store competitive advantages
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `order_index` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for public read access
    - Add policies for authenticated admin write access
*/

-- Solar Benefits Table
CREATE TABLE IF NOT EXISTS solar_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE solar_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view solar benefits"
  ON solar_benefits FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert solar benefits"
  ON solar_benefits FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update solar benefits"
  ON solar_benefits FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete solar benefits"
  ON solar_benefits FOR DELETE
  TO authenticated
  USING (true);

-- Solar Types Table
CREATE TABLE IF NOT EXISTS solar_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL,
  title text NOT NULL,
  size text NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE solar_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view solar types"
  ON solar_types FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert solar types"
  ON solar_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update solar types"
  ON solar_types FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete solar types"
  ON solar_types FOR DELETE
  TO authenticated
  USING (true);

-- Solar Best Practices Table
CREATE TABLE IF NOT EXISTS solar_best_practices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE solar_best_practices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view solar best practices"
  ON solar_best_practices FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert solar best practices"
  ON solar_best_practices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update solar best practices"
  ON solar_best_practices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete solar best practices"
  ON solar_best_practices FOR DELETE
  TO authenticated
  USING (true);

-- CCTV Packages Table
CREATE TABLE IF NOT EXISTS cctv_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  cameras text NOT NULL,
  price text NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  is_popular boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cctv_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cctv packages"
  ON cctv_packages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert cctv packages"
  ON cctv_packages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cctv packages"
  ON cctv_packages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete cctv packages"
  ON cctv_packages FOR DELETE
  TO authenticated
  USING (true);

-- CCTV Brands Table
CREATE TABLE IF NOT EXISTS cctv_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cctv_brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cctv brands"
  ON cctv_brands FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert cctv brands"
  ON cctv_brands FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cctv brands"
  ON cctv_brands FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete cctv brands"
  ON cctv_brands FOR DELETE
  TO authenticated
  USING (true);

-- Technicians Table
CREATE TABLE IF NOT EXISTS technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  experience text NOT NULL,
  specialization text NOT NULL,
  image_url text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view technicians"
  ON technicians FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert technicians"
  ON technicians FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update technicians"
  ON technicians FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete technicians"
  ON technicians FOR DELETE
  TO authenticated
  USING (true);

-- Company Benefits Table
CREATE TABLE IF NOT EXISTS company_benefits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  gradient text DEFAULT 'from-blue-500 to-blue-700',
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE company_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view company benefits"
  ON company_benefits FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert company benefits"
  ON company_benefits FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update company benefits"
  ON company_benefits FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete company benefits"
  ON company_benefits FOR DELETE
  TO authenticated
  USING (true);

-- Why Choose Us Table
CREATE TABLE IF NOT EXISTS why_choose_us (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE why_choose_us ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view why choose us"
  ON why_choose_us FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert why choose us"
  ON why_choose_us FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update why choose us"
  ON why_choose_us FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete why choose us"
  ON why_choose_us FOR DELETE
  TO authenticated
  USING (true);
