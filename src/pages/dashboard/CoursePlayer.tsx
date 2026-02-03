import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Circle, PlayCircle, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

const CoursePlayer = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Placeholder lessons
  const lessons = [
    { id: 1, title: "ভূমিকা ও পরিচিতি", duration: "15:30", completed: true },
    { id: 2, title: "বেসিক কনসেপ্ট", duration: "25:45", completed: true },
    { id: 3, title: "অ্যাডভান্সড টপিক", duration: "32:10", completed: false },
    { id: 4, title: "প্র্যাক্টিক্যাল প্রজেক্ট", duration: "45:20", completed: false },
    { id: 5, title: "ফাইনাল এক্সাম", duration: "20:00", completed: false },
  ];

  return (
    <>
      <Navbar />
      
      <main className="pt-20 min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/dashboard/courses")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ফিরে যান
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl overflow-hidden border border-border"
              >
                <div className="aspect-video bg-black flex items-center justify-center">
                  <div className="text-center text-white">
                    <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">ভিডিও প্লেয়ার এখানে দেখাবে</p>
                  </div>
                </div>
                <div className="p-4">
                  <h1 className="text-xl font-bold mb-2">লেসন ৩: অ্যাডভান্সড টপিক</h1>
                  <p className="text-muted-foreground text-sm">
                    এই লেসনে আমরা অ্যাডভান্সড কনসেপ্ট সম্পর্কে জানব।
                  </p>
                </div>
              </motion.div>

              {/* Materials */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl p-4 border border-border mt-4"
              >
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  কোর্স ম্যাটেরিয়ালস
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">লেকচার নোট.pdf</span>
                    <Button size="sm" variant="ghost">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm">প্র্যাক্টিস শীট.pdf</span>
                    <Button size="sm" variant="ghost">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Lesson List */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl border border-border overflow-hidden sticky top-24"
              >
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold">কোর্স কন্টেন্ট</h3>
                  <p className="text-sm text-muted-foreground">৫টি লেসন • ২ঘণ্টা ১৮মি</p>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                        index === 2 ? "bg-primary/5 border-l-2 border-l-primary" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {lesson.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <PlayCircle className="w-3 h-3" />
                            {lesson.duration}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CoursePlayer;
