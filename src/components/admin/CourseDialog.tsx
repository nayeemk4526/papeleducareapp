import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCourse, useUpdateCourse, type CourseFormData } from "@/hooks/useAdminCourses";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useAdminTeachers } from "@/hooks/useAdminTeachers";

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: any;
}

const CourseDialog = ({ open, onOpenChange, course }: CourseDialogProps) => {
  const isEdit = !!course;
  const { data: categories } = useAdminCategories();
  const { data: teachers } = useAdminTeachers();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();

  const getInitialFormData = (): CourseFormData => ({
    title: course?.title || "",
    slug: course?.slug || "",
    description: course?.description || "",
    short_description: course?.short_description || "",
    price: course?.price || 0,
    discount_price: course?.discount_price || undefined,
    category_id: course?.category_id || "",
    instructor_id: course?.instructor_id || "",
    duration_hours: course?.duration_hours || undefined,
    total_lessons: course?.total_lessons || 0,
    thumbnail_url: course?.thumbnail_url || "",
    preview_video_url: course?.preview_video_url || "",
    how_to_enroll_video_url: course?.how_to_enroll_video_url || "",
    is_published: course?.is_published ?? false,
    is_featured: course?.is_featured ?? false,
  });

  const [formData, setFormData] = useState<CourseFormData>(getInitialFormData());

  // Reset form when course changes or dialog opens
  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData());
    }
  }, [open, course]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up form data - convert empty strings to null for UUID fields
    const cleanedData: CourseFormData = {
      ...formData,
      category_id: formData.category_id || undefined,
      instructor_id: formData.instructor_id || undefined,
      thumbnail_url: formData.thumbnail_url || undefined,
      preview_video_url: formData.preview_video_url || undefined,
      how_to_enroll_video_url: formData.how_to_enroll_video_url || undefined,
      short_description: formData.short_description || undefined,
      description: formData.description || undefined,
    };
    
    if (isEdit) {
      await updateCourse.mutateAsync({ id: course.id, ...cleanedData });
    } else {
      await createCourse.mutateAsync(cleanedData);
    }
    
    onOpenChange(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "কোর্স সম্পাদনা করুন" : "নতুন কোর্স যোগ করুন"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">কোর্সের নাম *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    title: e.target.value,
                    slug: formData.slug || generateSlug(e.target.value)
                  });
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">স্লাগ *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">সংক্ষিপ্ত বিবরণ</Label>
            <Input
              id="short_description"
              value={formData.short_description || ""}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">বিস্তারিত বিবরণ</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">ক্যাটাগরি</Label>
              <Select 
                value={formData.category_id || undefined} 
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ক্যাটাগরি নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructor">শিক্ষক</Label>
              <Select 
                value={formData.instructor_id || undefined} 
                onValueChange={(value) => setFormData({ ...formData, instructor_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="শিক্ষক নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  {teachers?.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">মূল্য (৳) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_price">ডিসকাউন্ট মূল্য (৳)</Label>
              <Input
                id="discount_price"
                type="number"
                value={formData.discount_price || ""}
                onChange={(e) => setFormData({ ...formData, discount_price: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_hours">সময়কাল (ঘন্টা)</Label>
              <Input
                id="duration_hours"
                type="number"
                value={formData.duration_hours || ""}
                onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail_url">থাম্বনেইল URL</Label>
            <Input
              id="thumbnail_url"
              value={formData.thumbnail_url || ""}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preview_video_url">প্রিভিউ ভিডিও URL (YouTube)</Label>
              <Input
                id="preview_video_url"
                value={formData.preview_video_url || ""}
                onChange={(e) => setFormData({ ...formData, preview_video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="how_to_enroll_video_url">কিভাবে কিনবেন ভিডিও URL</Label>
              <Input
                id="how_to_enroll_video_url"
                value={formData.how_to_enroll_video_url || ""}
                onChange={(e) => setFormData({ ...formData, how_to_enroll_video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
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
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
              <Label htmlFor="is_featured">ফিচার্ড</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              বাতিল
            </Button>
            <Button 
              type="submit" 
              disabled={createCourse.isPending || updateCourse.isPending}
              className="gradient-primary"
            >
              {createCourse.isPending || updateCourse.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseDialog;
