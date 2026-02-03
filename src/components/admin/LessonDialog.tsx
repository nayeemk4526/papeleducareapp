import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Youtube, Check } from "lucide-react";
import { useCreateLesson, useUpdateLesson, type LessonFormData } from "@/hooks/useAdminLessons";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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

  const [isFetchingDuration, setIsFetchingDuration] = useState(false);
  const [durationFetched, setDurationFetched] = useState(false);

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
      setDurationFetched(false);
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
      setDurationFetched(false);
    }
  }, [lesson, courseId, sectionId, nextOrder]);

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const fetchYouTubeDuration = async (videoUrl: string) => {
    if (!isYouTubeUrl(videoUrl)) {
      toast({
        title: "সতর্কতা",
        description: "শুধুমাত্র YouTube ভিডিওর সময়কাল অটো-ফেচ করা যায়",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingDuration(true);
    setDurationFetched(false);

    try {
      const { data, error } = await supabase.functions.invoke('get-youtube-info', {
        body: { videoUrl },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setFormData(prev => ({
        ...prev,
        video_duration_minutes: data.durationMinutes,
      }));

      setDurationFetched(true);

      toast({
        title: "সফল!",
        description: `ভিডিওর সময়কাল: ${data.durationMinutes} মিনিট`,
      });
    } catch (error) {
      console.error('Error fetching YouTube info:', error);
      toast({
        title: "ত্রুটি",
        description: error instanceof Error ? error.message : "ভিডিওর তথ্য আনতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsFetchingDuration(false);
    }
  };

  const handleVideoUrlChange = (url: string) => {
    setFormData({ ...formData, video_url: url });
    setDurationFetched(false);
  };

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
            <Label htmlFor="video_url">ভিডিও URL (YouTube)</Label>
            <div className="flex gap-2">
              <Input
                id="video_url"
                value={formData.video_url || ""}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=... বা https://youtu.be/..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => formData.video_url && fetchYouTubeDuration(formData.video_url)}
                disabled={!formData.video_url || isFetchingDuration || !isYouTubeUrl(formData.video_url || "")}
                title="YouTube থেকে সময়কাল আনুন"
              >
                {isFetchingDuration ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : durationFetched ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Youtube className="h-4 w-4" />
                )}
              </Button>
            </div>
            {formData.video_url && isYouTubeUrl(formData.video_url) && !durationFetched && (
              <p className="text-xs text-muted-foreground">
                YouTube আইকনে ক্লিক করে ভিডিওর সময়কাল অটো-ফেচ করুন
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="video_duration_minutes">ভিডিওর সময়কাল (মিনিট)</Label>
              <Input
                id="video_duration_minutes"
                type="number"
                value={formData.video_duration_minutes || ""}
                onChange={(e) => setFormData({ ...formData, video_duration_minutes: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="অটো-ফেচ করুন বা ম্যানুয়ালি দিন"
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
