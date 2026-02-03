import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCourseBySlug } from "@/hooks/useCourses";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Course Detail Components
import CourseHero from "@/components/course-detail/CourseHero";
import CoursePricingCard from "@/components/course-detail/CoursePricingCard";
import CourseCurriculum from "@/components/course-detail/CourseCurriculum";
import CourseMaterialsSection from "@/components/course-detail/CourseMaterialsSection";
import CourseReviews from "@/components/course-detail/CourseReviews";
import InstructorSection from "@/components/course-detail/InstructorSection";
import WhatYouLearn from "@/components/course-detail/WhatYouLearn";
import VideoDialog from "@/components/course-detail/VideoDialog";

const CourseDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { data: course, isLoading: courseLoading } = useCourseBySlug(slug || "");
  
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
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">কোর্স পাওয়া যায়নি</h1>
            <p className="text-muted-foreground mb-6">
              দুঃখিত, আপনি যে কোর্সটি খুঁজছেন তা পাওয়া যায়নি।
            </p>
            <Button onClick={() => navigate("/courses")}>সব কোর্স দেখুন</Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <main className="pt-20 min-h-screen">
        {/* Hero Section with Featured Image */}
        <CourseHero 
          course={course} 
          onPlayPreview={() => setShowPreviewVideo(true)} 
        />

        {/* Course Content */}
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 order-2 lg:order-1">
                {/* Course Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-8"
                >
                  <h2 className="text-2xl font-bold mb-4">কোর্স সম্পর্কে</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                    {course.description ? (
                      <p className="whitespace-pre-line">{course.description}</p>
                    ) : (
                      <p>এই কোর্সে আপনি বিভিন্ন গুরুত্বপূর্ণ বিষয় শিখবেন।</p>
                    )}
                  </div>
                </motion.div>

                {/* What You'll Learn */}
                <WhatYouLearn courseId={course.id} />

                {/* Curriculum */}
                <CourseCurriculum 
                  courseId={course.id}
                  totalLessons={course.total_lessons || 0}
                  durationHours={course.duration_hours || 0}
                />

                {/* Course Materials */}
                <CourseMaterialsSection courseId={course.id} />

                {/* Instructor */}
                <InstructorSection instructor={course.instructor} />

                {/* Reviews */}
                <CourseReviews courseId={course.id} />
              </div>

              {/* Sidebar - Pricing Card */}
              <div className="lg:col-span-1 order-1 lg:order-2">
                <CoursePricingCard
                  course={course}
                  onPlayPreview={() => setShowPreviewVideo(true)}
                  onPlayHowToEnroll={() => setShowHowToBuyVideo(true)}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Preview Video Dialog */}
      <VideoDialog
        open={showPreviewVideo}
        onOpenChange={setShowPreviewVideo}
        title="প্রিভিউ ভিডিও"
        videoUrl={course.preview_video_url || ""}
      />

      {/* How to Buy Video Dialog */}
      <VideoDialog
        open={showHowToBuyVideo}
        onOpenChange={setShowHowToBuyVideo}
        title="কিভাবে কোর্সটি কিনবেন?"
        videoUrl={course.how_to_enroll_video_url || ""}
      />
    </>
  );
};

export default CourseDetail;
