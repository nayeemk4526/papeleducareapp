import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";

const semesters = [
  { id: 1, name: "১ম সেমিস্টার", courses: 12, color: "from-blue-500 to-blue-600" },
  { id: 2, name: "২য় সেমিস্টার", courses: 15, color: "from-purple-500 to-purple-600" },
  { id: 3, name: "৩য় সেমিস্টার", courses: 14, color: "from-cyan-500 to-cyan-600" },
  { id: 4, name: "৪র্থ সেমিস্টার", courses: 16, color: "from-pink-500 to-pink-600" },
  { id: 5, name: "৫ম সেমিস্টার", courses: 13, color: "from-orange-500 to-orange-600" },
  { id: 6, name: "৬ষ্ঠ সেমিস্টার", courses: 11, color: "from-green-500 to-green-600" },
  { id: 7, name: "৭ম সেমিস্টার", courses: 10, color: "from-red-500 to-red-600" },
];

const DiplomaDynamic = () => {
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
                <span className="gradient-text">ডিপ্লোমা ডায়নামিক কোর্স</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                আপনার সেমিস্টার অনুযায়ী কোর্স বেছে নিন। প্রতিটি সেমিস্টারে বিষয়ভিত্তিক 
                বিশেষজ্ঞ শিক্ষকদের দ্বারা পরিচালিত কোর্স রয়েছে।
              </p>
            </motion.div>
          </div>
        </section>

        {/* Semesters Grid */}
        <section className="section-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {semesters.map((semester, index) => (
              <motion.div
                key={semester.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/semester/${semester.id}`}>
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative bg-card rounded-2xl p-6 border border-border shadow-sm card-hover-glow overflow-hidden group"
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${semester.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                    {/* Semester Number */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${semester.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <span className="text-2xl font-bold text-white">{semester.id}</span>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {semester.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {semester.courses}টি কোর্স রয়েছে
                    </p>

                    {/* Arrow */}
                    <div className="flex items-center text-primary font-medium text-sm">
                      <span>কোর্স দেখুন</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>

                    {/* Decorative */}
                    <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br ${semester.color} rounded-full opacity-5 group-hover:opacity-10 transition-opacity`} />
                  </motion.div>
                </Link>
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

export default DiplomaDynamic;
