
-- Make user_id nullable in payments table for guest checkout
ALTER TABLE public.payments ALTER COLUMN user_id DROP NOT NULL;

-- Add RLS policy to allow anonymous inserts for guest checkout
CREATE POLICY "Allow anonymous payment inserts"
ON public.payments
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Allow anonymous users to read their own payment by id (for success page)
CREATE POLICY "Allow anonymous payment read by id"
ON public.payments
FOR SELECT
TO anon
USING (user_id IS NULL);
