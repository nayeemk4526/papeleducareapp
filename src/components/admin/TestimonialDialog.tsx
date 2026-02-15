import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface TestimonialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: any;
}

const TestimonialDialog = ({ open, onOpenChange, testimonial }: TestimonialDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: testimonial?.name || "",
    role: testimonial?.role || "",
    content: testimonial?.content || "",
    rating: testimonial?.rating || 5,
    course_id: testimonial?.course_id || "",
    is_approved: testimonial?.is_approved ?? true,
    is_featured: testimonial?.is_featured ?? false,
  });

  const { data: courses } = useQuery({
    queryKey: ["admin-courses-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: formData.name,
        role: formData.role || null,
        content: formData.content,
        rating: formData.rating,
        course_id: formData.course_id || null,
        is_approved: formData.is_approved,
        is_featured: formData.is_featured,
        user_id: user?.id,
      };

      if (testimonial) {
        const { error } = await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", testimonial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("testimonials")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast({ title: "সফল!", description: testimonial ? "টেস্টিমোনিয়াল আপডেট হয়েছে" : "টেস্টিমোনিয়াল যোগ হয়েছে" });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({ title: "ত্রুটি", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{testimonial ? "টেস্টিমোনিয়াল সম্পাদনা" : "নতুন টেস্টিমোনিয়াল যোগ করুন"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>নাম *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ছাত্রের নাম"
              />
            </div>
            <div className="space-y-2">
              <Label>পদবি / ভূমিকা</Label>
              <Input
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="যেমন: HSC পরীক্ষার্থী"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>মতামত *</Label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="ছাত্রের মতামত লিখুন..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>রেটিং</Label>
              <Select
                value={String(formData.rating)}
                onValueChange={(v) => setFormData({ ...formData, rating: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {"⭐".repeat(r)} ({r})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>কোর্স (ঐচ্ছিক)</Label>
              <Select
                value={formData.course_id}
                onValueChange={(v) => setFormData({ ...formData, course_id: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="কোর্স সিলেক্ট করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">কোনো কোর্স নেই</SelectItem>
                  {courses?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_approved}
                onCheckedChange={(v) => setFormData({ ...formData, is_approved: v })}
              />
              <Label>অনুমোদিত</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_featured}
                onCheckedChange={(v) => setFormData({ ...formData, is_featured: v })}
              />
              <Label>ফিচার্ড</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>বাতিল</Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!formData.name || !formData.content || mutation.isPending}
          >
            {mutation.isPending ? "সংরক্ষণ হচ্ছে..." : testimonial ? "আপডেট করুন" : "যোগ করুন"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestimonialDialog;
