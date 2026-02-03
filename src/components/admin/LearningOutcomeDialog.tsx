import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateLearningOutcome, useUpdateLearningOutcome, type LearningOutcomeFormData } from "@/hooks/useCourseLearningOutcomes";

interface LearningOutcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  outcome?: any;
  nextOrder?: number;
}

const LearningOutcomeDialog = ({ open, onOpenChange, courseId, outcome, nextOrder = 1 }: LearningOutcomeDialogProps) => {
  const isEdit = !!outcome;
  const createOutcome = useCreateLearningOutcome();
  const updateOutcome = useUpdateLearningOutcome();

  const [formData, setFormData] = useState<LearningOutcomeFormData>({
    course_id: courseId,
    content: "",
    display_order: nextOrder,
  });

  useEffect(() => {
    if (outcome) {
      setFormData({
        course_id: courseId,
        content: outcome.content || "",
        display_order: outcome.display_order || nextOrder,
      });
    } else {
      setFormData({
        course_id: courseId,
        content: "",
        display_order: nextOrder,
      });
    }
  }, [outcome, courseId, nextOrder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEdit) {
      await updateOutcome.mutateAsync({ id: outcome.id, ...formData });
    } else {
      await createOutcome.mutateAsync(formData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "শিখার বিষয় সম্পাদনা করুন" : "নতুন শিখার বিষয় যোগ করুন"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">শিখার বিষয় *</Label>
            <Input
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="যেমন: বেসিক থেকে অ্যাডভান্সড কনসেপ্ট"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">ক্রম নম্বর</Label>
            <Input
              id="display_order"
              type="number"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              বাতিল
            </Button>
            <Button 
              type="submit" 
              disabled={createOutcome.isPending || updateOutcome.isPending}
              className="gradient-primary"
            >
              {createOutcome.isPending || updateOutcome.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LearningOutcomeDialog;
