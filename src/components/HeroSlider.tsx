import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHeroSlides } from "@/hooks/useHeroSlides";
import { useNavigate } from "react-router-dom";

const HeroSlider = () => {
  const { data: slides, isLoading } = useHeroSlides();
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const activeSlides = slides || [];

  const nextSlide = useCallback(() => {
    if (activeSlides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    if (activeSlides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, activeSlides.length]);

  // Reset current slide if slides change
  useEffect(() => {
    if (currentSlide >= activeSlides.length && activeSlides.length > 0) {
      setCurrentSlide(0);
    }
  }, [activeSlides.length, currentSlide]);

  const handleSlideClick = (linkUrl: string | null) => {
    if (!linkUrl) return;
    if (linkUrl.startsWith("http")) {
      window.open(linkUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate(linkUrl);
    }
  };

  if (isLoading) {
    return (
      <section className="relative w-full aspect-[16/6] md:aspect-[16/5] bg-muted animate-pulse" />
    );
  }

  if (!activeSlides.length) {
    return (
      <section className="relative w-full aspect-[16/6] md:aspect-[16/5] bg-gradient-to-br from-secondary via-secondary/90 to-vibrant-pink flex items-center justify-center">
        <p className="text-white/60 text-lg">কোনো স্লাইড নেই</p>
      </section>
    );
  }

  const current = activeSlides[currentSlide];

  return (
    <section className="relative w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative w-full aspect-[16/6] md:aspect-[16/5] ${current.link_url ? "cursor-pointer" : ""}`}
          onClick={() => handleSlideClick(current.link_url)}
        >
          <img
            src={current.image_url}
            alt={current.title || "Hero slide"}
            className="w-full h-full object-cover"
          />
          {/* Optional dark overlay for readability */}
          {current.title && (
            <div className="absolute inset-0 bg-black/20">
              <div className="container mx-auto px-4 h-full flex items-end pb-12 md:pb-16">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg"
                >
                  {current.title}
                </motion.h2>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {activeSlides.length > 1 && (
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 md:px-6 z-20 pointer-events-none">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            className="p-2 md:p-3 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors pointer-events-auto"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            className="p-2 md:p-3 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors pointer-events-auto"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </div>
      )}

      {/* Slide Indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? "w-8 h-2.5 bg-white"
                  : "w-2.5 h-2.5 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
