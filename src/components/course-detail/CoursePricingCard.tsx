import { motion } from "framer-motion";
import { PlayCircle, Clock, FileText, Award, Calendar, Play, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsEnrolled } from "@/hooks/useEnrollments";
import { Course } from "@/hooks/useCourses";

interface CoursePricingCardProps {
  course: Course;
  onPlayPreview: () => void;
  onPlayHowToEnroll: () => void;
}

const CoursePricingCard = ({ course, onPlayPreview, onPlayHowToEnroll }: CoursePricingCardProps) => {
  const navigate = useNavigate();
  const { data: isEnrolled } = useIsEnrolled(course.id);

  const features = [
    { icon: PlayCircle, label: `${course.total_lessons || 0} টি ভিডিও লেসন` },
    { icon: Clock, label: `${course.duration_hours || 0} ঘন্টা` },
    { icon: FileText, label: "ডাউনলোডযোগ্য রিসোর্স" },
    { icon: Award, label: "সার্টিফিকেট" },
    { icon: Calendar, label: "লাইফটাইম অ্যাক্সেস" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl p-6 border border-border shadow-lg sticky top-24"
    >
      {/* Thumbnail Preview */}
      <div 
        className="aspect-video bg-muted rounded-xl overflow-hidden mb-4 relative group cursor-pointer"
        onClick={course.preview_video_url ? onPlayPreview : undefined}
      >
        {course.thumbnail_url ? (
          <>
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            {course.preview_video_url && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-12 h-12 text-white fill-white" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
        )}
      </div>

      {/* Price */}
      <div className="mb-4">
        {course.discount_price ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-3xl font-bold text-primary">
              ৳{course.discount_price.toLocaleString()}
            </span>
            <span className="text-lg text-muted-foreground line-through">
              ৳{course.price.toLocaleString()}
            </span>
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
              {Math.round((1 - course.discount_price / course.price) * 100)}% ছাড়
            </span>
          </div>
        ) : (
          <span className="text-3xl font-bold text-primary">
            ৳{course.price.toLocaleString()}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      {isEnrolled ? (
        <Button
          className="w-full gradient-primary mb-3"
          size="lg"
          onClick={() => navigate(`/dashboard/course/${course.id}`)}
        >
          <PlayCircle className="w-5 h-5 mr-2" />
          কোর্স চালিয়ে যান
        </Button>
      ) : (
        <Button
          className="w-full gradient-primary mb-3"
          size="lg"
          onClick={() => navigate(`/checkout/${course.id}`)}
        >
          এখনই এনরোল করুন
        </Button>
      )}

      {/* Features */}
      <div className="space-y-3 pt-4 border-t border-border mb-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Icon className="w-4 h-4 text-primary" />
              <span>{feature.label}</span>
            </div>
          );
        })}
      </div>

      {/* How to Buy Button - Below Features */}
      {course.how_to_enroll_video_url && (
        <Button
          variant="outline"
          className="w-full border-primary text-primary hover:bg-primary/10"
          onClick={onPlayHowToEnroll}
        >
          <Play className="w-4 h-4 mr-2" />
          কিভাবে কোর্সটি কিনবেন?
        </Button>
      )}
    </motion.div>
  );
};

export default CoursePricingCard;
