import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User, ArrowLeft, BookOpen, Clock, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";
import { useCoursesByCategorySlug, type Course } from "@/hooks/useCourses";

const semesterMap: Record<string, { name: string; slug: string }> = {
  "1": { name: "১ম সেমিস্টার", slug: "1st-semester" },
  "2": { name: "২য় সেমিস্টার", slug: "2nd-semester" },
  "3": { name: "৩য় সেমিস্টার", slug: "3rd-semester" },
  "4": { name: "৪র্থ সেমিস্টার", slug: "4th-semester" },
  "5": { name: "৫ম সেমিস্টার", slug: "5th-semester" },
  "6": { name: "৬ষ্ঠ সেমিস্টার", slug: "6th-semester" },
  "7": { name: "৭ম সেমিস্টার", slug: "7th-semester" },
};

const SemesterCourseCard = ({ course }: { course: Course }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
  >
    <Link to={`/course/${course.slug}`}>
      <div className="relative h-40 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary via-vibrant-pink to-primary flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white/80" />
          </div>
        )}
        {course.discount_price && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold shadow-lg">
            {Math.round((1 - course.discount_price / course.price) * 100)}% ছাড়
          </div>
        )}
      </div>
    </Link>
    <div className="p-4">
      <Link to={`/course/${course.slug}`}>
        <h4 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {course.title}
        </h4>
      </Link>
      {course.instructor?.name && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <User className="w-4 h-4" />
          <span>{course.instructor.name}</span>
        </div>
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        {course.duration_hours && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{course.duration_hours} ঘন্টা</span>
          </div>
        )}
        {(course.total_students ?? 0) > 0 && (
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{course.total_students}+</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            ৳{(course.discount_price || course.price).toLocaleString()}
          </span>
          {course.discount_price && (
            <span className="text-sm text-muted-foreground line-through">
              ৳{course.price.toLocaleString()}
            </span>
          )}
        </div>
        <Link to={`/course/${course.slug}`}>
          <Button size="sm" className="gradient-primary">
            বিস্তারিত
          </Button>
        </Link>
      </div>
    </div>
  </motion.div>
);

const SemesterPage = () => {
  const { id } = useParams<{ id: string }>();
  const semester = semesterMap[id || "1"] || { name: "সেমিস্টার", slug: "1st-semester" };
  const { data: courses, isLoading } = useCoursesByCategorySlug(semester.slug);

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
                <span className="gradient-text">{semester.name}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                এই সেমিস্টারের সকল কোর্স দেখুন এবং আপনার প্রয়োজনীয় কোর্সে ভর্তি হন।
              </p>
            </motion.div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="section-container">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                  <div className="h-40 bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-8 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <SemesterCourseCard course={course} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                এই সেমিস্টারে এখনো কোনো কোর্স যোগ করা হয়নি
              </h3>
              <p className="text-muted-foreground">
                শীঘ্রই কোর্স যোগ করা হবে। অপেক্ষা করুন।
              </p>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <MobileNavigation />
    </>
  );
};

export default SemesterPage;
