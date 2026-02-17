import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Users, BookOpen, CreditCard, LayoutGrid, GraduationCap,
  DollarSign, UserCheck, ArrowUpRight, Ticket, FileText, TrendingUp
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { bn } from "date-fns/locale";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        { count: usersCount },
        { count: coursesCount },
        { count: enrollmentsCount },
        { data: paymentsData }
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("courses").select("*", { count: "exact", head: true }),
        supabase.from("enrollments").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("amount").eq("status", "completed"),
      ]);

      const totalRevenue = paymentsData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      return {
        users: usersCount || 0,
        courses: coursesCount || 0,
        enrollments: enrollmentsCount || 0,
        revenue: totalRevenue,
      };
    },
  });

  // Enrollment trend (last 30 days)
  const { data: enrollmentTrend } = useQuery({
    queryKey: ["enrollment-trend"],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data } = await supabase
        .from("enrollments")
        .select("enrolled_at")
        .gte("enrolled_at", thirtyDaysAgo)
        .order("enrolled_at");

      const grouped: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const day = format(subDays(new Date(), i), "dd MMM");
        grouped[day] = 0;
      }
      data?.forEach((e) => {
        const day = format(new Date(e.enrolled_at), "dd MMM");
        if (grouped[day] !== undefined) grouped[day]++;
      });

      return Object.entries(grouped).map(([date, count]) => ({ date, count }));
    },
  });

  // Revenue trend (last 30 days)
  const { data: revenueTrend } = useQuery({
    queryKey: ["revenue-trend"],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const { data } = await supabase
        .from("payments")
        .select("amount, payment_date")
        .eq("status", "completed")
        .gte("payment_date", thirtyDaysAgo)
        .order("payment_date");

      const grouped: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const day = format(subDays(new Date(), i), "dd MMM");
        grouped[day] = 0;
      }
      data?.forEach((p) => {
        const day = format(new Date(p.payment_date), "dd MMM");
        if (grouped[day] !== undefined) grouped[day] += p.amount || 0;
      });

      return Object.entries(grouped).map(([date, amount]) => ({ date, amount }));
    },
  });

  // Category distribution
  const { data: categoryData } = useQuery({
    queryKey: ["category-distribution"],
    queryFn: async () => {
      const { data: courses } = await supabase
        .from("courses")
        .select("category_id, categories(name)")
        .not("category_id", "is", null);

      const counts: Record<string, number> = {};
      courses?.forEach((c: any) => {
        const name = c.categories?.name || "অন্যান্য";
        counts[name] = (counts[name] || 0) + 1;
      });

      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    },
  });

  // Recent payments
  const { data: recentPayments } = useQuery({
    queryKey: ["recent-payments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("id, amount, status, payment_method, payment_date, billing_info")
        .order("payment_date", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const statCards = [
    { label: "মোট ইউজার", value: stats?.users || 0, icon: Users, color: "from-blue-500 to-cyan-400", change: "+12%" },
    { label: "মোট কোর্স", value: stats?.courses || 0, icon: BookOpen, color: "from-emerald-500 to-green-400", change: "+3" },
    { label: "মোট রাজস্ব", value: `৳${(stats?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: "from-violet-500 to-purple-400", change: "+18%" },
    { label: "মোট এনরোলমেন্ট", value: stats?.enrollments || 0, icon: UserCheck, color: "from-amber-500 to-orange-400", change: "+8%" },
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">সম্পন্ন</span>;
      case "pending":
        return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs">প্রক্রিয়াধীন</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs">{status}</span>;
    }
  };

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
              className="relative bg-card rounded-2xl p-5 border border-border shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.07] group-hover:opacity-[0.12] transition-opacity">
                <Icon className="w-full h-full" />
              </div>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <span className="text-xs text-emerald-500 font-medium flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Enrollment Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl p-5 border border-border shadow-sm"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            এনরোলমেন্ট ট্রেন্ড (৩০ দিন)
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentTrend || []}>
                <defs>
                  <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#enrollGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-5 border border-border shadow-sm"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            রাজস্ব ট্রেন্ড (৩০ দিন)
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`৳${value.toLocaleString()}`, "রাজস্ব"]}
                />
                <Bar dataKey="amount" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row: Category Pie + Recent Payments */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-2xl p-5 border border-border shadow-sm"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-violet-500" />
            ক্যাটাগরি অনুযায়ী কোর্স
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(categoryData || []).map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {(categoryData || []).map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-muted-foreground truncate max-w-[120px]">{cat.name}</span>
                </div>
                <span className="font-medium">{cat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2 bg-card rounded-2xl p-5 border border-border shadow-sm"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-500" />
            সাম্প্রতিক পেমেন্ট
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium text-muted-foreground">তারিখ</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">পরিমাণ</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">মাধ্যম</th>
                  <th className="text-left py-2 font-medium text-muted-foreground">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {(recentPayments || []).map((p) => (
                  <tr key={p.id} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5">{format(new Date(p.payment_date), "dd/MM/yy")}</td>
                    <td className="py-2.5 font-medium">৳{p.amount.toLocaleString()}</td>
                    <td className="py-2.5 capitalize">{p.payment_method}</td>
                    <td className="py-2.5">{getStatusBadge(p.status)}</td>
                  </tr>
                ))}
                {(!recentPayments || recentPayments.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">কোনো পেমেন্ট নেই</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
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
              transition={{ delay: 0.8 + index * 0.05 }}
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
