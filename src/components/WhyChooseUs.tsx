import { motion } from "framer-motion";
import { Users, Video, BookOpen, HeadphonesIcon } from "lucide-react";

const features = [
  {
    id: 1,
    icon: Users,
    title: "দক্ষ মেন্টর",
    description: "BUET, DUET এবং বিভিন্ন বিশ্ববিদ্যালয়ের অভিজ্ঞ প্রভাষকমণ্ডলী দ্বারা পরিচালিত কোর্স",
    color: "from-primary to-accent",
    delay: 0,
  },
  {
    id: 2,
    icon: Video,
    title: "লাইভ ক্লাস",
    description: "Zoom এর মাধ্যমে ইন্টারেক্টিভ লাইভ ক্লাস এবং রেকর্ডেড ভিডিও লেকচার",
    color: "from-secondary to-vibrant-pink",
    delay: 0.1,
  },
  {
    id: 3,
    icon: BookOpen,
    title: "সুপার সাজেশন ই-বুক",
    description: "বিগত বছরের প্রশ্ন বিশ্লেষণ করে তৈরি সুপার সাজেশন এবং নোটস",
    color: "from-accent to-primary",
    delay: 0.2,
  },
  {
    id: 4,
    icon: HeadphonesIcon,
    title: "২৪/৭ অনলাইন সাপোর্ট",
    description: "যেকোনো সমস্যায় আমাদের ডেডিকেটেড সাপোর্ট টিম সবসময় আপনার পাশে",
    color: "from-vibrant-pink to-golden",
    delay: 0.3,
  },
];

const WhyChooseUs = () => {
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
            কেন পাপেল এডু-কেয়ার?
          </motion.span>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">আমাদের </span>
            <span className="bg-gradient-to-r from-secondary via-vibrant-pink to-primary bg-clip-text text-transparent">
              বিশেষত্ব
            </span>
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            কেন হাজারো শিক্ষার্থী আমাদের বিশ্বাস করে
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay, duration: 0.5 }}
                className="group"
              >
                <motion.div
                  whileHover={{ y: -10 }}
                  className="relative h-full bg-card rounded-3xl p-6 md:p-8 border border-border/50 overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                >
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}
                  />

                  {/* 3D Icon Container */}
                  <motion.div
                    whileHover={{ rotateY: 15, rotateX: -15 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative mb-6"
                    style={{ perspective: "1000px" }}
                  >
                    <div
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow`}
                      style={{
                        transform: "translateZ(20px)",
                        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)",
                      }}
                    >
                      <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                    {/* Shadow */}
                    <div
                      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-4 bg-gradient-to-br ${feature.color} blur-xl opacity-50`}
                    />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
