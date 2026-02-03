import { motion } from "framer-motion";
import { Play, Lock, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { usePublicLessonsByCourse } from "@/hooks/useLessons";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseCurriculumProps {
  courseId: string;
  totalLessons: number;
  durationHours: number;
}

const CourseCurriculum = ({ courseId, totalLessons, durationHours }: CourseCurriculumProps) => {
  const { data: lessons, isLoading } = usePublicLessonsByCourse(courseId);
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card rounded-xl p-6 border border-border mb-8"
      >
        <Skeleton className="h-8 w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </motion.div>
    );
  }

  const displayedLessons = showAll ? lessons : lessons?.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-xl p-6 border border-border mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">কোর্স কারিকুলাম</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{totalLessons} টি লেসন</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {durationHours} ঘন্টা
          </span>
        </div>
      </div>

      {lessons && lessons.length > 0 ? (
        <>
          <Accordion type="single" collapsible className="space-y-2">
            {displayedLessons?.map((lesson, index) => (
              <AccordionItem
                key={lesson.id}
                value={lesson.id}
                className="border border-border rounded-lg px-4 bg-muted/30"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{lesson.title}</span>
                        {lesson.is_free_preview && (
                          <Badge variant="secondary" className="text-xs">
                            ফ্রি প্রিভিউ
                          </Badge>
                        )}
                      </div>
                      {lesson.video_duration_minutes && (
                        <span className="text-xs text-muted-foreground">
                          {lesson.video_duration_minutes} মিনিট
                        </span>
                      )}
                    </div>
                    {lesson.is_free_preview ? (
                      <Play className="w-4 h-4 text-primary" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-0 pb-4">
                  <p className="text-sm text-muted-foreground pl-11">
                    {lesson.description || "এই লেসনে আপনি গুরুত্বপূর্ণ বিষয় শিখবেন।"}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {lessons.length > 5 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-4 w-full py-2 text-sm text-primary hover:text-primary/80 flex items-center justify-center gap-1 transition-colors"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  কম দেখুন
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  আরো {lessons.length - 5} টি লেসন দেখুন
                </>
              )}
            </button>
          )}
        </>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          এই কোর্সে এখনো কোনো লেসন যোগ করা হয়নি।
        </p>
      )}
    </motion.div>
  );
};

export default CourseCurriculum;
