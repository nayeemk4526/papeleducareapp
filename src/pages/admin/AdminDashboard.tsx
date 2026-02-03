import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Users, BookOpen, CreditCard, LayoutGrid, GraduationCap,
  TrendingUp, DollarSign, UserCheck, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth", { replace: true });
      } else if (!isAdmin) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const stats = [
    { label: "মোট ইউজার", value: "১,২৩৪", change: "+১২%", icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "মোট কোর্স", value: "৪৫", change: "+৫", icon: BookOpen, color: "from-green-500 to-green-600" },
    { label: "মোট রাজস্ব", value: "৳১২.৫ লক্ষ", change: "+২৩%", icon: DollarSign, color: "from-purple-500 to-purple-600" },
    { label: "নতুন এনরোলমেন্ট", value: "৮৭", change: "এই সপ্তাহে", icon: UserCheck, color: "from-orange-500 to-orange-600" },
  ];

  const menuItems = [
    { label: "কোর্স ম্যানেজমেন্ট", href: "/admin/courses", icon: BookOpen, description: "কোর্স যোগ, সম্পাদনা ও মুছুন" },
    { label: "ইউজার ম্যানেজমেন্ট", href: "/admin/users", icon: Users, description: "ইউজার ও এনরোলমেন্ট দেখুন" },
    { label: "পেমেন্ট ওভারভিউ", href: "/admin/payments", icon: CreditCard, description: "লেনদেন ও রাজস্ব দেখুন" },
    { label: "ক্যাটাগরি ম্যানেজমেন্ট", href: "/admin/categories", icon: LayoutGrid, description: "ক্যাটাগরি পরিচালনা করুন" },
    { label: "শিক্ষক ম্যানেজমেন্ট", href: "/admin/teachers", icon: GraduationCap, description: "শিক্ষক প্রোফাইল পরিচালনা" },
  ];

  return (
    <>
      <Navbar />
      
      <main className="pt-20 min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              <span className="gradient-text">অ্যাডমিন ড্যাশবোর্ড</span>
            </h1>
            <p className="text-muted-foreground">সাইটের সকল তথ্য এখানে দেখুন</p>
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
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <h2 className="text-lg font-semibold mb-4">দ্রুত অ্যাক্সেস</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link
                    to={item.href}
                    className="block bg-card rounded-xl p-6 border border-border hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="font-semibold mt-4 mb-1">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AdminDashboard;
