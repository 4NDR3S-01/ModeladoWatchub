import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: { persistSession: false }
      }
    );

    const { session_id } = await req.json();
    if (!session_id) {
      throw new Error("Session ID is required");
    }

    logStep("Verifying session", { session_id });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16"
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) {
      throw new Error("Session not found");
    }

    logStep("Session retrieved", { status: session.payment_status, customer: session.customer });

    if (session.payment_status === "paid" && session.mode === "subscription") {
      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      
      // Get customer details
      const customer = await stripe.customers.retrieve(session.customer as string);
      
      if (typeof customer === "string" || customer.deleted) {
        throw new Error("Customer not found");
      }

      const customerEmail = customer.email;
      if (!customerEmail) {
        throw new Error("Customer email not found");
      }

      // Determine subscription tier
      let subscriptionTier = "basic";
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;

      if (amount >= 1900) {
        subscriptionTier = "premium";
      } else if (amount >= 1400) {
        subscriptionTier = "standard";
      }

      logStep("Subscription details", {
        subscriptionId: subscription.id,
        tier: subscriptionTier,
        status: subscription.status
      });

      // Update subscriber record
      const { error: updateError } = await supabaseClient
        .from("subscribers")
        .upsert({
          email: customerEmail,
          stripe_customer_id: session.customer,
          subscribed: subscription.status === "active",
          subscription_tier: subscriptionTier,
          subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' });

      if (updateError) {
        logStep("Error updating subscriber", { error: updateError });
        throw new Error(`Failed to update subscriber: ${updateError.message}`);
      }

      // Create notification for user
      const { data: userData } = await supabaseClient
        .from("subscribers")
        .select("user_id")
        .eq("email", customerEmail)
        .single();

      if (userData?.user_id) {
        await supabaseClient
          .from("notifications")
          .insert({
            user_id: userData.user_id,
            title: "¡Suscripción activada!",
            message: `Tu suscripción ${subscriptionTier} ha sido activada exitosamente. ¡Disfruta del contenido premium!`,
            type: "subscription_activated"
          });
      }

      logStep("Payment verified and subscription updated");

      return new Response(JSON.stringify({
        success: true,
        verified: true,
        subscription_tier: subscriptionTier,
        subscription_status: subscription.status,
        message: "Payment verified and subscription activated"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        verified: false,
        payment_status: session.payment_status,
        message: "Payment not completed or not a subscription"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
