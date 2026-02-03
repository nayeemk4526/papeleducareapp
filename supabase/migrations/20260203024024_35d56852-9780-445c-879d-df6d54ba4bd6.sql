-- Create coupon_codes table for discount system
CREATE TABLE public.coupon_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  min_purchase_amount NUMERIC DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coupon_usages table to track usage
CREATE TABLE public.coupon_usages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupon_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupon_codes
CREATE POLICY "Admins can manage coupon codes"
ON public.coupon_codes
FOR ALL
USING (is_admin());

CREATE POLICY "Anyone can view active coupons"
ON public.coupon_codes
FOR SELECT
USING (is_active = true);

-- RLS Policies for coupon_usages
CREATE POLICY "Admins can manage coupon usages"
ON public.coupon_usages
FOR ALL
USING (is_admin());

CREATE POLICY "Users can view own coupon usage"
ON public.coupon_usages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own coupon usage"
ON public.coupon_usages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_coupon_codes_updated_at
BEFORE UPDATE ON public.coupon_codes
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add coupon_id to payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES public.coupon_codes(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS billing_info JSONB DEFAULT NULL;