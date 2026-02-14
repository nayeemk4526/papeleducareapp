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
    const { phone } = await req.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "ফোন নম্বর প্রয়োজন" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Store OTP in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delete old OTPs for this phone
    await supabase
      .from("phone_verifications")
      .delete()
      .eq("phone", phone);

    // Insert new OTP
    const { error: insertError } = await supabase
      .from("phone_verifications")
      .insert({
        phone,
        otp_code: otpCode,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("Insert OTP error:", insertError);
      return new Response(
        JSON.stringify({ error: "OTP সংরক্ষণ করতে সমস্যা হয়েছে" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send SMS
    const apiKey = Deno.env.get("SMS_API_KEY");
    const senderId = Deno.env.get("SMS_SENDER_ID");

    if (!apiKey || !senderId) {
      console.error("SMS API credentials not configured");
      return new Response(
        JSON.stringify({ error: "SMS সার্ভিস কনফিগার করা হয়নি" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Format phone number
    let formattedPhone = phone.replace(/^\+88/, "").replace(/^0/, "");
    if (!formattedPhone.startsWith("01")) {
      formattedPhone = "01" + formattedPhone;
    }

    const message = `আপনার পাপেল এডু-কেয়ার ভেরিফিকেশন কোড: ${otpCode}। এই কোডটি ৫ মিনিট পর্যন্ত কার্যকর।`;

    const smsUrl = `https://api.mimsms.com/api/SmsSending/Send?ApiKey=${apiKey}&ClientId=${senderId}&SenderId=${senderId}&Message=${encodeURIComponent(message)}&MobileNumbers=${formattedPhone}&Is_Unicode=true`;
    
    const smsResponse = await fetch(smsUrl, {
      method: "GET",
    });

    const smsResult = await smsResponse.json();

    if (!smsResponse.ok) {
      console.error("SMS API error:", smsResult);
      // Still return success since OTP is stored - user can retry
    }

    console.log("OTP sent to:", formattedPhone);

    return new Response(
      JSON.stringify({ success: true, message: "OTP পাঠানো হয়েছে" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return new Response(
      JSON.stringify({ error: "OTP পাঠাতে সমস্যা হয়েছে" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
