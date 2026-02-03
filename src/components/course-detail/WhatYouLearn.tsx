import { motion } from "framer-motion";
import { CheckCircle, Lightbulb } from "lucide-react";
import { useCourseLearningOutcomes } from "@/hooks/useCourseLearningOutcomes";
import { Skeleton } from "@/components/ui/skeleton";

interface WhatYouLearnProps {
  courseId: string;
}

const WhatYouLearn = ({ courseId }: WhatYouLearnProps) => {
  const { data: outcomes, isLoading } = useCourseLearningOutcomes(courseId);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-border mb-8">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Don't show if no outcomes exist
  if (!outcomes || outcomes.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-border mb-8"
    >
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-primary" />
        যা শিখবেন
      </h3>
      <div className="grid md:grid-cols-2 gap-3">
        {outcomes.map((outcome, index) => (
          <motion.div 
            key={outcome.id} 
            className="flex items-start gap-2"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{outcome.content}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WhatYouLearn;
