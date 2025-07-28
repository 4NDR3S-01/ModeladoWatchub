import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useWatchlist = () => {
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchWatchlist();
    }
  }, [user]);

  const fetchWatchlist = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('movie_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setWatchlistIds(data?.map(item => item.movie_id) || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const addToWatchlist = async (movieId: string) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar películas a tu lista.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('watchlist')
        .insert({ user_id: user.id, movie_id: movieId });

      if (error) throw error;
      
      setWatchlistIds(prev => [...prev, movieId]);
      toast({
        title: "Agregado a Mi Lista",
        description: "La película se ha agregado a tu lista.",
      });
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Ya está en tu lista",
          description: "Esta película ya está en tu lista de reproducción.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo agregar la película a tu lista.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (movieId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId);

      if (error) throw error;
      
      setWatchlistIds(prev => prev.filter(id => id !== movieId));
      toast({
        title: "Eliminado de Mi Lista",
        description: "La película se ha eliminado de tu lista.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la película de tu lista.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isInWatchlist = (movieId: string) => watchlistIds.includes(movieId);

  return {
    watchlistIds,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    fetchWatchlist,
  };
};