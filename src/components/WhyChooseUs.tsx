import { motion } from "framer-motion";
import { GraduationCap, Video, BookOpen, Headphones } from "lucide-react";

const features = [
  {
    id: 1,
    title: "দক্ষ মেন্টর",
    description: "BUET, DUET ও অন্যান্য বিশ্ববিদ্যালয়ের অভিজ্ঞ প্রভাষকদের দ্বারা পরিচালিত ক্লাস। বাস্তব অভিজ্ঞতা সম্পন্ন শিক্ষকগণ আপনাকে সঠিক দিকনির্দেশনা দেবেন।",
    icon: GraduationCap,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    title: "লাইভ ক্লাস",
    description: "Zoom ও Google Meet এ লাইভ ইন্টারেক্টিভ ক্লাস। সরাসরি প্রশ্ন করুন এবং তাৎক্ষণিক উত্তর পান। মিস করলে রেকর্ডিং দেখুন।",
    icon: Video,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: 3,
    title: "সুপার সাজেশন ই-বুক",
    description: "পরীক্ষার জন্য বিশেষভাবে প্রস্তুত সাজেশন এবং নোটস। প্রতিটি বিষয়ের গুরুত্বপূর্ণ টপিক কভার করা হয়েছে।",
    icon: BookOpen,
    color: "from-cyan-500 to-cyan-600",
  },
  {
    id: 4,
    title: "২৪/৭ অনলাইন সাপোর্ট",
    description: "যেকোনো সময় প্রশ্ন করুন, আমাদের সাপোর্ট টিম সবসময় আপনার পাশে। ফেসবুক গ্রুপ ও হোয়াটসঅ্যাপ সাপোর্ট।",
    icon: Headphones,
    color: "from-pink-500 to-pink-600",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const WhyChooseUs = () => {
  return (
    <section className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="section-heading">
          <span className="gradient-text">কেন পাপেল এডু-কেয়ার?</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          আমরা শুধু শিক্ষা দিই না, সাফল্যের পথ দেখাই
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              className="group"
            >
              <div className="relative bg-card rounded-2xl p-6 border border-border h-full card-hover-glow overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                {/* 3D Icon Container */}
                <motion.div
                  whileHover={{ rotateY: 180 }}
                  transition={{ duration: 0.6 }}
                  className="relative w-16 h-16 mb-6"
                  style={{ perspective: "1000px" }}
                >
                  <div className={`w-full h-full rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg transform-gpu`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Floating shadow */}
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 bg-gradient-to-br ${feature.color} rounded-full blur-md opacity-50`} />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative corner */}
                <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br ${feature.color} rounded-full opacity-5 group-hover:opacity-10 transition-opacity`} />
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default WhyChooseUs;
