import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useEmblaCarousel from "embla-carousel-react";

const tabs = [
  { id: "diploma", name: "ডিপ্লোমা" },
  { id: "ssc", name: "এসএসসি" },
  { id: "hsc", name: "এইচএসসি" },
  { id: "diploma-care", name: "ডিপ্লোমা কেয়ার" },
  { id: "admission", name: "এডমিশন" },
  { id: "skill", name: "স্কিল ডেভেলপমেন্ট" },
];

interface Course {
  id: number;
  title: string;
  instructor: string;
  price: number;
  originalPrice: number;
  students: number;
  duration: string;
  rating: number;
}

const allCoursesData: Record<string, Course[]> = {
  diploma: [
    { id: 1, title: "ইলেকট্রিক্যাল টেকনোলজি কমপ্লিট", instructor: "ইঞ্জি. মোহাম্মদ আলী", price: 3000, originalPrice: 4500, students: 1234, duration: "12 সপ্তাহ", rating: 4.8 },
    { id: 2, title: "সিভিল টেকনোলজি মাস্টারক্লাস", instructor: "ইঞ্জি. আব্দুল হামিদ", price: 3500, originalPrice: 5000, students: 876, duration: "14 সপ্তাহ", rating: 4.7 },
    { id: 3, title: "মেকানিক্যাল ইঞ্জিনিয়ারিং", instructor: "ইঞ্জি. কামরুল হাসান", price: 3200, originalPrice: 4800, students: 956, duration: "10 সপ্তাহ", rating: 4.9 },
    { id: 4, title: "কম্পিউটার টেকনোলজি", instructor: "ইঞ্জি. সাদিয়া রহমান", price: 2800, originalPrice: 4000, students: 1567, duration: "8 সপ্তাহ", rating: 4.6 },
    { id: 5, title: "পাওয়ার টেকনোলজি", instructor: "ইঞ্জি. রফিকুল ইসলাম", price: 2500, originalPrice: 3800, students: 654, duration: "10 সপ্তাহ", rating: 4.5 },
  ],
  ssc: [
    { id: 6, title: "এসএসসি সায়েন্স কমপ্লিট প্যাকেজ", instructor: "নাজমা বেগম", price: 2000, originalPrice: 3000, students: 2345, duration: "16 সপ্তাহ", rating: 4.9 },
    { id: 7, title: "এসএসসি ইংরেজি ক্র্যাশ কোর্স", instructor: "রাহেলা সুলতানা", price: 1200, originalPrice: 1800, students: 1890, duration: "6 সপ্তাহ", rating: 4.7 },
    { id: 8, title: "এসএসসি বাংলা মাস্টারক্লাস", instructor: "মোস্তাফিজুর রহমান", price: 1100, originalPrice: 1600, students: 1456, duration: "8 সপ্তাহ", rating: 4.6 },
    { id: 9, title: "এসএসসি আইসিটি স্পেশাল", instructor: "তানজিম আহমেদ", price: 1000, originalPrice: 1500, students: 2123, duration: "6 সপ্তাহ", rating: 4.8 },
  ],
  hsc: [
    { id: 10, title: "এইচএসসি ফিজিক্স ফুল কোর্স", instructor: "ড. আবুল কালাম", price: 2500, originalPrice: 3800, students: 1789, duration: "20 সপ্তাহ", rating: 4.9 },
    { id: 11, title: "এইচএসসি কেমিস্ট্রি মাস্টার", instructor: "প্রফ. সালেহা খাতুন", price: 2400, originalPrice: 3600, students: 1567, duration: "18 সপ্তাহ", rating: 4.8 },
    { id: 12, title: "এইচএসসি বায়োলজি কমপ্লিট", instructor: "ড. নাসরিন আক্তার", price: 2300, originalPrice: 3500, students: 1345, duration: "16 সপ্তাহ", rating: 4.7 },
  ],
  "diploma-care": [
    { id: 13, title: "বোর্ড ফাইনাল প্রিপারেশন", instructor: "মাহবুবুর রহমান", price: 2000, originalPrice: 3000, students: 890, duration: "8 সপ্তাহ", rating: 4.8 },
    { id: 14, title: "সেমিস্টার রিভিশন কোর্স", instructor: "শফিকুল ইসলাম", price: 1800, originalPrice: 2500, students: 765, duration: "6 সপ্তাহ", rating: 4.6 },
  ],
  admission: [
    { id: 15, title: "ইঞ্জিনিয়ারিং অ্যাডমিশন মাস্টার", instructor: "তৌফিক আহমেদ", price: 4000, originalPrice: 6000, students: 1234, duration: "12 সপ্তাহ", rating: 4.9 },
    { id: 16, title: "মেডিকেল অ্যাডমিশন স্পেশাল", instructor: "ডা. ফারহানা", price: 4500, originalPrice: 6500, students: 1123, duration: "14 সপ্তাহ", rating: 4.8 },
    { id: 17, title: "ইউনিভার্সিটি অ্যাডমিশন", instructor: "প্রফ. জামাল উদ্দিন", price: 3500, originalPrice: 5000, students: 987, duration: "10 সপ্তাহ", rating: 4.7 },
  ],
  skill: [
    { id: 18, title: "ফুল স্ট্যাক ওয়েব ডেভেলপমেন্ট", instructor: "রাকিবুল ইসলাম", price: 8000, originalPrice: 12000, students: 2345, duration: "24 সপ্তাহ", rating: 4.9 },
    { id: 19, title: "মোবাইল অ্যাপ ডেভেলপমেন্ট", instructor: "সাইফুল ইসলাম", price: 7000, originalPrice: 10000, students: 1890, duration: "20 সপ্তাহ", rating: 4.8 },
    { id: 20, title: "UI/UX ডিজাইন মাস্টারক্লাস", instructor: "সাবরিনা মাহমুদ", price: 6000, originalPrice: 9000, students: 1567, duration: "16 সপ্তাহ", rating: 4.7 },
    { id: 21, title: "ডিজিটাল মার্কেটিং", instructor: "ফাহিম আহমেদ", price: 5000, originalPrice: 7500, students: 2123, duration: "12 সপ্তাহ", rating: 4.6 },
  ],
};

