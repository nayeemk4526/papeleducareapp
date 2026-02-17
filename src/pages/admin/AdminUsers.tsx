import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, User, UserPlus, Pencil, X, Save } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/admin/AdminLayout";
import EnrollmentDialog from "@/components/admin/EnrollmentDialog";
import { useAllUsers } from "@/hooks/useAdminEnrollments";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

const AdminUsers = () => {
  const { data: users, isLoading } = useAllUsers();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [viewUser, setViewUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", phone: "" });

  // Fetch user roles
  const { data: userRoles } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Fetch enrollments count per user
  const { data: enrollmentCounts } = useQuery({
    queryKey: ["enrollment-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("enrollments").select("user_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach(e => { counts[e.user_id] = (counts[e.user_id] || 0) + 1; });
      return counts;
    },
  });

  // Fetch user enrollments for detail view
  const { data: viewUserEnrollments } = useQuery({
    queryKey: ["user-enrollments", viewUser?.user_id],
    queryFn: async () => {
      if (!viewUser) return [];
      const { data } = await supabase
        .from("enrollments")
        .select("*, course:courses(title, thumbnail_url)")
        .eq("user_id", viewUser.user_id);
      return data || [];
    },
    enabled: !!viewUser,
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await supabase.from("user_roles").delete().eq("user_id", userId);
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

  const updateProfile = useMutation({
    mutationFn: async ({ id, full_name, phone }: { id: string; full_name: string; phone: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name, phone: phone || null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      setEditUser(null);
      toast({ title: "সফল!", description: "প্রোফাইল আপডেট হয়েছে" });
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

  const handleEdit = (user: UserProfile) => {
    setEditForm({ full_name: user.full_name, phone: user.phone || "" });
    setEditUser(user);
  };

  const handleSaveEdit = () => {
    if (!editUser) return;
    updateProfile.mutate({ id: editUser.id, full_name: editForm.full_name, phone: editForm.phone });
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
          <Input placeholder="ইউজার খুঁজুন..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Button className="gradient-primary" onClick={() => setEnrollmentDialogOpen(true)}>
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
                            <img src={u.avatar_url} alt={u.full_name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                              {u.full_name.charAt(0)}
                            </div>
                          )}
                          <span className="font-medium">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">{u.email}</td>
                      <td className="p-4 hidden lg:table-cell text-sm text-muted-foreground">{u.phone || "-"}</td>
                      <td className="p-4">
                        <Select value={role} onValueChange={(value) => updateRole.mutate({ userId: u.user_id, role: value })}>
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
                      <td className="p-4 hidden lg:table-cell">{enrollmentCounts?.[u.user_id] || 0}টি কোর্স</td>
                      <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">{format(new Date(u.created_at), "dd/MM/yyyy")}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" title="বিস্তারিত দেখুন" onClick={() => setViewUser(u as UserProfile)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="এডিট করুন" onClick={() => handleEdit(u as UserProfile)}>
                            <Pencil className="w-4 h-4" />
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

      {/* View User Dialog */}
      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>ইউজার বিস্তারিত</DialogTitle>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {viewUser.avatar_url ? (
                  <img src={viewUser.avatar_url} alt={viewUser.full_name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
                    {viewUser.full_name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-lg">{viewUser.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{viewUser.email}</p>
                  {viewUser.phone && <p className="text-sm text-muted-foreground">{viewUser.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">রোল</p>
                  <p className="font-medium mt-1">{getRoleBadge(getUserRole(viewUser.user_id))}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">যোগদানের তারিখ</p>
                  <p className="font-medium mt-1">{format(new Date(viewUser.created_at), "dd/MM/yyyy")}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">এনরোলমেন্ট ({viewUserEnrollments?.length || 0})</h4>
                {viewUserEnrollments && viewUserEnrollments.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {viewUserEnrollments.map((e: any) => (
                      <div key={e.id} className="flex items-center gap-3 bg-muted/30 rounded-lg p-2">
                        <div className="w-12 h-8 rounded bg-muted overflow-hidden flex-shrink-0">
                          {e.course?.thumbnail_url ? (
                            <img src={e.course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{e.course?.title}</p>
                          <p className="text-xs text-muted-foreground">{e.progress_percentage || 0}% সম্পন্ন</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">কোনো এনরোলমেন্ট নেই</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ইউজার এডিট করুন</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>পুরো নাম</Label>
              <Input value={editForm.full_name} onChange={(e) => setEditForm(f => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div>
              <Label>ফোন নম্বর</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <Label>ইমেইল</Label>
              <Input value={editUser?.email || ""} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground mt-1">ইমেইল পরিবর্তন করা যাবে না</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>বাতিল</Button>
            <Button onClick={handleSaveEdit} disabled={updateProfile.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updateProfile.isPending ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enrollment Dialog */}
      <EnrollmentDialog open={enrollmentDialogOpen} onOpenChange={setEnrollmentDialogOpen} />
    </AdminLayout>
  );
};

export default AdminUsers;
