import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress_percentage: number;
  last_accessed_lesson_id: string | null;
  enrolled_at: string;
  completed_at: string | null;
  certificate_url: string | null;
  course?: {
    id: string;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    total_lessons: number;
    instructor?: {
      id: string;
      name: string;
    } | null;
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
        .select(`
          *,
          course:courses(
            id, title, slug, thumbnail_url, total_lessons,
            instructor:teachers(id, name)
          )
        `)
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false });

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

      const { data, error } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (error) throw error;
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

      const { data, error } = await supabase
        .from("enrollments")
        .insert({
          user_id: user.id,
          course_id: courseId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
    },
  });
};
