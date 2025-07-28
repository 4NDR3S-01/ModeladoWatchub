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

    // Verify admin authorization
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    switch (req.method) {
      case 'GET':
        if (action === 'list') {
          const page = parseInt(url.searchParams.get('page') || '1')
          const limit = parseInt(url.searchParams.get('limit') || '20')
          const status = url.searchParams.get('status')
          const search = url.searchParams.get('search')
          const sortBy = url.searchParams.get('sort_by') || 'created_at'
          const sortOrder = url.searchParams.get('sort_order') || 'desc'

          let query = supabaseClient
            .from('profiles')
            .select(`
              *,
              subscriptions (
                id,
                plan,
                status,
                current_period_start,
                current_period_end
              )
            `, { count: 'exact' })

          // Apply filters
          if (status && status !== 'all') {
            if (status === 'active_subscription') {
              query = query.not('subscriptions', 'is', null)
            } else if (status === 'no_subscription') {
              query = query.is('subscriptions', null)
            } else {
              query = query.eq('status', status)
            }
          }

          if (search) {
            query = query.or(
              `display_name.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%`
            )
          }

          // Apply sorting
          query = query.order(sortBy, { ascending: sortOrder === 'asc' })

          // Apply pagination
          const offset = (page - 1) * limit
          const { data: users, count, error } = await query
            .range(offset, offset + limit - 1)

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({
              users,
              pagination: {
                page,
                limit,
                total: count,
                total_pages: Math.ceil((count || 0) / limit)
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (action === 'stats') {
          const { data: stats } = await supabaseClient
            .rpc('get_user_stats')

          return new Response(
            JSON.stringify({ stats }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (action === 'detail') {
          const userId = url.searchParams.get('user_id')
          if (!userId) {
            return new Response(
              JSON.stringify({ error: 'User ID is required' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          const { data: userDetail } = await supabaseClient
            .from('profiles')
            .select(`
              *,
              subscriptions (*),
              watching_history (
                *,
                content (title, thumbnail_url)
              ),
              watchlist (
                *,
                content (title, thumbnail_url)
              ),
              reviews (
                *,
                content (title)
              )
            `)
            .eq('id', userId)
            .single()

          return new Response(
            JSON.stringify({ user: userDetail }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        break

      case 'POST': {
        const body = await req.json()

        if (action === 'suspend') {
          const { user_id, reason, duration_days } = body

          const suspensionEnd = duration_days 
            ? new Date(Date.now() + duration_days * 24 * 60 * 60 * 1000)
            : null

          const { error } = await supabaseClient
            .from('profiles')
            .update({
              status: 'suspended',
              suspension_reason: reason,
              suspension_end: suspensionEnd?.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', user_id)

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ message: 'User suspended successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (action === 'reactivate') {
          const { user_id } = body

          const { error } = await supabaseClient
            .from('profiles')
            .update({
              status: 'active',
              suspension_reason: null,
              suspension_end: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', user_id)

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ message: 'User reactivated successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (action === 'update_role') {
          const { user_id, role } = body

          if (!['user', 'admin', 'moderator'].includes(role)) {
            return new Response(
              JSON.stringify({ error: 'Invalid role' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          const { error } = await supabaseClient
            .from('profiles')
            .update({
              role,
              updated_at: new Date().toISOString()
            })
            .eq('id', user_id)

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ message: 'User role updated successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        break
      }

      case 'DELETE': {
        const userId = url.searchParams.get('user_id')
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Soft delete: mark user as deleted
        const { error } = await supabaseClient
          .from('profiles')
          .update({
            status: 'deleted',
            deleted_at: new Date().toISOString(),
            email: `deleted_${userId}@example.com`,
            display_name: 'Deleted User'
          })
          .eq('id', userId)

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ message: 'User deleted successfully' }),
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
