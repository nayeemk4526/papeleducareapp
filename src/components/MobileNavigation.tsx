import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Grid3X3, LayoutDashboard, User, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const MobileNavigation = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const navItems = [
    { name: "হোম", href: "/", icon: Home },
    { name: "কোর্স", href: "/courses", icon: Grid3X3 },
    { 
      name: isAdmin ? "অ্যাডমিন" : "ড্যাশবোর্ড", 
      href: isAdmin ? "/admin" : "/dashboard", 
      icon: isAdmin ? Settings : LayoutDashboard,
      requiresAuth: true 
    },
    { 
      name: "প্রোফাইল", 
      href: user ? "/dashboard/profile" : "/auth", 
      icon: User 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/95 backdrop-blur-md border-t border-border safe-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || 
            (item.href !== "/" && location.pathname.startsWith(item.href));

          // Skip auth-required items if not logged in
          if (item.requiresAuth && !user) {
            return null;
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className="relative flex flex-col items-center py-2 px-3 min-w-[60px]"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute -top-0 w-10 h-1 rounded-full bg-gradient-to-r from-secondary to-vibrant-pink"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <div
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    isActive && "bg-primary/10"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                </div>
                <span className={cn("text-[10px] font-medium", isActive && "text-primary")}>
                  {item.name}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
