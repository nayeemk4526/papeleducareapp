import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface LessonFormData {
  course_id: string;
  section_id?: string;
  title: string;
  description?: string;
  video_url?: string;
  video_duration_minutes?: number;
  lesson_order: number;
  is_free_preview?: boolean;
  is_published?: boolean;
  materials_url?: string;
}

export const useAdminLessons = (courseId?: string) => {
  return useQuery({
    queryKey: ["admin-lessons", courseId],
    queryFn: async () => {
      let query = supabase
        .from("lessons")
        .select("*")
        .order("lesson_order", { ascending: true });

      if (courseId) {
        query = query.eq("course_id", courseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
};

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (lesson: LessonFormData) => {
      const { data, error } = await supabase
        .from("lessons")
        .insert(lesson)
        .select()
        .single();

      if (error) throw error;
      return data;
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
    mutationFn: async ({ id, ...lesson }: LessonFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("lessons")
        .update(lesson)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
    mutationFn: async ({ id, courseId }: { id: string; courseId: string }) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
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
