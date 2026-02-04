import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { lessonsApi } from "@/lib/mysql-api";

export interface LessonProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  is_completed: boolean;
  watch_time_seconds: number;
  completed_at: string | null;
  created_at: string;
}

export const useLessonProgress = (courseId: string | number) => {
  const { user } = useAuth();
  const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;

  return useQuery({
    queryKey: ["lesson-progress", user?.id, numericCourseId],
    queryFn: async () => {
      if (!user) return [];

      // Get lessons with progress from API
      const response = await lessonsApi.getByCourse(numericCourseId);
      
      // Extract progress from lessons if included
      const progress: LessonProgress[] = [];
      if (response.data) {
        response.data.forEach((lesson: any) => {
          if (lesson.progress) {
            progress.push(lesson.progress);
          }
        });
      }
      
      return progress;
    },
    enabled: !!user && !!numericCourseId,
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
      lessonId: string | number;
      courseId: string | number;
      isCompleted?: boolean;
      watchTimeSeconds?: number;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const numericLessonId = typeof lessonId === 'string' ? parseInt(lessonId, 10) : lessonId;
      
      const response = await lessonsApi.updateProgress(numericLessonId, {
        is_completed: isCompleted,
        watch_time_seconds: watchTimeSeconds,
      });

      return { data: response, courseId };
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
      lessonId: string | number;
      courseId: string | number;
    }) => {
      return updateProgress.mutateAsync({
        lessonId,
        courseId,
        isCompleted: true,
      });
    },
  });
};
