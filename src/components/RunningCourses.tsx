import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useEmblaCarousel from "embla-carousel-react";

const tabs = [
  { id: "sem-2", label: "২য় সেমিস্টার" },
  { id: "sem-3", label: "৩য় সেমিস্টার" },
  { id: "sem-5", label: "৫ম সেমিস্টার" },
  { id: "sem-7", label: "৭ম সেমিস্টার" },
  { id: "ssc", label: "এসএসসি" },
  { id: "hsc", label: "এইচএসসি" },
  { id: "diploma-care", label: "ডিপ্লোমা কেয়ার" },
  { id: "admission", label: "এডমিশন" },
  { id: "skill", label: "স্কিল ডেভেলপমেন্ট" },
];

const coursesData = {
  "sem-2": [
    { id: 1, title: "ইলেকট্রিক্যাল সার্কিট অ্যানালাইসিস", instructor: "মোহাম্মদ রফিক", price: "১,৫০০", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80" },
    { id: 2, title: "প্রোগ্রামিং ফান্ডামেন্টালস", instructor: "সাদিয়া আক্তার", price: "১,২০০", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80" },
    { id: 3, title: "ইঞ্জিনিয়ারিং ড্রয়িং", instructor: "আব্দুল করিম", price: "১,০০০", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80" },
    { id: 4, title: "ম্যাথমেটিক্স-২", instructor: "নাজমুল হাসান", price: "৮০০", image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80" },
  ],
  "sem-3": [
    { id: 5, title: "ডিজিটাল ইলেকট্রনিক্স", instructor: "করিম উদ্দিন", price: "১,৬০০", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80" },
    { id: 6, title: "ডেটা স্ট্রাকচার", instructor: "ফারহানা ইসলাম", price: "১,৪০০", image: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=400&q=80" },
    { id: 7, title: "কম্পিউটার নেটওয়ার্কিং", instructor: "জাহিদ হাসান", price: "১,৩০০", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80" },
  ],
  "sem-5": [
    { id: 8, title: "মাইক্রোকন্ট্রোলার প্রোগ্রামিং", instructor: "রাসেল আহমেদ", price: "১,৮০০", image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=400&q=80" },
    { id: 9, title: "পাওয়ার ইলেকট্রনিক্স", instructor: "মাহমুদুল হক", price: "১,৭০০", image: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=400&q=80" },
  ],
  "sem-7": [
    { id: 10, title: "প্রজেক্ট ম্যানেজমেন্ট", instructor: "সালমা বেগম", price: "২,০০০", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80" },
    { id: 11, title: "ইন্ডাস্ট্রিয়াল ট্রেনিং", instructor: "আলমগীর হোসেন", price: "২,৫০০", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&q=80" },
  ],
  ssc: [
    { id: 12, title: "এসএসসি গণিত কমপ্লিট কোর্স", instructor: "আয়েশা সিদ্দিকা", price: "১,০০০", image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80" },
    { id: 13, title: "এসএসসি পদার্থবিজ্ঞান", instructor: "শাহিন আলম", price: "১,১০০", image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80" },
    { id: 14, title: "এসএসসি রসায়ন", instructor: "নাফিসা আক্তার", price: "১,১০০", image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80" },
  ],
  hsc: [
    { id: 15, title: "এইচএসসি উচ্চতর গণিত", instructor: "মাহবুব আলম", price: "১,৫০০", image: "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=400&q=80" },
    { id: 16, title: "এইচএসসি পদার্থবিজ্ঞান ১ম পত্র", instructor: "তানভীর হোসেন", price: "১,৪০০", image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80" },
  ],
  "diploma-care": [
    { id: 17, title: "ডিপ্লোমা বোর্ড পরীক্ষা প্রস্তুতি", instructor: "রহিম উদ্দিন", price: "২,০০০", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80" },
  ],
  admission: [
    { id: 18, title: "BUET অ্যাডমিশন প্রস্তুতি", instructor: "ইমরান হোসেন", price: "৩,০০০", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80" },
    { id: 19, title: "মেডিকেল অ্যাডমিশন", instructor: "ডা. সুমাইয়া", price: "৩,৫০০", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80" },
  ],
  skill: [
    { id: 20, title: "ওয়েব ডেভেলপমেন্ট ফুল কোর্স", instructor: "রাকিব হাসান", price: "৫,০০০", image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&q=80" },
    { id: 21, title: "গ্রাফিক ডিজাইন মাস্টারক্লাস", instructor: "সাবরিনা চৌধুরী", price: "৪,০০০", image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&q=80" },
  ],
};

const CourseCard = ({ course }: { course: typeof coursesData["sem-2"][0] }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-card rounded-xl border border-border overflow-hidden shadow-sm card-hover min-w-[280px] md:min-w-[300px]"
  >
    <div className="relative h-40 overflow-hidden">
      <img
        src={course.image}
        alt={course.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
    </div>
    <div className="p-4">
      <h4 className="font-semibold text-foreground mb-2 line-clamp-2">{course.title}</h4>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <User className="w-4 h-4" />
        <span>{course.instructor}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-primary">৳{course.price}</span>
        <Button size="sm" className="gradient-primary">
          বিস্তারিত
        </Button>
      </div>
    </div>
  </motion.div>
);

const CourseCarousel = ({ courses }: { courses: typeof coursesData["sem-2"] }) => {
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
    }, 4000);

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 md:gap-6">
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

const RunningCourses = () => {
  const [activeTab, setActiveTab] = useState("sem-2");

  return (
    <section className="section-container bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="section-heading">
          <span className="gradient-text">চলমান কোর্সসমূহ</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          বর্তমানে চলমান জনপ্রিয় কোর্সগুলোতে এখনই ভর্তি হন
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 mb-6 -mx-4 px-4">
          <TabsList className="inline-flex h-auto p-1 bg-muted/50 rounded-xl">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="px-4 py-2 text-sm whitespace-nowrap rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-0">
            <CourseCarousel courses={coursesData[tab.id as keyof typeof coursesData] || []} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
};

export default RunningCourses;
