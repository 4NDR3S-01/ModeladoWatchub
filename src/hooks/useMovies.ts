import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Movie {
  id: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  video_url: string | null;
  duration: number | null;
  release_year: number | null;
  genre: string[] | null;
  rating: number | null;
  views: number | null;
  featured: boolean | null;
  director: string | null;
  cast: string[] | null;
  trailer_url: string | null;
  backdrop_url: string | null;
  age_rating: string | null;
  is_original: boolean | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export const useMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovies(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching movies');
    } finally {
      setLoading(false);
    }
  };

  const getFeaturedMovies = () => movies.filter(movie => movie.featured);

  const getMoviesByGenre = (genre: string) => 
    movies.filter(movie => movie.genre?.includes(genre));

  return {
    movies,
    loading,
    error,
    fetchMovies,
    getFeaturedMovies,
    getMoviesByGenre,
  };
};