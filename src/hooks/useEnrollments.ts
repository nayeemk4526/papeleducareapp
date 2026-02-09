import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress_percentage: number | null;
  last_accessed_lesson_id: string | null;
  enrolled_at: string;
  completed_at: string | null;
  certificate_url: string | null;
  course?: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    total_lessons: number | null;
    instructor?: { id: string; name: string } | null;
  };
}

export const useEnrollments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["enrollments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("enrollments")
        .select("*, course:courses(id, title, slug, thumbnail_url, total_lessons, instructor:teachers(id, name))")
        .eq("user_id", user.id);
      if (error) throw error;
      return data as Enrollment[];
    },
    enabled: !!user,
  });
};

export const useIsEnrolled = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["enrollment", user?.id, courseId],
    queryFn: async () => {
      if (!user || !courseId) return false;
      const { data } = await supabase.rpc('is_enrolled', { _course_id: courseId });
      return !!data;
    },
    enabled: !!user && !!courseId,
  });
};

export const useEnrollInCourse = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("User not authenticated");
      throw new Error("Direct enrollment not supported. Please complete payment.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
    },
  });
};
