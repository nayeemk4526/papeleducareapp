import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean | null;
  watch_time_seconds: number | null;
  completed_at: string | null;
  created_at: string;
}

export const useLessonProgress = (courseId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lesson-progress", user?.id, courseId],
    queryFn: async () => {
      if (!user) return [];
      // Get all lessons for this course first
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", courseId);
      
      if (!lessons || lessons.length === 0) return [];
      
      const lessonIds = lessons.map(l => l.id);
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);
      if (error) throw error;
      return data as LessonProgress[];
    },
    enabled: !!user && !!courseId,
  });
};

export const useUpdateLessonProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      courseId,
      isCompleted,
      watchTimeSeconds,
    }: {
      lessonId: string;
      courseId: string;
      isCompleted?: boolean;
      watchTimeSeconds?: number;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data: existing } = await supabase
        .from("lesson_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();

      if (existing) {
        const updates: any = {};
        if (isCompleted !== undefined) {
          updates.is_completed = isCompleted;
          if (isCompleted) updates.completed_at = new Date().toISOString();
        }
        if (watchTimeSeconds !== undefined) updates.watch_time_seconds = watchTimeSeconds;

        const { error } = await supabase
          .from("lesson_progress")
          .update(updates)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("lesson_progress")
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            is_completed: isCompleted || false,
            watch_time_seconds: watchTimeSeconds || 0,
            completed_at: isCompleted ? new Date().toISOString() : null,
          });
        if (error) throw error;
      }

      return { courseId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
};

export const useMarkLessonComplete = () => {
  const updateProgress = useUpdateLessonProgress();

  return useMutation({
    mutationFn: async ({ lessonId, courseId }: { lessonId: string; courseId: string }) => {
      return updateProgress.mutateAsync({ lessonId, courseId, isCompleted: true });
    },
  });
};
