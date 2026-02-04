import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { enrollmentsApi } from "@/lib/mysql-api";

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  progress_percentage: number;
  last_accessed_lesson_id: number | null;
  enrolled_at: string;
  completed_at: string | null;
  certificate_url: string | null;
  course?: {
    id: number;
    title: string;
    slug: string;
    thumbnail_url: string | null;
    total_lessons: number;
    instructor?: {
      id: number;
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

      const response = await enrollmentsApi.list();
      return response.data as Enrollment[];
    },
    enabled: !!user,
  });
};

export const useIsEnrolled = (courseId: string | number) => {
  const { user } = useAuth();
  const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;

  return useQuery({
    queryKey: ["enrollment", user?.id, numericCourseId],
    queryFn: async () => {
      if (!user || !numericCourseId) return false;

      const response = await enrollmentsApi.check(numericCourseId);
      return response.enrolled;
    },
    enabled: !!user && !!numericCourseId,
  });
};

export const useEnrollInCourse = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string | number) => {
      if (!user) throw new Error("User not authenticated");

      const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
      
      // This would need an API endpoint to create enrollment
      // For now, enrollments are created through payments
      throw new Error("Direct enrollment not supported. Please complete payment.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
    },
  });
};
