import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Users, Star, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { useCourses, type Course } from "@/hooks/useCourses";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

const CourseCard = ({ course }: { course: Course }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 min-w-[280px] md:min-w-[300px] group"
  >
    <Link to={`/course/${course.slug}`}>
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary via-vibrant-pink to-primary flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-white/80" />
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />

        {/* Discount Badge */}
        {course.discount_price && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold shadow-lg">
            {Math.round((1 - course.discount_price / course.price) * 100)}% ছাড়
          </div>
        )}
      </div>
    </Link>

    {/* Content */}
    <div className="p-4">
      <Link to={`/course/${course.slug}`}>
        <h4 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h4>
      </Link>

      <p className="text-sm text-muted-foreground mb-3">{course.instructor?.name || "শিক্ষক"}</p>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        {course.duration_hours && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{course.duration_hours} ঘন্টা</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span>{course.total_students || 0}+</span>
        </div>
        <div className="flex items-center gap-1 text-golden">
          <Star className="w-3.5 h-3.5 fill-golden" />
          <span>4.8</span>
        </div>
      </div>

      {/* Price & Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            ৳{(course.discount_price || course.price).toLocaleString()}
          </span>
          {course.discount_price && (
            <span className="text-sm text-muted-foreground line-through">
              ৳{course.price.toLocaleString()}
            </span>
          )}
        </div>
        <Link to={`/course/${course.slug}`}>
          <Button
            size="sm"
            className="bg-gradient-to-r from-secondary to-vibrant-pink hover:from-secondary/90 hover:to-vibrant-pink/90 text-white rounded-full px-4"
          >
            বিস্তারিত
          </Button>
        </Link>
      </div>
    </div>
  </motion.div>
);

// Predefined tabs for running courses
const runningCourseTabs = [
  { slug: "all", name: "সকল কোর্স" },
  { slug: "2nd-semester", name: "২য় সেমিস্টার" },
  { slug: "3rd-semester", name: "৩য় সেমিস্টার" },
  { slug: "5th-semester", name: "৫ম সেমিস্টার" },
  { slug: "7th-semester", name: "৭ম সেমিস্টার" },
  { slug: "ssc", name: "এসএসসি" },
  { slug: "hsc", name: "এইচএসসি" },
  { slug: "diploma-care", name: "ডিপ্লোমা কেয়ার" },
  { slug: "admission", name: "এডমিশন" },
  { slug: "skill-development", name: "স্কিল ডেভেলপমেন্ট" },
];

const RunningCourses = () => {
  const { data: allCourses, isLoading } = useCourses({ featured: true, limit: 20 });
  const { data: categories } = useCategories();
  const [activeTab, setActiveTab] = useState("all");
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Filter courses by category
  const filteredCourses = activeTab === "all" 
    ? allCourses 
    : allCourses?.filter(course => {
        const category = categories?.find(c => c.id === course.category_id);
        return category?.slug === activeTab;
      });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Auto-scroll
  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);
    return () => clearInterval(autoplay);
  }, [emblaApi]);

  // Reinit embla when courses change
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi, filteredCourses]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4 animate-pulse" />
            <div className="h-12 bg-muted rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="flex gap-4 md:gap-6 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[280px] md:min-w-[300px] bg-card rounded-2xl border border-border/50 animate-pulse">
                <div className="h-44 bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!allCourses?.length) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-5 py-2 rounded-full border border-secondary/30 text-secondary text-sm font-medium mb-6 bg-secondary/5"
          >
            এখনই ভর্তি হন
          </motion.span>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-secondary via-vibrant-pink to-primary bg-clip-text text-transparent">
              জনপ্রিয় কোর্সসমূহ
            </span>
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            আমাদের সবচেয়ে জনপ্রিয় কোর্সগুলোতে আজই যোগ দিন
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {runningCourseTabs.map((tab) => (
              <button
                key={tab.slug}
                onClick={() => setActiveTab(tab.slug)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                  activeTab === tab.slug
                    ? "bg-gradient-to-r from-secondary to-vibrant-pink text-white shadow-lg"
                    : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6">
              {filteredCourses?.map((course) => (
                <div key={course.id} className="flex-shrink-0">
                  <CourseCard course={course} />
                </div>
              )) || (
                <div className="w-full text-center py-12 text-muted-foreground">
                  এই ক্যাটাগরিতে কোনো কোর্স নেই
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          {filteredCourses && filteredCourses.length > 3 && (
            <div className="hidden md:flex items-center justify-center gap-3 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className="w-12 h-12 rounded-full border-2 hover:bg-secondary hover:text-white hover:border-secondary transition-all disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollNext}
                disabled={!canScrollNext}
                className="w-12 h-12 rounded-full border-2 hover:bg-secondary hover:text-white hover:border-secondary transition-all disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RunningCourses;
