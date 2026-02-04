import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMySQLAuth } from "@/hooks/useMySQLAuth";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Navbar from "@/components/Navbar";
import logoImage from "@/assets/logo.png";
import { z } from "zod";

// Validation schemas
const registerStep1Schema = z.object({
  phone: z.string().min(11, "সঠিক ফোন নম্বর দিন").max(14, "সঠিক ফোন নম্বর দিন"),
});

const registerStep2Schema = z.object({
  otp: z.string().length(6, "৬ সংখ্যার OTP দিন"),
});

const registerStep3Schema = z.object({
  fullName: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  email: z.string().email("সঠিক ইমেইল দিন"),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "পাসওয়ার্ড মিলছে না",
  path: ["confirmPassword"],
});

const signInSchema = z.object({
  identifier: z.string().min(1, "ইমেইল বা ফোন নম্বর দিন"),
  password: z.string().min(1, "পাসওয়ার্ড দিন"),
});

type RegisterStep = 'phone' | 'otp' | 'details';

const AuthMySQL = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "login";
  const [isLogin, setIsLogin] = useState(defaultTab === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Registration steps
  const [registerStep, setRegisterStep] = useState<RegisterStep>('phone');
  const [otpCountdown, setOtpCountdown] = useState(0);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading, sendOTP, verifyOTPAndRegister, resendOTP, signIn } = useMySQLAuth();

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
    remember: false,
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    phone: "",
    otp: "",
    fullName: "",
    email: "",
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

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

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

      await signIn(loginData.identifier, loginData.password);
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

  // Step 1: Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const validation = registerStep1Schema.safeParse({ phone: registerData.phone });
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

      const result = await sendOTP(registerData.phone);
      
      if (result.success) {
        toast({
          title: "OTP পাঠানো হয়েছে",
          description: "আপনার ফোনে ৬ সংখ্যার কোড পাঠানো হয়েছে",
        });
        setRegisterStep('otp');
        setOtpCountdown(120); // 2 minutes
        
        // For development - show OTP in console
        if (result.dev_otp) {
          console.log('Development OTP:', result.dev_otp);
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "OTP পাঠাতে সমস্যা হয়েছে";
      toast({
        title: "ত্রুটি",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = registerStep2Schema.safeParse({ otp: registerData.otp });
    if (!validation.success) {
      setErrors({ otp: "৬ সংখ্যার OTP দিন" });
      return;
    }

    // Move to details step
    setRegisterStep('details');
  };

  // Step 3: Complete registration
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (!registerData.agreeTerms) {
      setErrors({ agreeTerms: "শর্তাবলী মেনে নিতে হবে" });
      setIsLoading(false);
      return;
    }

    try {
      const validation = registerStep3Schema.safeParse({
        fullName: registerData.fullName,
        email: registerData.email,
        password: registerData.password,
        confirmPassword: registerData.confirmPassword,
      });
      
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

      const result = await verifyOTPAndRegister({
        phone: registerData.phone,
        otp: registerData.otp,
        full_name: registerData.fullName,
        email: registerData.email,
        password: registerData.password,
      });

      if (result.success) {
        toast({
          title: "রেজিস্ট্রেশন সফল!",
          description: "আপনার অ্যাকাউন্ট তৈরি হয়েছে।",
        });
        navigate("/");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "রেজিস্ট্রেশন করতে সমস্যা হয়েছে";
      toast({
        title: "রেজিস্ট্রেশন ব্যর্থ",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (otpCountdown > 0) return;
    
    setIsLoading(true);
    try {
      const result = await resendOTP(registerData.phone);
      if (result.success) {
        toast({
          title: "নতুন OTP পাঠানো হয়েছে",
          description: "আপনার ফোনে নতুন কোড পাঠানো হয়েছে",
        });
        setOtpCountdown(120);
        setRegisterData(prev => ({ ...prev, otp: "" }));
        
        if (result.dev_otp) {
          console.log('Development OTP:', result.dev_otp);
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "OTP পাঠাতে সমস্যা হয়েছে";
      toast({
        title: "ত্রুটি",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset registration
  const handleResetRegistration = () => {
    setRegisterStep('phone');
    setRegisterData({
      phone: "",
      otp: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    });
    setErrors({});
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
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
                  {isLogin ? "আপনার অ্যাকাউন্টে প্রবেশ করুন" : 
                    registerStep === 'phone' ? "আপনার ফোন নম্বর দিন" :
                    registerStep === 'otp' ? "OTP কোড দিন" :
                    "আপনার তথ্য দিন"}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex bg-muted rounded-xl p-1 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true);
                    handleResetRegistration();
                  }}
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
                    <Label htmlFor="login-identifier" className="text-sm">ইমেইল / ফোন নম্বর</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="login-identifier"
                        type="text"
                        placeholder="ইমেইল অথবা ফোন নম্বর"
                        className="pl-10"
                        value={loginData.identifier}
                        onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.identifier && <p className="text-xs text-destructive">{errors.identifier}</p>}
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
                </form>
              ) : (
                /* Register Forms */
                <AnimatePresence mode="wait">
                  {/* Step 1: Phone Number */}
                  {registerStep === 'phone' && (
                    <motion.form
                      key="phone-step"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleSendOTP}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="reg-phone" className="text-sm">ফোন নম্বর *</Label>
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
                        <p className="text-xs text-muted-foreground">
                          এই নম্বরে OTP কোড পাঠানো হবে
                        </p>
                      </div>

                      <Button type="submit" className="w-full gradient-primary" size="lg" disabled={isLoading}>
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                          <ArrowRight className="w-5 h-5 mr-2" />
                        )}
                        OTP পাঠান
                      </Button>
                    </motion.form>
                  )}

                  {/* Step 2: OTP Verification */}
                  {registerStep === 'otp' && (
                    <motion.form
                      key="otp-step"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleVerifyOTP}
                      className="space-y-4"
                    >
                      <button
                        type="button"
                        onClick={() => setRegisterStep('phone')}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        ফোন নম্বর পরিবর্তন করুন
                      </button>

                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          OTP পাঠানো হয়েছে
                        </p>
                        <p className="font-medium">{registerData.phone}</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">৬ সংখ্যার OTP কোড</Label>
                        <div className="flex justify-center">
                          <InputOTP
                            maxLength={6}
                            value={registerData.otp}
                            onChange={(value) => setRegisterData({ ...registerData, otp: value })}
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
                        {errors.otp && <p className="text-xs text-destructive text-center">{errors.otp}</p>}
                      </div>

                      <div className="text-center">
                        {otpCountdown > 0 ? (
                          <p className="text-sm text-muted-foreground">
                            পুনরায় পাঠাতে পারবেন {Math.floor(otpCountdown / 60)}:{String(otpCountdown % 60).padStart(2, '0')} মিনিটে
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOTP}
                            disabled={isLoading}
                            className="flex items-center gap-1 text-sm text-primary hover:underline mx-auto"
                          >
                            <RefreshCw className="w-4 h-4" />
                            পুনরায় OTP পাঠান
                          </button>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full gradient-primary" 
                        size="lg" 
                        disabled={registerData.otp.length !== 6}
                      >
                        <ArrowRight className="w-5 h-5 mr-2" />
                        যাচাই করুন
                      </Button>
                    </motion.form>
                  )}

                  {/* Step 3: User Details */}
                  {registerStep === 'details' && (
                    <motion.form
                      key="details-step"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleCompleteRegistration}
                      className="space-y-4"
                    >
                      <button
                        type="button"
                        onClick={() => setRegisterStep('otp')}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        পিছনে যান
                      </button>

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
                            type={showPassword ? "text" : "password"}
                            placeholder="পাসওয়ার্ড পুনরায় দিন"
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
                          id="agree-terms"
                          checked={registerData.agreeTerms}
                          onCheckedChange={(checked) => setRegisterData({ ...registerData, agreeTerms: checked as boolean })}
                        />
                        <label htmlFor="agree-terms" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                          আমি{" "}
                          <Link to="/terms" className="text-primary hover:underline">
                            শর্তাবলী
                          </Link>{" "}
                          ও{" "}
                          <Link to="/privacy" className="text-primary hover:underline">
                            গোপনীয়তা নীতি
                          </Link>{" "}
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
                    </motion.form>
                  )}
                </AnimatePresence>
              )}

              {/* Footer */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                {isLogin ? (
                  <>
                    অ্যাকাউন্ট নেই?{" "}
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className="text-primary hover:underline font-medium"
                    >
                      রেজিস্টার করুন
                    </button>
                  </>
                ) : (
                  <>
                    আগে থেকেই অ্যাকাউন্ট আছে?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(true);
                        handleResetRegistration();
                      }}
                      className="text-primary hover:underline font-medium"
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

export default AuthMySQL;
