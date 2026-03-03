
-- Allow authenticated admins to upload to hero-slides bucket
CREATE POLICY "Admins can upload hero slides"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hero-slides' AND public.is_admin());

-- Allow admins to update hero slides
CREATE POLICY "Admins can update hero slides"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'hero-slides' AND public.is_admin());

-- Allow admins to delete hero slides
CREATE POLICY "Admins can delete hero slides"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'hero-slides' AND public.is_admin());

-- Allow public read access
CREATE POLICY "Anyone can view hero slides"
ON storage.objects
FOR SELECT
USING (bucket_id = 'hero-slides');
