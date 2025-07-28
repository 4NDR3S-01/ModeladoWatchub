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
    const limit = parseInt(url.searchParams.get('limit') || '10')

    // Get user's watch history and preferences
    const { data: watchHistory } = await supabaseClient
      .from('watching_history')
      .select('content_id, content(*)')
      .eq('user_id', user.id)
      .order('watched_at', { ascending: false })
      .limit(50)

    const { data: watchlist } = await supabaseClient
      .from('watchlist')
      .select('content_id, content(*)')
      .eq('user_id', user.id)

    const { data: reviews } = await supabaseClient
      .from('reviews')
      .select('content_id, rating')
      .eq('user_id', user.id)

    const { data: preferences } = await supabaseClient
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Extract user preferences
    const likedGenres = new Set<string>()
    const watchedContentIds = new Set<string>()
    const averageRatingByGenre: Record<string, { total: number; count: number }> = {}

    // Analyze watch history
    watchHistory?.forEach(item => {
      if (item.content) {
        watchedContentIds.add(item.content.id)
        item.content.genres?.forEach((genre: string) => {
          likedGenres.add(genre)
        })
      }
    })

    // Analyze ratings by genre
    reviews?.forEach(review => {
      const content = watchHistory?.find(h => h.content_id === review.content_id)?.content
      if (content?.genres) {
        content.genres.forEach((genre: string) => {
          if (!averageRatingByGenre[genre]) {
            averageRatingByGenre[genre] = { total: 0, count: 0 }
          }
          averageRatingByGenre[genre].total += review.rating
          averageRatingByGenre[genre].count += 1
        })
      }
    })

    // Calculate preferred genres based on ratings
    const preferredGenres = Object.entries(averageRatingByGenre)
      .filter(([_, data]) => data.count >= 2 && (data.total / data.count) >= 4)
      .map(([genre]) => genre)

    // Get similar users (users who watched similar content)
    const { data: similarUsers } = await supabaseClient
      .rpc('get_similar_users', { 
        target_user_id: user.id,
        min_common_content: 3
      })

    const similarUserIds = similarUsers?.map((u: any) => u.user_id) || []

    // Get content recommendations
    let recommendationsQuery = supabaseClient
      .from('content')
      .select('*')
      .eq('status', 'published')
      .not('id', 'in', `(${Array.from(watchedContentIds).join(',') || 'null'})`)

    // Add genre filtering if we have preferred genres
    if (preferredGenres.length > 0) {
      recommendationsQuery = recommendationsQuery
        .overlaps('genres', preferredGenres)
    }

    const { data: genreRecommendations } = await recommendationsQuery
      .order('average_rating', { ascending: false })
      .limit(Math.ceil(limit * 0.6))

    // Get trending content
    const { data: trendingContent } = await supabaseClient
      .from('content')
      .select('*')
      .eq('status', 'published')
      .not('id', 'in', `(${Array.from(watchedContentIds).join(',') || 'null'})`)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('view_count', { ascending: false })
      .limit(Math.ceil(limit * 0.3))

    // Get collaborative filtering recommendations
    let collaborativeRecommendations: any[] = []
    if (similarUserIds.length > 0) {
      const { data } = await supabaseClient
        .from('watching_history')
        .select('content_id, content(*)')
        .in('user_id', similarUserIds)
        .not('content_id', 'in', `(${Array.from(watchedContentIds).join(',') || 'null'})`)

      const contentFrequency: Record<string, { content: any; count: number }> = {}
      data?.forEach(item => {
        if (item.content) {
          const key = item.content_id
          if (!contentFrequency[key]) {
            contentFrequency[key] = { content: item.content, count: 0 }
          }
          contentFrequency[key].count++
        }
      })

      collaborativeRecommendations = Object.values(contentFrequency)
        .sort((a, b) => b.count - a.count)
        .slice(0, Math.ceil(limit * 0.1))
        .map(item => item.content)
    }

    // Combine and deduplicate recommendations
    const allRecommendations = [
      ...(genreRecommendations || []),
      ...(trendingContent || []),
      ...collaborativeRecommendations
    ]

    const uniqueRecommendations = Array.from(
      new Map(allRecommendations.map(item => [item.id, item])).values()
    ).slice(0, limit)

    // Calculate recommendation scores
    const scoredRecommendations = uniqueRecommendations.map(content => {
      let score = 0

      // Genre preference score
      if (content.genres) {
        const genreMatches = content.genres.filter((genre: string) => 
          preferredGenres.includes(genre)
        ).length
        score += genreMatches * 10
      }

      // Rating score
      score += (content.average_rating || 0) * 2

      // Popularity score
      score += Math.log(content.view_count || 1)

      // Recency score for new content
      const daysSinceCreated = (Date.now() - new Date(content.created_at).getTime()) / (24 * 60 * 60 * 1000)
      if (daysSinceCreated <= 7) {
        score += 5
      }

      return {
        ...content,
        recommendation_score: score,
        recommendation_reasons: getRecommendationReasons(content, preferredGenres, similarUserIds.length > 0)
      }
    })

    // Sort by recommendation score
    scoredRecommendations.sort((a, b) => b.recommendation_score - a.recommendation_score)

    return new Response(
      JSON.stringify({ 
        recommendations: scoredRecommendations,
        metadata: {
          total: scoredRecommendations.length,
          user_preferences: {
            preferred_genres: preferredGenres,
            watched_content_count: watchedContentIds.size,
            similar_users_found: similarUserIds.length
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function getRecommendationReasons(content: any, preferredGenres: string[], hasSimilarUsers: boolean): string[] {
  const reasons: string[] = []

  if (content.genres && preferredGenres.some((genre: string) => content.genres.includes(genre))) {
    reasons.push('Based on your favorite genres')
  }

  if (content.average_rating >= 4.5) {
    reasons.push('Highly rated')
  }

  if (hasSimilarUsers) {
    reasons.push('Popular among similar users')
  }

  const daysSinceCreated = (Date.now() - new Date(content.created_at).getTime()) / (24 * 60 * 60 * 1000)
  if (daysSinceCreated <= 7) {
    reasons.push('New release')
  }

  if (content.view_count > 10000) {
    reasons.push('Trending')
  }

  return reasons
}
