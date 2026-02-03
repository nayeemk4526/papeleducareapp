import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CouponCode {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  min_purchase_amount: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  course_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CouponFormData {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses?: number | null;
  min_purchase_amount?: number;
  valid_from?: string;
  valid_until?: string | null;
  is_active?: boolean;
  course_id?: string | null;
}

export const useAdminCoupons = () => {
  return useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupon_codes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CouponCode[];
    },
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (coupon: CouponFormData) => {
      const { data, error } = await supabase
        .from("coupon_codes")
        .insert(coupon)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast({ title: "সফল!", description: "কুপন কোড সফলভাবে তৈরি হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...coupon }: CouponFormData & { id: string }) => {
      const { data, error } = await supabase
        .from("coupon_codes")
        .update(coupon)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast({ title: "সফল!", description: "কুপন কোড সফলভাবে আপডেট হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupon_codes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast({ title: "সফল!", description: "কুপন কোড সফলভাবে মুছে ফেলা হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};

export const useValidateCoupon = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ code, courseId, amount }: { code: string; courseId: string; amount: number }) => {
      const { data, error } = await supabase
        .from("coupon_codes")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("অবৈধ কুপন কোড");

      // Check if coupon is for specific course
      if (data.course_id && data.course_id !== courseId) {
        throw new Error("এই কুপনটি এই কোর্সে প্রযোজ্য নয়");
      }

      // Check max uses
      if (data.max_uses && data.used_count >= data.max_uses) {
        throw new Error("এই কুপনের ব্যবহার সীমা শেষ হয়ে গেছে");
      }

      // Check validity dates
      const now = new Date();
      if (data.valid_from && new Date(data.valid_from) > now) {
        throw new Error("এই কুপনটি এখনও সক্রিয় হয়নি");
      }
      if (data.valid_until && new Date(data.valid_until) < now) {
        throw new Error("এই কুপনের মেয়াদ শেষ হয়ে গেছে");
      }

      // Check minimum purchase
      if (data.min_purchase_amount && amount < data.min_purchase_amount) {
        throw new Error(`সর্বনিম্ন ক্রয় পরিমাণ ৳${data.min_purchase_amount}`);
      }

      // Calculate discount
      let discountAmount = 0;
      if (data.discount_type === "percentage") {
        discountAmount = (amount * data.discount_value) / 100;
      } else {
        discountAmount = data.discount_value;
      }

      return {
        coupon: data as CouponCode,
        discountAmount: Math.min(discountAmount, amount),
      };
    },
    onSuccess: () => {
      toast({ title: "সফল!", description: "কুপন কোড প্রয়োগ করা হয়েছে" });
    },
    onError: (error: Error) => {
      toast({ title: "ত্রুটি!", description: error.message, variant: "destructive" });
    },
  });
};
