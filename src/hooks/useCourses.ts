import { useQuery } from "@tanstack/react-query";
import { coursesApi, categoriesApi } from "@/lib/mysql-api";

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  how_to_enroll_video_url: string | null;
  price: number;
  discount_price: number | null;
  category_id: number | null;
  instructor_id: number | null;
  duration_hours: number | null;
  total_lessons: number;
  total_students: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  instructor?: {
    id: number;
    name: string;
    title: string | null;
    subtitle?: string | null;
    bio?: string | null;
    avatar_url: string | null;
  } | null;
}

export const useCourses = (options?: { categoryId?: string | number; featured?: boolean; limit?: number }) => {
  return useQuery({
    queryKey: ["courses", options],
    queryFn: async () => {
      const params: any = {};
      
      if (options?.categoryId) {
        params.category_id = typeof options.categoryId === 'string' 
          ? parseInt(options.categoryId, 10) 
          : options.categoryId;
      }
      
      if (options?.featured) {
        params.featured = true;
      }
      
      if (options?.limit) {
        params.limit = options.limit;
      }

      const response = await coursesApi.list(params);
      return response.data as Course[];
    },
  });
};

export const useCourseBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const response = await coursesApi.getBySlug(slug);
      return response as Course | null;
    },
    enabled: !!slug,
  });
};

export const useCourseById = (id: string | number) => {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  
  return useQuery({
    queryKey: ["course", "id", numericId],
    queryFn: async () => {
      const response = await coursesApi.getById(numericId);
      return response as Course | null;
    },
    enabled: !!numericId,
  });
};

export const useCoursesByCategorySlug = (categorySlug: string) => {
  return useQuery({
    queryKey: ["courses", "category", categorySlug],
    queryFn: async () => {
      const category = await categoriesApi.getBySlug(categorySlug);
      if (!category) return [];

      const response = await coursesApi.list({ category_id: category.id });
      return response.data as Course[];
    },
    enabled: !!categorySlug,
  });
};

export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const response = await categoriesApi.getBySlug(slug);
      return response;
    },
    enabled: !!slug,
  });
};

export const useCoursesByCategory = (categoryId: string | number) => {
  const numericId = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  
  return useQuery({
    queryKey: ["courses", "categoryId", numericId],
    queryFn: async () => {
      const response = await coursesApi.list({ category_id: numericId });
      return response.data as Course[];
    },
    enabled: !!numericId,
  });
};
