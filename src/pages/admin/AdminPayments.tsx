import { useState } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, Clock, XCircle, Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface Payment {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  payment_method: string;
  status: string;
  transaction_id: string;
  payment_date: string;
  gateway_response: any;
  billing_info: any;
  profile?: {
    full_name: string;
    email: string;
    phone: string;
  };
  course?: {
    title: string;
  };
}

const AdminPayments = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: payments, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          course:courses(title)
        `)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, phone")
        .in("user_id", userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return data.map(payment => ({
        ...payment,
        profile: profileMap.get(payment.user_id) || null,
      })) as Payment[];
    },
  });

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

  const getMethodName = (method: string) => {
    const methods: Record<string, string> = {
      bkash: "বিকাশ",
      nagad: "নগদ",
      rocket: "রকেট",
      moynapay: "ময়নাপে",
      manual: "ম্যানুয়াল",
    };
    return methods[method] || method;
  };

  const handleVerifyPayment = async (action: "approve" | "reject") => {
    if (!selectedPayment) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: {
          payment_id: selectedPayment.id,
          action: action,
          admin_notes: adminNotes,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "সফল!",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
        setShowVerifyDialog(false);
        setSelectedPayment(null);
        setAdminNotes("");
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "ত্রুটি",
        description: error.message || "পেমেন্ট যাচাই করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredPayments = payments?.filter(p =>
    p.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalRevenue = payments?.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0) || 0;
  const pendingCount = payments?.filter(p => p.status === "pending").length || 0;

  if (isLoading) {
    return (
      <AdminLayout title="পেমেন্ট ম্যানেজমেন্ট">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="পেমেন্ট ম্যানেজমেন্ট" subtitle="সকল পেমেন্ট যাচাই ও অনুমোদন করুন">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">মোট রাজস্ব</p>
          <p className="text-2xl font-bold text-green-600">৳{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">মোট পেমেন্ট</p>
          <p className="text-2xl font-bold">{payments?.length || 0}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border relative">
          <p className="text-sm text-muted-foreground">যাচাই প্রয়োজন</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          {pendingCount > 0 && (
            <span className="absolute top-2 right-2 w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
          )}
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">সম্পন্ন</p>
          <p className="text-2xl font-bold text-green-600">{payments?.filter(p => p.status === "completed").length || 0}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="নাম, কোর্স বা Transaction ID দিয়ে খুঁজুন..."
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
                <th className="text-left p-4 font-medium">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    কোনো পেমেন্ট পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{payment.billing_info?.name || payment.profile?.full_name || "অজানা"}</p>
                        <p className="text-xs text-muted-foreground">{payment.transaction_id}</p>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm">
                      {payment.course?.title || "অজানা কোর্স"}
                    </td>
                    <td className="p-4 font-bold text-primary">
                      ৳{payment.amount?.toLocaleString()}
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm">
                      {getMethodName(payment.payment_method)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(payment.status)}
                        <span className="text-sm">{getStatusText(payment.status)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowVerifyDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {payment.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-100"
                              onClick={() => {
                                setSelectedPayment(payment);
                                handleVerifyPayment("approve");
                              }}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-100"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowVerifyDialog(true);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Details Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>পেমেন্ট বিবরণ</DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">ইউজার</p>
                  <p className="font-medium">{selectedPayment.billing_info?.name || selectedPayment.profile?.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ফোন</p>
                  <p className="font-medium">{selectedPayment.billing_info?.phone || selectedPayment.profile?.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ইমেইল</p>
                  <p className="font-medium">{selectedPayment.billing_info?.email || selectedPayment.profile?.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ইনস্টিটিউট</p>
                  <p className="font-medium">{selectedPayment.billing_info?.institute || "-"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">ঠিকানা</p>
                  <p className="font-medium">{selectedPayment.billing_info?.address || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">কোর্স</p>
                  <p className="font-medium">{selectedPayment.course?.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">পরিমাণ</p>
                  <p className="font-bold text-primary">৳{selectedPayment.amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">মাধ্যম</p>
                  <p className="font-medium">{getMethodName(selectedPayment.payment_method)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Transaction ID</p>
                  <p className="font-mono font-medium">{selectedPayment.transaction_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">তারিখ</p>
                  <p className="font-medium">{format(new Date(selectedPayment.payment_date), "dd/MM/yyyy hh:mm a")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">স্ট্যাটাস</p>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedPayment.status)}
                    <span>{getStatusText(selectedPayment.status)}</span>
                  </div>
                </div>
              </div>

              {selectedPayment.status === "pending" && (
                <>
                  <div className="space-y-2">
                    <Label>অ্যাডমিন নোট (ঐচ্ছিক)</Label>
                    <Textarea
                      placeholder="বাতিল করলে কারণ লিখুন..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>

                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowVerifyDialog(false);
                        setSelectedPayment(null);
                        setAdminNotes("");
                      }}
                    >
                      বাতিল
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleVerifyPayment("reject")}
                      disabled={isProcessing}
                    >
                      <X className="w-4 h-4 mr-2" />
                      বাতিল করুন
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleVerifyPayment("approve")}
                      disabled={isProcessing}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      অনুমোদন
                    </Button>
                  </DialogFooter>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPayments;
