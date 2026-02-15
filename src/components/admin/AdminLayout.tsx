import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, BookOpen, Users, CreditCard, LayoutGrid, 
  GraduationCap, Ticket, ArrowLeft, FileText, Settings, Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: "ড্যাশবোর্ড", href: "/admin", icon: LayoutDashboard },
  { label: "কোর্স", href: "/admin/courses", icon: BookOpen },
  { label: "ক্যাটাগরি", href: "/admin/categories", icon: LayoutGrid },
  { label: "শিক্ষক", href: "/admin/teachers", icon: GraduationCap },
  { label: "ইউজার", href: "/admin/users", icon: Users },
  { label: "পেমেন্ট", href: "/admin/payments", icon: CreditCard },
  { label: "পেমেন্ট সেটিংস", href: "/admin/payment-settings", icon: Settings },
  { label: "কুপন কোড", href: "/admin/coupons", icon: Ticket },
  { label: "টেস্টিমোনিয়াল", href: "/admin/testimonials", icon: FileText },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AdminLayout = ({ children, title, subtitle }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate("/auth", { replace: true });
      } else if (!isAdmin) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-lg">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              সাইটে ফিরুন
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-card border-r border-border min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
          <div className="flex overflow-x-auto scrollbar-hide">
            {menuItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-4 py-2 min-w-[70px] text-xs font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
