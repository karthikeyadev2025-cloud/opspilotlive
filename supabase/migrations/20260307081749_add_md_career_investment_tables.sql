/*
  # Add Managing Director, Career, and Investment Tables

  1. New Tables
    - `managing_director`
      - `id` (uuid, primary key)
      - `name` (text) - MD name
      - `photo_url` (text) - MD photo URL
      - `title` (text) - MD title/designation
      - `message` (text) - MD message to visitors
      - `address` (text) - Company address
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `career_applications`
      - `id` (uuid, primary key)
      - `full_name` (text, required)
      - `email` (text, required)
      - `phone` (text, required)
      - `position` (text) - Position applying for
      - `experience` (text) - Years of experience
      - `location` (text) - Preferred location
      - `resume_url` (text) - Resume file URL
      - `cover_letter` (text) - Cover letter/message
      - `status` (text) - Application status (new, reviewing, contacted, rejected, hired)
      - `created_at` (timestamptz)
    
    - `investment_inquiries`
      - `id` (uuid, primary key)
      - `full_name` (text, required)
      - `email` (text, required)
      - `phone` (text, required)
      - `investment_amount` (text) - Expected investment amount
      - `investment_type` (text) - Type of investment interest
      - `message` (text) - Additional message
      - `status` (text) - Inquiry status (new, contacted, interested, closed)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public can insert into career_applications and investment_inquiries
    - Only authenticated users can view applications/inquiries
    - Only authenticated users can update MD info
*/

CREATE TABLE IF NOT EXISTS managing_director (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Mudigarala Tandava Krishna',
  photo_url text DEFAULT 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=800',
  title text DEFAULT 'Managing Director',
  message text DEFAULT 'Welcome to Aadya Enterprises. We are committed to providing the best solar and CCTV solutions across Andhra Pradesh & Telangana.',
  address text DEFAULT 'Andhra Pradesh & Telangana',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS career_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  position text NOT NULL,
  experience text,
  location text,
  resume_url text,
  cover_letter text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investment_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  investment_amount text,
  investment_type text,
  message text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE managing_director ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view MD info"
  ON managing_director FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update MD info"
  ON managing_director FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can submit career applications"
  ON career_applications FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view career applications"
  ON career_applications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update career applications"
  ON career_applications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete career applications"
  ON career_applications FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can submit investment inquiries"
  ON investment_inquiries FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view investment inquiries"
  ON investment_inquiries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update investment inquiries"
  ON investment_inquiries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete investment inquiries"
  ON investment_inquiries FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO managing_director (id) VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;
