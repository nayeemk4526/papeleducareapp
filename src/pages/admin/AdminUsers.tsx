import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Eye, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth", { replace: true });
      } else if (!isAdmin) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Placeholder users
  const users = [
    { id: 1, name: "মোহাম্মদ রাকিব", email: "rakib@example.com", role: "student", enrollments: 3, joinedAt: "২০২৪-০১-১৫" },
    { id: 2, name: "সাবরিনা আক্তার", email: "sabrina@example.com", role: "student", enrollments: 5, joinedAt: "২০২৪-০১-১০" },
    { id: 3, name: "তানভীর আহমেদ", email: "tanvir@example.com", role: "teacher", enrollments: 0, joinedAt: "২০২৩-১২-২০" },
    { id: 4, name: "নুসরাত জাহান", email: "nusrat@example.com", role: "admin", enrollments: 0, joinedAt: "২০২৩-১১-০১" },
  ];

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs">অ্যাডমিন</span>;
      case "teacher":
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">শিক্ষক</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">শিক্ষার্থী</span>;
    }
  };

  return (
    <>
      <Navbar />
      
      <main className="pt-20 min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              <span className="gradient-text">ইউজার ম্যানেজমেন্ট</span>
            </h1>
            <p className="text-muted-foreground">সকল ইউজার পরিচালনা করুন</p>
          </motion.div>

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="ইউজার খুঁজুন..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Users Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">ইউজার</th>
                    <th className="text-left p-4 font-medium hidden md:table-cell">ইমেইল</th>
                    <th className="text-left p-4 font-medium">রোল</th>
                    <th className="text-left p-4 font-medium hidden lg:table-cell">এনরোলমেন্ট</th>
                    <th className="text-left p-4 font-medium hidden md:table-cell">যোগদান</th>
                    <th className="text-right p-4 font-medium">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t border-border hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                        {u.email}
                      </td>
                      <td className="p-4">
                        {getRoleBadge(u.role)}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {u.enrollments}টি কোর্স
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                        {u.joinedAt}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Shield className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AdminUsers;
