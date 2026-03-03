
-- Create hero_slides table
CREATE TABLE public.hero_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Anyone can view active slides
CREATE POLICY "Anyone can view active hero slides"
ON public.hero_slides
FOR SELECT
USING (is_active = true);

-- Admins can manage all slides
CREATE POLICY "Admins can manage hero slides"
ON public.hero_slides
FOR ALL
USING (public.is_admin());

-- Create storage bucket for hero images
INSERT INTO storage.buckets (id, name, public) VALUES ('hero-slides', 'hero-slides', true);

-- Storage policies for hero-slides bucket
CREATE POLICY "Anyone can view hero slide images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hero-slides');

CREATE POLICY "Admins can upload hero slide images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'hero-slides' AND public.is_admin());

CREATE POLICY "Admins can update hero slide images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'hero-slides' AND public.is_admin());

CREATE POLICY "Admins can delete hero slide images"
ON storage.objects FOR DELETE
USING (bucket_id = 'hero-slides' AND public.is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_hero_slides_updated_at
BEFORE UPDATE ON public.hero_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
