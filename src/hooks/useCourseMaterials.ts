import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CourseMaterial {
  id: string;
  course_id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
  is_downloadable: boolean;
  created_at: string;
}

export const useCourseMaterials = (courseId: string) => {
  return useQuery({
    queryKey: ["course-materials", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_materials")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as CourseMaterial[];
    },
    enabled: !!courseId,
  });
};

export const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return "";
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};
