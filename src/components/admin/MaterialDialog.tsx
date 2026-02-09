import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCreateCourseMaterial, useUpdateCourseMaterial, type CourseMaterialFormData } from "@/hooks/useAdminCourseMaterials";

interface MaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  material?: any;
}

const MaterialDialog = ({ open, onOpenChange, courseId, material }: MaterialDialogProps) => {
  const isEdit = !!material;
  const createMaterial = useCreateCourseMaterial();
  const updateMaterial = useUpdateCourseMaterial();

  const [formData, setFormData] = useState<CourseMaterialFormData>({
    course_id: courseId,
    title: "",
    file_url: "",
    file_type: "",
    file_size_bytes: undefined,
    is_downloadable: true,
  });

  useEffect(() => {
    if (material) {
      setFormData({
        course_id: courseId,
        title: material.title || "",
        file_url: material.file_url || "",
        file_type: material.file_type || "",
        file_size_bytes: material.file_size_bytes || undefined,
        is_downloadable: material.is_downloadable ?? true,
      });
    } else {
      setFormData({
        course_id: courseId,
        title: "",
        file_url: "",
        file_type: "",
        file_size_bytes: undefined,
        is_downloadable: true,
      });
    }
  }, [material, courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEdit) {
      await updateMaterial.mutateAsync({ id: material.id, ...formData });
    } else {
      await createMaterial.mutateAsync(formData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "ম্যাটেরিয়াল সম্পাদনা করুন" : "নতুন ম্যাটেরিয়াল যোগ করুন"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">ম্যাটেরিয়ালের নাম *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="যেমন: কোর্স স্লাইড, নোটস..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file_url">ফাইল URL *</Label>
            <Input
              id="file_url"
              value={formData.file_url}
              onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
              placeholder="https://drive.google.com/... বা অন্য কোনো লিংক"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file_type">ফাইল টাইপ</Label>
              <Input
                id="file_type"
                value={formData.file_type || ""}
                onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                placeholder="PDF, DOCX, ZIP..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file_size_bytes">ফাইল সাইজ (bytes)</Label>
              <Input
                id="file_size_bytes"
                type="number"
                value={formData.file_size_bytes || ""}
                onChange={(e) => setFormData({ ...formData, file_size_bytes: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_downloadable"
              checked={formData.is_downloadable}
              onCheckedChange={(checked) => setFormData({ ...formData, is_downloadable: checked })}
            />
            <Label htmlFor="is_downloadable">ডাউনলোডযোগ্য</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              বাতিল
            </Button>
            <Button 
              type="submit" 
              disabled={createMaterial.isPending || updateMaterial.isPending}
              className="gradient-primary"
            >
              {createMaterial.isPending || updateMaterial.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialDialog;
