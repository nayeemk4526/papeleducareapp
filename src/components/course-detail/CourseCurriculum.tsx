import { motion } from "framer-motion";
import { Play, Lock, Clock, ChevronDown, ChevronUp, FolderOpen } from "lucide-react";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { usePublicLessonsByCourse, usePublicSectionsByCourse } from "@/hooks/useLessons";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseCurriculumProps {
  courseId: string;
  totalLessons: number;
  durationHours: number;
}

const CourseCurriculum = ({ courseId, totalLessons, durationHours }: CourseCurriculumProps) => {
  const { data: lessons, isLoading: lessonsLoading } = usePublicLessonsByCourse(courseId);
  const { data: sections, isLoading: sectionsLoading } = usePublicSectionsByCourse(courseId);
  const [showAll, setShowAll] = useState(false);

  const isLoading = lessonsLoading || sectionsLoading;

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

  // Group lessons by section
  const getLessonsForSection = (sectionId: string) => {
    return lessons?.filter(l => l.section_id === sectionId) || [];
  };

  // Lessons without section
  const unassignedLessons = lessons?.filter(l => !l.section_id) || [];

  // Calculate display items
  const hasSections = sections && sections.length > 0;
  const displaySections = showAll ? sections : sections?.slice(0, 3);
  const displayUnassignedLessons = showAll ? unassignedLessons : unassignedLessons.slice(0, 5);

  // Total items for "show more" button
  const totalItems = (sections?.length || 0) + unassignedLessons.length;
  const displayedItems = (displaySections?.length || 0) + displayUnassignedLessons.length;

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
          {hasSections && <span>{sections.length} টি সেকশন</span>}
          <span>{lessons?.length || totalLessons} টি লেসন</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {durationHours} ঘন্টা
          </span>
        </div>
      </div>

      {(lessons && lessons.length > 0) || (sections && sections.length > 0) ? (
        <>
          <Accordion type="multiple" className="space-y-2">
            {/* Sections with lessons */}
            {hasSections && displaySections?.map((section, sectionIndex) => {
              const sectionLessons = getLessonsForSection(section.id);
              
              return (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border border-border rounded-lg px-4 bg-muted/30"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{section.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {sectionLessons.length} লেসন
                          </Badge>
                        </div>
                        {section.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {section.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-0 pb-4">
                    <div className="space-y-2 pl-11">
                      {sectionLessons.map((lesson, lessonIndex) => (
                        <div 
                          key={lesson.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              {lessonIndex + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{lesson.title}</span>
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
                          </div>
                          {lesson.is_free_preview ? (
                            <Play className="w-4 h-4 text-primary" />
                          ) : (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}

            {/* Unassigned lessons (when there are sections but also standalone lessons) */}
            {hasSections && unassignedLessons.length > 0 && (
              <div className="border border-dashed border-border rounded-lg p-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">অন্যান্য লেসন</p>
                <div className="space-y-2">
                  {displayUnassignedLessons.map((lesson, index) => (
                    <div 
                      key={lesson.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{lesson.title}</span>
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
                      </div>
                      {lesson.is_free_preview ? (
                        <Play className="w-4 h-4 text-primary" />
                      ) : (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* If no sections, show lessons directly */}
            {!hasSections && displayUnassignedLessons.map((lesson, index) => (
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

          {totalItems > 5 && (
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
                  আরো দেখুন
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
