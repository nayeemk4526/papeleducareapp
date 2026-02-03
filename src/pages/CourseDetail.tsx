import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, PlayCircle, Clock, Users, Star, BookOpen, 
  CheckCircle, FileText, Calendar, Award, Play, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCourseBySlug } from "@/hooks/useCourses";
import { useIsEnrolled } from "@/hooks/useEnrollments";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { user } = useAuth();
  const { data: course, isLoading: courseLoading } = useCourseBySlug(slug || "");
  const { data: isEnrolled } = useIsEnrolled(course?.id || "");
  
  const [showPreviewVideo, setShowPreviewVideo] = useState(false);
  const [showHowToBuyVideo, setShowHowToBuyVideo] = useState(false);

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <main className="pt-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">কোর্স পাওয়া যায়নি</h1>
            <Button onClick={() => navigate("/courses")}>সব কোর্স দেখুন</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const features = [
    { icon: PlayCircle, label: `${course.total_lessons || 0} টি ভিডিও লেসন` },
    { icon: Clock, label: `${course.duration_hours || 0} ঘন্টা` },
    { icon: FileText, label: "ডাউনলোডযোগ্য রিসোর্স" },
    { icon: Award, label: "সার্টিফিকেট" },
    { icon: Calendar, label: "লাইফটাইম অ্যাক্সেস" },
  ];

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("embed/")) return url;
    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <>
      <Navbar />
      
      <main className="pt-20 min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 py-8 md:py-16">
          <div className="container mx-auto px-4">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              ফিরে যান
            </Button>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Course Info */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {course.category && (
                    <span className="inline-block px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
                      {course.category.name}
                    </span>
                  )}
                  <h1 className="text-2xl md:text-4xl font-bold mb-4">{course.title}</h1>
                  <p className="text-muted-foreground mb-6">{course.short_description}</p>

                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                        {course.instructor?.name?.charAt(0) || "T"}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{course.instructor?.name}</p>
                        <p className="text-xs text-muted-foreground">{course.instructor?.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">4.8</span>
                      <span className="text-muted-foreground text-sm">(১২৩ রিভিউ)</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{course.total_students} জন শিক্ষার্থী</span>
                    </div>
                  </div>

                  {/* Preview Video Section */}
                  {course.preview_video_url && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative aspect-video rounded-2xl overflow-hidden bg-muted mb-6 cursor-pointer group"
                      onClick={() => setShowPreviewVideo(true)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-secondary/80 to-vibrant-pink/80 flex items-center justify-center">
                        <div className="text-center">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-all"
                          >
                            <Play className="w-10 h-10 text-white fill-white" />
                          </motion.div>
                          <p className="text-white font-medium text-lg">প্রিভিউ ভিডিও দেখুন</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </div>

              {/* Pricing Card */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border shadow-lg sticky top-24"
                >
                  <div className="aspect-video bg-muted rounded-xl overflow-hidden mb-4 relative group cursor-pointer"
                    onClick={() => course.preview_video_url && setShowPreviewVideo(true)}
                  >
                    {course.thumbnail_url ? (
                      <>
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        {course.preview_video_url && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-12 h-12 text-white fill-white" />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
                        <BookOpen className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    {course.discount_price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-primary">
                          ৳{course.discount_price.toLocaleString()}
                        </span>
                        <span className="text-lg text-muted-foreground line-through">
                          ৳{course.price.toLocaleString()}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
                          {Math.round((1 - course.discount_price / course.price) * 100)}% ছাড়
                        </span>
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-primary">
                        ৳{course.price.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {isEnrolled ? (
                    <Button
                      className="w-full gradient-primary mb-3"
                      size="lg"
                      onClick={() => navigate(`/dashboard/course/${course.id}`)}
                    >
                      <PlayCircle className="w-5 h-5 mr-2" />
                      কোর্স চালিয়ে যান
                    </Button>
                  ) : (
                    <Button
                      className="w-full gradient-primary mb-3"
                      size="lg"
                      onClick={() => {
                        if (!user) {
                          navigate("/auth");
                        } else {
                          navigate(`/checkout/${course.id}`);
                        }
                      }}
                    >
                      এখনই এনরোল করুন
                    </Button>
                  )}

                  {/* How to Buy Button */}
                  {course.how_to_enroll_video_url && (
                    <Button
                      variant="outline"
                      className="w-full mb-4"
                      onClick={() => setShowHowToBuyVideo(true)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      কিভাবে কোর্সটি কিনবেন?
                    </Button>
                  )}

                  <div className="space-y-3">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Icon className="w-4 h-4 text-primary" />
                          <span>{feature.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold mb-4">কোর্স সম্পর্কে</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {course.description || "এই কোর্সে আপনি বিভিন্ন গুরুত্বপূর্ণ বিষয় শিখবেন।"}
                </div>
              </motion.div>

              {/* What You'll Learn */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 border border-border mb-8"
              >
                <h3 className="text-xl font-bold mb-4">যা শিখবেন</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "বেসিক থেকে অ্যাডভান্সড কনসেপ্ট",
                    "হ্যান্ডস-অন প্র্যাক্টিস",
                    "রিয়েল-ওয়ার্ল্ড প্রজেক্ট",
                    "ইন্ডাস্ট্রি স্ট্যান্ডার্ড টেকনিক",
                    "প্রফেশনাল টিপস ও ট্রিকস",
                    "সার্টিফিকেশন প্রস্তুতি",
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Instructor Section */}
              {course.instructor && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-card rounded-xl p-6 border border-border mb-8"
                >
                  <h3 className="text-xl font-bold mb-4">কোর্স ইনস্ট্রাক্টর</h3>
                  <div className="flex items-start gap-4">
                    {course.instructor.avatar_url ? (
                      <img
                        src={course.instructor.avatar_url}
                        alt={course.instructor.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
                        {course.instructor.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-lg">{course.instructor.name}</h4>
                      <p className="text-primary text-sm mb-2">{course.instructor.title}</p>
                      <p className="text-muted-foreground text-sm">{course.instructor.bio}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Preview Video Dialog */}
      <Dialog open={showPreviewVideo} onOpenChange={setShowPreviewVideo}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>প্রিভিউ ভিডিও</span>
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            {course.preview_video_url && (
              <iframe
                src={getYoutubeEmbedUrl(course.preview_video_url)}
                title="Course Preview"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* How to Buy Video Dialog */}
      <Dialog open={showHowToBuyVideo} onOpenChange={setShowHowToBuyVideo}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>কিভাবে কোর্সটি কিনবেন?</span>
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video">
            {course.how_to_enroll_video_url && (
              <iframe
                src={getYoutubeEmbedUrl(course.how_to_enroll_video_url)}
                title="How to Enroll"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CourseDetail;
