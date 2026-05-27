/*
  # Content Management System for Aadya Enterprises

  1. New Tables
    - `site_content`
      - `id` (uuid, primary key)
      - `section` (text) - identifies which section (hero, about, services, etc.)
      - `key` (text) - specific content key (title, subtitle, description, etc.)
      - `value` (text) - the actual content value
      - `type` (text) - content type (text, image_url, etc.)
      - `updated_at` (timestamp)
    
    - `services`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `icon` (text) - icon name or image URL
      - `order_index` (integer) - for ordering services
      - `active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `gallery`
      - `id` (uuid, primary key)
      - `image_url` (text)
      - `title` (text)
      - `category` (text) - 'cctv' or 'solar'
      - `order_index` (integer)
      - `active` (boolean)
      - `created_at` (timestamp)
    
    - `testimonials`
      - `id` (uuid, primary key)
      - `client_name` (text)
      - `client_company` (text)
      - `testimonial` (text)
      - `rating` (integer)
      - `image_url` (text)
      - `order_index` (integer)
      - `active` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Public read access for active content
    - Admin-only write access
*/

-- Create site_content table
CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  key text NOT NULL,
  value text NOT NULL,
  type text DEFAULT 'text',
  updated_at timestamptz DEFAULT now(),
  UNIQUE(section, key)
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  order_index integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gallery table
CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text NOT NULL,
  category text NOT NULL,
  order_index integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  client_company text DEFAULT '',
  testimonial text NOT NULL,
  rating integer DEFAULT 5,
  image_url text DEFAULT '',
  order_index integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view site content"
  ON site_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Anyone can view active gallery items"
  ON gallery FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Anyone can view active testimonials"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- Admin policies (authenticated users can manage all content)
CREATE POLICY "Authenticated users can insert site content"
  ON site_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update site content"
  ON site_content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete site content"
  ON site_content FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view all services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert gallery items"
  ON gallery FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gallery items"
  ON gallery FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete gallery items"
  ON gallery FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view all gallery items"
  ON gallery FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert testimonials"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update testimonials"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete testimonials"
  ON testimonials FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view all testimonials"
  ON testimonials FOR SELECT
  TO authenticated
  USING (true);

-- Insert default content
INSERT INTO site_content (section, key, value, type) VALUES
  ('hero', 'title', 'Aadya Enterprises', 'text'),
  ('hero', 'subtitle', 'CCTV & Solar', 'text'),
  ('hero', 'tagline', 'Smart Energy. Smarter Security.', 'text'),
  ('hero', 'description', 'Leading provider of cutting-edge CCTV surveillance systems and sustainable solar energy solutions', 'text'),
  ('about', 'title', 'About Us', 'text'),
  ('about', 'description', 'We specialize in delivering top-tier security and energy solutions that protect your assets and reduce your carbon footprint.', 'text'),
  ('contact', 'phone', '+91 1234567890', 'text'),
  ('contact', 'email', 'info@aadyaenterprises.com', 'text'),
  ('contact', 'address', 'Your Address Here', 'text')
ON CONFLICT (section, key) DO NOTHING;

-- Insert default services
INSERT INTO services (title, description, icon, order_index) VALUES
  ('CCTV Installation', 'Professional installation of high-definition surveillance cameras with remote monitoring capabilities', 'Camera', 1),
  ('Solar Panel Systems', 'Complete solar energy solutions for residential and commercial properties', 'Sun', 2),
  ('Security Systems', 'Integrated security systems with motion detection and alarm features', 'Shield', 3),
  ('Maintenance & Support', '24/7 technical support and regular maintenance services', 'Settings', 4)
ON CONFLICT DO NOTHING;