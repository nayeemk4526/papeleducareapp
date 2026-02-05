import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Users, BookOpen, CreditCard, LayoutGrid, GraduationCap,
  DollarSign, UserCheck, ArrowUpRight, Ticket, FileText
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/mysql-api";

const AdminDashboard = () => {
  // Fetch real stats
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const result = await adminApi.getStats();
      return result;
    },
  });

  const statCards = [
    { label: "মোট ইউজার", value: stats?.users || 0, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "মোট কোর্স", value: stats?.courses || 0, icon: BookOpen, color: "from-green-500 to-green-600" },
    { label: "মোট রাজস্ব", value: `৳${(stats?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: "from-purple-500 to-purple-600" },
    { label: "মোট এনরোলমেন্ট", value: stats?.enrollments || 0, icon: UserCheck, color: "from-orange-500 to-orange-600" },
  ];

  const menuItems = [
    { label: "কোর্স ম্যানেজমেন্ট", href: "/admin/courses", icon: BookOpen, description: "কোর্স যোগ, সম্পাদনা ও মুছুন" },
    { label: "ইউজার ম্যানেজমেন্ট", href: "/admin/users", icon: Users, description: "ইউজার ও এনরোলমেন্ট দেখুন" },
    { label: "পেমেন্ট ওভারভিউ", href: "/admin/payments", icon: CreditCard, description: "লেনদেন ও রাজস্ব দেখুন" },
    { label: "ক্যাটাগরি ম্যানেজমেন্ট", href: "/admin/categories", icon: LayoutGrid, description: "ক্যাটাগরি পরিচালনা করুন" },
    { label: "শিক্ষক ম্যানেজমেন্ট", href: "/admin/teachers", icon: GraduationCap, description: "শিক্ষক প্রোফাইল পরিচালনা" },
    { label: "কুপন কোড", href: "/admin/coupons", icon: Ticket, description: "ডিসকাউন্ট কুপন পরিচালনা" },
    { label: "টেস্টিমোনিয়াল", href: "/admin/testimonials", icon: FileText, description: "ছাত্রদের মতামত পরিচালনা" },
  ];

  return (
    <AdminLayout title="অ্যাডমিন ড্যাশবোর্ড" subtitle="সাইটের সকল তথ্য এখানে দেখুন">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => {
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
    </AdminLayout>
  );
};

export default AdminDashboard;
