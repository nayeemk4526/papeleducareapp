import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import logoImage from "@/assets/logo.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // The user should have a session from the recovery link
      if (session) {
        setIsValidSession(true);
      }
      setIsCheckingSession(false);
    };

    checkSession();

    // Listen for auth state changes (when user clicks recovery link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
        setIsCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "সব ফিল্ড পূরণ করুন",
        description: "দয়া করে নতুন পাসওয়ার্ড দিন",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "পাসওয়ার্ড খুব ছোট",
        description: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "পাসওয়ার্ড মিলছে না",
        description: "উভয় পাসওয়ার্ড একই হতে হবে",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: "পাসওয়ার্ড আপডেট হয়েছে!",
        description: "আপনার নতুন পাসওয়ার্ড সেট করা হয়েছে।",
      });

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
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

  if (isCheckingSession) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </>
    );
  }

  if (!isValidSession && !isSuccess) {
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
                className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-xl text-center"
              >
                <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-xl font-bold mb-2">অবৈধ লিংক</h1>
                <p className="text-muted-foreground text-sm mb-6">
                  এই পাসওয়ার্ড রিসেট লিংকটি অবৈধ বা মেয়াদ উত্তীর্ণ হয়ে গেছে।
                  দয়া করে আবার চেষ্টা করুন।
                </p>
                <div className="space-y-2">
                  <Link to="/forgot-password">
                    <Button className="w-full gradient-primary">
                      নতুন লিংক পাঠান
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      লগইন পেজে ফিরে যান
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </>
    );
  }

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
                  <span className="gradient-text">নতুন পাসওয়ার্ড সেট করুন</span>
                </h1>
                <p className="text-muted-foreground text-sm">
                  আপনার নতুন পাসওয়ার্ড দিন
                </p>
              </div>

              {isSuccess ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-lg font-semibold">পাসওয়ার্ড আপডেট হয়েছে!</h2>
                  <p className="text-muted-foreground text-sm">
                    আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।
                    আপনাকে হোম পেজে নিয়ে যাওয়া হচ্ছে...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm">নতুন পাসওয়ার্ড</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        className="pl-10 pr-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm">পাসওয়ার্ড নিশ্চিত করুন</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="পাসওয়ার্ড আবার লিখুন"
                        className="pl-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full gradient-primary" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <Lock className="w-5 h-5 mr-2" />
                    )}
                    পাসওয়ার্ড আপডেট করুন
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ResetPassword;
