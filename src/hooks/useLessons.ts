import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Lesson {
  id: string;
  course_id: string;
  section_id: string | null;
  title: string;
  description: string | null;
  video_url: string | null;
  video_duration_minutes: number | null;
  lesson_order: number;
  is_free_preview: boolean | null;
  is_published: boolean | null;
  materials_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  section_order: number;
  is_published: boolean | null;
}

export const useLessonsByCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .order("lesson_order");
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!courseId,
  });
};

export const usePublicLessonsByCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["public-lessons", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, description, video_duration_minutes, lesson_order, is_free_preview, is_published, section_id")
        .eq("course_id", courseId)
        .eq("is_published", true)
        .order("lesson_order");
      if (error) throw error;
      return data as Lesson[];
    },
    enabled: !!courseId,
  });
};

export const usePublicSectionsByCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["public-sections", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_published", true)
        .order("section_order");
      if (error) throw error;
      return data as Section[];
    },
    enabled: !!courseId,
  });
};
