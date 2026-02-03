import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useEmblaCarousel from "embla-carousel-react";

const tabs = [
  { id: "2nd-semester", name: "২য় সেমিস্টার" },
  { id: "3rd-semester", name: "৩য় সেমিস্টার" },
  { id: "5th-semester", name: "৫ম সেমিস্টার" },
  { id: "7th-semester", name: "৭ম সেমিস্টার" },
  { id: "ssc", name: "এসএসসি" },
  { id: "hsc", name: "এইচএসসি" },
  { id: "diploma-care", name: "ডিপ্লোমা কেয়ার" },
  { id: "admission", name: "এডমিশন" },
  { id: "skill", name: "স্কিল ডেভেলপমেন্ট" },
];

interface Course {
  id: string;
  title: string;
  instructor: string;
  price: number;
  originalPrice: number;
  students: number;
  duration: string;
  rating: number;
  lessons: number;
}

const generateCourses = (tabId: string): Course[] => {
  const courseTemplates = [
    { title: "ইলেকট্রনিক্স", instructor: "ইঞ্জি. রাকিব হাসান" },
    { title: "ইলেকট্রিক্যাল", instructor: "ইঞ্জি. সাদিয়া আক্তার" },
    { title: "কম্পিউটার", instructor: "ইঞ্জি. তানভীর আহমেদ" },
    { title: "সিভিল", instructor: "ইঞ্জি. মাহমুদ হোসেন" },
    { title: "মেকানিক্যাল", instructor: "ইঞ্জি. শাহরিয়ার কবির" },
    { title: "আর্কিটেকচার", instructor: "আর্কি. নুসরাত জাহান" },
  ];

  const tabName = tabs.find((t) => t.id === tabId)?.name || "";

  return courseTemplates.map((template, index) => ({
    id: `${tabId}-${index}`,
    title: `${template.title} (${tabName})`,
    instructor: template.instructor,
    price: 1500 + index * 500,
    originalPrice: 2500 + index * 500,
    students: 120 + index * 30,
    duration: `${8 + index * 2} সপ্তাহ`,
    rating: 4.5 + index * 0.1,
    lessons: 20 + index * 5,
  }));
};

const CourseCard = ({ course }: { course: Course }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 min-w-[280px] md:min-w-[300px] group"
  >
    {/* Thumbnail */}
    <div className="relative h-44 overflow-hidden bg-gradient-to-br from-secondary via-vibrant-pink to-primary">
      {/* Decorative Elements */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0.5 }}
          whileHover={{ scale: 1, opacity: 0.8 }}
          className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
        >
          <span className="text-4xl font-bold text-white">প</span>
        </motion.div>
      </div>

      {/* Animated Orbs */}
      <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
      <div className="absolute bottom-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />

      {/* Discount Badge */}
      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold shadow-lg">
        {Math.round((1 - course.price / course.originalPrice) * 100)}% ছাড়
      </div>
    </div>

    {/* Content */}
    <div className="p-4">
      <h4 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
        {course.title}
      </h4>

      <p className="text-sm text-muted-foreground mb-3">{course.instructor}</p>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{course.duration}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span>{course.students}+</span>
        </div>
        <div className="flex items-center gap-1 text-golden">
          <Star className="w-3.5 h-3.5 fill-golden" />
          <span>{course.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Price & Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">৳{course.price}</span>
          <span className="text-sm text-muted-foreground line-through">
            ৳{course.originalPrice}
          </span>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-secondary to-vibrant-pink hover:from-secondary/90 hover:to-vibrant-pink/90 text-white rounded-full px-4"
        >
          বিস্তারিত
        </Button>
      </div>
    </div>
  </motion.div>
);

const RunningCourses = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const courses = generateCourses(activeTab);

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
              চলমান কোর্সসমূহ
            </span>
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            আমাদের জনপ্রিয় কোর্সগুলোতে আজই যোগ দিন
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-4 mb-8 -mx-4 px-4 scrollbar-hide">
            <TabsList className="inline-flex h-auto p-1.5 bg-muted/60 rounded-full gap-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-5 py-2.5 text-sm whitespace-nowrap rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-vibrant-pink data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
                >
                  {tab.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <div className="relative">
                {/* Carousel */}
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex gap-4 md:gap-6">
                    {courses.map((course) => (
                      <div key={course.id} className="flex-shrink-0">
                        <CourseCard course={course} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
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
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default RunningCourses;
