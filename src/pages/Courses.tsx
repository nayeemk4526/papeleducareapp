import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";

const allCourses = [
  { id: 1, title: "ইলেকট্রিক্যাল টেকনোলজি কমপ্লিট", instructor: "মোহাম্মদ আলী", price: "৩,০০০", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80", enrolled: "১,২৩৪", category: "ডিপ্লোমা" },
  { id: 2, title: "সিভিল টেকনোলজি মাস্টারক্লাস", instructor: "আব্দুল হামিদ", price: "৩,৫০০", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80", enrolled: "৮৭৬", category: "ডিপ্লোমা" },
  { id: 3, title: "এসএসসি গণিত কমপ্লিট কোর্স", instructor: "আয়েশা সিদ্দিকা", price: "১,০০০", image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80", enrolled: "২,৩৪৫", category: "এসএসসি" },
  { id: 4, title: "এসএসসি পদার্থবিজ্ঞান", instructor: "শাহিন আলম", price: "১,১০০", image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80", enrolled: "১,৮৯০", category: "এসএসসি" },
  { id: 5, title: "এইচএসসি ফিজিক্স ফুল কোর্স", instructor: "ড. আবুল কালাম", price: "২,৫০০", image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80", enrolled: "১,৭৮৯", category: "এইচএসসি" },
  { id: 6, title: "ফুল স্ট্যাক ওয়েব ডেভেলপমেন্ট", instructor: "রাকিবুল ইসলাম", price: "৮,০০০", image: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&q=80", enrolled: "২,৩৪৫", category: "স্কিল" },
  { id: 7, title: "মোবাইল অ্যাপ ডেভেলপমেন্ট", instructor: "সাইফুল ইসলাম", price: "৭,০০০", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80", enrolled: "১,৮৯০", category: "স্কিল" },
  { id: 8, title: "BUET অ্যাডমিশন প্রস্তুতি", instructor: "ইমরান হোসেন", price: "৪,০০০", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80", enrolled: "১,২৩৪", category: "এডমিশন" },
];

const Courses = () => {
  return (
    <>
      <Navbar />
      
      <main className="pt-20 pb-16 lg:pb-0">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                <span className="gradient-text">সকল কোর্সসমূহ</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                আপনার পছন্দের কোর্স খুঁজে নিন এবং আজই শেখা শুরু করুন
              </p>
            </motion.div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="section-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-card rounded-xl border border-border overflow-hidden shadow-sm card-hover"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-secondary/90 text-secondary-foreground">
                    {course.category}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-primary/90 text-primary-foreground">
                    {course.enrolled} জন
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-foreground mb-2 line-clamp-2">{course.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <User className="w-4 h-4" />
                    <span>{course.instructor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">৳{course.price}</span>
                    <Button size="sm" className="gradient-primary">
                      বিস্তারিত
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <MobileNavigation />
    </>
  );
};

export default Courses;
