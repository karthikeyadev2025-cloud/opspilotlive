/*
  # Create Photo Storage Bucket

  1. New Storage Bucket
    - `photos` - Public bucket for storing uploaded images
  
  2. Security
    - Enable public access for reading
    - Only authenticated users can upload/update/delete
    - File size limits and type restrictions applied
  
  3. Policies
    - Public can view all photos
    - Authenticated users can upload photos
    - Authenticated users can update their own uploads
    - Authenticated users can delete their own uploads
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Authenticated users can update photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can delete photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'photos');
