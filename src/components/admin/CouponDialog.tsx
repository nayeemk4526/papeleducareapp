import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCoupon, useUpdateCoupon, type CouponFormData, type CouponCode } from "@/hooks/useAdminCoupons";
import { useAdminCourses } from "@/hooks/useAdminCourses";

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: CouponCode;
}

const CouponDialog = ({ open, onOpenChange, coupon }: CouponDialogProps) => {
  const isEdit = !!coupon;
  const { data: courses } = useAdminCourses();
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();

  const [formData, setFormData] = useState<CouponFormData>({
    code: coupon?.code || "",
    discount_type: coupon?.discount_type || "percentage",
    discount_value: coupon?.discount_value || 0,
    max_uses: coupon?.max_uses || null,
    min_purchase_amount: coupon?.min_purchase_amount || 0,
    valid_from: coupon?.valid_from ? coupon.valid_from.split("T")[0] : new Date().toISOString().split("T")[0],
    valid_until: coupon?.valid_until ? coupon.valid_until.split("T")[0] : null,
    is_active: coupon?.is_active ?? true,
    course_id: coupon?.course_id || null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      code: formData.code.toUpperCase(),
    };
    
    if (isEdit) {
      await updateCoupon.mutateAsync({ id: coupon.id, ...submitData });
    } else {
      await createCoupon.mutateAsync(submitData);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "কুপন সম্পাদনা করুন" : "নতুন কুপন তৈরি করুন"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">কুপন কোড *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="SAVE20"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_type">ডিসকাউন্ট টাইপ</Label>
              <Select 
                value={formData.discount_type} 
                onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, discount_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">শতাংশ (%)</SelectItem>
                  <SelectItem value="fixed">নির্দিষ্ট পরিমাণ (৳)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_value">
                ডিসকাউন্ট মান {formData.discount_type === "percentage" ? "(%)" : "(৳)"}
              </Label>
              <Input
                id="discount_value"
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_uses">সর্বোচ্চ ব্যবহার</Label>
              <Input
                id="max_uses"
                type="number"
                value={formData.max_uses || ""}
                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? Number(e.target.value) : null })}
                placeholder="সীমাহীন"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_purchase_amount">সর্বনিম্ন ক্রয় (৳)</Label>
              <Input
                id="min_purchase_amount"
                type="number"
                value={formData.min_purchase_amount || ""}
                onChange={(e) => setFormData({ ...formData, min_purchase_amount: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valid_from">শুরুর তারিখ</Label>
              <Input
                id="valid_from"
                type="date"
                value={formData.valid_from || ""}
                onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid_until">শেষ তারিখ</Label>
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until || ""}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value || null })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">নির্দিষ্ট কোর্স (ঐচ্ছিক)</Label>
            <Select 
              value={formData.course_id || "all"} 
              onValueChange={(value) => setFormData({ ...formData, course_id: value === "all" ? null : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="সব কোর্সে প্রযোজ্য" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব কোর্সে প্রযোজ্য</SelectItem>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled={createCoupon.isPending || updateCoupon.isPending}
              className="gradient-primary"
            >
              {createCoupon.isPending || updateCoupon.isPending ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CouponDialog;
