import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PlayerLesson {
  id: string;
  course_id: string;
  section_id: string | null;
  title: string;
  description: string | null;
  video_url: string | null;
  video_duration_minutes: number | null;
  lesson_order: number;
  is_free_preview: boolean;
  is_published: boolean;
  materials_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlayerSection {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  section_order: number;
  is_published: boolean;
  lessons: PlayerLesson[];
}

// Hook for enrolled users to get full lesson data with video URLs
export const useEnrolledLessons = (courseId: string) => {
  const { user, isAdmin } = useAuth();

  return useQuery({
    queryKey: ["enrolled-lessons", courseId, user?.id, isAdmin],
    queryFn: async () => {
      if (!user) return [];

      // For admins, fetch all lessons regardless of enrollment
      // For regular users, RLS will filter based on enrollment
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_published", true)
        .order("lesson_order", { ascending: true });

      if (error) throw error;
      return data as PlayerLesson[];
    },
    enabled: !!user && !!courseId,
  });
};

export const useEnrolledSections = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["enrolled-sections", courseId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_published", true)
        .order("section_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!courseId,
  });
};

// Combined hook for structured curriculum
export const useEnrolledCurriculum = (courseId: string) => {
  const { data: sections = [], isLoading: sectionsLoading } = useEnrolledSections(courseId);
  const { data: lessons = [], isLoading: lessonsLoading } = useEnrolledLessons(courseId);

  const curriculum: PlayerSection[] = sections.map((section) => ({
    ...section,
    lessons: lessons.filter((lesson) => lesson.section_id === section.id),
  }));

  // Add lessons without section
  const orphanLessons = lessons.filter((lesson) => !lesson.section_id);

  return {
    sections: curriculum,
    orphanLessons,
    allLessons: lessons,
    isLoading: sectionsLoading || lessonsLoading,
  };
};
