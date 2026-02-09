import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SectionFormData {
  course_id: string;
  title: string;
  description?: string;
  section_order: number;
  is_published?: boolean;
}

export const useAdminSections = (courseId?: string) => {
  return useQuery({
    queryKey: ["admin-sections", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sections")
        .select("*, lessons(*)")
        .eq("course_id", courseId!)
        .order("section_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (section: SectionFormData) => {
      const { data, error } = await supabase
        .from("sections")
        .insert(section)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-sections", data.course_id] });
      toast({ title: "সফল!", description: "সেকশন সফলভাবে তৈরি হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...section }: SectionFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("sections")
        .update(section)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-sections", data.course_id] });
      toast({ title: "সফল!", description: "সেকশন সফলভাবে আপডেট হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, courseId }: { id: string; courseId: string }) => {
      const { error } = await supabase.from("sections").delete().eq("id", id);
      if (error) throw error;
      return courseId;
    },
    onSuccess: (courseId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-sections", courseId] });
      toast({ title: "সফল!", description: "সেকশন সফলভাবে মুছে ফেলা হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};
