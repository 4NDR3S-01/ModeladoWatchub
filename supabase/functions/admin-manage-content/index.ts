import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-MANAGE-CONTENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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

    // Check if user is admin
    const { data: isAdminData, error: roleError } = await supabaseClient
      .rpc('is_admin', { _user_id: user.id });

    if (roleError || !isAdminData) {
      throw new Error("Access denied. Admin privileges required.");
    }

    logStep("Admin privileges verified");

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const movieId = url.searchParams.get('movieId');

    switch (action) {
      case 'list':
        logStep("Listing all content");
        const { data: movies, error: listError } = await supabaseClient
          .from('content_with_categories')
          .select('*')
          .order('created_at', { ascending: false });

        if (listError) throw new Error(`Failed to fetch content: ${listError.message}`);

        return new Response(JSON.stringify({
          success: true,
          data: movies
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });

      case 'get':
        if (!movieId) throw new Error("Movie ID is required for get action");

        logStep("Getting content details", { movieId });

        const { data: movie, error: getError } = await supabaseClient
          .from('content_with_categories')
          .select('*')
          .eq('id', movieId)
          .single();

        if (getError) throw new Error(`Failed to fetch content: ${getError.message}`);

        return new Response(JSON.stringify({
          success: true,
          data: movie
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });

      case 'update':
        if (!movieId) throw new Error("Movie ID is required for update action");

        const updateData = await req.json();
        logStep("Updating content", { movieId, updateData });

        const { data: updatedMovie, error: updateError } = await supabaseClient
          .from('movies')
          .update(updateData)
          .eq('id', movieId)
          .select()
          .single();

        if (updateError) throw new Error(`Failed to update content: ${updateError.message}`);

        return new Response(JSON.stringify({
          success: true,
          data: updatedMovie,
          message: "Content updated successfully"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });

      case 'delete':
        if (!movieId) throw new Error("Movie ID is required for delete action");

        logStep("Deleting content", { movieId });

        // Delete associated storage files first
        const { data: storageFiles } = await supabaseClient.storage
          .from('videos')
          .list(`content/${movieId}`);

        if (storageFiles && storageFiles.length > 0) {
          const filePaths = storageFiles.map(file => `content/${movieId}/${file.name}`);
          await supabaseClient.storage.from('videos').remove(filePaths);
          await supabaseClient.storage.from('posters').remove(filePaths);
          await supabaseClient.storage.from('trailers').remove(filePaths);
          await supabaseClient.storage.from('backdrops').remove(filePaths);
        }

        const { error: deleteError } = await supabaseClient
          .from('movies')
          .delete()
          .eq('id', movieId);

        if (deleteError) throw new Error(`Failed to delete content: ${deleteError.message}`);

        return new Response(JSON.stringify({
          success: true,
          message: "Content deleted successfully"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });

      case 'update-urls':
        if (!movieId) throw new Error("Movie ID is required for update-urls action");

        const urlData = await req.json();
        const { poster_url, video_url, trailer_url, backdrop_url } = urlData;

        logStep("Updating content URLs", { movieId, urlData });

        const { data: urlUpdatedMovie, error: urlUpdateError } = await supabaseClient
          .from('movies')
          .update({
            poster_url,
            video_url,
            trailer_url,
            backdrop_url
          })
          .eq('id', movieId)
          .select()
          .single();

        if (urlUpdateError) throw new Error(`Failed to update URLs: ${urlUpdateError.message}`);

        return new Response(JSON.stringify({
          success: true,
          data: urlUpdatedMovie,
          message: "Content URLs updated successfully"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });

      default:
        throw new Error("Invalid action. Supported actions: list, get, update, delete, update-urls");
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
