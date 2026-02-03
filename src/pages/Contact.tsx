import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const contactInfo = [
  {
    icon: Phone,
    title: "ফোন",
    value: "+880 1XXX-XXXXXX",
    description: "সকাল ৯টা - রাত ১০টা",
    href: "tel:+8801XXXXXXXXX",
  },
  {
    icon: Mail,
    title: "ইমেইল",
    value: "info@papeleducare.com",
    description: "২৪ ঘন্টার মধ্যে উত্তর",
    href: "mailto:info@papeleducare.com",
  },
  {
    icon: MessageCircle,
    title: "হোয়াটসঅ্যাপ",
    value: "+880 1XXX-XXXXXX",
    description: "তাৎক্ষণিক সাপোর্ট",
    href: "https://wa.me/8801XXXXXXXXX",
  },
  {
    icon: MapPin,
    title: "ঠিকানা",
    value: "ঢাকা, বাংলাদেশ",
    description: "অফিস সময়: সকাল ১০টা - সন্ধ্যা ৬টা",
    href: "#",
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "বার্তা পাঠানো হয়েছে!",
      description: "আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।",
    });
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <>
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-12 md:py-24 overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                <span className="gradient-text">যোগাযোগ করুন</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground px-4">
                আমাদের সাথে যোগাযোগ করুন। যেকোনো প্রশ্ন বা সাহায্যের জন্য আমরা সবসময় প্রস্তুত।
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-8 md:py-12 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <motion.a
                    key={info.title}
                    href={info.href}
                    target={info.href.startsWith("http") ? "_blank" : undefined}
                    rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-card rounded-xl p-4 md:p-6 border border-border shadow-sm hover:shadow-lg transition-all text-center"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground mb-1 text-sm md:text-base">{info.title}</h3>
                    <p className="text-primary font-medium text-xs md:text-sm mb-1 break-all">{info.value}</p>
                    <p className="text-xs text-muted-foreground hidden md:block">{info.description}</p>
                  </motion.a>
                );
              })}
            </div>

            {/* Contact Form */}
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-6">
                  <span className="gradient-text">বার্তা পাঠান</span>
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">আপনার নাম *</Label>
                      <Input
                        id="name"
                        placeholder="আপনার নাম লিখুন"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">ইমেইল *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="আপনার ইমেইল"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm">ফোন নম্বর</Label>
                      <Input
                        id="phone"
                        placeholder="01XXX-XXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm">বিষয় *</Label>
                      <Input
                        id="subject"
                        placeholder="বার্তার বিষয়"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm">বার্তা *</Label>
                    <Textarea
                      id="message"
                      placeholder="আপনার বার্তা লিখুন..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full sm:w-auto gradient-primary btn-glow">
                    <Send className="w-4 h-4 mr-2" />
                    বার্তা পাঠান
                  </Button>
                </form>
              </motion.div>

              {/* Map */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-square lg:aspect-auto lg:h-full rounded-2xl overflow-hidden bg-muted border border-border">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d233667.49930878076!2d90.25487447178451!3d23.78088745804892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka!5e0!3m2!1sen!2sbd!4v1704500000000!5m2!1sen!2sbd"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "350px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Our Location"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Contact;
