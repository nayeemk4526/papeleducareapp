-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create sections table for organizing lessons into sections/modules
CREATE TABLE public.sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  section_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add section_id to lessons table
ALTER TABLE public.lessons ADD COLUMN section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL;

-- Create course_learning_outcomes table for "What you'll learn"
CREATE TABLE public.course_learning_outcomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sections
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sections
CREATE POLICY "Anyone can view published sections of published courses"
ON public.sections
FOR SELECT
USING (
  is_published = true AND 
  EXISTS (SELECT 1 FROM courses WHERE courses.id = sections.course_id AND courses.is_published = true)
);

CREATE POLICY "Enrolled users can view sections"
ON public.sections
FOR SELECT
USING (is_enrolled(course_id));

CREATE POLICY "Admins can manage sections"
ON public.sections
FOR ALL
USING (is_admin());

CREATE POLICY "Teachers can manage own sections"
ON public.sections
FOR ALL
USING (
  is_teacher() AND 
  course_id IN (
    SELECT courses.id FROM courses 
    WHERE courses.instructor_id IN (
      SELECT teachers.id FROM teachers WHERE teachers.user_id = auth.uid()
    )
  )
);

-- Enable RLS on course_learning_outcomes
ALTER TABLE public.course_learning_outcomes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_learning_outcomes
CREATE POLICY "Anyone can view learning outcomes of published courses"
ON public.course_learning_outcomes
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = course_learning_outcomes.course_id AND courses.is_published = true)
);

CREATE POLICY "Admins can manage learning outcomes"
ON public.course_learning_outcomes
FOR ALL
USING (is_admin());

CREATE POLICY "Teachers can manage own learning outcomes"
ON public.course_learning_outcomes
FOR ALL
USING (
  is_teacher() AND 
  course_id IN (
    SELECT courses.id FROM courses 
    WHERE courses.instructor_id IN (
      SELECT teachers.id FROM teachers WHERE teachers.user_id = auth.uid()
    )
  )
);

-- Add trigger for sections updated_at
CREATE TRIGGER update_sections_updated_at
BEFORE UPDATE ON public.sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();