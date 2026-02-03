import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useEmblaCarousel from "embla-carousel-react";

const tabs = [
  { id: "diploma", label: "ডিপ্লোমা" },
  { id: "ssc", label: "এসএসসি" },
  { id: "hsc", label: "এইচএসসি" },
  { id: "diploma-care", label: "ডিপ্লোমা কেয়ার" },
  { id: "admission", label: "এডমিশন" },
  { id: "skill", label: "স্কিল ডেভেলপমেন্ট" },
];

const allCoursesData = {
  diploma: [
    { id: 1, title: "ইলেকট্রিক্যাল টেকনোলজি কমপ্লিট", instructor: "মোহাম্মদ আলী", price: "৩,০০০", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80", enrolled: "১,২৩৪" },
    { id: 2, title: "সিভিল টেকনোলজি মাস্টারক্লাস", instructor: "আব্দুল হামিদ", price: "৩,৫০০", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80", enrolled: "৮৭৬" },
    { id: 3, title: "মেকানিক্যাল ইঞ্জিনিয়ারিং", instructor: "কামরুল হাসান", price: "৩,২০০", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&q=80", enrolled: "৯৫৬" },
    { id: 4, title: "কম্পিউটার টেকনোলজি", instructor: "সাদিয়া রহমান", price: "২,৮০০", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80", enrolled: "১,৫৬৭" },
    { id: 5, title: "পাওয়ার টেকনোলজি", instructor: "রফিকুল ইসলাম", price: "২,৫০০", image: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=400&q=80", enrolled: "৬৫৪" },
  ],
  ssc: [
    { id: 6, title: "এসএসসি সায়েন্স কমপ্লিট প্যাকেজ", instructor: "নাজমা বেগম", price: "২,০০০", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80", enrolled: "২,৩৪৫" },
    { id: 7, title: "এসএসসি ইংরেজি ক্র্যাশ কোর্স", instructor: "রাহেলা সুলতানা", price: "১,২০০", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80", enrolled: "১,৮৯০" },
    { id: 8, title: "এসএসসি বাংলা মাস্টারক্লাস", instructor: "মোস্তাফিজুর রহমান", price: "১,১০০", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80", enrolled: "১,৪৫৬" },
    { id: 9, title: "এসএসসি আইসিটি স্পেশাল", instructor: "তানজিম আহমেদ", price: "১,০০০", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80", enrolled: "২,১২৩" },
  ],
  hsc: [
    { id: 10, title: "এইচএসসি ফিজিক্স ফুল কোর্স", instructor: "ড. আবুল কালাম", price: "২,৫০০", image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80", enrolled: "১,৭৮৯" },
    { id: 11, title: "এইচএসসি কেমিস্ট্রি মাস্টার", instructor: "প্রফ. সালেহা খাতুন", price: "২,৪০০", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80", enrolled: "১,৫৬৭" },
    { id: 12, title: "এইচএসসি বায়োলজি কমপ্লিট", instructor: "ড. নাসরিন আক্তার", price: "২,৩০০", image: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&q=80", enrolled: "১,৩৪৫" },
  ],
  "diploma-care": [
    { id: 13, title: "বোর্ড ফাইনাল প্রিপারেশন", instructor: "মাহবুবুর রহমান", price: "২,০০০", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80", enrolled: "৮৯০" },
    { id: 14, title: "সেমিস্টার রিভিশন কোর্স", instructor: "শফিকুল ইসলাম", price: "১,৮০০", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80", enrolled: "৭৬৫" },
  ],
  admission: [
    { id: 15, title: "ইঞ্জিনিয়ারিং অ্যাডমিশন মাস্টার", instructor: "তৌফিক আহমেদ", price: "৪,০০০", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80", enrolled: "১,২৩৪" },
    { id: 16, title: "মেডিকেল অ্যাডমিশন স্পেশাল", instructor: "ডা. ফারহানা", price: "৪,৫০০", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80", enrolled: "১,১২৩" },
    { id: 17, title: "ইউনিভার্সিটি অ্যাডমিশন", instructor: "প্রফ. জামাল উদ্দিন", price: "৩,৫০০", image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&q=80", enrolled: "৯৮৭" },
  ],
  skill: [
    { id: 18, title: "ফুল স্ট্যাক ওয়েব ডেভেলপমেন্ট", instructor: "রাকিবুল ইসলাম", price: "৮,০০০", image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&q=80", enrolled: "২,৩৪৫" },
    { id: 19, title: "মোবাইল অ্যাপ ডেভেলপমেন্ট", instructor: "সাইফুল ইসলাম", price: "৭,০০০", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80", enrolled: "১,৮৯০" },
    { id: 20, title: "UI/UX ডিজাইন মাস্টারক্লাস", instructor: "সাবরিনা মাহমুদ", price: "৬,০০০", image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&q=80", enrolled: "১,৫৬৭" },
    { id: 21, title: "ডিজিটাল মার্কেটিং", instructor: "ফাহিম আহমেদ", price: "৫,০০০", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80", enrolled: "২,১২৩" },
  ],
};

const CourseCard = ({ course }: { course: typeof allCoursesData["diploma"][0] }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-card rounded-xl border border-border overflow-hidden shadow-sm card-hover min-w-[260px] md:min-w-[280px]"
  >
    <div className="relative h-36 overflow-hidden">
      <img
        src={course.image}
        alt={course.title}
        className="w-full h-full object-cover"
      />
      <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-primary/90 text-primary-foreground">
        {course.enrolled} জন
      </div>
    </div>
    <div className="p-4">
      <h4 className="font-semibold text-foreground mb-2 line-clamp-2 text-sm">{course.title}</h4>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <User className="w-3 h-3" />
        <span>{course.instructor}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-primary">৳{course.price}</span>
        <Button size="sm" variant="outline" className="text-xs">
          বিস্তারিত
        </Button>
      </div>
    </div>
  </motion.div>
);

const CourseCarousel = ({ courses }: { courses: typeof allCoursesData["diploma"] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {courses.map((course) => (
            <div key={course.id} className="flex-shrink-0">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={scrollPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 rounded-full glass hidden md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={scrollNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 rounded-full glass hidden md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};

const AllCourses = () => {
  const [activeTab, setActiveTab] = useState("diploma");

  return (
    <section className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="section-heading">
          <span className="gradient-text">সকল কোর্সসমূহ</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          আপনার পছন্দের ক্যাটাগরি থেকে কোর্স বেছে নিন
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 mb-6 -mx-4 px-4">
          <TabsList className="inline-flex h-auto p-1 bg-muted/50 rounded-xl">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-4 py-2 text-sm whitespace-nowrap rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            <CourseCarousel courses={allCoursesData[tab.id as keyof typeof allCoursesData] || []} />
          </TabsContent>
        ))}
      </Tabs>

      <div className="text-center mt-8">
        <Button size="lg" variant="outline" className="font-medium">
          সব কোর্স দেখুন
        </Button>
      </div>
    </section>
  );
};

export default AllCourses;
