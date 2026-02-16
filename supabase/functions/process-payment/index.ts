import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PaymentRequest {
  course_id: string;
  amount: number;
  payment_method: "bkash" | "nagad" | "rocket" | "moynapay";
  transaction_id: string;
  phone_number: string;
  billing_info?: {
    full_name: string;
    email: string;
    institute?: string;
    address?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for auth - optional for guest checkout
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    // Use service role for DB operations to bypass RLS for guest payments
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
      const { data: userData } = await supabaseAuth.auth.getUser(token);
      if (userData.user) {
        userId = userData.user.id;
      }
    }

    const body: PaymentRequest = await req.json();
    const { course_id, amount, payment_method, transaction_id, phone_number, billing_info } = body;

    // Validate required fields
    if (!course_id || !amount || !payment_method || !transaction_id) {
      return new Response(
        JSON.stringify({ error: "সব তথ্য প্রদান করুন" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate billing info for guest users
    if (!userId && (!billing_info?.full_name || !billing_info?.email)) {
      return new Response(
        JSON.stringify({ error: "গেস্ট চেকআউটের জন্য নাম ও ইমেইল আবশ্যক" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify course exists
    const { data: course, error: courseError } = await supabaseAdmin
      .from("courses")
      .select("id, title, price, discount_price")
      .eq("id", course_id)
      .single();

    if (courseError || !course) {
      return new Response(
        JSON.stringify({ error: "কোর্স পাওয়া যায়নি" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if logged-in user already enrolled
    if (userId) {
      const { data: existingEnrollment } = await supabaseAdmin
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", course_id)
        .single();

      if (existingEnrollment) {
        return new Response(
          JSON.stringify({ error: "আপনি ইতিমধ্যে এই কোর্সে এনরোল করেছেন" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Create payment record
    const paymentData: any = {
      course_id: course_id,
      amount: amount,
      payment_method: payment_method,
      transaction_id: transaction_id,
      status: "pending",
      billing_info: billing_info || {},
      gateway_response: {
        phone_number: phone_number,
        submitted_at: new Date().toISOString(),
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
      console.error("Payment creation error:", paymentError);
      return new Response(
        JSON.stringify({ error: "পেমেন্ট তৈরি করতে সমস্যা হয়েছে" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create notification only for logged-in users
    if (userId) {
      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        title: "পেমেন্ট জমা হয়েছে",
        message: `আপনার "${course.title}" কোর্সের পেমেন্ট জমা হয়েছে। যাচাই করা হচ্ছে...`,
        type: "payment",
        link: "/dashboard/payments",
      });
    }

    console.log("Payment submitted:", payment.id, "for course:", course.title, "guest:", !userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "পেমেন্ট সফলভাবে জমা হয়েছে। অ্যাডমিন যাচাই করার পর আপনাকে জানানো হবে।",
        payment_id: payment.id,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Payment processing error:", error);
    return new Response(
      JSON.stringify({ error: "পেমেন্ট প্রসেস করতে সমস্যা হয়েছে" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
