/*
  # Add Photo URL to Career Applications

  1. Changes
    - Add `photo_url` column to `career_applications` table
    - Allow storing employee passport size photo URL
    
  2. Notes
    - Column is optional (nullable)
    - Stores URL of uploaded photo from Supabase storage
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'career_applications' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE career_applications ADD COLUMN photo_url text;
  END IF;
END $$;
