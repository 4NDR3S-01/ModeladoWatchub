import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPAL-PAYMENT] ${step}${detailsStr}`);
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

    const { amount, currency = "USD", description = "Payment" } = await req.json();
    if (!amount) throw new Error("Amount is required");
    logStep("Payment details", { amount, currency, description });

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

    // Create PayPal payment
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const paymentData = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString(),
        },
        description: description,
      }],
      application_context: {
        return_url: `${origin}/payment-success?provider=paypal`,
        cancel_url: `${origin}/payment-canceled`,
        brand_name: "WatchHub",
        user_action: "PAY_NOW",
      },
    };

    const paymentResponse = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json();
      logStep("PayPal payment creation failed", errorData);
      throw new Error("Failed to create PayPal payment");
    }

    const payment = await paymentResponse.json();
    logStep("PayPal payment created", { paymentId: payment.id });

    // Store payment info in database
    await supabaseClient.from("paypal_payments").insert({
      user_id: user.id,
      paypal_order_id: payment.id,
      amount: parseFloat(amount),
      currency: currency,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    const approvalUrl = payment.links.find((link: any) => link.rel === "approve")?.href;
    
    return new Response(JSON.stringify({ 
      url: approvalUrl,
      paymentId: payment.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-paypal-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});