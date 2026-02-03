import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, ArrowLeft, Clock, Users, Star, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCoursesByCategory, useCategoryBySlug } from "@/hooks/useCourses";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: category, isLoading: categoryLoading } = useCategoryBySlug(slug || "");
  const { data: courses, isLoading: coursesLoading } = useCoursesByCategory(category?.id || "");

  const isLoading = categoryLoading || coursesLoading;

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
                <span className="gradient-text">{category?.name || "ক্যাটাগরি"}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                {category?.description || "এই ক্যাটাগরির সকল কোর্স দেখুন এবং আপনার প্রয়োজনীয় কোর্সে ভর্তি হন।"}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="section-container">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
          ) : courses?.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">এই ক্যাটাগরিতে কোনো কোর্স নেই</h3>
              <p className="text-muted-foreground mb-6">শীঘ্রই নতুন কোর্স যোগ করা হবে</p>
              <Link to="/courses">
                <Button className="gradient-primary">সব কোর্স দেখুন</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses?.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-card rounded-xl border border-border overflow-hidden shadow-sm card-hover"
                >
                  <Link to={`/course/${course.slug}`}>
                    <div className="relative h-40 overflow-hidden">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-vibrant-pink flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-white/80" />
                        </div>
                      )}
                      {course.discount_price && (
                        <div className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-full bg-destructive text-destructive-foreground">
                          {Math.round((1 - course.discount_price / course.price) * 100)}% ছাড়
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/course/${course.slug}`}>
                      <h4 className="font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                        {course.title}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <User className="w-4 h-4" />
                      <span>{course.instructor?.name || "শিক্ষক"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      {course.duration_hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{course.duration_hours} ঘন্টা</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{course.total_students || 0}+</span>
                      </div>
                      <div className="flex items-center gap-1 text-golden">
                        <Star className="w-3 h-3 fill-golden" />
                        <span>4.8</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          ৳{(course.discount_price || course.price).toLocaleString()}
                        </span>
                        {course.discount_price && (
                          <span className="text-xs text-muted-foreground line-through">
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
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
};

export default CategoryPage;
