import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="রিফান্ড নীতি" description="Papel Edu-Care এর রিফান্ড নীতি। কোর্স ফেরত সংক্রান্ত শর্তাবলী জানুন।" />
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            রিফান্ড পলিসি
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground">১. রিফান্ড যোগ্যতা</h2>
              <p>
                পাপেল এডু-কেয়ার শিক্ষার্থীদের সন্তুষ্টিকে সর্বোচ্চ প্রাধান্য দেয়। 
                নিম্নলিখিত শর্তে রিফান্ড আবেদন করা যাবে:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li>কোর্স কেনার ৩ দিনের মধ্যে রিফান্ড আবেদন করতে হবে</li>
                <li>কোর্সের ২০% এর বেশি কন্টেন্ট দেখা যাবে না</li>
                <li>কোনো সার্টিফিকেট বা ম্যাটেরিয়াল ডাউনলোড করা থাকলে রিফান্ড প্রযোজ্য হবে না</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">২. রিফান্ড প্রক্রিয়া</h2>
              <p>রিফান্ড পেতে নিম্নলিখিত ধাপ অনুসরণ করুন:</p>
              <ol className="list-decimal list-inside space-y-2 mt-3">
                <li>আমাদের সাপোর্ট টিমে যোগাযোগ করুন (ইমেইল বা ফোনে)</li>
                <li>আপনার অর্ডার আইডি এবং রিফান্ডের কারণ জানান</li>
                <li>আমাদের টিম ৪৮ ঘন্টার মধ্যে আপনার আবেদন পর্যালোচনা করবে</li>
                <li>অনুমোদিত হলে ৫-৭ কার্যদিবসের মধ্যে রিফান্ড প্রসেস করা হবে</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">৩. রিফান্ড পদ্ধতি</h2>
              <p>
                রিফান্ড আপনার মূল পেমেন্ট পদ্ধতিতে (বিকাশ/নগদ/রকেট) ফেরত দেওয়া হবে। 
                ব্যাংক ট্রান্সফারের ক্ষেত্রে অতিরিক্ত ২-৩ কার্যদিবস সময় লাগতে পারে।
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">৪. যেসব ক্ষেত্রে রিফান্ড প্রযোজ্য নয়</h2>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li>কোর্স কেনার ৩ দিন পরে আবেদন করলে</li>
                <li>কোর্সের ২০% এর বেশি কন্টেন্ট দেখা থাকলে</li>
                <li>ডিসকাউন্ট বা কুপন কোড ব্যবহার করে কেনা কোর্সের ক্ষেত্রে</li>
                <li>বিনামূল্যের কোর্সের ক্ষেত্রে</li>
                <li>একাউন্ট সাসপেন্ড বা নিষিদ্ধ হলে</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">৫. আংশিক রিফান্ড</h2>
              <p>
                কিছু ক্ষেত্রে আমরা আংশিক রিফান্ড প্রদান করতে পারি, যা কোর্সের ব্যবহারের 
                পরিমাণ ও পরিস্থিতির উপর নির্ভর করবে।
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">৬. যোগাযোগ</h2>
              <p>
                রিফান্ড সংক্রান্ত যেকোনো প্রশ্নের জন্য যোগাযোগ করুন:
              </p>
              <ul className="list-none space-y-2 mt-3">
                <li>📧 ইমেইল: <strong className="text-foreground">info@papeleducare.com</strong></li>
                <li>📞 ফোন: <strong className="text-foreground">+880 1XXX-XXXXXX</strong></li>
                <li>⏰ সময়: সকাল ৯টা - রাত ১০টা</li>
              </ul>
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

export default RefundPolicy;
