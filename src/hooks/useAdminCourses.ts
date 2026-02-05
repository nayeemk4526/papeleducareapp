import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/lib/mysql-api";
import { useToast } from "@/hooks/use-toast";

export interface CourseFormData {
  title: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  discount_price?: number;
  category_id?: number;
  instructor_id?: number;
  duration_hours?: number;
  total_lessons?: number;
  thumbnail_url?: string;
  preview_video_url?: string;
  how_to_enroll_video_url?: string;
  is_published?: boolean;
  is_featured?: boolean;
}

export const useAdminCourses = () => {
  return useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const result = await coursesApi.list({ limit: 1000 });
      return result.data;
    },
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (course: CourseFormData) => {
      const result = await coursesApi.create(course);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "সফল!", description: "কোর্স সফলভাবে তৈরি হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...course }: CourseFormData & { id: number }) => {
      const result = await coursesApi.update(id, course);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "সফল!", description: "কোর্স সফলভাবে আপডেট হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await coursesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "সফল!", description: "কোর্স সফলভাবে মুছে ফেলা হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};
