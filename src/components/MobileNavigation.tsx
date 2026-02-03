import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Grid3X3, LayoutDashboard, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "হোম", href: "/", icon: Home },
  { name: "ক্যাটাগরি", href: "/categories", icon: Grid3X3 },
  { name: "ড্যাসবোর্ড", href: "/dashboard", icon: LayoutDashboard },
  { name: "প্রোফাইল", href: "/profile", icon: User },
];

const MobileNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass border-t border-border">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              className="relative flex flex-col items-center py-2 px-4"
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
                    className="absolute -top-2 w-12 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-5 h-5", isActive && "text-primary")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
