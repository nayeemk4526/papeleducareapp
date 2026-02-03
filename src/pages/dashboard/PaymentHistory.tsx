import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle, Clock, XCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PaymentHistory = () => {
  const navigate = useNavigate();
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

  // Placeholder payments
  const payments = [
    { id: 1, course: "ইলেকট্রিক্যাল টেকনোলজি", amount: 3000, method: "bKash", status: "completed", date: "২০২৪-০১-১৫" },
    { id: 2, course: "ওয়েব ডেভেলপমেন্ট", amount: 5000, method: "Nagad", status: "completed", date: "২০২৪-০১-১০" },
    { id: 3, course: "গ্রাফিক ডিজাইন", amount: 2500, method: "bKash", status: "pending", date: "২০২৪-০১-২০" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
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

  return (
    <>
      <Navbar />
      
      <main className="pt-20 min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              <span className="gradient-text">পেমেন্ট হিস্ট্রি</span>
            </h1>
            <p className="text-muted-foreground">আপনার সকল লেনদেনের তালিকা</p>
          </motion.div>

          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-4 md:p-6 border border-border"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{payment.course}</h3>
                        <p className="text-sm text-muted-foreground">
                          {payment.method} • {payment.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">৳{payment.amount.toLocaleString()}</p>
                        <div className="flex items-center gap-1 text-sm">
                          {getStatusIcon(payment.status)}
                          <span>{getStatusText(payment.status)}</span>
                        </div>
                      </div>
                      {payment.status === "completed" && (
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          রসিদ
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-12 border border-border text-center">
              <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">কোনো পেমেন্ট নেই</h3>
              <p className="text-muted-foreground mb-6">
                আপনার কোনো পেমেন্ট রেকর্ড নেই
              </p>
              <Button onClick={() => navigate("/courses")} className="gradient-primary">
                কোর্স দেখুন
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PaymentHistory;
