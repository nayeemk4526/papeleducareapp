import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Facebook,
  Youtube,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";

const quickLinks = [
  { name: "হোম", href: "/" },
  { name: "কোর্সসমূহ", href: "/courses" },
  { name: "আমাদের সম্পর্কে", href: "/about" },
  { name: "যোগাযোগ", href: "/contact" },
  { name: "প্রাইভেসি পলিসি", href: "/privacy" },
  { name: "রিফান্ড পলিসি", href: "/refund" },
];

const categories = [
  { name: "ডিপ্লোমা ডায়নামিক কোর্স", href: "/diploma-dynamic" },
  { name: "এসএসসি কোর্স", href: "/category/ssc" },
  { name: "এইচএসসি কোর্স", href: "/category/hsc" },
  { name: "স্কিল ডেভেলপমেন্ট", href: "/category/skill-development" },
  { name: "অ্যাডমিশন প্রস্তুতি", href: "/category/admission" },
];

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/papeleducare", color: "hover:text-blue-500" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com/@papeleducare", color: "hover:text-red-500" },
  { name: "WhatsApp", icon: MessageCircle, href: "https://wa.me/8801XXXXXXXXX", color: "hover:text-green-500" },
];

const Footer = () => {
  return (
    <footer className="relative bg-card border-t border-border mb-16 lg:mb-0">
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-vibrant-pink to-primary" />

      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-secondary to-vibrant-pink flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">প</span>
              </div>
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-secondary via-vibrant-pink to-primary bg-clip-text text-transparent">
                  পাপেল এডু-কেয়ার
                </h3>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm mb-4">
              বাংলাদেশের সেরা অনলাইন শিক্ষা প্ল্যাটফর্ম। ডিপ্লোমা, এসএসসি, এইচএসসি এবং স্কিল ডেভেলপমেন্ট কোর্স।
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center transition-colors ${social.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">দ্রুত লিংক</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-foreground mb-4">ক্যাটাগরি</h4>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.href}>
                  <Link
                    to={category.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-foreground mb-4">যোগাযোগ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">+880 1XXX-XXXXXX</p>
                  <p className="text-xs text-muted-foreground">সকাল ৯টা - রাত ১০টা</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">info@papeleducare.com</p>
                  <p className="text-xs text-muted-foreground">২৪ ঘন্টার মধ্যে উত্তর</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">ঢাকা, বাংলাদেশ</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © ২০২৪ পাপেল এডু-কেয়ার। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-primary transition-colors">
              শর্তাবলী
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              গোপনীয়তা
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
