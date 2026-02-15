import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminPaymentSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: methods, isLoading } = useQuery({
    queryKey: ["admin-payment-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_settings")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const updateMethod = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from("payment_settings")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-settings"] });
      toast({ title: "সফল!", description: "সেটিংস আপডেট হয়েছে" });
    },
    onError: (e: any) => {
      toast({ title: "ত্রুটি", description: e.message, variant: "destructive" });
    },
  });

  const addMethod = useMutation({
    mutationFn: async () => {
      const maxOrder = methods?.reduce((max, m) => Math.max(max, m.display_order || 0), 0) || 0;
      const { error } = await supabase
        .from("payment_settings")
        .insert({
          method_key: `custom-${Date.now()}`,
          method_name: "নতুন মেথড",
          account_number: "",
          color: "#6366F1",
          is_merchant: false,
          display_order: maxOrder + 1,
          is_enabled: false,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-settings"] });
      toast({ title: "সফল!", description: "নতুন পেমেন্ট মেথড যোগ হয়েছে" });
    },
  });

  const deleteMethod = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("payment_settings")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-settings"] });
      toast({ title: "সফল!", description: "পেমেন্ট মেথড মুছে ফেলা হয়েছে" });
      setDeleteId(null);
    },
  });

  if (isLoading) {
    return (
      <AdminLayout title="পেমেন্ট সেটিংস">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="পেমেন্ট গেটওয়ে সেটিংস" subtitle="পেমেন্ট মেথড কনফিগার করুন">
      <div className="flex justify-end mb-6">
        <Button onClick={() => addMethod.mutate()} disabled={addMethod.isPending}>
          <Plus className="w-4 h-4 mr-2" />
          নতুন মেথড যোগ করুন
        </Button>
      </div>

      <div className="space-y-4">
        {methods?.map((method, index) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: method.color || "#6366F1" }}
                    >
                      {method.method_name?.charAt(0)}
                    </div>
                    <CardTitle className="text-lg">{method.method_name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">সক্রিয়</Label>
                      <Switch
                        checked={method.is_enabled}
                        onCheckedChange={(v) =>
                          updateMethod.mutate({ id: method.id, updates: { is_enabled: v } })
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteId(method.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>মেথডের নাম</Label>
                    <Input
                      defaultValue={method.method_name}
                      onBlur={(e) =>
                        e.target.value !== method.method_name &&
                        updateMethod.mutate({ id: method.id, updates: { method_name: e.target.value } })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>মেথড কী</Label>
                    <Input
                      defaultValue={method.method_key}
                      onBlur={(e) =>
                        e.target.value !== method.method_key &&
                        updateMethod.mutate({ id: method.id, updates: { method_key: e.target.value } })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>অ্যাকাউন্ট নম্বর</Label>
                    <Input
                      defaultValue={method.account_number || ""}
                      placeholder={method.is_merchant ? "মার্চেন্ট - প্রযোজ্য নয়" : "01XXXXXXXXX"}
                      disabled={method.is_merchant}
                      onBlur={(e) =>
                        e.target.value !== (method.account_number || "") &&
                        updateMethod.mutate({ id: method.id, updates: { account_number: e.target.value } })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>রঙ (হেক্স কোড)</Label>
                    <div className="flex gap-2">
                      <Input
                        defaultValue={method.color || ""}
                        placeholder="#E2136E"
                        onBlur={(e) =>
                          e.target.value !== (method.color || "") &&
                          updateMethod.mutate({ id: method.id, updates: { color: e.target.value } })
                        }
                      />
                      <div
                        className="w-10 h-10 rounded-md border flex-shrink-0"
                        style={{ backgroundColor: method.color || "#ccc" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={method.is_merchant}
                      onCheckedChange={(v) =>
                        updateMethod.mutate({ id: method.id, updates: { is_merchant: v } })
                      }
                    />
                    <Label className="text-sm">মার্চেন্ট পেমেন্ট (অটো এনরোল)</Label>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label>নির্দেশনা (ঐচ্ছিক)</Label>
                  <Textarea
                    defaultValue={method.instructions || ""}
                    placeholder="পেমেন্টের নির্দেশনা..."
                    rows={2}
                    onBlur={(e) =>
                      e.target.value !== (method.instructions || "") &&
                      updateMethod.mutate({ id: method.id, updates: { instructions: e.target.value } })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
            <AlertDialogDescription>এই পেমেন্ট মেথডটি মুছে ফেলা হবে।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMethod.mutate(deleteId)}
            >
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminPaymentSettings;
