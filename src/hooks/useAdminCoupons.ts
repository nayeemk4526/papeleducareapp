import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponsApi } from "@/lib/mysql-api";
import { useToast } from "@/hooks/use-toast";

export interface CouponCode {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  min_purchase_amount: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  course_id: number | null;
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
  course_id?: number | null;
}

export const useAdminCoupons = () => {
  return useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const response = await couponsApi.list();
      return response.data as CouponCode[];
    },
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (coupon: CouponFormData) => {
      const response = await couponsApi.create(coupon);
      return response.data;
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
    mutationFn: async ({ id, ...coupon }: CouponFormData & { id: number }) => {
      const response = await couponsApi.update(id, coupon);
      return response.data;
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
    mutationFn: async (id: number) => {
      await couponsApi.delete(id);
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
    mutationFn: async ({ code, courseId, amount }: { code: string; courseId: number; amount: number }) => {
      const response = await couponsApi.validate(code, courseId, amount);
      
      if (!response.success) {
        throw new Error("অবৈধ কুপন কোড");
      }
      
      return {
        coupon: response.coupon as CouponCode,
        discountAmount: response.discountAmount,
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
