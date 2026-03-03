import { useState } from "react";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import GlobalLoader from "@/components/GlobalLoader";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import RunningCourses from "@/components/RunningCourses";
import WhyChooseUs from "@/components/WhyChooseUs";
import AllCourses from "@/components/AllCourses";
import Statistics from "@/components/Statistics";
import Testimonials from "@/components/Testimonials";
import TeachersPanel from "@/components/TeachersPanel";
import Footer from "@/components/Footer";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <SEO title="হোম" description="Papel Edu-Care - বাংলাদেশের সেরা অনলাইন শিক্ষা প্ল্যাটফর্ম। দক্ষ শিক্ষকদের সাথে মানসম্মত কোর্সে ভর্তি হন।" keywords="অনলাইন কোর্স, বাংলাদেশ, শিক্ষা, পাপেল এডু-কেয়ার" />
      {isLoading && <GlobalLoader onLoadingComplete={() => setIsLoading(false)} />}
      
      <div className={isLoading ? "hidden" : ""}>
        <Navbar />
        
        <main>
          <HeroSlider />
          <CategoryGrid />
          <RunningCourses />
          <WhyChooseUs />
          <AllCourses />
          <Statistics />
          <Testimonials />
          <TeachersPanel />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;
