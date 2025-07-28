import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CONTENT-SEARCH] ${step}${detailsStr}`);
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

    const url = new URL(req.url);
    const searchQuery = url.searchParams.get('q') || '';
    const category = url.searchParams.get('category');
    const contentType = url.searchParams.get('type');
    const featured = url.searchParams.get('featured');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    logStep("Search parameters", {
      searchQuery,
      category,
      contentType,
      featured,
      limit,
      offset
    });

    let query = supabaseClient
      .from('content_with_categories')
      .select('*');

    // Apply search filters
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    if (category) {
      query = query.contains('category_names', [category]);
    }

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: content, error } = await query;

    if (error) {
      logStep("ERROR fetching content", { error });
      throw new Error(`Failed to search content: ${error.message}`);
    }

    logStep("Search completed", { resultsCount: content?.length || 0 });

    // Get categories for filtering
    const { data: categories } = await supabaseClient
      .from('categories')
      .select('*')
      .order('sort_order');

    return new Response(JSON.stringify({
      success: true,
      data: {
        content: content || [],
        categories: categories || [],
        totalCount: content?.length || 0,
        hasMore: content?.length === limit
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

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
