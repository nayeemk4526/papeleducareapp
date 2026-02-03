import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  Building2,
  TrendingUp,
  Lightbulb,
  PenTool,
  Settings,
  type LucideIcon,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  href: string;
  special?: boolean;
  badge?: string;
}

const categories: Category[] = [
  {
    id: 1,
    name: "নবম শ্রেণি (ভোকেশনাল)",
    icon: BookOpen,
    gradient: "from-primary to-primary/80",
    iconBg: "bg-gradient-to-br from-primary to-primary/70",
    href: "/category/class-9",
  },
  {
    id: 2,
    name: "দশম শ্রেণি (ভোকেশনাল)",
    icon: GraduationCap,
    gradient: "from-accent to-primary",
    iconBg: "bg-gradient-to-br from-accent to-primary",
    href: "/category/class-10",
  },
  {
    id: 3,
    name: "একাদশ শ্রেণি (ভোক & বিএমটি)",
    icon: Layers,
    gradient: "from-accent to-secondary",
    iconBg: "bg-gradient-to-br from-accent via-primary to-secondary",
    href: "/category/class-11",
  },
  {
    id: 4,
    name: "দ্বাদশ শ্রেণি (ভোক & বিএমটি)",
    icon: FileText,
    gradient: "from-vibrant-pink to-secondary",
    iconBg: "bg-gradient-to-br from-vibrant-pink/80 to-vibrant-pink/50",
    href: "/category/class-12",
  },
  {
    id: 5,
    name: "ডিপ্লোমা ডায়নামিক কোর্স",
    icon: Settings,
    gradient: "from-golden to-vibrant-pink",
    iconBg: "bg-gradient-to-br from-golden via-vibrant-pink to-secondary",
    href: "/diploma-dynamic",
    special: true,
    badge: "৭ সেমিস্টার",
  },
  {
    id: 6,
    name: "ডিপ্লোমা কেয়ার কোর্স",
    icon: Layers,
    gradient: "from-secondary to-vibrant-pink",
    iconBg: "bg-gradient-to-br from-secondary/80 to-secondary/50",
    href: "/category/diploma-care",
  },
  {
    id: 7,
    name: "এডমিশন (ডিপ্লোমা & ডুয়েট)",
    icon: Building2,
    gradient: "from-primary to-accent",
    iconBg: "bg-gradient-to-br from-primary to-accent",
    href: "/category/admission",
  },
  {
    id: 8,
    name: "স্কিল ডেভেলপমেন্ট",
    icon: TrendingUp,
    gradient: "from-accent to-secondary",
    iconBg: "bg-gradient-to-br from-accent to-secondary",
    href: "/category/skill-development",
  },
  {
    id: 9,
    name: "সুপার সাজেশন",
    icon: Lightbulb,
    gradient: "from-vibrant-pink to-golden",
    iconBg: "bg-gradient-to-br from-vibrant-pink/60 to-vibrant-pink/30",
    href: "/category/super-suggestion",
  },
  {
    id: 10,
    name: "অটো ক্যাড",
    icon: PenTool,
    gradient: "from-secondary to-vibrant-pink",
    iconBg: "bg-gradient-to-br from-secondary via-vibrant-pink to-golden",
    href: "/category/autocad",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const CategoryGrid = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-5 py-2 rounded-full border border-secondary/30 text-secondary text-sm font-medium mb-6 bg-secondary/5"
          >
            আমাদের ক্যাটাগরিসমূহ
          </motion.span>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-foreground">শিক্ষার সকল ক্ষেত্রে </span>
            <span className="bg-gradient-to-r from-secondary via-vibrant-pink to-primary bg-clip-text text-transparent">
              আমরা আছি
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            আপনার পছন্দের ক্যাটাগরি বাছাই করুন এবং শেখার যাত্রা শুরু করুন
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5"
        >
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.div key={category.id} variants={itemVariants}>
                <Link to={category.href} className="group block h-full">
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative h-full bg-card rounded-2xl p-5 md:p-6 border transition-all duration-300 ${
                      category.special
                        ? "border-golden/60 shadow-lg shadow-golden/10 ring-2 ring-golden/20"
                        : "border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                    }`}
                  >
                    {/* Subtle gradient background */}
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${category.gradient} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300`}
                    />

                    {/* Special Badge */}
                    {category.special && category.badge && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-vibrant-pink to-golden text-white shadow-sm">
                        {category.badge}
                      </span>
                    )}

                    {/* Icon */}
                    <div
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-xl ${category.iconBg} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                    >
                      <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                      {category.name}
                    </h3>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryGrid;
