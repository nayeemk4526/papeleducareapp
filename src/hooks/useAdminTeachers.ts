import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teachersApi } from "@/lib/mysql-api";
import { useToast } from "@/hooks/use-toast";

export interface TeacherFormData {
  name: string;
  title?: string;
  subtitle?: string;
  bio?: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  specializations?: string[];
  is_active?: boolean;
  user_id?: number;
}

export const useAdminTeachers = () => {
  return useQuery({
    queryKey: ["admin-teachers"],
    queryFn: async () => {
      const result = await teachersApi.list();
      return result.data;
    },
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (teacher: TeacherFormData) => {
      const result = await teachersApi.create(teacher);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast({ title: "সফল!", description: "শিক্ষক সফলভাবে যোগ হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...teacher }: TeacherFormData & { id: number }) => {
      const result = await teachersApi.update(id, teacher);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast({ title: "সফল!", description: "শিক্ষক সফলভাবে আপডেট হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await teachersApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast({ title: "সফল!", description: "শিক্ষক সফলভাবে মুছে ফেলা হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};
