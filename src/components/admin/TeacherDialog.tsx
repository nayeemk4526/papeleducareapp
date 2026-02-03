import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateTeacher, useUpdateTeacher, type TeacherFormData } from "@/hooks/useAdminTeachers";

interface TeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: any;
}

const TeacherDialog = ({ open, onOpenChange, teacher }: TeacherDialogProps) => {
  const isEdit = !!teacher;
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();

  const [formData, setFormData] = useState<TeacherFormData>({
    name: teacher?.name || "",
    title: teacher?.title || "",
    subtitle: teacher?.subtitle || "",
    bio: teacher?.bio || "",
    avatar_url: teacher?.avatar_url || "",
    email: teacher?.email || "",
    phone: teacher?.phone || "",
    specializations: teacher?.specializations || [],
    is_active: teacher?.is_active ?? true,
  });

  const [specializationInput, setSpecializationInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEdit) {
      await updateTeacher.mutateAsync({ id: teacher.id, ...formData });
    } else {
      await createTeacher.mutateAsync(formData);
    }
    
    onOpenChange(false);
  };

  const addSpecialization = () => {
    if (specializationInput.trim()) {
      setFormData({
        ...formData,
        specializations: [...(formData.specializations || []), specializationInput.trim()],
      });
      setSpecializationInput("");
    }
  };

  const removeSpecialization = (index: number) => {
    setFormData({
      ...formData,
      specializations: (formData.specializations || []).filter((_, i) => i !== index),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "শিক্ষক সম্পাদনা করুন" : "নতুন শিক্ষক যোগ করুন"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">নাম *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">পদবী</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="প্রভাষক"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">সাবটাইটেল</Label>
              <Input
                id="subtitle"
                value={formData.subtitle || ""}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="বিএসসি, এমবিএ"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">বিবরণ</Label>
            <Textarea
              id="bio"
              rows={3}
              value={formData.bio || ""}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">ফোন</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar_url">প্রোফাইল ছবি URL</Label>
            <Input
              id="avatar_url"
              value={formData.avatar_url || ""}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label>বিশেষজ্ঞতা</Label>
            <div className="flex gap-2">
              <Input
                value={specializationInput}
                onChange={(e) => setSpecializationInput(e.target.value)}
                placeholder="বিষয় লিখুন"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialization())}
              />
              <Button type="button" onClick={addSpecialization} variant="outline">
                যোগ
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.specializations?.map((spec, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                >
                  {spec}
                  <button
                    type="button"
                    onClick={() => removeSpecialization(index)}
                    className="text-primary hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">সক্রিয়</Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              বাতিল
            </Button>
            <Button 
              type="submit" 
              disabled={createTeacher.isPending || updateTeacher.isPending}
              className="gradient-primary"
            >
              {createTeacher.isPending || updateTeacher.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherDialog;
