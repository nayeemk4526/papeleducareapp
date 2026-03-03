import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit, GripVertical, ExternalLink, Eye, EyeOff, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  useAdminHeroSlides,
  useCreateHeroSlide,
  useUpdateHeroSlide,
  useDeleteHeroSlide,
  HeroSlide,
} from "@/hooks/useHeroSlides";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminHeroSlides = () => {
  const { data: slides, isLoading } = useAdminHeroSlides();
  const createSlide = useCreateHeroSlide();
  const updateSlide = useUpdateHeroSlide();
  const deleteSlide = useDeleteHeroSlide();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    image_url: "",
    link_url: "",
    display_order: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({ title: "", image_url: "", link_url: "", display_order: 0, is_active: true });
    setEditingSlide(null);
  };

  const openCreate = () => {
    resetForm();
    setFormData((f) => ({ ...f, display_order: (slides?.length || 0) + 1 }));
    setDialogOpen(true);
  };

  const openEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || "",
      image_url: slide.image_url,
      link_url: slide.link_url || "",
      display_order: slide.display_order,
      is_active: slide.is_active,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("hero-slides")
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: "আপলোড ব্যর্থ", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("hero-slides").getPublicUrl(fileName);
    setFormData((f) => ({ ...f, image_url: urlData.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!formData.image_url) {
      toast({ title: "ইমেজ আপলোড করুন", variant: "destructive" });
      return;
    }

    if (editingSlide) {
      await updateSlide.mutateAsync({ id: editingSlide.id, ...formData });
    } else {
      await createSlide.mutateAsync(formData);
    }
    setDialogOpen(false);
    resetForm();
  };

  const toggleActive = async (slide: HeroSlide) => {
    await updateSlide.mutateAsync({ id: slide.id, is_active: !slide.is_active });
  };

  return (
    <AdminLayout title="হিরো স্লাইডার" subtitle="হোম পেইজের স্লাইডার ইমেজ ম্যানেজ করুন">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            মোট {slides?.length || 0} টি স্লাইড
          </p>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            নতুন স্লাইড যোগ করুন
          </Button>
        </div>

        {/* Slides List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !slides?.length ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              কোনো স্লাইড নেই। নতুন স্লাইড যোগ করুন।
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {slides.map((slide, index) => (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={!slide.is_active ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <GripVertical className="w-5 h-5 text-muted-foreground shrink-0" />

                      {/* Thumbnail */}
                      <div className="w-32 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img
                          src={slide.image_url}
                          alt={slide.title || "Slide"}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {slide.title || `স্লাইড #${slide.display_order}`}
                        </h3>
                        {slide.link_url && (
                          <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {slide.link_url}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          অর্ডার: {slide.display_order}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActive(slide)}
                          title={slide.is_active ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                        >
                          {slide.is_active ? (
                            <Eye className="w-4 h-4 text-green-500" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(slide)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>স্লাইড মুছে ফেলবেন?</AlertDialogTitle>
                              <AlertDialogDescription>
                                এই স্লাইড স্থায়ীভাবে মুছে ফেলা হবে।
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>বাতিল</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteSlide.mutate(slide.id)}>
                                মুছুন
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingSlide ? "স্লাইড সম্পাদনা" : "নতুন স্লাইড যোগ করুন"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <Label>ইমেজ *</Label>
                {formData.image_url ? (
                  <div className="relative mt-2">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => setFormData((f) => ({ ...f, image_url: "" }))}
                    >
                      পরিবর্তন করুন
                    </Button>
                  </div>
                ) : (
                  <label className="mt-2 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">ইমেজ আপলোড করুন</span>
                        <span className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <Label>শিরোনাম (ঐচ্ছিক)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                  placeholder="স্লাইডের শিরোনাম"
                  className="mt-1"
                />
              </div>

              {/* Link URL */}
              <div>
                <Label>লিংক URL (ঐচ্ছিক)</Label>
                <Input
                  value={formData.link_url}
                  onChange={(e) => setFormData((f) => ({ ...f, link_url: e.target.value }))}
                  placeholder="https://example.com বা /courses"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ক্লিক করলে এই লিংকে নিয়ে যাবে
                </p>
              </div>

              {/* Display Order */}
              <div>
                <Label>প্রদর্শন ক্রম</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData((f) => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                  className="mt-1"
                />
              </div>

              {/* Active */}
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData((f) => ({ ...f, is_active: checked }))}
                />
                <Label>সক্রিয়</Label>
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={createSlide.isPending || updateSlide.isPending || !formData.image_url}
              >
                {(createSlide.isPending || updateSlide.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingSlide ? "আপডেট করুন" : "যোগ করুন"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminHeroSlides;
