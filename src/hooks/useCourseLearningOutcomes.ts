import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface LearningOutcomeFormData {
  course_id: string;
  content: string;
  display_order: number;
}

export const useCourseLearningOutcomes = (courseId?: string) => {
  return useQuery({
    queryKey: ["course-learning-outcomes", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_learning_outcomes")
        .select("*")
        .eq("course_id", courseId!)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!courseId,
  });
};

export const useCreateLearningOutcome = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (outcome: LearningOutcomeFormData) => {
      const { data, error } = await supabase
        .from("course_learning_outcomes")
        .insert(outcome)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["course-learning-outcomes", data.course_id] });
      toast({ title: "সফল!", description: "শিখার বিষয় সফলভাবে যোগ হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateLearningOutcome = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...outcome }: LearningOutcomeFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("course_learning_outcomes")
        .update(outcome)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["course-learning-outcomes", data.course_id] });
      toast({ title: "সফল!", description: "শিখার বিষয় সফলভাবে আপডেট হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteLearningOutcome = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, courseId }: { id: string; courseId: string }) => {
      const { error } = await supabase.from("course_learning_outcomes").delete().eq("id", id);
      if (error) throw error;
      return courseId;
    },
    onSuccess: (courseId) => {
      queryClient.invalidateQueries({ queryKey: ["course-learning-outcomes", courseId] });
      toast({ title: "সফল!", description: "শিখার বিষয় সফলভাবে মুছে ফেলা হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};
