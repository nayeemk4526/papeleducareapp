import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SMSRequest {
  phone: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("SMS_API_KEY");
    const senderId = Deno.env.get("SMS_SENDER_ID");
    const smsUsername = Deno.env.get("SMS_USERNAME");

    if (!apiKey || !senderId || !smsUsername) {
      console.error("SMS API credentials not configured");
      return new Response(
        JSON.stringify({ error: "SMS সার্ভিস কনফিগার করা হয়নি" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body: SMSRequest = await req.json();
    const { phone, message } = body;

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "ফোন নম্বর এবং মেসেজ প্রয়োজন" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Format phone number (remove +88 or 0 prefix if present)
    let formattedPhone = phone.replace(/^\+88/, "").replace(/^0/, "");
    if (!formattedPhone.startsWith("01")) {
      formattedPhone = "01" + formattedPhone;
    }

    // Format phone to international format (8801XXXXXXXXX)
    let intlPhone = formattedPhone;
    if (intlPhone.startsWith("01")) {
      intlPhone = "88" + intlPhone;
    }

    const smsBody = {
      UserName: smsUsername,
      Apikey: apiKey,
      MobileNumber: intlPhone,
      SenderName: senderId,
      TransactionType: "T",
      Message: message,
      Is_Unicode: true,
    };

    const response = await fetch("https://api.mimsms.com/api/SmsSending/SMS", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(smsBody),
    });

    const result = await response.text();

    if (!response.ok) {
      console.error("SMS API error:", response.status, result);
      return new Response(
        JSON.stringify({ error: "SMS পাঠাতে সমস্যা হয়েছে", details: result }),
        { status: response.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("SMS sent successfully to:", formattedPhone);

    return new Response(
      JSON.stringify({ success: true, message: "SMS সফলভাবে পাঠানো হয়েছে" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("SMS sending error:", error);
    return new Response(
      JSON.stringify({ error: "SMS পাঠাতে সমস্যা হয়েছে" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
