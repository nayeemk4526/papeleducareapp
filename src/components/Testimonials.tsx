import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";

const testimonials = [
  {
    id: 1,
    name: "মোহাম্মদ রাকিব",
    role: "ডিপ্লোমা ইন ইলেকট্রনিক্স",
    content: "পাপেল এডু-কেয়ারের কোর্স করে আমার বোর্ড পরীক্ষায় A+ পেয়েছি। স্যারদের পড়ানোর ধরন অসাধারণ!",
    rating: 5,
  },
  {
    id: 2,
    name: "সাবরিনা আক্তার",
    role: "ডিপ্লোমা ইন কম্পিউটার",
    content: "লাইভ ক্লাসগুলো খুবই ইন্টারেক্টিভ। যেকোনো প্রশ্নের উত্তর সাথে সাথে পাওয়া যায়।",
    rating: 5,
  },
  {
    id: 3,
    name: "তানভীর আহমেদ",
    role: "ডিপ্লোমা ইন সিভিল",
    content: "সুপার সাজেশন ই-বুক আমার পরীক্ষার প্রস্তুতিতে অনেক সাহায্য করেছে।",
    rating: 5,
  },
  {
    id: 4,
    name: "নুসরাত জাহান",
    role: "ডিপ্লোমা ইন ইলেকট্রিক্যাল",
    content: "২৪/৭ সাপোর্ট সত্যিই অসাধারণ। যেকোনো সমস্যায় সাথে সাথে সাহায্য পাই।",
    rating: 5,
  },
  {
    id: 5,
    name: "রাকিবুল হাসান",
    role: "এইচএসসি সায়েন্স",
    content: "এত সুন্দর করে প্রতিটি টপিক বুঝিয়ে দেওয়া হয়। ধন্যবাদ পাপেল এডু-কেয়ার!",
    rating: 5,
  },
];

const Testimonials = () => {
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
    <section className="py-16 md:py-24 bg-muted/30">
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
            শিক্ষার্থীদের মতামত
          </motion.span>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">পাপেল এডু-কেয়ার সম্পর্কে </span>
            <span className="bg-gradient-to-r from-secondary via-vibrant-pink to-primary bg-clip-text text-transparent">
              শিক্ষার্থীদের মতামত..!!
            </span>
          </h2>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="flex-shrink-0 w-[280px] md:w-[360px]">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-card rounded-xl md:rounded-2xl p-4 md:p-6 border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 h-full"
                  >
                    {/* Quote Icon */}
                    <div className="mb-3 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-secondary to-vibrant-pink flex items-center justify-center">
                        <Quote className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-foreground mb-4 md:mb-6 leading-relaxed text-sm md:text-base line-clamp-4">
                      "{testimonial.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm md:text-lg">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground text-sm md:text-base">{testimonial.name}</h4>
                        <p className="text-xs md:text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex gap-0.5 md:gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 md:w-4 md:h-4 text-golden fill-golden" />
                      ))}
                    </div>
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

export default Testimonials;
