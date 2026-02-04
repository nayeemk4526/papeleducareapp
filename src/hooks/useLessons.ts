import { useQuery } from "@tanstack/react-query";
import { lessonsApi } from "@/lib/mysql-api";

export interface Lesson {
  id: number;
  course_id: number;
  section_id: number | null;
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

export interface Section {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  section_order: number;
  is_published: boolean;
}

export const useLessonsByCourse = (courseId: string | number) => {
  const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
  
  return useQuery({
    queryKey: ["lessons", numericCourseId],
    queryFn: async () => {
      const response = await lessonsApi.getByCourse(numericCourseId);
      return response.data as Lesson[];
    },
    enabled: !!numericCourseId,
  });
};

export const usePublicLessonsByCourse = (courseId: string | number) => {
  const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
  
  return useQuery({
    queryKey: ["public-lessons", numericCourseId],
    queryFn: async () => {
      // For public view, we only show lesson titles and free preview status
      const response = await lessonsApi.getByCourse(numericCourseId);
      return response.data.map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        video_duration_minutes: lesson.video_duration_minutes,
        lesson_order: lesson.lesson_order,
        is_free_preview: lesson.is_free_preview,
        is_published: lesson.is_published,
        section_id: lesson.section_id,
      }));
    },
    enabled: !!numericCourseId,
  });
};

export const usePublicSectionsByCourse = (courseId: string | number) => {
  const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
  
  return useQuery({
    queryKey: ["public-sections", numericCourseId],
    queryFn: async () => {
      // This would need a sections API endpoint
      // For now, return empty array - sections can be fetched with lessons
      return [] as Section[];
    },
    enabled: !!numericCourseId,
  });
};
