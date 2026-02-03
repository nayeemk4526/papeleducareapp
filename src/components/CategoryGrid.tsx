import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  Code,
  Lightbulb,
  FileText,
  PenTool,
  Layers,
  Cpu,
} from "lucide-react";

const categories = [
  {
    id: 1,
    name: "নবম শ্রেণি (ভোকেশনাল)",
    icon: BookOpen,
    color: "from-blue-500 to-blue-600",
    href: "/category/class-9",
  },
  {
    id: 2,
    name: "দশম শ্রেণি (ভোকেশনাল)",
    icon: GraduationCap,
    color: "from-purple-500 to-purple-600",
    href: "/category/class-10",
  },
  {
    id: 3,
    name: "একাদশ শ্রেণি",
    icon: Award,
    color: "from-cyan-500 to-cyan-600",
    href: "/category/class-11",
  },
  {
    id: 4,
    name: "দ্বাদশ শ্রেণি",
    icon: Briefcase,
    color: "from-pink-500 to-pink-600",
    href: "/category/class-12",
  },
  {
    id: 5,
    name: "ডিপ্লোমা ডায়নামিক কোর্স",
    icon: Layers,
    color: "from-orange-500 to-orange-600",
    href: "/diploma-dynamic",
    special: true,
  },
  {
    id: 6,
    name: "ডিপ্লোমা কেয়ার কোর্স",
    icon: FileText,
    color: "from-green-500 to-green-600",
    href: "/category/diploma-care",
  },
  {
    id: 7,
    name: "এডমিশন",
    icon: PenTool,
    color: "from-red-500 to-red-600",
    href: "/category/admission",
  },
  {
    id: 8,
    name: "স্কিল ডেভেলপমেন্ট",
    icon: Code,
    color: "from-indigo-500 to-indigo-600",
    href: "/category/skill-development",
  },
  {
    id: 9,
    name: "সুপার সাজেশন",
    icon: Lightbulb,
    color: "from-yellow-500 to-yellow-600",
    href: "/category/super-suggestion",
  },
  {
    id: 10,
    name: "অটো ক্যাড",
    icon: Cpu,
    color: "from-teal-500 to-teal-600",
    href: "/category/autocad",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const CategoryGrid = () => {
  return (
    <section className="section-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="section-heading">
          <span className="gradient-text">আমাদের ক্যাটাগরি সমূহ</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          আপনার প্রয়োজন অনুযায়ী ক্যাটাগরি বেছে নিন এবং আজই শেখা শুরু করুন
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
      >
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <motion.div key={category.id} variants={itemVariants}>
              <Link
                to={category.href}
                className="group block"
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative bg-card rounded-2xl p-4 md:p-6 border border-border shadow-sm card-hover-glow overflow-hidden"
                >
                  {/* Background Gradient on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  {/* Special Badge */}
                  {category.special && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary text-primary-foreground">
                      বিশেষ
                    </span>
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 md:mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {category.name}
                  </h3>

                  {/* Arrow indicator */}
                  <motion.div
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -10 }}
                    whileHover={{ x: 0 }}
                  >
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default CategoryGrid;
