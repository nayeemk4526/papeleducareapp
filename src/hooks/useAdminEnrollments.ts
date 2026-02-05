import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/mysql-api";
import { useToast } from "@/hooks/use-toast";

export interface EnrollmentWithDetails {
  id: number;
  user_id: number;
  course_id: number;
  progress_percentage: number;
  enrolled_at: string;
  completed_at: string | null;
  profile?: {
    full_name: string;
    email: string;
    phone: string | null;
  };
  course?: {
    title: string;
    slug: string;
  };
}

export const useAdminEnrollments = (courseId?: string | number) => {
  return useQuery({
    queryKey: ["admin-enrollments", courseId],
    queryFn: async () => {
      const result = await adminApi.getEnrollments(courseId ? Number(courseId) : undefined);
      return result.data as EnrollmentWithDetails[];
    },
  });
};

export const useManualEnrollment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, courseId }: { userId: number; courseId: number }) => {
      const result = await adminApi.createEnrollment({ user_id: userId, course_id: courseId });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast({ title: "সফল!", description: "ম্যানুয়াল এনরোলমেন্ট সফল হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useSearchUsers = (search: string) => {
  return useQuery({
    queryKey: ["admin-users-search", search],
    queryFn: async () => {
      const result = await adminApi.getUsers(search);
      return result.data;
    },
    enabled: search.length >= 2,
  });
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const result = await adminApi.getUsers();
      return result.data;
    },
  });
};
