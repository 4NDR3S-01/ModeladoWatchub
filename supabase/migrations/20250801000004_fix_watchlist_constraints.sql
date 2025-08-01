-- Fix watchlist table to allow NULL movie_id for OMDb movies
DO $$
BEGIN
  -- First, drop the NOT NULL constraint on movie_id if it exists
  ALTER TABLE public.watchlist 
  ALTER COLUMN movie_id DROP NOT NULL;
  
  -- Also drop the foreign key constraint and recreate it to allow NULL
  ALTER TABLE public.watchlist 
  DROP CONSTRAINT IF EXISTS watchlist_movie_id_fkey;
  
  -- Recreate the foreign key constraint to allow NULL values
  ALTER TABLE public.watchlist 
  ADD CONSTRAINT watchlist_movie_id_fkey 
  FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;
  
  -- Add a check constraint to ensure either movie_id OR imdb_id is present
  ALTER TABLE public.watchlist 
  DROP CONSTRAINT IF EXISTS check_movie_or_imdb_id;
  
  ALTER TABLE public.watchlist 
  ADD CONSTRAINT check_movie_or_imdb_id 
  CHECK (movie_id IS NOT NULL OR imdb_id IS NOT NULL);
  
  -- Add unique constraint for user_id + imdb_id combination to prevent duplicates
  ALTER TABLE public.watchlist 
  DROP CONSTRAINT IF EXISTS watchlist_user_imdb_unique;
  
  CREATE UNIQUE INDEX IF NOT EXISTS watchlist_user_imdb_unique 
  ON public.watchlist(user_id, imdb_id) 
  WHERE imdb_id IS NOT NULL;
  
  -- Add unique constraint for user_id + movie_id combination
  CREATE UNIQUE INDEX IF NOT EXISTS watchlist_user_movie_unique 
  ON public.watchlist(user_id, movie_id) 
  WHERE movie_id IS NOT NULL;
  
END $$;
