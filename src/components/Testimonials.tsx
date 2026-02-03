import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";

const testimonials = [
  {
    id: 1,
    name: "মোহাম্মদ রাকিব",
    role: "ডিপ্লোমা ইন ইলেকট্রিক্যাল",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    content: "পাপেল এডু-কেয়ারের কোর্স করে আমি বোর্ড পরীক্ষায় প্রথম হয়েছি। এখানকার শিক্ষকরা অসাধারণ এবং সাপোর্ট টিম সবসময় সাহায্য করতে প্রস্তুত।",
    rating: 5,
  },
  {
    id: 2,
    name: "সাদিয়া আক্তার",
    role: "এইচএসসি সায়েন্স",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    content: "লাইভ ক্লাসগুলো অনেক ইন্টারেক্টিভ। যেকোনো প্রশ্ন করলে সাথে সাথে উত্তর পাই। সুপার সাজেশন ই-বুক পরীক্ষার জন্য অনেক হেল্পফুল।",
    rating: 5,
  },
  {
    id: 3,
    name: "আব্দুল করিম",
    role: "স্কিল ডেভেলপমেন্ট - ওয়েব ডেভ",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    content: "ওয়েব ডেভেলপমেন্ট কোর্স করে এখন আমি ফ্রিল্যান্সিং করছি। কোর্সের কন্টেন্ট অনেক আপডেটেড এবং প্র্যাক্টিক্যাল।",
    rating: 5,
  },
  {
    id: 4,
    name: "ফাতিমা জান্নাত",
    role: "মেডিকেল অ্যাডমিশন",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    content: "মেডিকেল অ্যাডমিশন কোর্সটি অসাধারণ ছিল। এত সুন্দর করে প্রতিটি টপিক বুঝিয়ে দেওয়া হয়েছে। ধন্যবাদ পাপেল এডু-কেয়ার!",
    rating: 5,
  },
  {
    id: 5,
    name: "জাহিদ হাসান",
    role: "ডিপ্লোমা ইন সিভিল",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    content: "২৪/৭ সাপোর্ট সত্যিই অসাধারণ। রাত ১২টায়ও প্রশ্ন করলে উত্তর পেয়েছি। এমন প্ল্যাটফর্ম আগে পাইনি।",
    rating: 5,
  },
];

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-card rounded-2xl p-6 border border-border shadow-sm h-full min-w-[300px] md:min-w-[350px]"
  >
    {/* Quote Icon */}
    <div className="mb-4">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Quote className="w-5 h-5 text-primary" />
      </div>
    </div>

    {/* Content */}
    <p className="text-foreground mb-6 leading-relaxed text-sm md:text-base">
      "{testimonial.content}"
    </p>

    {/* Rating */}
    <div className="flex gap-1 mb-4">
      {[...Array(testimonial.rating)].map((_, i) => (
        <svg
          key={i}
          className="w-4 h-4 text-yellow-500 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>

    {/* Author */}
    <div className="flex items-center gap-3">
      <img
        src={testimonial.image}
        alt={testimonial.name}
        className="w-12 h-12 rounded-full object-cover border-2 border-primary"
      />
      <div>
        <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
      </div>
    </div>
  </motion.div>
);

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
    }, 6000);

    return () => clearInterval(autoplay);
  }, [emblaApi]);

  return (
    <section className="section-container bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="section-heading">
          <span className="gradient-text">পাপেল এডু-কেয়ার সম্পর্কে শিক্ষার্থীদের মতামত..!!</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          আমাদের শিক্ষার্থীরা যা বলছেন
        </p>
      </motion.div>

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="flex-shrink-0">
                <TestimonialCard testimonial={testimonial} />
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

export default Testimonials;
