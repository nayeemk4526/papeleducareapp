
-- Create payment gateway settings table
CREATE TABLE public.payment_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  method_key text NOT NULL UNIQUE,
  method_name text NOT NULL,
  account_number text,
  is_enabled boolean NOT NULL DEFAULT true,
  color text,
  is_merchant boolean NOT NULL DEFAULT false,
  display_order integer DEFAULT 0,
  instructions text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Admin can manage
CREATE POLICY "Admins can manage payment settings"
  ON public.payment_settings FOR ALL
  USING (is_admin());

-- Anyone can view enabled settings
CREATE POLICY "Anyone can view enabled payment settings"
  ON public.payment_settings FOR SELECT
  USING (is_enabled = true);

-- Insert default payment methods
INSERT INTO public.payment_settings (method_key, method_name, account_number, color, is_merchant, display_order, instructions) VALUES
  ('bkash-merchant', 'বিকাশ মার্চেন্ট', NULL, '#E2136E', true, 1, 'বিকাশ মার্চেন্ট পেমেন্ট পেজে নিয়ে যাওয়া হবে।'),
  ('bkash', 'বিকাশ', '01XXXXXXXXX', '#E2136E', false, 2, NULL),
  ('nagad', 'নগদ', '01XXXXXXXXX', '#F6921E', false, 3, NULL),
  ('rocket', 'রকেট', '01XXXXXXXXX', '#8C3494', false, 4, NULL);

-- Trigger for updated_at
CREATE TRIGGER update_payment_settings_updated_at
  BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
