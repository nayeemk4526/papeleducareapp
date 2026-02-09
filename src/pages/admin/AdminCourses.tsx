import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Eye, BookOpen, MoreHorizontal, Video, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
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
import CourseDialog from "@/components/admin/CourseDialog";
import LessonDialog from "@/components/admin/LessonDialog";
import EnrollmentDialog from "@/components/admin/EnrollmentDialog";
import { useAdminCourses, useDeleteCourse } from "@/hooks/useAdminCourses";
import { useAdminLessons } from "@/hooks/useAdminLessons";
import { Link, useNavigate } from "react-router-dom";

const AdminCourses = () => {
  const navigate = useNavigate();
  const { data: courses, isLoading } = useAdminCourses();
  const deleteCourse = useDeleteCourse();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  const filteredCourses = courses?.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (course: any) => {
    setSelectedCourse(course);
    setCourseDialogOpen(true);
  };

  const handleAddLesson = (course: any) => {
    setSelectedCourse(course);
    setLessonDialogOpen(true);
  };

  const handleEnrollStudent = (course: any) => {
    setSelectedCourse(course);
    setEnrollmentDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCourseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (courseToDelete) {
      await deleteCourse.mutateAsync(courseToDelete);
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="কোর্স ম্যানেজমেন্ট">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="কোর্স ম্যানেজমেন্ট" subtitle="সকল কোর্স পরিচালনা করুন">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="কোর্স খুঁজুন..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          className="gradient-primary"
          onClick={() => {
            setSelectedCourse(null);
            setCourseDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          নতুন কোর্স যোগ করুন
        </Button>
      </div>

      {/* Courses Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">কোর্স</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">ক্যাটাগরি</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">ইন্সট্রাক্টর</th>
                <th className="text-left p-4 font-medium">মূল্য</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">স্ট্যাটাস</th>
                <th className="text-right p-4 font-medium">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <tr key={course.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          {course.thumbnail_url ? (
                            <img
                              src={course.thumbnail_url}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{course.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {course.total_students} জন শিক্ষার্থী • {course.total_lessons} লেসন
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="px-2 py-1 rounded-full bg-secondary/10 text-secondary text-xs">
                        {course.category?.name || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm">
                      {course.instructor?.name || "N/A"}
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="font-medium">৳{course.price.toLocaleString()}</span>
                        {course.discount_price && (
                          <span className="text-xs text-muted-foreground line-through ml-2">
                            ৳{course.discount_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        course.is_published 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {course.is_published ? "প্রকাশিত" : "ড্রাফট"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/course/${course.slug}`}>
                          <Button size="icon" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/admin/courses/${course.id}`)}>
                              <BookOpen className="w-4 h-4 mr-2" />
                              কনটেন্ট ম্যানেজ
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(course)}>
                              <Edit className="w-4 h-4 mr-2" />
                              সম্পাদনা
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddLesson(course)}>
                              <Video className="w-4 h-4 mr-2" />
                              লেসন যোগ করুন
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEnrollStudent(course)}>
                              <Users className="w-4 h-4 mr-2" />
                              স্টুডেন্ট এনরোল
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(course.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              মুছে ফেলুন
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    কোনো কোর্স পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Course Dialog */}
      <CourseDialog
        open={courseDialogOpen}
        onOpenChange={setCourseDialogOpen}
        course={selectedCourse}
      />

      {/* Lesson Dialog */}
      {selectedCourse && (
        <LessonDialog
          open={lessonDialogOpen}
          onOpenChange={setLessonDialogOpen}
          courseId={selectedCourse.id}
        />
      )}

      {/* Enrollment Dialog */}
      {selectedCourse && (
        <EnrollmentDialog
          open={enrollmentDialogOpen}
          onOpenChange={setEnrollmentDialogOpen}
          courseId={selectedCourse.id}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
            <AlertDialogDescription>
              এই কোর্সটি মুছে ফেললে এর সাথে সম্পর্কিত সকল লেসন, ম্যাটেরিয়াল এবং এনরোলমেন্ট মুছে যাবে।
              এই কাজটি ফিরিয়ে আনা যাবে না।
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

export default AdminCourses;
