import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonsApi } from "@/lib/mysql-api";
import { useToast } from "@/hooks/use-toast";

export interface LessonFormData {
  course_id: number;
  section_id?: number;
  title: string;
  description?: string;
  video_url?: string;
  video_duration_minutes?: number;
  lesson_order: number;
  is_free_preview?: boolean;
  is_published?: boolean;
  materials_url?: string;
}

export const useAdminLessons = (courseId?: string | number) => {
  return useQuery({
    queryKey: ["admin-lessons", courseId],
    queryFn: async () => {
      const result = await lessonsApi.getByCourse(Number(courseId));
      return result.data;
    },
    enabled: !!courseId,
  });
};

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lesson: LessonFormData) => {
      const result = await lessonsApi.create(lesson);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", data.course_id] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      toast({ title: "সফল!", description: "লেসন সফলভাবে তৈরি হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...lesson }: LessonFormData & { id: number }) => {
      const result = await lessonsApi.update(id, lesson);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", data.course_id] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      toast({ title: "সফল!", description: "লেসন সফলভাবে আপডেট হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, courseId }: { id: number; courseId: string | number }) => {
      await lessonsApi.delete(id);
      return courseId;
    },
    onSuccess: (courseId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-lessons", courseId] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      toast({ title: "সফল!", description: "লেসন সফলভাবে মুছে ফেলা হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};
