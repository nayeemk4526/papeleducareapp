import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const paymentID = url.searchParams.get("paymentID");
    const status = url.searchParams.get("status");

    console.log("bKash callback received:", { paymentID, status });

    if (!paymentID) {
      console.error("No paymentID in callback");
      return redirectToResult("error", "পেমেন্ট আইডি পাওয়া যায়নি");
    }

    // Create admin client for database operations
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Find the payment record
    const { data: payment, error: findError } = await supabase
      .from("payments")
      .select("*")
      .eq("transaction_id", paymentID)
      .single();

    if (findError || !payment) {
      console.error("Payment not found:", findError);
      return redirectToResult("error", "পেমেন্ট রেকর্ড পাওয়া যায়নি");
    }

    const origin = payment.gateway_response?.origin || "https://papeleducareapp.lovable.app";

    if (status === "cancel") {
      console.log("Payment cancelled by user");
      await supabase
        .from("payments")
        .update({ status: "failed", gateway_response: { ...payment.gateway_response, callback_status: "cancel" } })
        .eq("id", payment.id);

      return redirectToResult("cancel", "পেমেন্ট বাতিল করা হয়েছে", origin, payment.course_id);
    }

    if (status === "failure") {
      console.log("Payment failed");
      await supabase
        .from("payments")
        .update({ status: "failed", gateway_response: { ...payment.gateway_response, callback_status: "failure" } })
        .eq("id", payment.id);

      return redirectToResult("error", "পেমেন্ট ব্যর্থ হয়েছে", origin, payment.course_id);
    }

    if (status !== "success") {
      console.error("Unknown callback status:", status);
      return redirectToResult("error", "অজানা পেমেন্ট স্ট্যাটাস", origin, payment.course_id);
    }

    // Get bKash credentials for execute
    const appKey = Deno.env.get("BKASH_APP_KEY");
    const idToken = payment.gateway_response?.id_token;

    if (!idToken) {
      console.error("No ID token found in payment record");
      return redirectToResult("error", "সেশন মেয়াদ শেষ", origin, payment.course_id);
    }

    const bkashBaseUrl = "https://tokenized.pay.bka.sh/v1.2.0-beta";

    // Execute the payment
    console.log("Executing bKash payment...");
    const executeResponse = await fetch(`${bkashBaseUrl}/tokenized/checkout/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: idToken,
        "X-APP-Key": appKey!,
      },
      body: JSON.stringify({
        paymentID: paymentID,
      }),
    });

    const executeData = await executeResponse.json();
    console.log("Execute response:", { statusCode: executeData.statusCode, trxID: executeData.trxID });

    if (executeData.statusCode !== "0000" || executeData.transactionStatus !== "Completed") {
      console.error("Execute payment failed:", executeData);
      await supabase
        .from("payments")
        .update({
          status: "failed",
          gateway_response: { ...payment.gateway_response, execute_response: executeData },
        })
        .eq("id", payment.id);

      return redirectToResult(
        "error",
        executeData.statusMessage || "পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে",
        origin,
        payment.course_id,
      );
    }

    // Payment successful - update payment record
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "completed",
        verified_at: new Date().toISOString(),
        gateway_response: {
          ...payment.gateway_response,
          execute_response: executeData,
          trxID: executeData.trxID,
        },
      })
      .eq("id", payment.id);

    if (updateError) {
      console.error("Failed to update payment:", updateError);
    }

    // Create enrollment
    const { error: enrollError } = await supabase.from("enrollments").insert({
      user_id: payment.user_id,
      course_id: payment.course_id,
      progress_percentage: 0,
    });

    if (enrollError && !enrollError.message.includes("duplicate")) {
      console.error("Failed to create enrollment:", enrollError);
    }

    // Update course total students
    const { data: course } = await supabase
      .from("courses")
      .select("total_students")
      .eq("id", payment.course_id)
      .single();

    if (course) {
      await supabase
        .from("courses")
        .update({ total_students: (course.total_students || 0) + 1 })
        .eq("id", payment.course_id);
    }

    // Create success notification
    await supabase.from("notifications").insert({
      user_id: payment.user_id,
      title: "পেমেন্ট সফল!",
      message: `আপনার বিকাশ পেমেন্ট সফল হয়েছে। Transaction ID: ${executeData.trxID}`,
      type: "payment",
      link: "/dashboard",
    });

    // Send SMS notification
    try {
      await supabase.functions.invoke("send-sms", {
        body: {
          phone: payment.billing_info?.phone || "",
          message: `পেমেন্ট সফল! TrxID: ${executeData.trxID}। আপনার কোর্স এক্সেস শুরু হয়েছে। - Papeldu Care`,
        },
      });
    } catch (smsError) {
      console.error("SMS sending failed:", smsError);
    }

    console.log("Payment completed successfully:", { trxID: executeData.trxID });
    return redirectToResult("success", "পেমেন্ট সফল হয়েছে!", origin, payment.course_id);
  } catch (error: any) {
    console.error("bKash callback error:", error);
    return redirectToResult("error", "পেমেন্ট প্রসেস করতে সমস্যা হয়েছে");
  }
});

function redirectToResult(
  status: string,
  message: string,
  origin = "https://papeleducareapp.lovable.app",
  courseId?: string,
) {
  const redirectUrl =
    status === "success"
      ? `${origin}/dashboard?payment=success`
      : `${origin}/checkout/${courseId || ""}?payment=${status}&message=${encodeURIComponent(message)}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl,
    },
  });
}
