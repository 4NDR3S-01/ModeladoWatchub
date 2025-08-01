-- Create user favorites table to store favorite OMDb movies
CREATE TABLE public.user_favorites (
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

-- Create user watchlist table for OMDb movies
CREATE TABLE public.user_watchlist (
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

-- Create continue_watching table to track user progress with OMDb movies
CREATE TABLE public.continue_watching (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  imdb_id TEXT NOT NULL,
  title TEXT NOT NULL,
  poster_url TEXT,
  progress INTEGER DEFAULT 0, -- percentage watched (0-100)
  time_left TEXT, -- formatted time remaining
  last_watched TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, imdb_id)
);

-- Create analytics tables for admin dashboard
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

-- Add RLS policies
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.continue_watching ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;

-- User favorites are private to each user
CREATE POLICY "Users can manage their own favorites" ON public.user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- User watchlist is private to each user
CREATE POLICY "Users can manage their own watchlist" ON public.user_watchlist
    FOR ALL USING (auth.uid() = user_id);

-- Continue watching is private to each user
CREATE POLICY "Users can view their own continue watching" ON public.continue_watching
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own continue watching" ON public.continue_watching
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own continue watching" ON public.continue_watching
    FOR UPDATE USING (auth.uid() = user_id);

-- Analytics are only viewable by admins (you can modify this based on your admin system)
CREATE POLICY "Admins can view site analytics" ON public.site_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.subscription_plan = 'admin'
        )
    );
