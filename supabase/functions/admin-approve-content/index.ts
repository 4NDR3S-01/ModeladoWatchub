import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-APPROVE-CONTENT] ${step}${detailsStr}`);
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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      throw new Error("Unauthorized: Admin access required");
    }

    logStep("Admin access verified");

    const { content_id, action, review_notes } = await req.json();

    if (!content_id || !action) {
      throw new Error("Content ID and action are required");
    }

    if (!["approve", "reject"].includes(action)) {
      throw new Error("Invalid action. Must be 'approve' or 'reject'");
    }

    // Get content from queue
    const { data: queueContent, error: queueError } = await supabaseClient
      .from("admin_content_queue")
      .select("*")
      .eq("id", content_id)
      .eq("status", "pending")
      .single();

    if (queueError || !queueContent) {
      throw new Error("Content not found or already processed");
    }

    logStep("Found content in queue", { title: queueContent.title });

    if (action === "approve") {
      // Move content to main movies table
      const { data: movieData, error: movieError } = await supabaseClient
        .from("movies")
        .insert({
          title: queueContent.title,
          description: queueContent.description,
          content_type: queueContent.content_type,
          genre: queueContent.genre,
          age_rating: queueContent.age_rating,
          duration: queueContent.duration,
          release_year: queueContent.release_year,
          video_url: queueContent.video_url,
          poster_url: queueContent.poster_url,
          trailer_url: queueContent.trailer_url
        })
        .select()
        .single();

      if (movieError) {
        logStep("Error moving to movies table", { error: movieError });
        throw new Error(`Failed to approve content: ${movieError.message}`);
      }

      logStep("Content moved to movies table", { movieId: movieData.id });

      // Notify uploader of approval
      await supabaseClient
        .from("notifications")
        .insert({
          user_id: queueContent.uploaded_by,
          title: "Contenido aprobado",
          message: `Tu contenido "${queueContent.title}" ha sido aprobado y está ahora disponible en la plataforma`,
          type: "content_approved",
          action_url: `/watch/${movieData.id}`
        });
    } else {
      // Notify uploader of rejection
      await supabaseClient
        .from("notifications")
        .insert({
          user_id: queueContent.uploaded_by,
          title: "Contenido rechazado",
          message: `Tu contenido "${queueContent.title}" ha sido rechazado. ${review_notes ? `Motivo: ${review_notes}` : ''}`,
          type: "content_rejected"
        });
    }

    // Update queue status
    const { error: updateError } = await supabaseClient
      .from("admin_content_queue")
      .update({
        status: action === "approve" ? "approved" : "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: review_notes
      })
      .eq("id", content_id);

    if (updateError) {
      logStep("Error updating queue status", { error: updateError });
      throw new Error(`Failed to update queue: ${updateError.message}`);
    }

    logStep("Content review completed", { action, contentId: content_id });

    return new Response(JSON.stringify({
      success: true,
      action,
      message: `Content ${action === "approve" ? "approved and published" : "rejected"} successfully`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in admin-approve-content", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
