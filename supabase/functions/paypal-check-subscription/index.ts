import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYPAL-CHECK] ${step}${detailsStr}`);
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

    // Get user's PayPal subscriptions from database
    const { data: subscriptions, error: dbError } = await supabaseClient
      .from("paypal_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (dbError) {
      logStep("Database error", dbError);
      throw new Error("Failed to fetch subscription data");
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ 
        hasActiveSubscription: false,
        subscriptions: []
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

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

    // Check each subscription status with PayPal
    const activeSubscriptions = [];
    for (const subscription of subscriptions) {
      try {
        const subscriptionResponse = await fetch(
          `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscription.paypal_subscription_id}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (subscriptionResponse.ok) {
          const paypalSubscription = await subscriptionResponse.json();
          
          if (paypalSubscription.status === "ACTIVE") {
            activeSubscriptions.push({
              ...subscription,
              paypal_status: paypalSubscription.status,
              next_billing_time: paypalSubscription.billing_info?.next_billing_time
            });
          } else {
            // Update local database if PayPal says it's not active
            await supabaseClient
              .from("paypal_subscriptions")
              .update({ 
                status: paypalSubscription.status.toLowerCase(),
                updated_at: new Date().toISOString()
              })
              .eq("id", subscription.id);
          }
        }
      } catch (error) {
        logStep("Error checking subscription", { 
          subscriptionId: subscription.paypal_subscription_id, 
          error: error.message 
        });
      }
    }

    return new Response(JSON.stringify({ 
      hasActiveSubscription: activeSubscriptions.length > 0,
      subscriptions: activeSubscriptions
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in paypal-check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
