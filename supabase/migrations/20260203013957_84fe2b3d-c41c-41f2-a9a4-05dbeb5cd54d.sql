-- =============================================
-- STORAGE BUCKETS
-- =============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('course-thumbnails', 'course-thumbnails', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('course-materials', 'course-materials', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip']),
  ('category-images', 'category-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- AVATARS STORAGE POLICIES
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- COURSE THUMBNAILS STORAGE POLICIES
CREATE POLICY "Course thumbnails are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Admins can manage course thumbnails"
  ON storage.objects FOR ALL
  USING (bucket_id = 'course-thumbnails' AND public.is_admin());

CREATE POLICY "Teachers can upload course thumbnails"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course-thumbnails' AND public.is_teacher());

-- COURSE MATERIALS STORAGE POLICIES
CREATE POLICY "Enrolled users can view course materials"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'course-materials' AND
    (
      public.is_admin() OR
      public.is_enrolled((storage.foldername(name))[1]::uuid)
    )
  );

CREATE POLICY "Admins can manage course materials"
  ON storage.objects FOR ALL
  USING (bucket_id = 'course-materials' AND public.is_admin());

CREATE POLICY "Teachers can upload course materials"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'course-materials' AND public.is_teacher());

-- CATEGORY IMAGES STORAGE POLICIES
CREATE POLICY "Category images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-images');

CREATE POLICY "Admins can manage category images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'category-images' AND public.is_admin());