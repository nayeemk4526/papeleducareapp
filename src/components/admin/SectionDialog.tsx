import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateSection, useUpdateSection, type SectionFormData } from "@/hooks/useAdminSections";

interface SectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  section?: any;
  nextOrder?: number;
}

const SectionDialog = ({ open, onOpenChange, courseId, section, nextOrder = 1 }: SectionDialogProps) => {
  const isEdit = !!section;
  const createSection = useCreateSection();
  const updateSection = useUpdateSection();

  const [formData, setFormData] = useState<SectionFormData>({
    course_id: courseId,
    title: "",
    description: "",
    section_order: nextOrder,
    is_published: true,
  });

  useEffect(() => {
    if (section) {
      setFormData({
        course_id: courseId,
        title: section.title || "",
        description: section.description || "",
        section_order: section.section_order || nextOrder,
        is_published: section.is_published ?? true,
      });
    } else {
      setFormData({
        course_id: courseId,
        title: "",
        description: "",
        section_order: nextOrder,
        is_published: true,
      });
    }
  }, [section, courseId, nextOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEdit) {
      await updateSection.mutateAsync({ id: section.id, ...formData });
    } else {
      await createSection.mutateAsync(formData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "সেকশন সম্পাদনা করুন" : "নতুন সেকশন যোগ করুন"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">সেকশনের নাম *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="যেমন: পরিচিতি, প্রাথমিক ধারণা..."
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
              placeholder="এই সেকশনে কি শেখানো হবে..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section_order">ক্রম নম্বর</Label>
            <Input
              id="section_order"
              type="number"
              value={formData.section_order}
              onChange={(e) => setFormData({ ...formData, section_order: Number(e.target.value) })}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
            />
            <Label htmlFor="is_published">প্রকাশিত</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              বাতিল
            </Button>
            <Button 
              type="submit" 
              disabled={createSection.isPending || updateSection.isPending}
              className="gradient-primary"
            >
              {createSection.isPending || updateSection.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SectionDialog;
