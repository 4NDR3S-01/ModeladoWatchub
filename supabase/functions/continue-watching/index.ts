import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONTINUE-WATCHING] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);

    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const movieId = url.searchParams.get('movieId');
    const profileId = url.searchParams.get('profileId');

    switch (action) {
      case 'list':
        logStep("Getting continue watching list");

        let query = supabaseClient
          .from('continue_watching')
          .select(`
            *,
            movies:movie_id (
              id,
              title,
              description,
              poster_url,
              content_type,
              duration,
              rating,
              release_year,
              age_rating,
              series_id,
              season_number,
              episode_number
            )
          `)
          .eq('user_id', user.id);

        if (profileId) {
          query = query.eq('profile_id', profileId);
        }

        query = query
          .gte('progress_percentage', 5) // Only show if at least 5% watched
          .lt('progress_percentage', 90) // Don't show if almost finished
          .order('last_watched_at', { ascending: false })
          .limit(20);

        const { data: continueWatching, error: listError } = await query;

        if (listError) throw new Error(`Failed to fetch continue watching: ${listError.message}`);

        return new Response(JSON.stringify({
          success: true,
          data: continueWatching
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });

      case 'update':
        if (!movieId || !profileId) throw new Error("Movie ID and Profile ID are required for update action");

        const updateData = await req.json();
        const { progress_seconds, duration_seconds } = updateData;

        logStep("Updating watch progress", {
          movieId,
          profileId,
          progress_seconds,
          duration_seconds
        });

        const { data: updatedProgress, error: updateError } = await supabaseClient
          .from('continue_watching')
          .upsert({
            user_id: user.id,
            profile_id: profileId,
            movie_id: movieId,
            progress_seconds,
            duration_seconds,
            last_watched_at: new Date().toISOString()
          })
          .select()
          .single();

        if (updateError) throw new Error(`Failed to update progress: ${updateError.message}`);

        // Update view count
        await supabaseClient
          .from('movies')
          .update({
            views: supabaseClient.rpc('increment_views', { movie_id: movieId })
          })
          .eq('id', movieId);

        return new Response(JSON.stringify({
          success: true,
          data: updatedProgress,
          message: "Progress updated successfully"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });

      case 'get':
        if (!movieId || !profileId) throw new Error("Movie ID and Profile ID are required for get action");

        logStep("Getting watch progress", { movieId, profileId });

        const { data: progress, error: getError } = await supabaseClient
          .from('continue_watching')
          .select('*')
          .eq('user_id', user.id)
          .eq('profile_id', profileId)
          .eq('movie_id', movieId)
          .single();

        if (getError && getError.code !== 'PGRST116') {
          throw new Error(`Failed to get progress: ${getError.message}`);
        }

        return new Response(JSON.stringify({
          success: true,
          data: progress || null
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });

      case 'remove':
        if (!movieId || !profileId) throw new Error("Movie ID and Profile ID are required for remove action");

        logStep("Removing from continue watching", { movieId, profileId });

        const { error: removeError } = await supabaseClient
          .from('continue_watching')
          .delete()
          .eq('user_id', user.id)
          .eq('profile_id', profileId)
          .eq('movie_id', movieId);

        if (removeError) throw new Error(`Failed to remove from continue watching: ${removeError.message}`);

        return new Response(JSON.stringify({
          success: true,
          message: "Removed from continue watching successfully"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });

      default:
        throw new Error("Invalid action. Supported actions: list, update, get, remove");
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
