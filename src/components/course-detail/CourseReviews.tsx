import { motion } from "framer-motion";
import { Star, MessageSquare, Quote } from "lucide-react";
import { useTestimonialsByCourse } from "@/hooks/useTestimonials";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CourseReviewsProps {
  courseId: string;
}

const CourseReviews = ({ courseId }: CourseReviewsProps) => {
  const { data: reviews, isLoading } = useTestimonialsByCourse(courseId);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card rounded-xl p-6 border border-border mb-8"
      >
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </motion.div>
    );
  }

  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-xl p-6 border border-border mb-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          শিক্ষার্থীদের মতামত
        </h3>
        {reviews && reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(Number(averageRating))
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="font-bold">{averageRating}</span>
            <span className="text-sm text-muted-foreground">
              ({reviews.length} টি রিভিউ)
            </span>
          </div>
        )}
      </div>

      {reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg bg-muted/30 border border-border"
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                    {review.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="font-medium">{review.name}</p>
                      {review.role && (
                        <p className="text-xs text-muted-foreground">{review.role}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= (review.rating || 5)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <Quote className="absolute -top-1 -left-1 w-4 h-4 text-primary/20" />
                    <p className="text-sm text-muted-foreground pl-4">{review.content}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">এখনো কোনো রিভিউ নেই।</p>
          <p className="text-sm text-muted-foreground">প্রথম রিভিউ দিন!</p>
        </div>
      )}
    </motion.div>
  );
};

export default CourseReviews;
