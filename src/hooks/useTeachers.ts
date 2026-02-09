import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Teacher {
  id: string;
  user_id: string | null;
  name: string;
  title: string | null;
  subtitle: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  specializations: string[] | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useTeachers = () => {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data as Teacher[];
    },
  });
};

export const useTeacherById = (id: string) => {
  return useQuery({
    queryKey: ["teacher", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Teacher;
    },
    enabled: !!id,
  });
};
