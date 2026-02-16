import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check for auth - optional for guest checkout
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (authHeader?.startsWith("Bearer ")) {
      const supabaseAuth = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabaseAuth.auth.getUser(token);
      if (user) {
        userId = user.id;
      }
    }

    const { course_id, amount, phone_number, billing_info } = await req.json();
    console.log("bKash payment request:", { course_id, amount, phone_number, user_id: userId, is_guest: !userId });

    // Validate required fields
    if (!course_id || !amount || !phone_number) {
      return new Response(
        JSON.stringify({ success: false, error: "অসম্পূর্ণ তথ্য" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate billing info for guest users
    if (!userId && (!billing_info?.full_name || !billing_info?.email)) {
      return new Response(
        JSON.stringify({ success: false, error: "গেস্ট চেকআউটের জন্য নাম ও ইমেইল আবশ্যক" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get bKash credentials
    const appKey = Deno.env.get("BKASH_APP_KEY");
    const appSecret = Deno.env.get("BKASH_APP_SECRET");
    const username = Deno.env.get("BKASH_USERNAME");
    const password = Deno.env.get("BKASH_PASSWORD");

    if (!appKey || !appSecret || !username || !password) {
      console.error("bKash credentials not configured");
      return new Response(
        JSON.stringify({ success: false, error: "বিকাশ সেটআপ সম্পূর্ণ নয়" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const bkashBaseUrl = "https://tokenized.pay.bka.sh/v1.2.0-beta";

    // Step 1: Grant Token
    console.log("Requesting bKash token...");
    const tokenResponse = await fetch(`${bkashBaseUrl}/tokenized/checkout/token/grant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "username": username,
        "password": password,
      },
      body: JSON.stringify({
        app_key: appKey,
        app_secret: appSecret,
      }),
    });

    const tokenData = await tokenResponse.json();
    console.log("Token response:", { statusCode: tokenData.statusCode, statusMessage: tokenData.statusMessage });

    if (tokenData.statusCode !== "0000" || !tokenData.id_token) {
      console.error("Token grant failed:", tokenData);
      return new Response(
        JSON.stringify({ success: false, error: "বিকাশ টোকেন পেতে সমস্যা হয়েছে" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const idToken = tokenData.id_token;
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const origin = req.headers.get("origin") || "https://papeleducareapp.lovable.app";
    const callbackURL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/bkash-callback`;

    // Step 2: Create Payment
    console.log("Creating bKash payment...");
    const createPaymentResponse = await fetch(`${bkashBaseUrl}/tokenized/checkout/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": idToken,
        "X-APP-Key": appKey,
      },
      body: JSON.stringify({
        mode: "0011",
        payerReference: userId || `guest-${phone_number}`,
        callbackURL: callbackURL,
        amount: amount.toString(),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: paymentId,
      }),
    });

    const createPaymentData = await createPaymentResponse.json();
    console.log("Create payment response:", { statusCode: createPaymentData.statusCode, paymentID: createPaymentData.paymentID });

    if (createPaymentData.statusCode !== "0000" || !createPaymentData.bkashURL) {
      console.error("Create payment failed:", createPaymentData);
      return new Response(
        JSON.stringify({ success: false, error: createPaymentData.statusMessage || "বিকাশ পেমেন্ট তৈরি করতে সমস্যা হয়েছে" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store pending payment in database
    const paymentData: any = {
      course_id: course_id,
      amount: amount,
      payment_method: "bkash",
      status: "pending",
      transaction_id: createPaymentData.paymentID,
      billing_info: billing_info,
      gateway_response: {
        bkash_payment_id: createPaymentData.paymentID,
        merchant_invoice: paymentId,
        id_token: idToken,
        origin: origin,
        is_guest: !userId,
      },
    };

    if (userId) {
      paymentData.user_id = userId;
    }

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert(paymentData)
      .select()
      .single();

    if (paymentError) {
      console.error("Failed to save payment:", paymentError);
      return new Response(
        JSON.stringify({ success: false, error: "পেমেন্ট সংরক্ষণ করতে সমস্যা হয়েছে" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Payment created successfully:", { paymentId: payment.id, bkashURL: createPaymentData.bkashURL });

    return new Response(
      JSON.stringify({
        success: true,
        bkashURL: createPaymentData.bkashURL,
        paymentID: createPaymentData.paymentID,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("bKash payment error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "বিকাশ পেমেন্ট শুরু করতে সমস্যা হয়েছে" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
