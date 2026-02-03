import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  BookOpen, PlayCircle, Award, CreditCard, Bell, Settings,
  Clock, TrendingUp, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEnrollments } from "@/hooks/useEnrollments";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading || enrollmentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const stats = [
    { label: "মোট কোর্স", value: enrollments?.length || 0, icon: BookOpen, color: "from-blue-500 to-blue-600" },
    { label: "সম্পন্ন", value: enrollments?.filter(e => e.completed_at)?.length || 0, icon: Award, color: "from-green-500 to-green-600" },
    { label: "চলমান", value: enrollments?.filter(e => !e.completed_at)?.length || 0, icon: PlayCircle, color: "from-orange-500 to-orange-600" },
    { label: "সার্টিফিকেট", value: enrollments?.filter(e => e.certificate_url)?.length || 0, icon: Award, color: "from-purple-500 to-purple-600" },
  ];

  const menuItems = [
    { label: "আমার কোর্সসমূহ", href: "/dashboard/courses", icon: BookOpen },
    { label: "লাইভ ক্লাস", href: "/dashboard/live-classes", icon: Calendar },
    { label: "পেমেন্ট হিস্ট্রি", href: "/dashboard/payments", icon: CreditCard },
    { label: "নোটিফিকেশন", href: "/dashboard/notifications", icon: Bell },
    { label: "প্রোফাইল সেটিংস", href: "/dashboard/profile", icon: Settings },
  ];

  return (
    <>
      <Navbar />
      
      <main className="pt-20 min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              স্বাগতম, <span className="gradient-text">{profile?.full_name || "শিক্ষার্থী"}</span>!
            </h1>
            <p className="text-muted-foreground">আপনার ড্যাশবোর্ডে আপনাকে স্বাগতম</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-4 md:p-6 border border-border shadow-sm"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold mb-4">দ্রুত অ্যাক্সেস</h2>
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.href}
                      variant="ghost"
                      className="w-full justify-start h-12"
                      onClick={() => navigate(item.href)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Recent Courses */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">সাম্প্রতিক কোর্সসমূহ</h2>
                <Button variant="link" onClick={() => navigate("/dashboard/courses")}>
                  সব দেখুন
                </Button>
              </div>

              {enrollments && enrollments.length > 0 ? (
                <div className="space-y-4">
                  {enrollments.slice(0, 3).map((enrollment) => (
                    <motion.div
                      key={enrollment.id}
                      whileHover={{ y: -2 }}
                      className="bg-card rounded-xl p-4 border border-border flex gap-4 cursor-pointer"
                      onClick={() => navigate(`/dashboard/course/${enrollment.course_id}`)}
                    >
                      <div className="w-24 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {enrollment.course?.thumbnail_url ? (
                          <img
                            src={enrollment.course.thumbnail_url}
                            alt={enrollment.course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {enrollment.course?.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {enrollment.progress_percentage}% সম্পন্ন
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {enrollment.course?.total_lessons || 0} লেসন
                          </span>
                        </div>
                        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all"
                            style={{ width: `${enrollment.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-xl p-8 border border-border text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">কোনো কোর্স নেই</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    আপনি এখনো কোনো কোর্সে এনরোল করেননি
                  </p>
                  <Button onClick={() => navigate("/courses")} className="gradient-primary">
                    কোর্স দেখুন
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default StudentDashboard;
