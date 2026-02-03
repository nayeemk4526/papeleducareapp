import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import logoImage from "@/assets/logo.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "ইমেইল প্রয়োজন",
        description: "দয়া করে আপনার ইমেইল দিন",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: "ইমেইল পাঠানো হয়েছে!",
        description: "পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "কিছু ভুল হয়েছে";
      toast({
        title: "ব্যর্থ হয়েছে",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <main className="min-h-screen pt-20 flex items-center justify-center py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-xl"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <Link to="/" className="inline-flex items-center gap-2 mb-4">
                  <img src={logoImage} alt="পাপেল এডু-কেয়ার" className="w-16 h-16 rounded-full" />
                </Link>
                <h1 className="text-xl md:text-2xl font-bold mb-2">
                  <span className="gradient-text">পাসওয়ার্ড ভুলে গেছেন?</span>
                </h1>
                <p className="text-muted-foreground text-sm">
                  আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হবে
                </p>
              </div>

              {isSuccess ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-lg font-semibold">ইমেইল পাঠানো হয়েছে!</h2>
                  <p className="text-muted-foreground text-sm">
                    আমরা <strong>{email}</strong> এ একটি পাসওয়ার্ড রিসেট লিংক পাঠিয়েছি।
                    দয়া করে আপনার ইনবক্স এবং স্প্যাম ফোল্ডার চেক করুন।
                  </p>
                  <div className="pt-4 space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsSuccess(false);
                        setEmail("");
                      }}
                    >
                      আবার চেষ্টা করুন
                    </Button>
                    <Link to="/auth">
                      <Button variant="ghost" className="w-full">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        লগইন পেজে ফিরে যান
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">ইমেইল</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="আপনার ইমেইল"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full gradient-primary" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Mail className="w-5 h-5 mr-2" />
                    )}
                    রিসেট লিংক পাঠান
                  </Button>

                  <div className="text-center pt-2">
                    <Link to="/auth" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                      <ArrowLeft className="w-4 h-4" />
                      লগইন পেজে ফিরে যান
                    </Link>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ForgotPassword;
