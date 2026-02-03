import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";

const categoryNames: Record<string, string> = {
  "class-9": "নবম শ্রেণি (ভোকেশনাল)",
  "class-10": "দশম শ্রেণি (ভোকেশনাল)",
  "class-11": "একাদশ শ্রেণি",
  "class-12": "দ্বাদশ শ্রেণি",
  "diploma-care": "ডিপ্লোমা কেয়ার কোর্স",
  "admission": "এডমিশন",
  "skill-development": "স্কিল ডেভেলপমেন্ট",
  "super-suggestion": "সুপার সাজেশন",
  "autocad": "অটো ক্যাড",
  "ssc": "এসএসসি",
  "hsc": "এইচএসসি",
};

const coursesData = [
  { id: 1, title: "বিষয়ভিত্তিক প্র্যাক্টিস কোর্স", instructor: "মোহাম্মদ রফিক", price: "১,৫০০", image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80" },
  { id: 2, title: "পরীক্ষা প্রস্তুতি মাস্টার কোর্স", instructor: "সাদিয়া আক্তার", price: "১,২০০", image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80" },
  { id: 3, title: "সম্পূর্ণ সিলেবাস কোর্স", instructor: "আব্দুল করিম", price: "২,০০০", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80" },
  { id: 4, title: "ক্র্যাশ কোর্স", instructor: "নাজমুল হাসান", price: "৮০০", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80" },
];

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const categoryName = categoryNames[slug || ""] || "ক্যাটাগরি";

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
            >
              <Link
                to="/"
                className="inline-flex items-center text-primary hover:underline mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                হোম
              </Link>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                <span className="gradient-text">{categoryName}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                এই ক্যাটাগরির সকল কোর্স দেখুন এবং আপনার প্রয়োজনীয় কোর্সে ভর্তি হন।
              </p>
            </motion.div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="section-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {coursesData.map((course, index) => (
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

export default CategoryPage;