const CourseCard = ({ course }: { course: Course }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 min-w-[260px] md:min-w-[280px] group"
  >
    {/* Thumbnail */}
    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary via-secondary to-vibrant-pink">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <span className="text-3xl font-bold text-white">প</span>
        </div>
      </div>
      <div className="absolute top-4 left-4 w-14 h-14 bg-white/10 rounded-full blur-xl" />
      <div className="absolute bottom-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
      
      {/* Discount Badge */}
      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold shadow-lg">
        {Math.round((1 - course.price / course.originalPrice) * 100)}% ছাড়
      </div>
    </div>

    {/* Content */}
    <div className="p-4">
      <h4 className="font-semibold text-foreground mb-2 line-clamp-2 text-sm group-hover:text-primary transition-colors">
        {course.title}
      </h4>

      <p className="text-xs text-muted-foreground mb-3">{course.instructor}</p>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{course.duration}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{course.students}+</span>
        </div>
        <div className="flex items-center gap-1 text-golden">
          <Star className="w-3 h-3 fill-golden" />
          <span>{course.rating}</span>
        </div>
      </div>

      {/* Price & Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-primary">৳{course.price}</span>
          <span className="text-xs text-muted-foreground line-through">৳{course.originalPrice}</span>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-r from-secondary to-vibrant-pink hover:from-secondary/90 hover:to-vibrant-pink/90 text-white rounded-full px-4 text-xs"
        >
          বিস্তারিত
        </Button>
      </div>
    </div>
  </motion.div>
);

const AllCourses = () => {
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

  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(autoplay);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const courses = allCoursesData[activeTab] || [];

  return (
    <section className="py-16 md:py-24">
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
            সকল কোর্স
          </motion.span>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">আপনার পছন্দের </span>
            <span className="bg-gradient-to-r from-secondary via-vibrant-pink to-primary bg-clip-text text-transparent">
              কোর্স বেছে নিন
            </span>
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            বিভিন্ন ক্যাটাগরি থেকে আপনার পছন্দের কোর্স খুঁজে নিন
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile: Vertical Tabs */}
          <div className="md:hidden mb-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm rounded-full transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-secondary to-vibrant-pink text-white shadow-md"
                      : "bg-muted/60 text-foreground hover:bg-muted"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: Horizontal Tabs */}
          <div className="hidden md:block overflow-x-auto pb-4 mb-8">
            <TabsList className="inline-flex h-auto p-1.5 bg-muted/60 rounded-full gap-1 w-full justify-center">
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

        {/* View All Button */}
        <div className="text-center mt-10">
          <Button
            size="lg"
            className="bg-gradient-to-r from-secondary to-vibrant-pink hover:from-secondary/90 hover:to-vibrant-pink/90 text-white font-medium px-8 rounded-full shadow-lg"
          >
            সব কোর্স দেখুন
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AllCourses;
