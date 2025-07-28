import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { Authorization: req.headers.get('Authorization')! } 
        } 
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const contentId = url.searchParams.get('content_id')
    const action = url.searchParams.get('action')

    switch (req.method) {
      case 'GET':
        if (action === 'list') {
          const { data: reviews } = await supabaseClient
            .from('reviews')
            .select(`
              *,
              user:user_id (
                id,
                profiles (display_name, avatar_url)
              )
            `)
            .eq('content_id', contentId)
            .order('created_at', { ascending: false })

          return new Response(
            JSON.stringify({ reviews }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (action === 'user_review') {
          const { data: review } = await supabaseClient
            .from('reviews')
            .select('*')
            .eq('content_id', contentId)
            .eq('user_id', user.id)
            .single()

          return new Response(
            JSON.stringify({ review }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (action === 'stats') {
          const { data: stats } = await supabaseClient
            .rpc('get_review_stats', { content_id: contentId })

          return new Response(
            JSON.stringify({ stats }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        break

      case 'POST': {
        const body = await req.json()
        const { rating, comment } = body

        if (!contentId || !rating) {
          return new Response(
            JSON.stringify({ error: 'Content ID and rating are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Check if user already reviewed this content
        const { data: existingReview } = await supabaseClient
          .from('reviews')
          .select('id')
          .eq('content_id', contentId)
          .eq('user_id', user.id)
          .single()

        if (existingReview) {
          return new Response(
            JSON.stringify({ error: 'You have already reviewed this content' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: review, error } = await supabaseClient
          .from('reviews')
          .insert({
            content_id: contentId,
            user_id: user.id,
            rating,
            comment,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ review }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'PUT': {
        const body = await req.json()
        const { rating, comment } = body
        const reviewId = url.searchParams.get('review_id')

        if (!reviewId) {
          return new Response(
            JSON.stringify({ error: 'Review ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { data: review, error } = await supabaseClient
          .from('reviews')
          .update({
            rating,
            comment,
            updated_at: new Date().toISOString()
          })
          .eq('id', reviewId)
          .eq('user_id', user.id)
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ review }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'DELETE': {
        const reviewId = url.searchParams.get('review_id')

        if (!reviewId) {
          return new Response(
            JSON.stringify({ error: 'Review ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error } = await supabaseClient
          .from('reviews')
          .delete()
          .eq('id', reviewId)
          .eq('user_id', user.id)

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Review deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action or method' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
