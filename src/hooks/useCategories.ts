import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/mysql-api";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  image_url: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await categoriesApi.list();
      return response.data as Category[];
    },
  });
};

export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const response = await categoriesApi.getBySlug(slug);
      return response as Category | null;
    },
    enabled: !!slug,
  });
};
