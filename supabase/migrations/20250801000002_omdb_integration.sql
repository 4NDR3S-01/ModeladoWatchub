-- Modify existing continue_watching table for OMDb integration
DO $$
BEGIN
  -- Add OMDb-specific columns to continue_watching if they don't exist
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'continue_watching' AND column_name = 'imdb_id') THEN
    ALTER TABLE public.continue_watching 
    ADD COLUMN imdb_id TEXT,
    ADD COLUMN omdb_title TEXT,
    ADD COLUMN omdb_poster_url TEXT;
  END IF;
END $$;

-- Modify existing watchlist table for OMDb integration
DO $$
BEGIN
  -- Add OMDb-specific columns to watchlist if they don't exist
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'watchlist' AND column_name = 'imdb_id') THEN
    ALTER TABLE public.watchlist 
    ADD COLUMN imdb_id TEXT,
    ADD COLUMN omdb_title TEXT,
    ADD COLUMN omdb_poster_url TEXT,
    ADD COLUMN omdb_year TEXT,
    ADD COLUMN omdb_genre TEXT;
  END IF;
END $$;

-- Modify existing movies table for OMDb integration
DO $$
BEGIN
  -- Add OMDb-specific columns to movies if they don't exist
  IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'movies' AND column_name = 'imdb_id') THEN
    ALTER TABLE public.movies 
    ADD COLUMN imdb_id TEXT UNIQUE,
    ADD COLUMN director TEXT,
    ADD COLUMN actors TEXT[],
    ADD COLUMN country TEXT,
    ADD COLUMN language TEXT,
    ADD COLUMN awards TEXT,
    ADD COLUMN box_office TEXT,
    ADD COLUMN metascore INTEGER,
    ADD COLUMN imdb_votes TEXT,
    ADD COLUMN imdb_rating NUMERIC,
    ADD COLUMN is_omdb_imported BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create user favorites table for OMDb movies (separate from watchlist)
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  imdb_id TEXT NOT NULL,
  title TEXT NOT NULL,
  poster_url TEXT,
  year TEXT,
  genre TEXT,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, imdb_id)
);

-- Update site analytics for OMDb tracking
DO $$
BEGIN
  -- Add OMDb-specific columns to site_analytics if they don't exist
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'site_analytics') THEN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'site_analytics' AND column_name = 'omdb_searches') THEN
      ALTER TABLE public.site_analytics 
      ADD COLUMN omdb_searches INTEGER DEFAULT 0,
      ADD COLUMN movies_watched INTEGER DEFAULT 0;
    END IF;
  ELSE
    -- Create analytics table if it doesn't exist
    CREATE TABLE public.site_analytics (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      total_users INTEGER DEFAULT 0,
      active_users INTEGER DEFAULT 0,
      new_users INTEGER DEFAULT 0,
      total_revenue DECIMAL(10,2) DEFAULT 0,
      omdb_searches INTEGER DEFAULT 0,
      movies_watched INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      UNIQUE(date)
    );
  END IF;
END $$;

-- Enable RLS on new tables and update existing ones
DO $$
BEGIN
  -- Enable RLS on user_favorites if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_favorites') THEN
    ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
  END IF;
  
  -- Enable RLS on site_analytics if it exists and doesn't have RLS
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'site_analytics') THEN
    ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create/Update RLS policies
DO $$
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.user_favorites;
  DROP POLICY IF EXISTS "Users can manage their own watchlist" ON public.watchlist;
  DROP POLICY IF EXISTS "Users can view their own continue watching" ON public.continue_watching;
  DROP POLICY IF EXISTS "Users can insert their own continue watching" ON public.continue_watching;
  DROP POLICY IF EXISTS "Users can update their own continue watching" ON public.continue_watching;
  DROP POLICY IF EXISTS "Admins can view site analytics" ON public.site_analytics;

  -- User favorites policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_favorites') THEN
    CREATE POLICY "Users can manage their own favorites" ON public.user_favorites
        FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Continue watching policies (update existing)
  CREATE POLICY "Users can view their own continue watching" ON public.continue_watching
      FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own continue watching" ON public.continue_watching
      FOR INSERT WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own continue watching" ON public.continue_watching
      FOR UPDATE USING (auth.uid() = user_id);

  -- Analytics policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'site_analytics') THEN
    CREATE POLICY "Admins can view site analytics" ON public.site_analytics
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.user_id = auth.uid() 
                AND profiles.subscription_plan = 'admin'
            )
        );
  END IF;
END $$;
