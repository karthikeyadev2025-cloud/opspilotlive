/*
  # Create Marketing Leads Table

  ## Summary
  Adds a marketing_leads table to capture data collected by marketing executives in the field.

  ## New Tables
  - `marketing_leads`
    - `id` (uuid, primary key)
    - `full_name` (text) - Prospect's full name
    - `contact_number` (text) - Phone number for telecalling
    - `alternate_number` (text, optional) - Alternate contact number
    - `email` (text, optional) - Email address
    - `location` (text) - Area/location of the prospect
    - `address` (text, optional) - Full address
    - `requirement` (text) - What product/service they need (Solar, CCTV, etc.)
    - `requirement_details` (text, optional) - Additional requirement details
    - `collected_by` (text) - Marketing executive who collected this lead
    - `status` (text) - Lead status: new, called, interested, not_interested, converted, callback
    - `remarks` (text) - Telecaller remarks/notes after calling
    - `callback_date` (timestamptz, optional) - Scheduled callback date
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Public insert allowed (marketing executives submit via form)
  - Authenticated users (admin) can read, update, delete
*/

CREATE TABLE IF NOT EXISTS marketing_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  contact_number text NOT NULL,
  alternate_number text DEFAULT '',
  email text DEFAULT '',
  location text NOT NULL,
  address text DEFAULT '',
  requirement text NOT NULL,
  requirement_details text DEFAULT '',
  collected_by text NOT NULL,
  status text DEFAULT 'new',
  remarks text DEFAULT '',
  callback_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit marketing leads"
  ON marketing_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view marketing leads"
  ON marketing_leads
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update marketing leads"
  ON marketing_leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete marketing leads"
  ON marketing_leads
  FOR DELETE
  TO authenticated
  USING (true);
