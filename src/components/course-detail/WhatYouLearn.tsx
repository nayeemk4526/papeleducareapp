import { motion } from "framer-motion";
import { CheckCircle, Lightbulb } from "lucide-react";

interface WhatYouLearnProps {
  items?: string[];
}

const defaultItems = [
  "বেসিক থেকে অ্যাডভান্সড কনসেপ্ট",
  "হ্যান্ডস-অন প্র্যাক্টিস",
  "রিয়েল-ওয়ার্ল্ড প্রজেক্ট",
  "ইন্ডাস্ট্রি স্ট্যান্ডার্ড টেকনিক",
  "প্রফেশনাল টিপস ও ট্রিকস",
  "সার্টিফিকেশন প্রস্তুতি",
];

const WhatYouLearn = ({ items = defaultItems }: WhatYouLearnProps) => {
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
        {items.map((item, index) => (
          <motion.div 
            key={index} 
            className="flex items-start gap-2"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{item}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WhatYouLearn;
