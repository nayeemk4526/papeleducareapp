import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Trash2, FileText, Star, Check, X, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import TestimonialDialog from "@/components/admin/TestimonialDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const AdminTestimonials = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select(`
          *,
          course:courses(title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateTestimonial = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from("testimonials")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast({ title: "সফল!", description: "টেস্টিমোনিয়াল আপডেট হয়েছে" });
    },
  });

  const deleteTestimonial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      toast({ title: "সফল!", description: "টেস্টিমোনিয়াল মুছে ফেলা হয়েছে" });
    },
  });

  const filteredTestimonials = testimonials?.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.content.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleApprove = (id: string, isApproved: boolean) => {
    updateTestimonial.mutate({ id, updates: { is_approved: isApproved } });
  };

  const handleFeature = (id: string, isFeatured: boolean) => {
    updateTestimonial.mutate({ id, updates: { is_featured: isFeatured } });
  };

  const handleDelete = (id: string) => {
    setTestimonialToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (testimonialToDelete) {
      await deleteTestimonial.mutateAsync(testimonialToDelete);
      setDeleteDialogOpen(false);
      setTestimonialToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="টেস্টিমোনিয়াল">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="টেস্টিমোনিয়াল" subtitle="ছাত্রদের মতামত পরিচালনা করুন">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="টেস্টিমোনিয়াল খুঁজুন..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => { setEditingTestimonial(null); setShowDialog(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          নতুন টেস্টিমোনিয়াল যোগ করুন
        </Button>
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        {filteredTestimonials.length > 0 ? (
          filteredTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl p-6 border border-border"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <span className="text-sm text-muted-foreground">{testimonial.role}</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (testimonial.rating || 0)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-3">{testimonial.content}</p>
                  <div className="flex items-center gap-3 text-sm">
                    {testimonial.course && (
                      <span className="text-primary">{testimonial.course.title}</span>
                    )}
                    <span className="text-muted-foreground">
                      {format(new Date(testimonial.created_at), "dd/MM/yyyy")}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={testimonial.is_approved ? "default" : "outline"}
                    onClick={() => handleApprove(testimonial.id, !testimonial.is_approved)}
                  >
                    {testimonial.is_approved ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        অনুমোদিত
                      </>
                    ) : (
                      "অনুমোদন করুন"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant={testimonial.is_featured ? "default" : "outline"}
                    onClick={() => handleFeature(testimonial.id, !testimonial.is_featured)}
                  >
                    <Star className={`w-4 h-4 ${testimonial.is_featured ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => { setEditingTestimonial(testimonial); setShowDialog(true); }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleDelete(testimonial.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-card rounded-xl p-12 border border-border text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">কোনো টেস্টিমোনিয়াল পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
            <AlertDialogDescription>
              এই টেস্টিমোনিয়ালটি মুছে ফেলা হবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Dialog */}
      <TestimonialDialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) setEditingTestimonial(null);
        }}
        testimonial={editingTestimonial}
      />
    </AdminLayout>
  );
};

export default AdminTestimonials;
