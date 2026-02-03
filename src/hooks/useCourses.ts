import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  thumbnail_url: string | null;
  preview_video_url: string | null;
  how_to_enroll_video_url: string | null;
  price: number;
  discount_price: number | null;
  category_id: string | null;
  instructor_id: string | null;
  duration_hours: number | null;
  total_lessons: number;
  total_students: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  instructor?: {
    id: string;
    name: string;
    title: string | null;
    subtitle?: string | null;
    bio?: string | null;
    avatar_url: string | null;
  } | null;
}

export const useCourses = (options?: { categoryId?: string; featured?: boolean; limit?: number }) => {
  return useQuery({
    queryKey: ["courses", options],
    queryFn: async () => {
      let query = supabase
        .from("courses")
        .select(`
          *,
          category:categories(id, name, slug),
          instructor:teachers(id, name, title, avatar_url)
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (options?.categoryId) {
        query = query.eq("category_id", options.categoryId);
      }

      if (options?.featured) {
        query = query.eq("is_featured", true);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Course[];
    },
  });
};

export const useCourseBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          category:categories(id, name, slug),
          instructor:teachers(id, name, title, subtitle, bio, avatar_url)
        `)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data as Course | null;
    },
    enabled: !!slug,
  });
};

export const useCourseById = (id: string) => {
  return useQuery({
    queryKey: ["course", "id", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          category:categories(id, name, slug),
          instructor:teachers(id, name, title, subtitle, bio, avatar_url)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Course | null;
    },
    enabled: !!id,
  });
};

export const useCoursesByCategorySlug = (categorySlug: string) => {
  return useQuery({
    queryKey: ["courses", "category", categorySlug],
    queryFn: async () => {
      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .maybeSingle();

      if (categoryError) throw categoryError;
      if (!category) return [];

      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          category:categories(id, name, slug),
          instructor:teachers(id, name, title, avatar_url)
        `)
        .eq("category_id", category.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Course[];
    },
    enabled: !!categorySlug,
  });
};

export const useCategoryBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};

export const useCoursesByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: ["courses", "categoryId", categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          category:categories(id, name, slug),
          instructor:teachers(id, name, title, avatar_url)
        `)
        .eq("category_id", categoryId)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Course[];
    },
    enabled: !!categoryId,
  });
};
