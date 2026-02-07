import { useQuery } from "@tanstack/react-query";
import { courseMaterialsApi } from "@/lib/mysql-api";

export interface CourseMaterial {
  id: number;
  course_id: number;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
  is_downloadable: boolean;
  created_at: string;
}

export const useCourseMaterials = (courseId: string | number) => {
  const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
  
  return useQuery({
    queryKey: ["course-materials", numericCourseId],
    queryFn: async () => {
      const response = await courseMaterialsApi.getByCourse(numericCourseId);
      return response.data as CourseMaterial[];
    },
    enabled: !!numericCourseId,
  });
};

export const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return "";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};
