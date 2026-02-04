import { useQuery } from "@tanstack/react-query";
import { testimonialsApi } from "@/lib/mysql-api";

export interface Testimonial {
  id: number;
  user_id: number;
  course_id: number | null;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

export const useTestimonialsByCourse = (courseId: string | number) => {
  const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
  
  return useQuery({
    queryKey: ["testimonials", numericCourseId],
    queryFn: async () => {
      const response = await testimonialsApi.byCourse(numericCourseId);
      return response.data as Testimonial[];
    },
    enabled: !!numericCourseId,
  });
};

export const useFeaturedTestimonials = () => {
  return useQuery({
    queryKey: ["featured-testimonials"],
    queryFn: async () => {
      const response = await testimonialsApi.featured();
      return response.data as Testimonial[];
    },
  });
};
