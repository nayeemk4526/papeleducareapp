import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sectionsApi } from "@/lib/mysql-api";
import { useToast } from "@/hooks/use-toast";

export interface SectionFormData {
  course_id: number;
  title: string;
  description?: string;
  section_order: number;
  is_published?: boolean;
}

export const useAdminSections = (courseId?: string | number) => {
  return useQuery({
    queryKey: ["admin-sections", courseId],
    queryFn: async () => {
      const result = await sectionsApi.getByCourse(Number(courseId));
      return result.data;
    },
    enabled: !!courseId,
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (section: SectionFormData) => {
      const result = await sectionsApi.create(section);
      return result.data;
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
    mutationFn: async ({ id, ...section }: SectionFormData & { id: number }) => {
      const result = await sectionsApi.update(id, section);
      return result.data;
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
    mutationFn: async ({ id, courseId }: { id: number; courseId: string | number }) => {
      await sectionsApi.delete(id);
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
