-- Fix watchlist RLS policies that were accidentally removed
DO $$
BEGIN
  -- Recreate watchlist policies
  DROP POLICY IF EXISTS "Users can view their own watchlist" ON public.watchlist;
  DROP POLICY IF EXISTS "Users can manage their own watchlist" ON public.watchlist;
  DROP POLICY IF EXISTS "Users can remove from their own watchlist" ON public.watchlist;

  -- Create new comprehensive watchlist policies
  CREATE POLICY "Users can view their own watchlist" ON public.watchlist
    FOR SELECT USING (auth.uid() = user_id);

  CREATE POLICY "Users can manage their own watchlist" ON public.watchlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update their own watchlist" ON public.watchlist
    FOR UPDATE USING (auth.uid() = user_id);

  CREATE POLICY "Users can remove from their own watchlist" ON public.watchlist
    FOR DELETE USING (auth.uid() = user_id);
END $$;
