import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Testimonial {
  id: string;
  user_id: string;
  course_id: string | null;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

export const useTestimonialsByCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["testimonials", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("course_id", courseId)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Testimonial[];
    },
    enabled: !!courseId,
  });
};

export const useFeaturedTestimonials = () => {
  return useQuery({
    queryKey: ["featured-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_approved", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Testimonial[];
    },
  });
};
