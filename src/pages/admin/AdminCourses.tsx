import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Eye, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/hooks/useCourses";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AdminCourses = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth", { replace: true });
      } else if (!isAdmin) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const filteredCourses = courses?.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <>
      <Navbar />
      
      <main className="pt-20 min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="gradient-text">কোর্স ম্যানেজমেন্ট</span>
              </h1>
              <p className="text-muted-foreground">সকল কোর্স পরিচালনা করুন</p>
            </motion.div>

            <Button className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              নতুন কোর্স যোগ করুন
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="কোর্স খুঁজুন..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Courses Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">কোর্স</th>
                    <th className="text-left p-4 font-medium hidden md:table-cell">ক্যাটাগরি</th>
                    <th className="text-left p-4 font-medium hidden lg:table-cell">ইন্সট্রাক্টর</th>
                    <th className="text-left p-4 font-medium">মূল্য</th>
                    <th className="text-left p-4 font-medium hidden md:table-cell">স্ট্যাটাস</th>
                    <th className="text-right p-4 font-medium">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <tr key={course.id} className="border-t border-border hover:bg-muted/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                              {course.thumbnail_url ? (
                                <img
                                  src={course.thumbnail_url}
                                  alt={course.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{course.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {course.total_students} জন শিক্ষার্থী
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="px-2 py-1 rounded-full bg-secondary/10 text-secondary text-xs">
                            {course.category?.name || "N/A"}
                          </span>
                        </td>
                        <td className="p-4 hidden lg:table-cell text-sm">
                          {course.instructor?.name || "N/A"}
                        </td>
                        <td className="p-4">
                          <span className="font-medium">৳{course.price.toLocaleString()}</span>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            course.is_published 
                              ? "bg-green-100 text-green-700" 
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {course.is_published ? "প্রকাশিত" : "ড্রাফট"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="icon" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        কোনো কোর্স পাওয়া যায়নি
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AdminCourses;
