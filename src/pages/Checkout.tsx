import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Smartphone, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCourseById } from "@/hooks/useCourses";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const paymentMethods = [
  { id: "bkash", name: "বিকাশ", color: "#E2136E", number: "01XXXXXXXXX" },
  { id: "nagad", name: "নগদ", color: "#F6921E", number: "01XXXXXXXXX" },
  { id: "rocket", name: "রকেট", color: "#8C3494", number: "01XXXXXXXXX" },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: course, isLoading } = useCourseById(courseId || "");
  
  const [selectedMethod, setSelectedMethod] = useState("bkash");
  const [transactionId, setTransactionId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <main className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">কোর্স পাওয়া যায়নি</h1>
            <Button onClick={() => navigate("/courses")}>সব কোর্স দেখুন</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const finalPrice = course.discount_price || course.price;
  const selectedPayment = paymentMethods.find(m => m.id === selectedMethod);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionId.trim()) {
      toast({
        title: "ত্রুটি",
        description: "ট্রানজেকশন আইডি দিন",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber.trim() || phoneNumber.length < 11) {
      toast({
        title: "ত্রুটি",
        description: "সঠিক ফোন নম্বর দিন",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          course_id: course.id,
          amount: finalPrice,
          payment_method: selectedMethod,
          transaction_id: transactionId.trim(),
          phone_number: phoneNumber.trim(),
        },
      });

      if (error) throw error;

      if (data.success) {
        setIsSuccess(true);
        toast({
          title: "সফল!",
          description: data.message,
        });
      } else {
        throw new Error(data.error || "পেমেন্ট প্রসেস করতে সমস্যা হয়েছে");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "ত্রুটি",
        description: error.message || "পেমেন্ট প্রসেস করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <>
        <Navbar />
        <main className="pt-20 min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4">পেমেন্ট জমা হয়েছে!</h1>
            <p className="text-muted-foreground mb-6">
              আপনার পেমেন্ট সফলভাবে জমা হয়েছে। অ্যাডমিন যাচাই করার পর আপনাকে 
              নোটিফিকেশন এবং SMS এর মাধ্যমে জানানো হবে।
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate("/dashboard/payments")}>
                পেমেন্ট হিস্ট্রি
              </Button>
              <Button className="gradient-primary" onClick={() => navigate("/courses")}>
                আরো কোর্স দেখুন
              </Button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <main className="pt-20 min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ফিরে যান
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      পেমেন্ট করুন
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Payment Method Selection */}
                      <div className="space-y-3">
                        <Label>পেমেন্ট মেথড সিলেক্ট করুন</Label>
                        <RadioGroup
                          value={selectedMethod}
                          onValueChange={setSelectedMethod}
                          className="grid grid-cols-3 gap-3"
                        >
                          {paymentMethods.map((method) => (
                            <div key={method.id}>
                              <RadioGroupItem
                                value={method.id}
                                id={method.id}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={method.id}
                                className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                              >
                                <div
                                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2"
                                  style={{ backgroundColor: method.color }}
                                >
                                  {method.name.charAt(0)}
                                </div>
                                <span className="font-medium">{method.name}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      {/* Payment Instructions */}
                      <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">পেমেন্ট নির্দেশনা:</p>
                            <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1 mt-2">
                              <li>
                                <span style={{ color: selectedPayment?.color }} className="font-medium">
                                  {selectedPayment?.name}
                                </span> অ্যাপ ওপেন করুন
                              </li>
                              <li>"Send Money" অপশনে যান</li>
                              <li>
                                নম্বর: <span className="font-mono font-bold">{selectedPayment?.number}</span>
                              </li>
                              <li>
                                পরিমাণ: <span className="font-bold text-primary">৳{finalPrice.toLocaleString()}</span>
                              </li>
                              <li>পেমেন্ট সম্পন্ন করে Transaction ID কপি করুন</li>
                            </ol>
                          </div>
                        </div>
                      </div>

                      {/* Transaction ID */}
                      <div className="space-y-2">
                        <Label htmlFor="transaction-id">Transaction ID *</Label>
                        <Input
                          id="transaction-id"
                          placeholder="যেমন: 8N7XXXXX"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          required
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <Label htmlFor="phone">আপনার মোবাইল নম্বর *</Label>
                        <div className="relative">
                          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            placeholder="01XXXXXXXXX"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          এই নম্বরে SMS এ কনফার্মেশন পাঠানো হবে
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full gradient-primary"
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            প্রসেস হচ্ছে...
                          </span>
                        ) : (
                          "পেমেন্ট জমা দিন"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">অর্ডার সামারি</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-20 h-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-primary to-secondary" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2">{course.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {course.instructor?.name}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">কোর্স মূল্য</span>
                        <span>৳{course.price.toLocaleString()}</span>
                      </div>
                      {course.discount_price && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>ছাড়</span>
                          <span>-৳{(course.price - course.discount_price).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>সর্বমোট</span>
                        <span className="text-primary">৳{finalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Checkout;
