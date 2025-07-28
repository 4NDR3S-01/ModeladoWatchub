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

    if (!contentId) {
      return new Response(
        JSON.stringify({ error: 'Content ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check user subscription
    const { data: subscription } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return new Response(
        JSON.stringify({ 
          error: 'Active subscription required',
          hasAccess: false 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get content details
    const { data: content } = await supabaseClient
      .from('content')
      .select('*')
      .eq('id', contentId)
      .eq('status', 'published')
      .single()

    if (!content) {
      return new Response(
        JSON.stringify({ 
          error: 'Content not found or not available',
          hasAccess: false 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check subscription tier access
    const tierHierarchy = { basic: 1, standard: 2, premium: 3 }
    const userTier = tierHierarchy[subscription.plan as keyof typeof tierHierarchy] || 0
    const requiredTier = tierHierarchy[content.required_tier as keyof typeof tierHierarchy] || 1

    if (userTier < requiredTier) {
      return new Response(
        JSON.stringify({ 
          error: `${content.required_tier} subscription required`,
          hasAccess: false,
          userTier: subscription.plan,
          requiredTier: content.required_tier
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check parental controls if applicable
    if (content.age_rating && content.age_rating !== 'G') {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('date_of_birth, parental_controls')
        .eq('id', user.id)
        .single()

      if (profile?.parental_controls?.enabled) {
        const ageRatingMap = {
          'G': 0,
          'PG': 8,
          'PG-13': 13,
          'R': 17,
          'NC-17': 18
        }

        const requiredAge = ageRatingMap[content.age_rating as keyof typeof ageRatingMap] || 18
        const userAge = profile.date_of_birth 
          ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : 0

        if (userAge < requiredAge) {
          return new Response(
            JSON.stringify({ 
              error: 'Content restricted by parental controls',
              hasAccess: false,
              ageRating: content.age_rating
            }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // Generate secure streaming URL
    const streamingUrl = await generateStreamingUrl(content.video_url, user.id)

    // Log access for analytics
    await supabaseClient
      .from('content_access_logs')
      .insert({
        user_id: user.id,
        content_id: contentId,
        access_type: 'stream',
        accessed_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({ 
        hasAccess: true,
        content: {
          id: content.id,
          title: content.title,
          description: content.description,
          duration: content.duration,
          thumbnail_url: content.thumbnail_url
        },
        streamingUrl,
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        hasAccess: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function generateStreamingUrl(videoUrl: string, userId: string): Promise<string> {
  // In production, this would generate a signed URL with expiration
  // For now, return the URL with a token parameter
  const token = btoa(`${userId}:${Date.now()}:${Math.random()}`)
  const separator = videoUrl.includes('?') ? '&' : '?'
  return `${videoUrl}${separator}token=${token}&expires=${Date.now() + 4 * 60 * 60 * 1000}`
}
