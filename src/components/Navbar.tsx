import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "হোম", href: "/" },
  { name: "কোর্সসমূহ", href: "/courses" },
  { name: "আমাদের সম্পর্কে", href: "/about" },
  { name: "যোগাযোগ", href: "/contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "bg-background/95 backdrop-blur-md py-2 shadow-lg border-b border-border/50" 
            : "bg-background py-3",
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo - Left */}
            <Link to="/" className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-vibrant-pink flex items-center justify-center shadow-lg"
              >
                <span className="text-xl font-bold text-white">প</span>
              </motion.div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-secondary via-vibrant-pink to-primary bg-clip-text text-transparent">
                  পাপেল এডু-কেয়ার
                </h1>
                <p className="text-xs text-muted-foreground -mt-0.5">শিক্ষার নতুন দিগন্ত</p>
              </div>
            </Link>

            {/* Navigation - Center (Desktop) */}
            <div className="hidden lg:flex items-center gap-1 bg-muted/50 rounded-full p-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                    location.pathname === link.href
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-foreground hover:text-primary hover:bg-muted",
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Side - Theme Toggle & Auth Buttons */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                className="rounded-full w-10 h-10 hover:bg-muted"
              >
                <AnimatePresence mode="wait">
                  {theme === "light" ? (
                    <motion.div
                      key="moon"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>

              {/* Auth Buttons (Desktop) */}
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" className="font-medium text-foreground hover:text-primary">
                    লগইন
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-secondary to-vibrant-pink hover:from-secondary/90 hover:to-vibrant-pink/90 text-white font-medium px-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                    রেজিস্টার
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div className="absolute right-0 top-0 bottom-0 w-72 bg-card border-l border-border p-6 pt-20 shadow-xl">
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      className={cn(
                        "block px-4 py-3 rounded-xl text-base font-medium transition-all",
                        location.pathname === link.href 
                          ? "bg-gradient-to-r from-secondary to-vibrant-pink text-white" 
                          : "hover:bg-muted",
                      )}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                <div className="border-t border-border my-4" />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col gap-2"
                >
                  <Link to="/login">
                    <Button variant="outline" className="w-full font-medium rounded-xl">
                      লগইন
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="w-full bg-gradient-to-r from-secondary to-vibrant-pink text-white font-medium rounded-xl">
                      রেজিস্টার
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
