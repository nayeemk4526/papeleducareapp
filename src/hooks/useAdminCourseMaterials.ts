import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseMaterialsApi } from "@/lib/mysql-api";
import { useToast } from "@/hooks/use-toast";

export interface CourseMaterialFormData {
  course_id: number;
  title: string;
  file_url: string;
  file_type?: string;
  file_size_bytes?: number;
  is_downloadable?: boolean;
}

export const useAdminCourseMaterials = (courseId?: string | number) => {
  return useQuery({
    queryKey: ["admin-course-materials", courseId],
    queryFn: async () => {
      const result = await courseMaterialsApi.getByCourse(Number(courseId));
      return result.data;
    },
    enabled: !!courseId,
  });
};

export const useCreateCourseMaterial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (material: CourseMaterialFormData) => {
      const result = await courseMaterialsApi.create(material);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-materials", data.course_id] });
      queryClient.invalidateQueries({ queryKey: ["course-materials", data.course_id] });
      toast({ title: "সফল!", description: "ম্যাটেরিয়াল সফলভাবে যোগ হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateCourseMaterial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...material }: CourseMaterialFormData & { id: number }) => {
      const result = await courseMaterialsApi.update(id, material);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-materials", data.course_id] });
      queryClient.invalidateQueries({ queryKey: ["course-materials", data.course_id] });
      toast({ title: "সফল!", description: "ম্যাটেরিয়াল সফলভাবে আপডেট হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteCourseMaterial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, courseId }: { id: number; courseId: string | number }) => {
      await courseMaterialsApi.delete(id);
      return String(courseId);
    },
    onSuccess: (courseId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-materials", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course-materials", courseId] });
      toast({ title: "সফল!", description: "ম্যাটেরিয়াল সফলভাবে মুছে ফেলা হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};
