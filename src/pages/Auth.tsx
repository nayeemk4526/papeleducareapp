import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { signUp, signIn, signUpSchema, signInSchema } from "@/lib/auth";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import logoImage from "@/assets/logo.png";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "login";
  const [isLogin, setIsLogin] = useState(defaultTab === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // OTP verification state
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [pendingRegisterData, setPendingRegisterData] = useState<typeof registerData | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({
          title: "Google লগইন ব্যর্থ",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Google লগইন ব্যর্থ",
        description: "দয়া করে আবার চেষ্টা করুন",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const validation = signInSchema.safeParse(loginData);
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      await signIn(loginData);
      toast({
        title: "সফলভাবে লগইন হয়েছে!",
        description: "আপনাকে স্বাগতম।",
      });
      navigate("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "লগইন করতে সমস্যা হয়েছে";
      toast({
        title: "লগইন ব্যর্থ",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async (phone: string) => {
    const response = await supabase.functions.invoke("send-otp", {
      body: { phone },
    });

    if (response.error) {
      throw new Error("OTP পাঠাতে সমস্যা হয়েছে");
    }

    const data = response.data;
    if (!data.success) {
      throw new Error(data.error || "OTP পাঠাতে সমস্যা হয়েছে");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (!registerData.agreeTerms) {
      setErrors({ agreeTerms: "শর্তাবলী মেনে নিতে হবে" });
      setIsLoading(false);
      return;
    }

    try {
      const validation = signUpSchema.safeParse(registerData);
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        setIsLoading(false);
        return;
      }

      // Send OTP to phone number
      await sendOtp(registerData.phone);
      setPendingRegisterData(registerData);
      setShowOtpVerification(true);
      setResendTimer(60);
      
      toast({
        title: "OTP পাঠানো হয়েছে!",
        description: `${registerData.phone} নম্বরে একটি ভেরিফিকেশন কোড পাঠানো হয়েছে।`,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "রেজিস্ট্রেশন করতে সমস্যা হয়েছে";
      toast({
        title: "সমস্যা হয়েছে",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6 || !pendingRegisterData) return;
    
    setOtpLoading(true);
    try {
      // Verify OTP
      const verifyResponse = await supabase.functions.invoke("verify-otp", {
        body: { phone: pendingRegisterData.phone, otp: otpValue },
      });

      if (verifyResponse.error) {
        throw new Error("ভেরিফিকেশন করতে সমস্যা হয়েছে");
      }

      const verifyData = verifyResponse.data;
      if (!verifyData.success) {
        throw new Error(verifyData.error || "ভুল OTP");
      }

      // OTP verified, now register the user
      await signUp(pendingRegisterData);
      
      toast({
        title: "রেজিস্ট্রেশন সফল!",
        description: "আপনার অ্যাকাউন্ট তৈরি হয়েছে। স্বাগতম!",
      });
      
      // Auto login after registration (since email auto-confirm is on)
      await signIn({ 
        email: pendingRegisterData.email, 
        password: pendingRegisterData.password 
      });
      
      navigate("/");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ভেরিফিকেশন করতে সমস্যা হয়েছে";
      toast({
        title: "ভেরিফিকেশন ব্যর্থ",
        description: message,
        variant: "destructive",
      });
      setOtpValue("");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || !pendingRegisterData) return;
    
    setOtpLoading(true);
    try {
      await sendOtp(pendingRegisterData.phone);
      setResendTimer(60);
      setOtpValue("");
      toast({
        title: "OTP পুনরায় পাঠানো হয়েছে!",
        description: `${pendingRegisterData.phone} নম্বরে নতুন কোড পাঠানো হয়েছে।`,
      });
    } catch (error) {
      toast({
        title: "সমস্যা হয়েছে",
        description: "OTP পাঠাতে সমস্যা হয়েছে, আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // OTP Verification Screen
  if (showOtpVerification && pendingRegisterData) {
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
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold mb-2">
                    <span className="gradient-text">ফোন ভেরিফিকেশন</span>
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    <span className="font-medium text-foreground">{pendingRegisterData.phone}</span> নম্বরে পাঠানো ৬ সংখ্যার কোডটি লিখুন
                  </p>
                </div>

                <div className="flex justify-center mb-6">
                  <InputOTP
                    maxLength={6}
                    value={otpValue}
                    onChange={(value) => setOtpValue(value)}
                    disabled={otpLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  className="w-full gradient-primary"
                  size="lg"
                  disabled={otpValue.length !== 6 || otpLoading}
                >
                  {otpLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 mr-2" />
                  )}
                  ভেরিফাই করুন
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    কোড পাননি?{" "}
                    {resendTimer > 0 ? (
                      <span className="text-primary font-medium">{resendTimer}s পর আবার পাঠান</span>
                    ) : (
                      <button
                        onClick={handleResendOtp}
                        className="text-primary font-medium hover:underline"
                        disabled={otpLoading}
                      >
                        আবার পাঠান
                      </button>
                    )}
                  </p>
                </div>

                <div className="text-center mt-4">
                  <button
                    onClick={() => {
                      setShowOtpVerification(false);
                      setPendingRegisterData(null);
                      setOtpValue("");
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← ফিরে যান
                  </button>
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
                  <span className="gradient-text">
                    {isLogin ? "লগইন করুন" : "রেজিস্টার করুন"}
                  </span>
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isLogin ? "আপনার অ্যাকাউন্টে প্রবেশ করুন" : "নতুন অ্যাকাউন্ট তৈরি করুন"}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex bg-muted rounded-xl p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    isLogin
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  লগইন
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                    !isLogin
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  রেজিস্টার
                </button>
              </div>

              {/* Login Form */}
              {isLogin ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm">ইমেইল</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="আপনার ইমেইল"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm">পাসওয়ার্ড</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="আপনার পাসওয়ার্ড"
                        className="pl-10 pr-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={loginData.remember}
                        onCheckedChange={(checked) => setLoginData({ ...loginData, remember: checked as boolean })}
                      />
                      <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                        মনে রাখুন
                      </label>
                    </div>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      পাসওয়ার্ড ভুলে গেছেন?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full gradient-primary" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="w-5 h-5 mr-2" />
                    )}
                    লগইন
                  </Button>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">অথবা</span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    Google দিয়ে লগইন
                  </Button>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className="text-sm">পূর্ণ নাম *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="reg-name"
                        placeholder="আপনার পূর্ণ নাম"
                        className="pl-10"
                        value={registerData.fullName}
                        onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-sm">ইমেইল *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="আপনার ইমেইল"
                        className="pl-10"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-phone" className="text-sm">ফোন নম্বর * <span className="text-xs text-muted-foreground">(ভেরিফিকেশন কোড পাঠানো হবে)</span></Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="reg-phone"
                        placeholder="01XXX-XXXXXX"
                        className="pl-10"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-sm">পাসওয়ার্ড *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        className="pl-10 pr-10"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
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
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm-password" className="text-sm">পাসওয়ার্ড নিশ্চিত করুন *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="reg-confirm-password"
                        type="password"
                        placeholder="পাসওয়ার্ড আবার লিখুন"
                        className="pl-10"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={registerData.agreeTerms}
                      onCheckedChange={(checked) => setRegisterData({ ...registerData, agreeTerms: checked as boolean })}
                      className="mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                      আমি{" "}
                      <Link to="/terms" className="text-primary hover:underline">শর্তাবলী</Link>{" "}
                      এবং{" "}
                      <Link to="/privacy" className="text-primary hover:underline">গোপনীয়তা নীতি</Link>{" "}
                      মেনে নিচ্ছি
                    </label>
                  </div>
                  {errors.agreeTerms && <p className="text-xs text-destructive">{errors.agreeTerms}</p>}

                  <Button type="submit" className="w-full gradient-primary" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="w-5 h-5 mr-2" />
                    )}
                    রেজিস্টার করুন
                  </Button>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">অথবা</span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    size="lg"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    Google দিয়ে রেজিস্টার
                  </Button>
                </form>
              )}

              {/* Switch Message */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                {isLogin ? (
                  <>
                    অ্যাকাউন্ট নেই?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="text-primary font-medium hover:underline"
                    >
                      রেজিস্টার করুন
                    </button>
                  </>
                ) : (
                  <>
                    ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className="text-primary font-medium hover:underline"
                    >
                      লগইন করুন
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Auth;
