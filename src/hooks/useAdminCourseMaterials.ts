import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CourseMaterialFormData {
  course_id: string;
  title: string;
  file_url: string;
  file_type?: string;
  file_size_bytes?: number;
  is_downloadable?: boolean;
}

export const useAdminCourseMaterials = (courseId?: string) => {
  return useQuery({
    queryKey: ["admin-course-materials", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_materials")
        .select("*")
        .eq("course_id", courseId!)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
};

export const useCreateCourseMaterial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (material: CourseMaterialFormData) => {
      const { data, error } = await supabase
        .from("course_materials")
        .insert(material)
        .select()
        .single();

      if (error) throw error;
      return data;
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
    mutationFn: async ({ id, ...material }: CourseMaterialFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("course_materials")
        .update(material)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
    mutationFn: async ({ id, courseId }: { id: string; courseId: string }) => {
      const { error } = await supabase.from("course_materials").delete().eq("id", id);
      if (error) throw error;
      return courseId;
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
