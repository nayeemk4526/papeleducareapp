import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, CreditCard, CheckCircle, Clock, XCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AdminPayments = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Placeholder payments
  const payments = [
    { id: 1, user: "মোহাম্মদ রাকিব", course: "ইলেকট্রিক্যাল টেকনোলজি", amount: 3000, method: "bKash", status: "completed", date: "২০২৪-০১-১৫", txnId: "TXN123456" },
    { id: 2, user: "সাবরিনা আক্তার", course: "ওয়েব ডেভেলপমেন্ট", amount: 5000, method: "Nagad", status: "completed", date: "২০২৪-০১-১০", txnId: "TXN123457" },
    { id: 3, user: "তানভীর আহমেদ", course: "গ্রাফিক ডিজাইন", amount: 2500, method: "bKash", status: "pending", date: "২০২৪-০১-২০", txnId: "TXN123458" },
    { id: 4, user: "নুসরাত জাহান", course: "এসএসসি গণিত", amount: 1500, method: "Rocket", status: "failed", date: "২০২৪-০১-১৮", txnId: "TXN123459" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "সম্পন্ন";
      case "pending":
        return "প্রক্রিয়াধীন";
      case "failed":
        return "ব্যর্থ";
      default:
        return status;
    }
  };

  const filteredPayments = payments.filter(p =>
    p.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.txnId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);

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
              <span className="gradient-text">পেমেন্ট ওভারভিউ</span>
            </h1>
            <p className="text-muted-foreground">সকল লেনদেন দেখুন</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground">মোট রাজস্ব</p>
              <p className="text-2xl font-bold text-green-600">৳{totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground">সম্পন্ন</p>
              <p className="text-2xl font-bold">{payments.filter(p => p.status === "completed").length}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground">প্রক্রিয়াধীন</p>
              <p className="text-2xl font-bold text-yellow-600">{payments.filter(p => p.status === "pending").length}</p>
            </div>
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground">ব্যর্থ</p>
              <p className="text-2xl font-bold text-red-600">{payments.filter(p => p.status === "failed").length}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="পেমেন্ট খুঁজুন..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Payments Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">ইউজার</th>
                    <th className="text-left p-4 font-medium hidden md:table-cell">কোর্স</th>
                    <th className="text-left p-4 font-medium">পরিমাণ</th>
                    <th className="text-left p-4 font-medium hidden lg:table-cell">মাধ্যম</th>
                    <th className="text-left p-4 font-medium">স্ট্যাটাস</th>
                    <th className="text-left p-4 font-medium hidden md:table-cell">তারিখ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-t border-border hover:bg-muted/30">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{payment.user}</p>
                          <p className="text-xs text-muted-foreground">{payment.txnId}</p>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm">
                        {payment.course}
                      </td>
                      <td className="p-4 font-bold">
                        ৳{payment.amount.toLocaleString()}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm">
                        {payment.method}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {getStatusIcon(payment.status)}
                          <span className="text-sm">{getStatusText(payment.status)}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                        {payment.date}
                      </td>
                    </tr>
                  ))}
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

export default AdminPayments;
