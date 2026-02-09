import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import TeacherDialog from "@/components/admin/TeacherDialog";
import { useAdminTeachers, useDeleteTeacher } from "@/hooks/useAdminTeachers";

const AdminTeachers = () => {
  const { data: teachers, isLoading } = useAdminTeachers();
  const deleteTeacher = useDeleteTeacher();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);

  const filteredTeachers = teachers?.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (teacher: any) => {
    setSelectedTeacher(teacher);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTeacherToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (teacherToDelete) {
      await deleteTeacher.mutateAsync(teacherToDelete);
      setDeleteDialogOpen(false);
      setTeacherToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="শিক্ষক ম্যানেজমেন্ট">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="শিক্ষক ম্যানেজমেন্ট" subtitle="সকল শিক্ষক পরিচালনা করুন">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="শিক্ষক খুঁজুন..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          className="gradient-primary"
          onClick={() => {
            setSelectedTeacher(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          নতুন শিক্ষক যোগ করুন
        </Button>
      </div>

      {/* Teachers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher, index) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {teacher.avatar_url ? (
                    <img
                      src={teacher.avatar_url}
                      alt={teacher.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold">
                      {teacher.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{teacher.name}</h3>
                    <p className="text-sm text-muted-foreground">{teacher.title}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(teacher)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-destructive"
                    onClick={() => handleDelete(teacher.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {teacher.bio || "কোনো বিবরণ নেই"}
              </p>
              {teacher.specializations && teacher.specializations.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {teacher.specializations.slice(0, 3).map((spec: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{teacher.email}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  teacher.is_active 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}>
                  {teacher.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full bg-card rounded-xl p-12 border border-border text-center">
            <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">কোনো শিক্ষক পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      {/* Teacher Dialog */}
      <TeacherDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        teacher={selectedTeacher}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
            <AlertDialogDescription>
              এই শিক্ষককে মুছে ফেললে তার সাথে সম্পর্কিত কোর্সগুলোতে শিক্ষক থাকবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminTeachers;
