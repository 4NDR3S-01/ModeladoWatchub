import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPLOAD-CONTENT] ${step}${detailsStr}`);
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

    const contentData = await req.json();
    const { 
      title, 
      description, 
      content_type, 
      genre, 
      age_rating, 
      duration, 
      release_year, 
      video_url, 
      poster_url, 
      trailer_url, 
      series_id, 
      season_number, 
      episode_number 
    } = contentData;

    // Validate required fields
    if (!title || !content_type) {
      throw new Error("Title and content type are required");
    }

    if (!["movie", "series", "episode", "documentary"].includes(content_type)) {
      throw new Error("Invalid content type");
    }

    // For episodes, series_id is required
    if (content_type === "episode" && !series_id) {
      throw new Error("Series ID is required for episodes");
    }

    logStep("Validated content data", { title, content_type });

    // Insert content into admin queue for approval
    const { data: queueData, error: queueError } = await supabaseClient
      .from("admin_content_queue")
      .insert({
        title,
        description,
        content_type,
        genre: genre || [],
        age_rating: age_rating || "G",
        duration,
        release_year,
        video_url,
        poster_url,
        trailer_url,
        uploaded_by: user.id,
        status: "pending"
      })
      .select()
      .single();

    if (queueError) {
      logStep("Error inserting into queue", { error: queueError });
      throw new Error(`Failed to submit content: ${queueError.message}`);
    }

    logStep("Content submitted to admin queue", { queueId: queueData.id });

    // Create notification for admins
    const { error: notificationError } = await supabaseClient
      .from("notifications")
      .insert({
        title: "Nuevo contenido pendiente de revisión",
        message: `Se ha subido nuevo contenido: "${title}" que requiere aprobación`,
        type: "content_review",
        action_url: `/admin/content-queue/${queueData.id}`,
        user_id: null // For all admins
      });

    if (notificationError) {
      logStep("Error creating notification", { error: notificationError });
    }

    return new Response(JSON.stringify({
      success: true,
      queue_id: queueData.id,
      message: "Content submitted successfully and is pending admin approval"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in upload-content", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
