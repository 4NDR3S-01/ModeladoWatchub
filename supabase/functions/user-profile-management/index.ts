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
    const action = url.searchParams.get('action')

    switch (req.method) {
      case 'GET':
        if (action === 'profile') {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          return new Response(
            JSON.stringify({ profile }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (action === 'preferences') {
          const { data: preferences } = await supabaseClient
            .from('user_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single()

          return new Response(
            JSON.stringify({ preferences }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (action === 'watching_history') {
          const { data: history } = await supabaseClient
            .from('watching_history')
            .select(`
              *,
              content:content_id (*)
            `)
            .eq('user_id', user.id)
            .order('watched_at', { ascending: false })
            .limit(50)

          return new Response(
            JSON.stringify({ history }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        break

      case 'POST':
      case 'PUT':
        const body = await req.json()

        if (action === 'update_profile') {
          const { data: profile, error } = await supabaseClient
            .from('profiles')
            .upsert({
              id: user.id,
              ...body,
              updated_at: new Date().toISOString()
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
            JSON.stringify({ profile }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (action === 'update_preferences') {
          const { data: preferences, error } = await supabaseClient
            .from('user_preferences')
            .upsert({
              user_id: user.id,
              ...body,
              updated_at: new Date().toISOString()
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
            JSON.stringify({ preferences }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (action === 'change_password') {
          const { password } = body
          
          const { error } = await supabaseClient.auth.updateUser({
            password: password
          })

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ message: 'Password updated successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (action === 'delete_account') {
          // Soft delete: mark profile as deleted
          const { error } = await supabaseClient
            .from('profiles')
            .update({ 
              deleted_at: new Date().toISOString(),
              email: `deleted_${user.id}@example.com`
            })
            .eq('id', user.id)

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ message: 'Account marked for deletion' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        break

      case 'DELETE':
        if (action === 'clear_history') {
          const { error } = await supabaseClient
            .from('watching_history')
            .delete()
            .eq('user_id', user.id)

          if (error) {
            return new Response(
              JSON.stringify({ error: error.message }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          return new Response(
            JSON.stringify({ message: 'Watching history cleared' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        break
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
