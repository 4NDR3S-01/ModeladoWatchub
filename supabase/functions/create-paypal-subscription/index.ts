import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPAL-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    
    logStep("Checking PayPal credentials", { 
      hasClientId: !!paypalClientId, 
      clientIdLength: paypalClientId?.length || 0,
      hasClientSecret: !!paypalClientSecret,
      secretLength: paypalClientSecret?.length || 0
    });
    
    if (!paypalClientId || !paypalClientSecret) {
      logStep("ERROR: PayPal credentials missing", { 
        clientId: paypalClientId ? "present" : "missing",
        clientSecret: paypalClientSecret ? "present" : "missing"
      });
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

    const { plan } = await req.json();
    if (!plan) throw new Error("Plan is required");
    logStep("Subscription plan requested", { plan });

    // Plan pricing
    const planPricing: { [key: string]: { amount: string, name: string } } = {
      "basic": { amount: "9.99", name: "Plan Básico" },
      "standard": { amount: "14.99", name: "Plan Estándar" },
      "premium": { amount: "19.99", name: "Plan Premium" }
    };

    const selectedPlan = planPricing[plan.toLowerCase()];
    if (!selectedPlan) throw new Error("Invalid plan selected");

    // Get PayPal access token
    const paypalAuth = btoa(`${paypalClientId}:${paypalClientSecret}`);
    
    // Determinar la URL de PayPal (sandbox o producción)
    const paypalBaseUrl = paypalClientId.includes('sandbox') || paypalClientId.startsWith('AV') 
      ? "https://api-m.sandbox.paypal.com" 
      : "https://api-m.paypal.com";
    
    logStep("Using PayPal environment", { baseUrl: paypalBaseUrl });
    
    const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
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

    // Create subscription - usando pagos únicos primero para testing
    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    // En lugar de suscripciones, usar pagos únicos que funcionan inmediatamente
    const paymentData = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: selectedPlan.amount,
        },
        description: `WatchHub ${selectedPlan.name} - Suscripción Mensual`,
      }],
      application_context: {
        brand_name: "WatchHub",
        user_action: "PAY_NOW",
        return_url: `${origin}/payment-success?provider=paypal&type=subscription&plan=${plan}`,
        cancel_url: `${origin}/payment-canceled`,
      },
    };

    logStep("Creating PayPal payment (subscription simulation)", { amount: selectedPlan.amount });

    const subscriptionResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify(paymentData),
    });

    if (!subscriptionResponse.ok) {
      const errorData = await subscriptionResponse.json();
      logStep("PayPal payment creation failed", errorData);
      throw new Error("Failed to create PayPal payment");
    }

    const payment = await subscriptionResponse.json();
    logStep("PayPal payment created", { paymentId: payment.id });

    // Store payment info in database (simulating subscription)
    await supabaseClient.from("paypal_subscriptions").insert({
      user_id: user.id,
      paypal_subscription_id: payment.id,
      plan_name: selectedPlan.name,
      amount: parseFloat(selectedPlan.amount),
      status: "pending",
      created_at: new Date().toISOString(),
    });

    const approvalUrl = payment.links.find((link: any) => link.rel === "approve")?.href;
    
    return new Response(JSON.stringify({ 
      url: approvalUrl,
      subscriptionId: payment.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-paypal-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});