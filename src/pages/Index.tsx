import { useState } from "react";
import Navbar from "@/components/Navbar";
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
