import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";

const teachers = [
  {
    id: 1,
    name: "ইঞ্জি. মোহাম্মদ আলী",
    title: "প্রধান প্রশিক্ষক",
    designation: "BUET থেকে স্নাতক",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80",
    specialization: "ইলেকট্রিক্যাল ইঞ্জিনিয়ারিং",
  },
  {
    id: 2,
    name: "প্রফ. সাদিয়া রহমান",
    title: "সিনিয়র প্রশিক্ষক",
    designation: "DUET প্রভাষক",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80",
    specialization: "কম্পিউটার সায়েন্স",
  },
  {
    id: 3,
    name: "ড. আবুল কালাম",
    title: "বিষয় বিশেষজ্ঞ",
    designation: "PhD, Physics",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
    specialization: "পদার্থবিজ্ঞান",
  },
  {
    id: 4,
    name: "ইঞ্জি. কামরুল হাসান",
    title: "প্রশিক্ষক",
    designation: "CUET থেকে স্নাতক",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80",
    specialization: "মেকানিক্যাল ইঞ্জিনিয়ারিং",
  },
  {
    id: 5,
    name: "নাজমা বেগম",
    title: "সিনিয়র প্রশিক্ষক",
    designation: "DU প্রভাষক",
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=300&q=80",
    specialization: "গণিত",
  },
  {
    id: 6,
    name: "তানভীর হোসেন",
    title: "প্রশিক্ষক",
    designation: "RUET থেকে স্নাতক",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80",
    specialization: "সিভিল ইঞ্জিনিয়ারিং",
  },
];

const TeacherCard = ({ teacher }: { teacher: typeof teachers[0] }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm card-hover min-w-[240px] md:min-w-[280px]"
  >
    {/* Image */}
    <div className="relative h-64 overflow-hidden">
      <img
        src={teacher.image}
        alt={teacher.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      {/* Specialization Badge */}
      <div className="absolute bottom-3 left-3 right-3">
        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/90 text-primary-foreground">
          {teacher.specialization}
        </span>
      </div>
    </div>

    {/* Info */}
    <div className="p-4 text-center">
      <h4 className="font-bold text-foreground mb-1">{teacher.name}</h4>
      <p className="text-sm text-primary font-medium mb-1">{teacher.title}</p>
      <p className="text-xs text-muted-foreground">{teacher.designation}</p>
    </div>
  </motion.div>
);

const TeachersPanel = () => {
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
    <section className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="section-heading">
          <span className="gradient-text">আমাদের দক্ষ মেন্টরগণ</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          দেশের সেরা বিশ্ববিদ্যালয় থেকে অভিজ্ঞ শিক্ষকদের সাথে শিখুন
        </p>
      </motion.div>

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="flex-shrink-0">
                <TeacherCard teacher={teacher} />
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
    </section>
  );
};

export default TeachersPanel;
