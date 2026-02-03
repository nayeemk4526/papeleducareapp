import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Ticket, Percent, DollarSign, Calendar } from "lucide-react";
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
import CouponDialog from "@/components/admin/CouponDialog";
import { useAdminCoupons, useDeleteCoupon, type CouponCode } from "@/hooks/useAdminCoupons";
import { format } from "date-fns";

const AdminCoupons = () => {
  const { data: coupons, isLoading } = useAdminCoupons();
  const deleteCoupon = useDeleteCoupon();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponCode | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  const filteredCoupons = coupons?.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (coupon: CouponCode) => {
    setSelectedCoupon(coupon);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCouponToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (couponToDelete) {
      await deleteCoupon.mutateAsync(couponToDelete);
      setDeleteDialogOpen(false);
      setCouponToDelete(null);
    }
  };

  const isExpired = (coupon: CouponCode) => {
    if (!coupon.valid_until) return false;
    return new Date(coupon.valid_until) < new Date();
  };

  const isUsedUp = (coupon: CouponCode) => {
    if (!coupon.max_uses) return false;
    return coupon.used_count >= coupon.max_uses;
  };

  if (isLoading) {
    return (
      <AdminLayout title="কুপন কোড">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="কুপন কোড" subtitle="ডিসকাউন্ট কুপন পরিচালনা করুন">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="কুপন কোড খুঁজুন..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          className="gradient-primary"
          onClick={() => {
            setSelectedCoupon(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          নতুন কুপন তৈরি করুন
        </Button>
      </div>

      {/* Coupons Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.length > 0 ? (
          filteredCoupons.map((coupon, index) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-card rounded-xl p-6 border border-border relative ${
                !coupon.is_active || isExpired(coupon) || isUsedUp(coupon) ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    coupon.discount_type === "percentage" 
                      ? "bg-blue-100 dark:bg-blue-900/30" 
                      : "bg-green-100 dark:bg-green-900/30"
                  }`}>
                    {coupon.discount_type === "percentage" ? (
                      <Percent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg font-mono">{coupon.code}</h3>
                    <p className="text-sm text-primary font-medium">
                      {coupon.discount_type === "percentage" 
                        ? `${coupon.discount_value}% ছাড়` 
                        : `৳${coupon.discount_value} ছাড়`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(coupon)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-destructive"
                    onClick={() => handleDelete(coupon.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>ব্যবহৃত</span>
                  <span className="font-medium text-foreground">
                    {coupon.used_count} / {coupon.max_uses || "∞"}
                  </span>
                </div>
                {coupon.min_purchase_amount > 0 && (
                  <div className="flex items-center justify-between">
                    <span>সর্বনিম্ন ক্রয়</span>
                    <span className="font-medium text-foreground">৳{coupon.min_purchase_amount}</span>
                  </div>
                )}
                {coupon.valid_until && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>মেয়াদ: {format(new Date(coupon.valid_until), "dd/MM/yyyy")}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  {coupon.course_id ? "নির্দিষ্ট কোর্স" : "সব কোর্সে প্রযোজ্য"}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  !coupon.is_active 
                    ? "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                    : isExpired(coupon)
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : isUsedUp(coupon)
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                }`}>
                  {!coupon.is_active 
                    ? "নিষ্ক্রিয়" 
                    : isExpired(coupon) 
                    ? "মেয়াদ শেষ" 
                    : isUsedUp(coupon)
                    ? "সীমা শেষ"
                    : "সক্রিয়"}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full bg-card rounded-xl p-12 border border-border text-center">
            <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">কোনো কুপন কোড পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      {/* Coupon Dialog */}
      <CouponDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        coupon={selectedCoupon}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
            <AlertDialogDescription>
              এই কুপন কোডটি মুছে ফেললে আর ব্যবহার করা যাবে না।
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
    </AdminLayout>
  );
};

export default AdminCoupons;
