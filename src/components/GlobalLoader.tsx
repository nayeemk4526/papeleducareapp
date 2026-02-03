import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GlobalLoaderProps {
  onLoadingComplete?: () => void;
}

const GlobalLoader = ({ onLoadingComplete }: GlobalLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const interval = 20;
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsVisible(false);
            onLoadingComplete?.();
          }, 200);
          return 100;
        }
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          {/* Animated Background Circles */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full bg-primary/10 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-secondary/10 blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.5, 0.3, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>

          {/* Logo/Brand */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 text-center mb-8"
          >
            {/* Animated Icon */}
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center"
              animate={{
                rotateY: [0, 360],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-3xl font-bold text-primary-foreground">প</span>
            </motion.div>

            {/* Brand Name */}
            <h1 className="text-2xl md:text-3xl font-bold gradient-text mb-2">
              পাপেল এডু-কেয়ার
            </h1>
            <motion.p
              className="text-muted-foreground text-sm md:text-base"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              লোডিং হচ্ছে...
            </motion.p>
          </motion.div>

          {/* Progress Bar Container */}
          <div className="relative z-10 w-64 md:w-80">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full animate-shimmer rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {Math.round(progress)}%
            </p>
          </div>

          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/40"
              style={{
                left: `${20 + i * 12}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoader;
