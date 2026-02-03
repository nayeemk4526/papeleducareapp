import { motion } from "framer-motion";
import { ArrowLeft, Star, Users, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Course } from "@/hooks/useCourses";

interface CourseHeroProps {
  course: Course;
  onPlayPreview: () => void;
}

const CourseHero = ({ course, onPlayPreview }: CourseHeroProps) => {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 py-8 md:py-16">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ফিরে যান
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Course Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {course.category && (
              <span className="inline-block px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
                {course.category.name}
              </span>
            )}
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {course.title}
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              {course.short_description}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                {course.instructor?.avatar_url ? (
                  <img
                    src={course.instructor.avatar_url}
                    alt={course.instructor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                    {course.instructor?.name?.charAt(0) || "T"}
                  </div>
                )}
                <div>
                  <p className="font-medium text-sm">{course.instructor?.name}</p>
                  <p className="text-xs text-muted-foreground">{course.instructor?.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-medium">4.8</span>
                <span className="text-muted-foreground text-sm">(১২৩ রিভিউ)</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-sm">{course.total_students} জন শিক্ষার্থী</span>
              </div>
            </div>
          </motion.div>

          {/* Featured Image / Preview Video */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div 
              className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
              onClick={course.preview_video_url ? onPlayPreview : undefined}
            >
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-vibrant-pink" />
              )}
              
              {/* Play Button Overlay */}
              {course.preview_video_url && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl"
                  >
                    <Play className="w-10 h-10 text-primary fill-primary ml-1" />
                  </motion.div>
                </div>
              )}

              {/* Play indicator */}
              {course.preview_video_url && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Play className="w-4 h-4 text-white fill-white" />
                  <span className="text-white text-sm font-medium">প্রিভিউ দেখুন</span>
                </div>
              )}
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CourseHero;
