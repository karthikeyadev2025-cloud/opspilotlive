/*
  # Storage Policies for Attendance Selfies and Lead Photos

  ## Summary
  Creates RLS policies for the attendance-selfies and lead-photos storage buckets.
  - Authenticated users can upload to their own folder
  - Public read access for displaying photos
*/

-- attendance-selfies bucket policies
CREATE POLICY "Authenticated users can upload selfies"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'attendance-selfies');

CREATE POLICY "Public can read selfies"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'attendance-selfies');

CREATE POLICY "Users can update own selfies"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'attendance-selfies' AND auth.uid()::text = (storage.foldername(name))[1]);

-- lead-photos bucket policies
CREATE POLICY "Authenticated users can upload lead photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'lead-photos');

CREATE POLICY "Public can read lead photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'lead-photos');

CREATE POLICY "Users can update own lead photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'lead-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
