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

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const genre = formData.get('genre') as string
    const duration = formData.get('duration') as string
    const ageRating = formData.get('age_rating') as string
    const requiredTier = formData.get('required_tier') as string

    if (!file || !title) {
      return new Response(
        JSON.stringify({ error: 'File and title are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov']
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only video files are allowed.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file size (max 5GB)
    const maxSize = 5 * 1024 * 1024 * 1024 // 5GB in bytes
    if (file.size > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 5GB limit' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}-${title.replace(/[^a-zA-Z0-9]/g, '-')}.${fileExtension}`

    try {
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('videos')
        .upload(`uploads/${fileName}`, file, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseClient.storage
        .from('videos')
        .getPublicUrl(`uploads/${fileName}`)

      // Create thumbnail (placeholder for now)
      const thumbnailUrl = `${publicUrl}?t=${timestamp}&thumb=true`

      // Insert content record
      const { data: content, error: dbError } = await supabaseClient
        .from('content')
        .insert({
          title,
          description,
          video_url: publicUrl,
          thumbnail_url: thumbnailUrl,
          duration: duration ? parseInt(duration) : null,
          genres: genre ? [genre] : [],
          age_rating: ageRating || 'G',
          required_tier: requiredTier || 'basic',
          status: 'processing',
          uploaded_by: user.id,
          file_size: file.size,
          file_name: fileName,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabaseClient.storage
          .from('videos')
          .remove([`uploads/${fileName}`])

        throw new Error(`Database error: ${dbError.message}`)
      }

      // Start background processing
      await startVideoProcessing(content.id, publicUrl, supabaseClient)

      return new Response(
        JSON.stringify({
          message: 'Video uploaded successfully and processing started',
          content: {
            id: content.id,
            title: content.title,
            status: content.status,
            video_url: content.video_url,
            thumbnail_url: content.thumbnail_url
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (storageError) {
      console.error('Storage error:', storageError)
      return new Response(
        JSON.stringify({ error: `Upload failed: ${storageError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function startVideoProcessing(contentId: string, videoUrl: string, supabaseClient: any) {
  try {
    // Update status to processing
    await supabaseClient
      .from('content')
      .update({ 
        status: 'processing',
        processing_started_at: new Date().toISOString()
      })
      .eq('id', contentId)

    // In a real implementation, this would trigger:
    // 1. Video transcoding to multiple qualities
    // 2. Thumbnail generation
    // 3. Subtitle extraction
    // 4. Content analysis for metadata
    
    // For now, simulate processing and mark as ready for review
    setTimeout(async () => {
      await supabaseClient
        .from('content')
        .update({ 
          status: 'pending_review',
          processing_completed_at: new Date().toISOString()
        })
        .eq('id', contentId)
    }, 5000) // 5 second delay to simulate processing

  } catch (error) {
    console.error('Processing error:', error)
    
    // Mark as failed
    await supabaseClient
      .from('content')
      .update({ 
        status: 'processing_failed',
        processing_error: error.message,
        processing_completed_at: new Date().toISOString()
      })
      .eq('id', contentId)
  }
}
