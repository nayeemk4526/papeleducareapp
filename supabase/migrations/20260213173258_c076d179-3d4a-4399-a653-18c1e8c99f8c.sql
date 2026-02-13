
-- Create phone_verifications table for OTP
CREATE TABLE public.phone_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for sending OTP before auth)
CREATE POLICY "Anyone can create phone verification"
ON public.phone_verifications
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read their own verification by phone
CREATE POLICY "Anyone can read phone verifications"
ON public.phone_verifications
FOR SELECT
USING (true);

-- Allow updates for verification
CREATE POLICY "Anyone can update phone verifications"
ON public.phone_verifications
FOR UPDATE
USING (true);

-- Auto-delete expired OTPs (cleanup function)
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.phone_verifications WHERE expires_at < now();
END;
$$;

-- Add phone_verified column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
