import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { lessonsApi, sectionsApi } from "@/lib/mysql-api";

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
export const useEnrolledLessons = (courseId: string | number) => {
  const { user, isAdmin } = useAuth();
  const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;

  return useQuery({
    queryKey: ["enrolled-lessons", numericCourseId, user?.id, isAdmin],
    queryFn: async () => {
      if (!user || !numericCourseId) return [];

      // Fetch lessons from MySQL API
      const response = await lessonsApi.getByCourse(numericCourseId);
      
      // Filter for published lessons and transform to expected format
      const lessons = (response.data || [])
        .filter((lesson: any) => lesson.is_published)
        .map((lesson: any) => ({
          ...lesson,
          id: String(lesson.id),
          course_id: String(lesson.course_id),
          section_id: lesson.section_id ? String(lesson.section_id) : null,
        }));
      
      return lessons as PlayerLesson[];
    },
    enabled: !!user && !!numericCourseId,
  });
};

export const useEnrolledSections = (courseId: string | number) => {
  const { user } = useAuth();
  const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;

  return useQuery({
    queryKey: ["enrolled-sections", numericCourseId, user?.id],
    queryFn: async () => {
      if (!user || !numericCourseId) return [];

      const response = await sectionsApi.getByCourse(numericCourseId);
      
      // Filter for published sections and transform IDs to strings
      const sections = (response.data || [])
        .filter((section: any) => section.is_published)
        .map((section: any) => ({
          ...section,
          id: String(section.id),
          course_id: String(section.course_id),
        }));
      
      return sections;
    },
    enabled: !!user && !!numericCourseId,
  });
};

// Combined hook for structured curriculum
export const useEnrolledCurriculum = (courseId: string | number) => {
  const { data: sections = [], isLoading: sectionsLoading } = useEnrolledSections(courseId);
  const { data: lessons = [], isLoading: lessonsLoading } = useEnrolledLessons(courseId);

  const curriculum: PlayerSection[] = sections.map((section: any) => ({
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
