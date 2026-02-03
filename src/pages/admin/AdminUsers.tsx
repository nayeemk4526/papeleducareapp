import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Shield, User, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import EnrollmentDialog from "@/components/admin/EnrollmentDialog";
import { useAllUsers } from "@/hooks/useAdminEnrollments";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const AdminUsers = () => {
  const { data: users, isLoading } = useAllUsers();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);

  // Fetch user roles
  const { data: userRoles } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch enrollments count per user
  const { data: enrollmentCounts } = useQuery({
    queryKey: ["enrollment-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("user_id");
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach(e => {
        counts[e.user_id] = (counts[e.user_id] || 0) + 1;
      });
      return counts;
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // Delete existing role
      await supabase.from("user_roles").delete().eq("user_id", userId);
      
      // Insert new role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: role as "student" | "admin" | "teacher" });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      toast({ title: "সফল!", description: "রোল আপডেট হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });

  const getUserRole = (userId: string) => {
    const role = userRoles?.find(r => r.user_id === userId);
    return role?.role || "student";
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs">অ্যাডমিন</span>;
      case "teacher":
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">শিক্ষক</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">শিক্ষার্থী</span>;
    }
  };

  const filteredUsers = users?.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phone && u.phone.includes(searchTerm))
  ) || [];

  if (isLoading) {
    return (
      <AdminLayout title="ইউজার ম্যানেজমেন্ট">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="ইউজার ম্যানেজমেন্ট" subtitle="সকল ইউজার পরিচালনা করুন">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="ইউজার খুঁজুন..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          className="gradient-primary"
          onClick={() => setEnrollmentDialogOpen(true)}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          ম্যানুয়াল এনরোলমেন্ট
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">ইউজার</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">ইমেইল</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">ফোন</th>
                <th className="text-left p-4 font-medium">রোল</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">এনরোলমেন্ট</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">যোগদান</th>
                <th className="text-right p-4 font-medium">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const role = getUserRole(u.user_id);
                  return (
                    <tr key={u.id} className="border-t border-border hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {u.avatar_url ? (
                            <img 
                              src={u.avatar_url} 
                              alt={u.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                              {u.full_name.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                        {u.email}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">
                        {u.phone || "-"}
                      </td>
                      <td className="p-4">
                        <Select
                          value={role}
                          onValueChange={(value) => updateRole.mutate({ userId: u.user_id, role: value })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>{getRoleBadge(role)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">শিক্ষার্থী</SelectItem>
                            <SelectItem value="teacher">শিক্ষক</SelectItem>
                            <SelectItem value="admin">অ্যাডমিন</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {enrollmentCounts?.[u.user_id] || 0}টি কোর্স
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                        {format(new Date(u.created_at), "dd/MM/yyyy")}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    কোনো ইউজার পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrollment Dialog */}
      <EnrollmentDialog
        open={enrollmentDialogOpen}
        onOpenChange={setEnrollmentDialogOpen}
      />
    </AdminLayout>
  );
};

export default AdminUsers;
