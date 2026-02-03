import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  PlayCircle, 
  FileText, 
  Download, 
  Lock,
  ChevronDown,
  ChevronUp,
  Clock,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { useCourseById } from "@/hooks/useCourses";
import { useIsEnrolled } from "@/hooks/useEnrollments";
import { useEnrolledCurriculum, PlayerLesson } from "@/hooks/usePlayerLessons";
import { useLessonProgress, useMarkLessonComplete } from "@/hooks/useLessonProgress";
import { useCourseMaterials, formatFileSize } from "@/hooks/useCourseMaterials";
import Navbar from "@/components/Navbar";
import YouTubePlayer from "@/components/dashboard/YouTubePlayer";
import { useToast } from "@/hooks/use-toast";

const CoursePlayer = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();

  const { data: course, isLoading: courseLoading } = useCourseById(courseId || "");
  const { data: isEnrolled, isLoading: enrollmentLoading } = useIsEnrolled(courseId || "");
  const { sections, orphanLessons, allLessons, isLoading: curriculumLoading } = useEnrolledCurriculum(courseId || "");
  const { data: progressData = [], isLoading: progressLoading } = useLessonProgress(courseId || "");
  const { data: materials = [] } = useCourseMaterials(courseId || "");
  const markComplete = useMarkLessonComplete();

  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>([]);

  // Check access (enrolled OR admin)
  const hasAccess = isEnrolled || isAdmin;

  // Progress map
  const progressMap = useMemo(() => {
    const map: Record<string, { isCompleted: boolean; watchTime: number }> = {};
    progressData.forEach((p) => {
      map[p.lesson_id] = {
        isCompleted: p.is_completed,
        watchTime: p.watch_time_seconds,
      };
    });
    return map;
  }, [progressData]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (allLessons.length === 0) return 0;
    const completed = allLessons.filter((l) => progressMap[l.id]?.isCompleted).length;
    return Math.round((completed / allLessons.length) * 100);
  }, [allLessons, progressMap]);

  // Current lesson
  const currentLesson = useMemo(() => {
    if (!currentLessonId) return null;
    return allLessons.find((l) => l.id === currentLessonId) || null;
  }, [currentLessonId, allLessons]);

  // Set initial lesson
  useEffect(() => {
    if (allLessons.length > 0 && !currentLessonId) {
      // Find first incomplete lesson or first lesson
      const firstIncomplete = allLessons.find((l) => !progressMap[l.id]?.isCompleted);
      setCurrentLessonId(firstIncomplete?.id || allLessons[0].id);

      // Open the section containing the current lesson
      const sectionId = (firstIncomplete || allLessons[0]).section_id;
      if (sectionId) {
        setOpenSections([sectionId]);
      }
    }
  }, [allLessons, currentLessonId, progressMap]);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Access check
  useEffect(() => {
    if (!authLoading && !enrollmentLoading && !hasAccess && !courseLoading && course) {
      toast({
        title: "অ্যাক্সেস নেই",
        description: "এই কোর্সে অ্যাক্সেস পেতে প্রথমে কোর্সটি কিনুন।",
        variant: "destructive",
      });
      navigate(`/course/${course.slug}`, { replace: true });
    }
  }, [hasAccess, authLoading, enrollmentLoading, courseLoading, course, navigate, toast]);

  const handleLessonClick = (lesson: PlayerLesson) => {
    setCurrentLessonId(lesson.id);
  };

  const handleMarkComplete = async () => {
    if (!currentLessonId || !courseId) return;

    try {
      await markComplete.mutateAsync({ lessonId: currentLessonId, courseId });
      toast({
        title: "সম্পন্ন!",
        description: "লেসনটি সম্পন্ন হিসেবে চিহ্নিত হয়েছে।",
      });

      // Auto-advance to next lesson
      const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
      if (currentIndex < allLessons.length - 1) {
        setCurrentLessonId(allLessons[currentIndex + 1].id);
      }
    } catch (error) {
      toast({
        title: "ত্রুটি!",
        description: "লেসন সম্পন্ন করতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    }
  };

  const goToNextLesson = () => {
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
    if (currentIndex < allLessons.length - 1) {
      setCurrentLessonId(allLessons[currentIndex + 1].id);
    }
  };

  const goToPrevLesson = () => {
    const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
    if (currentIndex > 0) {
      setCurrentLessonId(allLessons[currentIndex - 1].id);
    }
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "";
    if (minutes < 60) return `${minutes} মি`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ঘ ${mins}মি`;
  };

  if (authLoading || courseLoading || enrollmentLoading || curriculumLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <main className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">কোর্স পাওয়া যায়নি</h1>
            <Button onClick={() => navigate("/dashboard/courses")}>আমার কোর্সে যান</Button>
          </div>
        </main>
      </>
    );
  }

  const currentIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const hasNext = currentIndex < allLessons.length - 1;
  const hasPrev = currentIndex > 0;
  const isCurrentComplete = currentLessonId ? progressMap[currentLessonId]?.isCompleted : false;

  return (
    <>
      <Navbar />

      <main className="pt-16 min-h-screen bg-muted/30">
        <div className="flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 lg:w-2/3">
            {/* Video Player */}
            <div className="bg-black">
              {currentLesson?.video_url ? (
                <YouTubePlayer
                  videoUrl={currentLesson.video_url}
                  title={currentLesson.title}
                  onComplete={handleMarkComplete}
                  className="w-full"
                />
              ) : (
                <div className="aspect-video flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <PlayCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">এই লেসনে কোনো ভিডিও নেই</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Info */}
            <div className="p-4 lg:p-6">
              {/* Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard/courses")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  আমার কোর্স
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasPrev}
                    onClick={goToPrevLesson}
                  >
                    পূর্ববর্তী
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasNext}
                    onClick={goToNextLesson}
                  >
                    পরবর্তী
                  </Button>
                </div>
              </div>

              {/* Lesson Title */}
              <motion.div
                key={currentLessonId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold mb-2">
                      {currentLesson?.title || "লেসন নির্বাচন করুন"}
                    </h1>
                    {currentLesson?.description && (
                      <p className="text-muted-foreground">{currentLesson.description}</p>
                    )}
                  </div>
                  {currentLesson && (
                    <Button
                      onClick={handleMarkComplete}
                      disabled={isCurrentComplete || markComplete.isPending}
                      variant={isCurrentComplete ? "secondary" : "default"}
                      size="sm"
                    >
                      {isCurrentComplete ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          সম্পন্ন
                        </>
                      ) : (
                        "সম্পন্ন করুন"
                      )}
                    </Button>
                  )}
                </div>
              </motion.div>

              {/* Course Materials */}
              {materials.length > 0 && (
                <div className="bg-card rounded-xl p-4 border border-border mb-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    কোর্স ম্যাটেরিয়ালস
                  </h3>
                  <div className="space-y-2">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <span className="text-sm font-medium">{material.title}</span>
                          {material.file_size_bytes && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({formatFileSize(material.file_size_bytes)})
                            </span>
                          )}
                        </div>
                        {material.is_downloadable && (
                          <Button
                            size="sm"
                            variant="ghost"
                            asChild
                          >
                            <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Badge */}
              {isAdmin && !isEnrolled && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    <strong>এডমিন মোড:</strong> আপনি এডমিন হিসেবে এই কোর্সটি দেখছেন।
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Lesson List */}
          <div className="lg:w-[380px] lg:border-l border-border bg-card lg:h-[calc(100vh-64px)] lg:sticky lg:top-16">
            {/* Course Info Header */}
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {allLessons.length} লেসন
                </span>
                {course.duration_hours && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration_hours} ঘন্টা
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>অগ্রগতি</span>
                  <span className="font-medium">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
            </div>

            {/* Lesson List */}
            <ScrollArea className="h-[calc(100vh-200px)] lg:h-[calc(100vh-200px)]">
              <div className="p-2">
                {/* Sections */}
                {sections.map((section) => (
                  <Collapsible
                    key={section.id}
                    open={openSections.includes(section.id)}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-muted/50 rounded-lg transition-colors">
                      <div className="flex items-center gap-2 text-left">
                        <span className="font-medium text-sm">{section.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {section.lessons.length} লেসন
                        </Badge>
                      </div>
                      {openSections.includes(section.id) ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-2">
                        {section.lessons.map((lesson) => (
                          <LessonItem
                            key={lesson.id}
                            lesson={lesson}
                            isActive={lesson.id === currentLessonId}
                            isCompleted={progressMap[lesson.id]?.isCompleted}
                            onClick={() => handleLessonClick(lesson)}
                            formatDuration={formatDuration}
                          />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}

                {/* Orphan Lessons (no section) */}
                {orphanLessons.length > 0 && (
                  <div className="mt-2">
                    {sections.length > 0 && (
                      <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
                        অন্যান্য লেসন
                      </div>
                    )}
                    {orphanLessons.map((lesson) => (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        isActive={lesson.id === currentLessonId}
                        isCompleted={progressMap[lesson.id]?.isCompleted}
                        onClick={() => handleLessonClick(lesson)}
                        formatDuration={formatDuration}
                      />
                    ))}
                  </div>
                )}

                {allLessons.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    <p>এই কোর্সে এখনো কোনো লেসন নেই</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </main>
    </>
  );
};

// Lesson Item Component
interface LessonItemProps {
  lesson: PlayerLesson;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  formatDuration: (minutes: number | null) => string;
}

const LessonItem = ({ lesson, isActive, isCompleted, onClick, formatDuration }: LessonItemProps) => {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? "bg-primary/10 border border-primary/30"
          : "hover:bg-muted/50"
      }`}
    >
      <div className="flex items-start gap-3">
        {isCompleted ? (
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isActive ? "text-primary" : ""}`}>
            {lesson.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {lesson.video_url ? (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <PlayCircle className="w-3 h-3" />
                {formatDuration(lesson.video_duration_minutes) || "ভিডিও"}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="w-3 h-3" />
                টেক্সট
              </span>
            )}
            {lesson.is_free_preview && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                ফ্রি
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
