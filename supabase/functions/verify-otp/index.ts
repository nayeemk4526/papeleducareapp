import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: "ফোন নম্বর এবং OTP প্রয়োজন" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find the OTP record
    const { data: otpRecord, error: fetchError } = await supabase
      .from("phone_verifications")
      .select("*")
      .eq("phone", phone)
      .eq("otp_code", otp)
      .eq("is_verified", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (fetchError) {
      console.error("Fetch OTP error:", fetchError);
      return new Response(
        JSON.stringify({ error: "ভেরিফিকেশন চেক করতে সমস্যা হয়েছে" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!otpRecord) {
      return new Response(
        JSON.stringify({ error: "ভুল OTP অথবা মেয়াদ শেষ হয়েছে" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark as verified
    await supabase
      .from("phone_verifications")
      .update({ is_verified: true })
      .eq("id", otpRecord.id);

    return new Response(
      JSON.stringify({ success: true, message: "ফোন নম্বর ভেরিফাই হয়েছে" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return new Response(
      JSON.stringify({ error: "ভেরিফিকেশন করতে সমস্যা হয়েছে" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
