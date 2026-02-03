import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useManualEnrollment, useAllUsers } from "@/hooks/useAdminEnrollments";
import { useAdminCourses } from "@/hooks/useAdminCourses";
import { Search, UserPlus } from "lucide-react";

interface EnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId?: string;
}

const EnrollmentDialog = ({ open, onOpenChange, courseId }: EnrollmentDialogProps) => {
  const { data: users } = useAllUsers();
  const { data: courses } = useAdminCourses();
  const enrollUser = useManualEnrollment();

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || "");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users?.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId || !selectedCourseId) return;

    await enrollUser.mutateAsync({
      userId: selectedUserId,
      courseId: selectedCourseId,
    });
    
    onOpenChange(false);
    setSelectedUserId("");
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            ম্যানুয়াল এনরোলমেন্ট
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!courseId && (
            <div className="space-y-2">
              <Label htmlFor="course">কোর্স নির্বাচন করুন *</Label>
              <Select 
                value={selectedCourseId} 
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="কোর্স নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>ব্যবহারকারী খুঁজুন *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
                className="pl-10"
              />
            </div>
          </div>

          {searchTerm && (
            <div className="max-h-48 overflow-y-auto border border-border rounded-lg">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUserId(user.user_id)}
                    className={`p-3 cursor-pointer hover:bg-muted transition-colors border-b border-border last:border-0 ${
                      selectedUserId === user.user_id ? "bg-primary/10" : ""
                    }`}
                  >
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.phone && (
                      <p className="text-xs text-muted-foreground">{user.phone}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-muted-foreground">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
              )}
            </div>
          )}

          {selectedUserId && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary font-medium">
                নির্বাচিত: {users?.find(u => u.user_id === selectedUserId)?.full_name}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              বাতিল
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedUserId || !selectedCourseId || enrollUser.isPending}
              className="gradient-primary"
            >
              {enrollUser.isPending ? "এনরোল হচ্ছে..." : "এনরোল করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentDialog;
