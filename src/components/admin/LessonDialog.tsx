import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateLesson, useUpdateLesson, type LessonFormData } from "@/hooks/useAdminLessons";

interface LessonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  sectionId?: string;
  lesson?: any;
  nextOrder?: number;
}

const LessonDialog = ({ open, onOpenChange, courseId, sectionId, lesson, nextOrder = 1 }: LessonDialogProps) => {
  const isEdit = !!lesson;
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();

  const [formData, setFormData] = useState<LessonFormData>({
    course_id: courseId,
    section_id: sectionId,
    title: "",
    description: "",
    video_url: "",
    video_duration_minutes: undefined,
    lesson_order: nextOrder,
    is_free_preview: false,
    is_published: true,
    materials_url: "",
  });

  useEffect(() => {
    if (lesson) {
      setFormData({
        course_id: courseId,
        section_id: lesson.section_id || sectionId,
        title: lesson.title || "",
        description: lesson.description || "",
        video_url: lesson.video_url || "",
        video_duration_minutes: lesson.video_duration_minutes || undefined,
        lesson_order: lesson.lesson_order || nextOrder,
        is_free_preview: lesson.is_free_preview ?? false,
        is_published: lesson.is_published ?? true,
        materials_url: lesson.materials_url || "",
      });
    } else {
      setFormData({
        course_id: courseId,
        section_id: sectionId,
        title: "",
        description: "",
        video_url: "",
        video_duration_minutes: undefined,
        lesson_order: nextOrder,
        is_free_preview: false,
        is_published: true,
        materials_url: "",
      });
    }
  }, [lesson, courseId, sectionId, nextOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEdit) {
      await updateLesson.mutateAsync({ id: lesson.id, ...formData });
    } else {
      await createLesson.mutateAsync(formData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "লেসন সম্পাদনা করুন" : "নতুন লেসন যোগ করুন"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">লেসনের নাম *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">বিবরণ</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">ভিডিও URL</Label>
            <Input
              id="video_url"
              value={formData.video_url || ""}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://youtube.com/watch?v=... or Vimeo URL"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video_duration_minutes">ভিডিওর সময়কাল (মিনিট)</Label>
              <Input
                id="video_duration_minutes"
                type="number"
                value={formData.video_duration_minutes || ""}
                onChange={(e) => setFormData({ ...formData, video_duration_minutes: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson_order">ক্রম নম্বর</Label>
              <Input
                id="lesson_order"
                type="number"
                value={formData.lesson_order}
                onChange={(e) => setFormData({ ...formData, lesson_order: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="materials_url">ম্যাটেরিয়াল URL</Label>
            <Input
              id="materials_url"
              value={formData.materials_url || ""}
              onChange={(e) => setFormData({ ...formData, materials_url: e.target.value })}
              placeholder="PDF, Docs, etc."
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <Label htmlFor="is_published">প্রকাশিত</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_free_preview"
                checked={formData.is_free_preview}
                onCheckedChange={(checked) => setFormData({ ...formData, is_free_preview: checked })}
              />
              <Label htmlFor="is_free_preview">ফ্রি প্রিভিউ</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              বাতিল
            </Button>
            <Button 
              type="submit" 
              disabled={createLesson.isPending || updateLesson.isPending}
              className="gradient-primary"
            >
              {createLesson.isPending || updateLesson.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LessonDialog;
