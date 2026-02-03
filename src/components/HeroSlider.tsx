import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    id: 1,
    badge: "BUET ও DUET এর প্রভাষকবৃন্দ",
    title: "দক্ষ মেন্টরদের সাথে শিখুন",
    description: "অভিজ্ঞ শিক্ষকদের সাথে লাইভ ক্লাস",
  },
  {
    id: 2,
    badge: "পাপেল এডু-কেয়ারে স্বাগতম",
    title: "শিক্ষার নতুন দিগন্ত",
    description: "ডিপ্লোমা ইঞ্জিনিয়ারিং এর সেরা প্ল্যাটফর্ম",
  },
  {
    id: 3,
    badge: "১০,০০০+ সফল শিক্ষার্থী",
    title: "সফলতার পথে এগিয়ে যান",
    description: "আপনার স্বপ্ন পূরণে আমরা পাশে আছি",
  },
  {
    id: 4,
    badge: "পরীক্ষায় A+ নিশ্চিত করুন",
    title: "সুপার সাজেশন ই-বুক",
    description: "বিগত বছরের প্রশ্ন বিশ্লেষণ",
  },
  {
    id: 5,
    badge: "যেকোনো সমস্যায় পাশে আছি",
    title: "২৪/৭ অনলাইন সাপোর্ট",
    description: "আপনার প্রশ্নের উত্তর দিতে সদা প্রস্তুত",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section className="relative min-h-[75vh] md:min-h-[85vh] overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/90 to-vibrant-pink">
        {/* Animated Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-vibrant-pink/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-primary/30 rounded-full blur-[80px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-accent/20 rounded-full blur-[60px]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center pt-20 pb-32 md:pb-40">
        <div className="container mx-auto px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl"
            >
              {/* Badge */}
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium mb-6 border border-white/20"
              >
                {slides[currentSlide].badge}
              </motion.span>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 leading-tight"
              >
                {slides[currentSlide].title}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg md:text-xl text-white/80 mb-8"
              >
                {slides[currentSlide].description}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-4"
              >
                <Button
                  size="lg"
                  className="bg-white text-secondary hover:bg-white/90 font-semibold text-base px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all"
                >
                  ভর্তি হন
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/40 text-white hover:bg-white/10 font-semibold text-base px-8 py-6 rounded-full backdrop-blur-sm bg-white/5"
                >
                  বিস্তারিত দেখুন
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 md:px-6 z-20 pointer-events-none">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={prevSlide}
          className="p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors pointer-events-auto border border-white/20"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextSlide}
          className="p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors pointer-events-auto border border-white/20"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </motion.button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-28 md:bottom-36 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentSlide ? 1 : -1);
              setCurrentSlide(index);
            }}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide
                ? "w-8 h-2.5 bg-white"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Bottom Wave - Curved */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg 
          viewBox="0 0 1440 150" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 150L1440 150L1440 60C1440 60 1320 0 1080 30C840 60 720 100 480 80C240 60 120 20 0 60L0 150Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSlider;
