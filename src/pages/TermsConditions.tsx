import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="শর্তাবলী" description="Papel Edu-Care এর ব্যবহারের শর্তাবলী। সেবা ব্যবহারের আগে শর্তাবলী পড়ুন।" />
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            শর্তাবলী
          </h1>

          <div className="prose prose-lg max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground">১. সাধারণ শর্তাবলী</h2>
              <p>
                পাপেল এডু-কেয়ার ওয়েবসাইট ব্যবহার করার মাধ্যমে আপনি এই শর্তাবলী মেনে চলতে সম্মত হচ্ছেন।
                এই শর্তাবলী আপনার এবং পাপেল এডু-কেয়ার এর মধ্যে একটি আইনি চুক্তি হিসেবে কাজ করবে।
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">২. একাউন্ট নিবন্ধন</h2>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li>একাউন্ট তৈরি করতে সঠিক ও সম্পূর্ণ তথ্য প্রদান করতে হবে</li>
                <li>আপনার একাউন্টের নিরাপত্তা রক্ষা করা আপনার দায়িত্ব</li>
                <li>পাসওয়ার্ড গোপন রাখতে হবে এবং অন্য কাউকে শেয়ার করা যাবে না</li>
                <li>একাউন্টে কোনো অননুমোদিত ব্যবহার হলে অবিলম্বে জানাতে হবে</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">৩. কোর্স ও কন্টেন্ট</h2>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li>কোর্সের সকল কন্টেন্ট পাপেল এডু-কেয়ার এর মেধাস্বত্ব দ্বারা সুরক্ষিত</li>
                <li>কোর্স কন্টেন্ট ডাউনলোড, কপি, শেয়ার বা পুনঃবিতরণ করা সম্পূর্ণ নিষিদ্ধ</li>
                <li>কোর্সের অ্যাক্সেস শুধুমাত্র ক্রেতার ব্যক্তিগত ব্যবহারের জন্য</li>
                <li>কোর্স কন্টেন্ট রেকর্ড করা বা স্ক্রিনশট নেওয়া নিষিদ্ধ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">৪. পেমেন্ট শর্তাবলী</h2>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li>সকল মূল্য বাংলাদেশী টাকায় (BDT) প্রদর্শিত</li>
                <li>পেমেন্ট বিকাশ, নগদ, রকেট বা অন্যান্য অনুমোদিত মাধ্যমে গ্রহণ করা হয়</li>
                <li>পেমেন্ট সফল হলে কোর্সে স্বয়ংক্রিয়ভাবে এনরোল হয়ে যাবে</li>
                <li>মূল্য পরিবর্তনের অধিকার পাপেল এডু-কেয়ার সংরক্ষণ করে</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">৫. নিষিদ্ধ কার্যকলাপ</h2>
              <p>নিম্নলিখিত কার্যকলাপ সম্পূর্ণ নিষিদ্ধ:</p>
              <ul className="list-disc list-inside space-y-2 mt-3">
                <li>অন্যের একাউন্ট ব্যবহার বা হ্যাক করার চেষ্টা</li>
                <li>ওয়েবসাইটের নিরাপত্তা ব্যবস্থা ভাঙার চেষ্টা</li>
                <li>স্প্যাম, ম্যালওয়্যার বা ক্ষতিকর কন্টেন্ট প্রচার</li>
                <li>মিথ্যা তথ্য দিয়ে একাউন্ট তৈরি</li>
                <li>কোর্স কন্টেন্ট বাণিজ্যিকভাবে ব্যবহার</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">৬. একাউন্ট স্থগিতকরণ</h2>
              <p>
                শর্তাবলী লঙ্ঘন করলে পাপেল এডু-কেয়ার যেকোনো সময় আপনার একাউন্ট স্থগিত বা বাতিল 
                করার অধিকার রাখে। এক্ষেত্রে কোনো রিফান্ড প্রদান করা হবে না।
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">৭. দায়বদ্ধতার সীমাবদ্ধতা</h2>
              <p>
                পাপেল এডু-কেয়ার কোর্স কন্টেন্টের মান বজায় রাখার চেষ্টা করে, তবে কোনো নির্দিষ্ট 
                ফলাফলের নিশ্চয়তা প্রদান করে না। পরীক্ষার ফলাফল বা চাকরি প্রাপ্তির জন্য 
                পাপেল এডু-কেয়ার দায়ী নয়।
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">৮. শর্তাবলী পরিবর্তন</h2>
              <p>
                পাপেল এডু-কেয়ার যেকোনো সময় এই শর্তাবলী পরিবর্তন করার অধিকার রাখে। 
                পরিবর্তনের পর ওয়েবসাইট ব্যবহার অব্যাহত রাখলে আপনি নতুন শর্তাবলী মেনে নিয়েছেন বলে ধরা হবে।
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground">৯. যোগাযোগ</h2>
              <p>
                শর্তাবলী সংক্রান্ত কোনো প্রশ্ন থাকলে যোগাযোগ করুন:
              </p>
              <ul className="list-none space-y-2 mt-3">
                <li>📧 ইমেইল: <strong className="text-foreground">info@papeleducare.com</strong></li>
                <li>📞 ফোন: <strong className="text-foreground">+880 1XXX-XXXXXX</strong></li>
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

export default TermsConditions;
