import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";

const semesterNames: Record<string, string> = {
  "1": "১ম সেমিস্টার",
  "2": "২য় সেমিস্টার",
  "3": "৩য় সেমিস্টার",
  "4": "৪র্থ সেমিস্টার",
  "5": "৫ম সেমিস্টার",
  "6": "৬ষ্ঠ সেমিস্টার",
  "7": "৭ম সেমিস্টার",
};

const coursesData = [
  { id: 1, title: "ইলেকট্রিক্যাল সার্কিট অ্যানালাইসিস", instructor: "মোহাম্মদ রফিক", price: "১,৫০০", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&q=80" },
  { id: 2, title: "প্রোগ্রামিং ফান্ডামেন্টালস", instructor: "সাদিয়া আক্তার", price: "১,২০০", image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80" },
  { id: 3, title: "ইঞ্জিনিয়ারিং ড্রয়িং", instructor: "আব্দুল করিম", price: "১,০০০", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80" },
  { id: 4, title: "ম্যাথমেটিক্স", instructor: "নাজমুল হাসান", price: "৮০০", image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80" },
  { id: 5, title: "ফিজিক্স ফর ইঞ্জিনিয়ার্স", instructor: "ড. আবুল কালাম", price: "১,১০০", image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&q=80" },
  { id: 6, title: "বাংলাদেশ স্টাডিজ", instructor: "মোস্তাফিজুর রহমান", price: "৫০০", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80" },
];

const SemesterPage = () => {
  const { id } = useParams<{ id: string }>();
  const semesterName = semesterNames[id || "1"] || "সেমিস্টার";

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
                to="/diploma-dynamic"
                className="inline-flex items-center text-primary hover:underline mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                ডিপ্লোমা ডায়নামিক কোর্স
              </Link>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                <span className="gradient-text">{semesterName}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                এই সেমিস্টারের সকল কোর্স দেখুন এবং আপনার প্রয়োজনীয় কোর্সে ভর্তি হন।
              </p>
            </motion.div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="section-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

export default SemesterPage;
