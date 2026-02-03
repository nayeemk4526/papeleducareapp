import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VerifyPaymentRequest {
  payment_id: string;
  action: "approve" | "reject";
  admin_notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "অনুমোদন প্রয়োজন" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: "অবৈধ সেশন" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if user is admin using service role
    const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "শুধুমাত্র অ্যাডমিন এই অপারেশন করতে পারবে" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body: VerifyPaymentRequest = await req.json();
    const { payment_id, action, admin_notes } = body;

    if (!payment_id || !action) {
      return new Response(JSON.stringify({ error: "পেমেন্ট আইডি এবং অ্যাকশন প্রয়োজন" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get payment details
    const { data: payment, error: paymentError } = await adminClient
      .from("payments")
      .select("*, courses(id, title)")
      .eq("id", payment_id)
      .single();

    if (paymentError || !payment) {
      return new Response(JSON.stringify({ error: "পেমেন্ট পাওয়া যায়নি" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (payment.status !== "pending") {
      return new Response(JSON.stringify({ error: "এই পেমেন্ট ইতিমধ্যে প্রসেস করা হয়েছে" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const newStatus = action === "approve" ? "completed" : "failed";

    // Update payment status
    const { error: updateError } = await adminClient
      .from("payments")
      .update({
        status: newStatus,
        verified_at: new Date().toISOString(),
        gateway_response: {
          ...payment.gateway_response,
          admin_notes: admin_notes,
          verified_by: userData.user.id,
          verified_at: new Date().toISOString(),
        },
      })
      .eq("id", payment_id);

    if (updateError) {
      console.error("Payment update error:", updateError);
      return new Response(JSON.stringify({ error: "পেমেন্ট আপডেট করতে সমস্যা হয়েছে" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // If approved, create enrollment
    if (action === "approve" && payment.course_id) {
      const { error: enrollError } = await adminClient.from("enrollments").insert({
        user_id: payment.user_id,
        course_id: payment.course_id,
        progress_percentage: 0,
      });

      if (enrollError) {
        console.error("Enrollment creation error:", enrollError);
        // Don't fail the whole operation, just log it
      }

      // Create success notification
      await adminClient.from("notifications").insert({
        user_id: payment.user_id,
        title: "পেমেন্ট সফল!",
        message: `আপনার "${payment.courses?.title}" কোর্সে এনরোলমেন্ট সফল হয়েছে। এখনই শিখতে শুরু করুন!`,
        type: "success",
        link: `/dashboard/course/${payment.course_id}`,
      });

      // Update course student count
      await adminClient.rpc("increment", {
        table_name: "courses",
        row_id: payment.course_id,
        column_name: "total_students",
        increment_by: 1,
      });
    } else if (action === "reject") {
      // Create rejection notification
      await adminClient.from("notifications").insert({
        user_id: payment.user_id,
        title: "পেমেন্ট বাতিল",
        message: `আপনার "${payment.courses?.title}" কোর্সের পেমেন্ট যাচাই হয়নি। ${admin_notes || "অনুগ্রহ করে সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।"}`,
        type: "error",
        link: "/dashboard/payments",
      });
    }

    console.log(`Payment ${payment_id} ${action}d by admin ${userData.user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: action === "approve" ? "পেমেন্ট অনুমোদন করা হয়েছে" : "পেমেন্ট বাতিল করা হয়েছে",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ error: "পেমেন্ট যাচাই করতে সমস্যা হয়েছে" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
