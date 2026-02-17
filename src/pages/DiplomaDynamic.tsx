import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const semesterSlugs = [
  { id: 1, slug: "1st-semester", name: "১ম সেমিস্টার", color: "from-blue-500 to-blue-600" },
  { id: 2, slug: "2nd-semester", name: "২য় সেমিস্টার", color: "from-purple-500 to-purple-600" },
  { id: 3, slug: "3rd-semester", name: "৩য় সেমিস্টার", color: "from-cyan-500 to-cyan-600" },
  { id: 4, slug: "4th-semester", name: "৪র্থ সেমিস্টার", color: "from-pink-500 to-pink-600" },
  { id: 5, slug: "5th-semester", name: "৫ম সেমিস্টার", color: "from-orange-500 to-orange-600" },
  { id: 6, slug: "6th-semester", name: "৬ষ্ঠ সেমিস্টার", color: "from-green-500 to-green-600" },
  { id: 7, slug: "7th-semester", name: "৭ম সেমিস্টার", color: "from-red-500 to-red-600" },
];

const DiplomaDynamic = () => {
  // Fetch categories and course counts
  const { data: categoriesWithCounts } = useQuery({
    queryKey: ["semester-course-counts"],
    queryFn: async () => {
      const slugs = semesterSlugs.map(s => s.slug);
      const { data: categories, error: catError } = await supabase
        .from("categories")
        .select("id, slug")
        .in("slug", slugs);
      
      if (catError) throw catError;
      if (!categories?.length) return {};

      const counts: Record<string, number> = {};
      for (const cat of categories) {
        const { count, error } = await supabase
          .from("courses")
          .select("id", { count: "exact", head: true })
          .eq("category_id", cat.id)
          .eq("is_published", true);
        if (!error) counts[cat.slug] = count || 0;
      }
      return counts;
    },
  });

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
            {semesterSlugs.map((semester, index) => {
              const courseCount = categoriesWithCounts?.[semester.slug] || 0;
              return (
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
                      <div className={`absolute inset-0 bg-gradient-to-br ${semester.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${semester.color} flex items-center justify-center mb-4 shadow-lg`}>
                        <span className="text-2xl font-bold text-white">{semester.id}</span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {semester.name}
                      </h3>
                      {courseCount > 0 && (
                        <p className="text-muted-foreground text-sm mb-4">
                          {courseCount}টি কোর্স রয়েছে
                        </p>
                      )}
                      <div className="flex items-center text-primary font-medium text-sm">
                        <span>কোর্স দেখুন</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className={`absolute -bottom-8 -right-8 w-24 h-24 bg-gradient-to-br ${semester.color} rounded-full opacity-5 group-hover:opacity-10 transition-opacity`} />
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
      <MobileNavigation />
    </>
  );
};

export default DiplomaDynamic;
