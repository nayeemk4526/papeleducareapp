import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Youtube, PlayCircle, BookOpen, Users } from "lucide-react";

const stats = [
  { 
    id: 1, 
    label: "YouTube সাবস্ক্রাইবার", 
    value: 50000, 
    suffix: "+",
    icon: Youtube,
    color: "from-red-500 to-red-600"
  },
  { 
    id: 2, 
    label: "মোট লেসন", 
    value: 2500, 
    suffix: "+",
    icon: PlayCircle,
    color: "from-blue-500 to-blue-600"
  },
  { 
    id: 3, 
    label: "মোট কোর্স", 
    value: 150, 
    suffix: "+",
    icon: BookOpen,
    color: "from-green-500 to-green-600"
  },
  { 
    id: 4, 
    label: "দক্ষ মেন্টর", 
    value: 50, 
    suffix: "+",
    icon: Users,
    color: "from-purple-500 to-purple-600"
  },
];

const formatNumber = (num: number): string => {
  if (num >= 100000) {
    return (num / 1000).toFixed(0) + "K";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString();
};

const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 50;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {formatNumber(count)}{suffix}
    </span>
  );
};

const Statistics = () => {
  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-14"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-5 py-2 rounded-full border border-secondary/30 text-secondary text-sm font-medium mb-4 bg-secondary/5"
          >
            আমাদের অর্জন
          </motion.span>

          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold">
            <span className="text-foreground">সংখ্যায় </span>
            <span className="bg-gradient-to-r from-secondary via-vibrant-pink to-primary bg-clip-text text-transparent">
              পাপেল এডু-কেয়ার
            </span>
          </h2>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className="relative bg-card rounded-2xl p-5 md:p-8 border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 text-center overflow-hidden">
                  {/* Background Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </motion.div>

                  {/* Counter */}
                  <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>

                  {/* Label */}
                  <p className="text-muted-foreground text-xs md:text-sm font-medium">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
