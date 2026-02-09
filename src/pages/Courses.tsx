import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { User, Clock, Users, Star, BookOpen, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCourses } from "@/hooks/useCourses";
import { useCategories } from "@/hooks/useCategories";
import { useState } from "react";

const Courses = () => {
  const { data: courses, isLoading } = useCourses();
  const { data: categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredCourses = courses?.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.short_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
                <span className="gradient-text">সকল কোর্সসমূহ</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground px-4 mb-8">
                আপনার পছন্দের কোর্স খুঁজে নিন এবং আজই শেখা শুরু করুন
              </p>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="কোর্স খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="ক্যাটাগরি" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Courses Grid */}
        <section className="py-8 md:py-12 px-4">
          <div className="container mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
                    <div className="h-36 md:h-40 bg-muted" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                      <div className="h-8 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCourses?.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">কোনো কোর্স পাওয়া যায়নি</h3>
                <p className="text-muted-foreground">আপনার সার্চ পরিবর্তন করে আবার চেষ্টা করুন</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredCourses?.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all"
                  >
                    <Link to={`/course/${course.slug}`}>
                      <div className="relative h-36 md:h-40 overflow-hidden">
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
                        {course.category && (
                          <div className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-secondary/90 text-secondary-foreground">
                            {course.category.name}
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
                        <h4 className="font-semibold text-foreground mb-2 line-clamp-2 text-sm md:text-base hover:text-primary transition-colors">
                          {course.title}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-2">
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
                          <span className="text-base md:text-lg font-bold text-primary">
                            ৳{(course.discount_price || course.price).toLocaleString()}
                          </span>
                          {course.discount_price && (
                            <span className="text-xs text-muted-foreground line-through">
                              ৳{course.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <Link to={`/course/${course.slug}`}>
                          <Button size="sm" className="gradient-primary text-xs md:text-sm">
                            বিস্তারিত
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Courses;
