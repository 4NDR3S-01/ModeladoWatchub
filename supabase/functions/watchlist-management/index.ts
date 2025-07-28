import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WATCHLIST-MANAGEMENT] ${step}${detailsStr}`);
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

    switch (action) {
      case 'list':
        logStep("Getting user watchlist");
        const { data: watchlist, error: listError } = await supabaseClient
          .from('watchlist')
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
              age_rating
            )
          `)
          .eq('user_id', user.id)
          .order('added_at', { ascending: false });

        if (listError) throw new Error(`Failed to fetch watchlist: ${listError.message}`);

        return new Response(JSON.stringify({
          success: true,
          data: watchlist
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });

      case 'add':
        if (!movieId) throw new Error("Movie ID is required for add action");
        
        logStep("Adding to watchlist", { movieId });

        // Check if already in watchlist
        const { data: existing } = await supabaseClient
          .from('watchlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('movie_id', movieId)
          .single();

        if (existing) {
          return new Response(JSON.stringify({
            success: true,
            message: "Content already in watchlist"
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
          });
        }

        const { data: newWatchlistItem, error: addError } = await supabaseClient
          .from('watchlist')
          .insert({
            user_id: user.id,
            movie_id: movieId
          })
          .select()
          .single();

        if (addError) throw new Error(`Failed to add to watchlist: ${addError.message}`);

        return new Response(JSON.stringify({
          success: true,
          data: newWatchlistItem,
          message: "Added to watchlist successfully"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });

      case 'remove':
        if (!movieId) throw new Error("Movie ID is required for remove action");

        logStep("Removing from watchlist", { movieId });

        const { error: removeError } = await supabaseClient
          .from('watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('movie_id', movieId);

        if (removeError) throw new Error(`Failed to remove from watchlist: ${removeError.message}`);

        return new Response(JSON.stringify({
          success: true,
          message: "Removed from watchlist successfully"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });

      case 'check':
        if (!movieId) throw new Error("Movie ID is required for check action");

        logStep("Checking if in watchlist", { movieId });

        const { data: isInWatchlist } = await supabaseClient
          .from('watchlist')
          .select('id')
          .eq('user_id', user.id)
          .eq('movie_id', movieId)
          .single();

        return new Response(JSON.stringify({
          success: true,
          data: { isInWatchlist: !!isInWatchlist }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200
        });

      default:
        throw new Error("Invalid action. Supported actions: list, add, remove, check");
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
