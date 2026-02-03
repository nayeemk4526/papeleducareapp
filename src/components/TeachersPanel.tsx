import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import { useTeachers } from "@/hooks/useTeachers";

const TeachersPanel = () => {
  const { data: teachers, isLoading } = useTeachers();
  
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
    }, 3000);

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  if (isLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4 animate-pulse" />
            <div className="h-12 bg-muted rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="min-w-[200px] md:min-w-[240px] bg-card rounded-2xl p-6 animate-pulse">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted" />
                <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2" />
                <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!teachers?.length) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-5 py-2 rounded-full border border-secondary/30 text-secondary text-sm font-medium mb-6 bg-secondary/5"
          >
            আমাদের শিক্ষকমণ্ডলী
          </motion.span>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">দক্ষ ও অভিজ্ঞ </span>
            <span className="bg-gradient-to-r from-secondary via-vibrant-pink to-primary bg-clip-text text-transparent">
              মেন্টরবৃন্দ
            </span>
          </h2>
        </motion.div>

        {/* Teachers Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {teachers?.map((teacher) => (
                <div key={teacher.id} className="flex-shrink-0 min-w-[200px] md:min-w-[240px]">
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 text-center"
                  >
                    {/* Avatar */}
                    {teacher.avatar_url ? (
                      <img
                        src={teacher.avatar_url}
                        alt={teacher.name}
                        className="w-20 h-20 mx-auto mb-4 rounded-full object-cover shadow-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary via-vibrant-pink to-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {teacher.name.charAt(0)}
                      </div>
                    )}

                    {/* Info */}
                    <h4 className="font-bold text-foreground mb-1 text-base">
                      {teacher.name}
                    </h4>
                    <p className="text-sm text-primary font-medium mb-1">
                      {teacher.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {teacher.subtitle}
                    </p>

                    {/* Specializations */}
                    {teacher.specializations && teacher.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center mt-3">
                        {teacher.specializations.slice(0, 3).map((spec, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
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
              className="w-12 h-12 rounded-full border-2 hover:bg-secondary hover:text-white hover:border-secondary transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="w-12 h-12 rounded-full border-2 hover:bg-secondary hover:text-white hover:border-secondary transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeachersPanel;
