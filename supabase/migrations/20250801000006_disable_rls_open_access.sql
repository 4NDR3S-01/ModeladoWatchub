-- Disable RLS policies to allow everyone to watch movies
DO $$
BEGIN
    -- Disable RLS on critical tables to allow open access
    ALTER TABLE public.movies DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.watchlist DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_favorites DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.continue_watching DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.watch_history DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.subscribers DISABLE ROW LEVEL SECURITY;
    
    -- Drop all restrictive policies
    DROP POLICY IF EXISTS "Movies are viewable by everyone" ON public.movies;
    DROP POLICY IF EXISTS "Users can view their own watchlist" ON public.watchlist;
    DROP POLICY IF EXISTS "Users can manage their own watchlist" ON public.watchlist;
    DROP POLICY IF EXISTS "Users can update their own watchlist" ON public.watchlist;
    DROP POLICY IF EXISTS "Users can remove from their own watchlist" ON public.watchlist;
    DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.user_favorites;
    DROP POLICY IF EXISTS "Users can view their own continue watching" ON public.continue_watching;
    DROP POLICY IF EXISTS "Users can insert their own continue watching" ON public.continue_watching;
    DROP POLICY IF EXISTS "Users can update their own continue watching" ON public.continue_watching;
    
    RAISE NOTICE 'RLS policies disabled - open access enabled for all users';
END $$;
