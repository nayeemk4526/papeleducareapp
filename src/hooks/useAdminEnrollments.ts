import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EnrollmentWithDetails {
  id: string;
  user_id: string;
  course_id: string;
  progress_percentage: number | null;
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

export const useAdminEnrollments = (courseId?: string) => {
  return useQuery({
    queryKey: ["admin-enrollments", courseId],
    queryFn: async () => {
      let query = supabase
        .from("enrollments")
        .select("*, course:courses(title, slug)")
        .order("enrolled_at", { ascending: false });
      
      if (courseId) query = query.eq("course_id", courseId);
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Fetch profiles for enrolled users
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(e => e.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email, phone")
          .in("user_id", userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
        return data.map(e => ({
          ...e,
          profile: profileMap.get(e.user_id),
        })) as EnrollmentWithDetails[];
      }
      
      return data as EnrollmentWithDetails[];
    },
  });
};

export const useManualEnrollment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, courseId }: { userId: string; courseId: string }) => {
      const { data, error } = await supabase
        .from("enrollments")
        .insert({ user_id: userId, course_id: courseId, progress_percentage: 0 })
        .select()
        .single();
      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      if (error) throw error;
      return data;
    },
    enabled: search.length >= 2,
  });
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};
