import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Interface for minimal movie data needed for watchlist
interface WatchlistMovie {
  imdbID: string;
  Title: string;
  Year?: string;
  Poster?: string;
  Genre?: string;
}

export const useOMDbWatchlist = () => {
  const [watchlistImdbIds, setWatchlistImdbIds] = useState<string[]>([]);
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
        .select('imdb_id')
        .eq('user_id', user.id)
        .not('imdb_id', 'is', null);

      if (error) throw error;
      setWatchlistImdbIds(data?.map(item => item.imdb_id).filter(Boolean) || []);
    } catch (error) {
      console.error('Error fetching OMDb watchlist:', error);
    }
  };

  const addMovieToWatchlist = async (movie: WatchlistMovie) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar películas a tu lista.",
        variant: "destructive",
      });
      return;
    }

    if (watchlistImdbIds.includes(movie.imdbID)) {
      toast({
        title: "Ya está en tu lista",
        description: "Esta película ya está en tu lista de reproducción.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Add directly to database instead of using the service function
      const { error } = await supabase
        .from('watchlist')
        .insert({
          user_id: user.id,
          movie_id: null, // For OMDb movies, we don't have a local movie_id
          imdb_id: movie.imdbID,
          omdb_title: movie.Title,
          omdb_poster_url: movie.Poster && movie.Poster !== 'N/A' ? movie.Poster : null,
          omdb_year: movie.Year,
          omdb_genre: movie.Genre
        });

      if (error) throw error;
      
      setWatchlistImdbIds(prev => [...prev, movie.imdbID]);
      toast({
        title: "Agregado a Mi Lista",
        description: "La película se ha agregado a tu lista.",
      });
    } catch (error: any) {
      console.error('Error adding to watchlist:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      if (error.code === '23505' || error.message.includes('duplicate')) {
        toast({
          title: "Ya está en tu lista",
          description: "Esta película ya está en tu lista de reproducción.",
          variant: "destructive",
        });
      } else if (error.message.includes('violates check constraint')) {
        toast({
          title: "Error de validación",
          description: "Los datos de la película no son válidos.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: `No se pudo agregar la película: ${error.message}`,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const removeMovieFromWatchlist = async (imdbId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      // Remove directly from database
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('imdb_id', imdbId);

      if (error) throw error;
      
      setWatchlistImdbIds(prev => prev.filter(id => id !== imdbId));
      toast({
        title: "Eliminado de Mi Lista",
        description: "La película se ha eliminado de tu lista.",
      });
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la película de tu lista.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isInWatchlist = (imdbId: string) => watchlistImdbIds.includes(imdbId);

  const toggleWatchlist = async (movie: WatchlistMovie) => {
    if (isInWatchlist(movie.imdbID)) {
      await removeMovieFromWatchlist(movie.imdbID);
    } else {
      await addMovieToWatchlist(movie);
    }
  };

  return {
    watchlistImdbIds,
    loading,
    addMovieToWatchlist,
    removeMovieFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    fetchWatchlist,
  };
};
