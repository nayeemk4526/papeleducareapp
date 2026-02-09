import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  watch_time_seconds: number;
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
      const { data: lessons, error: lessonsError } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", courseId);

      if (lessonsError) throw lessonsError;

      const lessonIds = lessons?.map((l) => l.id) || [];

      if (lessonIds.length === 0) return [];

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

      // Check if progress exists
      const { data: existing } = await supabase
        .from("lesson_progress")
        .select("id, watch_time_seconds")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const updateData: Record<string, unknown> = {};
        if (isCompleted !== undefined) {
          updateData.is_completed = isCompleted;
          if (isCompleted) {
            updateData.completed_at = new Date().toISOString();
          }
        }
        if (watchTimeSeconds !== undefined) {
          updateData.watch_time_seconds = Math.max(
            existing.watch_time_seconds || 0,
            watchTimeSeconds
          );
        }

        const { data, error } = await supabase
          .from("lesson_progress")
          .update(updateData)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return { data, courseId };
      } else {
        // Create new
        const { data, error } = await supabase
          .from("lesson_progress")
          .insert({
            user_id: user.id,
            lesson_id: lessonId,
            is_completed: isCompleted || false,
            watch_time_seconds: watchTimeSeconds || 0,
            completed_at: isCompleted ? new Date().toISOString() : null,
          })
          .select()
          .single();

        if (error) throw error;
        return { data, courseId };
      }
    },
    onSuccess: ({ courseId }) => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
  });
};

export const useMarkLessonComplete = () => {
  const updateProgress = useUpdateLessonProgress();

  return useMutation({
    mutationFn: async ({
      lessonId,
      courseId,
    }: {
      lessonId: string;
      courseId: string;
    }) => {
      return updateProgress.mutateAsync({
        lessonId,
        courseId,
        isCompleted: true,
      });
    },
  });
};
