/*
  # Add Video Support to Content Management

  1. Changes
    - Add new content entries for hero video URLs
    - Support for background video, promotional video, and video poster
  
  2. New Content Keys
    - hero.video_url - Main background video URL
    - hero.video_poster - Video poster/thumbnail image
    - hero.promo_video_url - Optional promotional video overlay
*/

-- Insert video-related content entries
INSERT INTO site_content (section, key, value, type) VALUES
  ('hero', 'video_url', 'https://cdn.pixabay.com/video/2023/05/12/161729-826094078_large.mp4', 'video'),
  ('hero', 'video_poster', 'https://images.pexels.com/photos/8092172/pexels-photo-8092172.jpeg?auto=compress&cs=tinysrgb&w=1920', 'image'),
  ('hero', 'show_video', 'true', 'boolean')
ON CONFLICT (section, key) DO UPDATE
  SET value = EXCLUDED.value, type = EXCLUDED.type;