import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import MobileNavigation from "@/components/MobileNavigation";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Courses from "./pages/Courses";
import DiplomaDynamic from "./pages/DiplomaDynamic";
import SemesterPage from "./pages/SemesterPage";
import CategoryPage from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import TermsConditions from "./pages/TermsConditions";

// Dashboard Pages
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import MyCourses from "./pages/dashboard/MyCourses";
import CoursePlayer from "./pages/dashboard/CoursePlayer";
import PaymentHistory from "./pages/dashboard/PaymentHistory";
import ProfileSettings from "./pages/dashboard/ProfileSettings";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCourseManagement from "./pages/admin/AdminCourseManagement";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminTeachers from "./pages/admin/AdminTeachers";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminPaymentSettings from "./pages/admin/AdminPaymentSettings";

// Course Pages
import CourseDetail from "./pages/CourseDetail";
import Checkout from "./pages/Checkout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen pb-20 lg:pb-0">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/course/:slug" element={<CourseDetail />} />
                <Route path="/checkout/:courseId" element={<Checkout />} />
                <Route path="/diploma-dynamic" element={<DiplomaDynamic />} />
                <Route path="/semester/:id" element={<SemesterPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/refund" element={<RefundPolicy />} />
                <Route path="/terms" element={<TermsConditions />} />

                {/* Student Dashboard Routes */}
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/dashboard/courses" element={<MyCourses />} />
                <Route path="/dashboard/course/:courseId" element={<CoursePlayer />} />
                <Route path="/dashboard/payments" element={<PaymentHistory />} />
                <Route path="/dashboard/profile" element={<ProfileSettings />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/courses" element={<AdminCourses />} />
                <Route path="/admin/courses/:courseId" element={<AdminCourseManagement />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/payments" element={<AdminPayments />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/teachers" element={<AdminTeachers />} />
                <Route path="/admin/coupons" element={<AdminCoupons />} />
                <Route path="/admin/testimonials" element={<AdminTestimonials />} />
                <Route path="/admin/payment-settings" element={<AdminPaymentSettings />} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <MobileNavigation />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
