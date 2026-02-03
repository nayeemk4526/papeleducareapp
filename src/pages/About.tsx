import { motion } from "framer-motion";
import { Target, Eye, Heart, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const values = [
  {
    icon: Target,
    title: "আমাদের লক্ষ্য",
    description: "বাংলাদেশের প্রতিটি শিক্ষার্থীকে মানসম্মত শিক্ষা প্রদান করা এবং তাদের স্বপ্ন পূরণে সহায়তা করা।",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Eye,
    title: "আমাদের দৃষ্টি",
    description: "প্রযুক্তির মাধ্যমে শিক্ষাকে সবার কাছে সহজলভ্য করে তোলা এবং একটি শিক্ষিত জাতি গড়ে তোলা।",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Heart,
    title: "আমাদের মূল্যবোধ",
    description: "সততা, নিষ্ঠা, এবং শিক্ষার্থীদের প্রতি দায়বদ্ধতা আমাদের মূল চালিকাশক্তি।",
    color: "from-pink-500 to-pink-600",
  },
  {
    icon: Users,
    title: "আমাদের দল",
    description: "BUET, DUET সহ দেশের সেরা বিশ্ববিদ্যালয়ের অভিজ্ঞ শিক্ষকদের সমন্বয়ে গঠিত আমাদের দল।",
    color: "from-cyan-500 to-cyan-600",
  },
];

const About = () => {
  return (
    <>
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-12 md:py-24 overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                <span className="gradient-text">আমাদের সম্পর্কে</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground px-4">
                পাপেল এডু-কেয়ার বাংলাদেশের অন্যতম শীর্ষস্থানীয় অনলাইন শিক্ষা প্ল্যাটফর্ম। 
                আমরা ডিপ্লোমা, এসএসসি, এইচএসসি এবং স্কিল ডেভেলপমেন্ট কোর্সের মাধ্যমে 
                হাজারো শিক্ষার্থীকে তাদের লক্ষ্যে পৌঁছাতে সাহায্য করছি।
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-12 md:py-16 px-4">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">
                  <span className="gradient-text">আমাদের গল্প</span>
                </h2>
                <div className="space-y-3 md:space-y-4 text-muted-foreground text-sm md:text-base">
                  <p>
                    ২০২০ সালে করোনা মহামারীর সময় পাপেল এডু-কেয়ারের যাত্রা শুরু হয়। 
                    যখন সারা দেশের শিক্ষাপ্রতিষ্ঠান বন্ধ ছিল, তখন আমরা অনলাইনে শিক্ষা 
                    চালিয়ে যাওয়ার সিদ্ধান্ত নিই।
                  </p>
                  <p>
                    শুরুতে ইউটিউবে ফ্রি ভিডিও দিয়ে শুরু করেছিলাম। শিক্ষার্থীদের 
                    অভূতপূর্ব সাড়া পেয়ে আমরা একটি পূর্ণাঙ্গ প্ল্যাটফর্ম তৈরির 
                    দিকে এগিয়ে যাই।
                  </p>
                  <p>
                    আজ আমাদের ১ লক্ষ ৫০ হাজারের বেশি সাবস্ক্রাইবার এবং হাজারো 
                    সফল শিক্ষার্থী রয়েছে যারা আমাদের কোর্স করে তাদের লক্ষ্যে 
                    পৌঁছেছে।
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                    alt="Team collaboration"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Floating Stats */}
                <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-card rounded-xl p-3 md:p-4 shadow-lg border border-border">
                  <p className="text-2xl md:text-3xl font-bold text-primary">১৫০K+</p>
                  <p className="text-xs md:text-sm text-muted-foreground">সাবস্ক্রাইবার</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 md:py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-xl md:text-3xl font-bold">
                <span className="gradient-text">আমাদের মূল্যবোধ ও লক্ষ্য</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-card rounded-xl md:rounded-2xl p-5 md:p-6 border border-border shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-3 md:mb-4`}>
                      <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-base md:text-lg mb-2 text-foreground">{value.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default About;
