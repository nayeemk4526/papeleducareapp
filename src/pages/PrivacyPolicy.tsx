import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            প্রাইভেসি পলিসি
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground">১. তথ্য সংগ্রহ</h2>
              <p>
                পাপেল এডু-কেয়ার আপনার ব্যক্তিগত তথ্য সংগ্রহ ও সংরক্ষণ করে শুধুমাত্র আপনাকে 
                উন্নত সেবা প্রদানের জন্য। আমরা নিম্নলিখিত তথ্য সংগ্রহ করি:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li>নাম, ইমেইল, ফোন নম্বর</li>
                <li>পেমেন্ট সংক্রান্ত তথ্য (বিকাশ/নগদ ট্রানজেকশন আইডি)</li>
                <li>কোর্স এনরোলমেন্ট ও প্রগ্রেস ডেটা</li>
                <li>ব্রাউজার ও ডিভাইস সম্পর্কিত তথ্য</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">২. তথ্যের ব্যবহার</h2>
              <p>আপনার তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করা হয়:</p>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li>একাউন্ট তৈরি ও পরিচালনা</li>
                <li>কোর্স অ্যাক্সেস ও কন্টেন্ট ডেলিভারি</li>
                <li>পেমেন্ট প্রসেসিং ও ভেরিফিকেশন</li>
                <li>কাস্টমার সাপোর্ট প্রদান</li>
                <li>সেবা উন্নতি ও নতুন ফিচার ডেভেলপমেন্ট</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">৩. তথ্য সুরক্ষা</h2>
              <p>
                আমরা আপনার তথ্য সুরক্ষিত রাখতে শিল্প-মানের নিরাপত্তা ব্যবস্থা ব্যবহার করি। 
                আপনার ডেটা এনক্রিপ্টেড সার্ভারে সংরক্ষণ করা হয় এবং অননুমোদিত অ্যাক্সেস থেকে 
                সুরক্ষিত রাখা হয়।
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">৪. তৃতীয় পক্ষের সাথে শেয়ারিং</h2>
              <p>
                আমরা আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করি না। 
                শুধুমাত্র পেমেন্ট প্রসেসিং পার্টনার (বিকাশ, নগদ) এবং আইনি প্রয়োজনে তথ্য শেয়ার করা হতে পারে।
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">৫. কুকিজ</h2>
              <p>
                আমাদের ওয়েবসাইট কুকিজ ব্যবহার করে আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে। 
                আপনি ব্রাউজার সেটিংস থেকে কুকিজ নিয়ন্ত্রণ করতে পারেন।
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">৬. যোগাযোগ</h2>
              <p>
                প্রাইভেসি সংক্রান্ত কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন: 
                <strong className="text-foreground"> info@papeleducare.com</strong>
              </p>
            </section>

            <p className="text-sm border-t border-border pt-6 mt-8">
              সর্বশেষ আপডেট: ফেব্রুয়ারি ২০২৬
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
