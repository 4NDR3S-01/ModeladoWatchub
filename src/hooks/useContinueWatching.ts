import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ContinueWatchingItem {
  id: string;
  movie_id: string;
  progress: number;
  time_left: string;
  last_watched: string;
  movie: {
    id: string;
    title: string;
    poster_url: string | null;
    duration: number | null;
  };
}

export const useContinueWatching = () => {
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchContinueWatching();
    }
  }, [user]);

  const fetchContinueWatching = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('continue_watching')
        .select(`
          id,
          movie_id,
          progress,
          time_left,
          last_watched,
          movies:movie_id (
            id,
            title,
            poster_url,
            duration
          )
        `)
        .eq('user_id', user.id)
        .order('last_watched', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const formattedData = data?.map(item => ({
        ...item,
        movie: item.movies
      })) || [];
      
      setContinueWatching(formattedData as ContinueWatchingItem[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching continue watching');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (movieId: string, progress: number, timeLeft: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('continue_watching')
        .upsert({
          user_id: user.id,
          movie_id: movieId,
          progress,
          time_left: timeLeft,
          last_watched: new Date().toISOString()
        }, {
          onConflict: 'user_id,movie_id'
        });

      if (error) throw error;
      
      await fetchContinueWatching();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el progreso.",
        variant: "destructive",
      });
    }
  };

  const removeFromContinueWatching = async (movieId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('continue_watching')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId);

      if (error) throw error;
      
      setContinueWatching(prev => prev.filter(item => item.movie_id !== movieId));
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar de continuar viendo.",
        variant: "destructive",
      });
    }
  };

  return {
    continueWatching,
    loading,
    error,
    fetchContinueWatching,
    updateProgress,
    removeFromContinueWatching,
  };
};
