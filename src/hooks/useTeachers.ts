import { useQuery } from "@tanstack/react-query";
import { teachersApi } from "@/lib/mysql-api";

export interface Teacher {
  id: number;
  user_id: number | null;
  name: string;
  title: string | null;
  subtitle: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  specializations: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useTeachers = () => {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await teachersApi.list();
      return response.data as Teacher[];
    },
  });
};

export const useTeacherById = (id: string | number) => {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  return useQuery({
    queryKey: ["teacher", numericId],
    queryFn: async () => {
      const response = await teachersApi.getById(numericId);
      return response as Teacher | null;
    },
    enabled: !!numericId,
  });
};
