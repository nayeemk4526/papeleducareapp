import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80",
    title: "স্বপ্ন দেখো, সাফল্য অর্জন করো",
    subtitle: "পাপেল এডু-কেয়ারে আপনাকে স্বাগতম",
    description: "বাংলাদেশের সেরা অনলাইন শিক্ষা প্ল্যাটফর্মে যোগ দিন",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1920&q=80",
    title: "দক্ষ মেন্টরদের সাথে শিখুন",
    subtitle: "BUET ও DUET এর অভিজ্ঞ প্রভাষকগণ",
    description: "সেরা শিক্ষকদের কাছ থেকে সেরা শিক্ষা নিন",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&q=80",
    title: "ডিপ্লোমা থেকে স্কিল ডেভেলপমেন্ট",
    subtitle: "সকল শ্রেণির জন্য কোর্স",
    description: "এসএসসি, এইচএসসি, ডিপ্লোমা এবং আরও অনেক কিছু",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80",
    title: "লাইভ ক্লাস ও রেকর্ডেড ভিডিও",
    subtitle: "২৪/৭ অ্যাক্সেস",
    description: "যেকোনো সময়, যেকোনো জায়গায় শিখুন",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1920&q=80",
    title: "সাফল্যের দিকে প্রথম পদক্ষেপ",
    subtitle: "আজই ভর্তি হন",
    description: "আপনার সাফল্যের যাত্রা শুরু করুন আমাদের সাথে",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <section className="relative h-[60vh] md:h-[80vh] lg:h-screen overflow-hidden">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {/* Background Image with Ken Burns Effect */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 8, ease: "linear" }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full container mx-auto px-4 flex items-center">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-1.5 mb-4 text-sm font-medium rounded-full bg-primary/20 text-primary border border-primary/30"
              >
                {slides[currentSlide].subtitle}
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight"
              >
                <span className="gradient-text">{slides[currentSlide].title}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-muted-foreground mb-8"
              >
                {slides[currentSlide].description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Button
                  size="lg"
                  className="gradient-primary btn-glow text-lg px-8 py-6 font-semibold"
                >
                  ভর্তি হন
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 font-semibold border-2"
                >
                  কোর্স দেখুন
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-4 pointer-events-none">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevSlide}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          className="pointer-events-auto w-12 h-12 rounded-full glass hover:bg-primary/20"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextSlide}
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          className="pointer-events-auto w-12 h-12 rounded-full glass hover:bg-primary/20"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              index === currentSlide
                ? "w-8 bg-primary"
                : "bg-primary/40 hover:bg-primary/60"
            )}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
