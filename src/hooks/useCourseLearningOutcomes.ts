import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { learningOutcomesApi } from "@/lib/mysql-api";
import { useToast } from "@/hooks/use-toast";

export interface LearningOutcomeFormData {
  course_id: number;
  content: string;
  display_order: number;
}

export const useCourseLearningOutcomes = (courseId?: string | number) => {
  return useQuery({
    queryKey: ["course-learning-outcomes", courseId],
    queryFn: async () => {
      const result = await learningOutcomesApi.getByCourse(Number(courseId));
      return result.data;
    },
    enabled: !!courseId,
  });
};

export const useCreateLearningOutcome = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (outcome: LearningOutcomeFormData) => {
      const result = await learningOutcomesApi.create(outcome);
      return result.data;
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
    mutationFn: async ({ id, ...outcome }: LearningOutcomeFormData & { id: number }) => {
      const result = await learningOutcomesApi.update(id, outcome);
      return result.data;
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
    mutationFn: async ({ id, courseId }: { id: number; courseId: string | number }) => {
      await learningOutcomesApi.delete(id);
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
