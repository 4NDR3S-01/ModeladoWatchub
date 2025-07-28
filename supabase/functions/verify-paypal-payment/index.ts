import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYPAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    
    if (!paypalClientId || !paypalClientSecret) {
      throw new Error("PayPal credentials not configured");
    }
    logStep("PayPal credentials verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { paymentId, subscriptionId, type = "payment" } = await req.json();
    if (!paymentId && !subscriptionId) {
      throw new Error("PayPal ID is required");
    }
    logStep("Verification request", { paymentId, subscriptionId, type });

    // Get PayPal access token
    const paypalAuth = btoa(`${paypalClientId}:${paypalClientSecret}`);
    const authResponse = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${paypalAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      throw new Error("Failed to get PayPal access token");
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;
    logStep("PayPal access token obtained");

    if (type === "subscription" && subscriptionId) {
      // Verify subscription
      const subscriptionResponse = await fetch(`https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!subscriptionResponse.ok) {
        throw new Error("Failed to verify PayPal subscription");
      }

      const subscription = await subscriptionResponse.json();
      const isActive = subscription.status === "ACTIVE";
      logStep("Subscription verified", { status: subscription.status, isActive });

      // Update subscription in database
      await supabaseClient.from("paypal_subscriptions")
        .update({ 
          status: subscription.status.toLowerCase(),
          updated_at: new Date().toISOString()
        })
        .eq("paypal_subscription_id", subscriptionId);

      // Update user subscription status
      if (isActive) {
        const nextBillingTime = subscription.billing_info?.next_billing_time;
        await supabaseClient.from("subscribers").upsert({
          email: user.email,
          user_id: user.id,
          subscribed: true,
          subscription_tier: "PayPal",
          subscription_end: nextBillingTime,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });
      }

      return new Response(JSON.stringify({
        verified: true,
        subscribed: isActive,
        status: subscription.status,
        nextBilling: subscription.billing_info?.next_billing_time
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (paymentId) {
      // Verify one-time payment
      const paymentResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${paymentId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!paymentResponse.ok) {
        throw new Error("Failed to verify PayPal payment");
      }

      const payment = await paymentResponse.json();
      const isCompleted = payment.status === "COMPLETED";
      logStep("Payment verified", { status: payment.status, isCompleted });

      // Update payment in database
      await supabaseClient.from("paypal_payments")
        .update({ 
          status: payment.status.toLowerCase(),
          updated_at: new Date().toISOString()
        })
        .eq("paypal_order_id", paymentId);

      return new Response(JSON.stringify({
        verified: true,
        completed: isCompleted,
        status: payment.status,
        amount: payment.purchase_units[0]?.amount?.value
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Invalid verification request");

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-paypal-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});