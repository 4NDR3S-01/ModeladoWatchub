import { useState } from 'react';
import * as omdbService from '@/services/omdbService';
import { streamingService } from '@/services/streamingService';
import type { StreamingSource } from '@/services/streamingService';
import { useToast } from '@/hooks/use-toast';

export interface EnhancedMovie {
  id?: string;
  imdb_id: string;
  title: string;
  description: string;
  poster_url: string;
  video_url?: string;
  streaming_sources: StreamingSource[];
  available_platforms: string[];
  duration: number | null;
  release_year: number;
  genre: string[];
  rating: number;
  director: string;
  cast: string[];
  age_rating: string;
  country: string;
  language: string;
  awards?: string;
  box_office?: string;
  metascore?: number;
  imdb_votes?: string;
  trailer_url?: string;
  is_streamable: boolean;
}

export const useOMDbMovies = () => {
  const [movies, setMovies] = useState<EnhancedMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Search movies from OMDb
  const searchMovies = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchResults = await omdbService.searchMovies(query);
      const enhancedMovies: EnhancedMovie[] = [];

      // Get detailed info for each movie (limit to first 5 for performance)
      const moviesToProcess = searchResults.Search.slice(0, 5);
      
      for (const movie of moviesToProcess) {
        try {
          const details = await omdbService.getMovieDetails(movie.imdbID);
          const streamingSources = await streamingService.getStreamingSources(movie.imdbID);
          const availablePlatforms = await streamingService.getAvailablePlatforms(movie.imdbID);
          const trailerUrl = await streamingService.getTrailerUrl(movie.imdbID);

          const enhancedMovie: EnhancedMovie = {
            imdb_id: details.imdbID,
            title: details.Title,
            description: details.Plot,
            poster_url: details.Poster !== 'N/A' ? details.Poster : '/placeholder.svg',
            streaming_sources: streamingSources,
            available_platforms: availablePlatforms,
            duration: parseDuration(details.Runtime),
            release_year: parseInt(details.Year),
            genre: details.Genre.split(', '),
            rating: parseFloat(details.imdbRating) || 0,
            director: details.Director,
            cast: details.Actors.split(', '),
            age_rating: details.Rated,
            country: details.Country,
            language: details.Language,
            awards: details.Awards !== 'N/A' ? details.Awards : undefined,
            box_office: details.BoxOffice !== 'N/A' ? details.BoxOffice : undefined,
            metascore: details.Metascore !== 'N/A' ? parseInt(details.Metascore) : undefined,
            imdb_votes: details.imdbVotes !== 'N/A' ? details.imdbVotes : undefined,
            trailer_url: trailerUrl || undefined,
            is_streamable: streamingSources.length > 0
          };

          enhancedMovies.push(enhancedMovie);
        } catch (movieError) {
          console.error(`Error processing movie ${movie.imdbID}:`, movieError);
        }
      }

      setMovies(enhancedMovies);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error searching movies';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get movie details by IMDb ID
  const getMovieDetails = async (imdbId: string): Promise<EnhancedMovie | null> => {
    try {
      setLoading(true);
      
      const details = await omdbService.getMovieDetails(imdbId);
      const streamingSources = await streamingService.getStreamingSources(imdbId);
      const availablePlatforms = await streamingService.getAvailablePlatforms(imdbId);
      const trailerUrl = await streamingService.getTrailerUrl(imdbId);

      return {
        imdb_id: details.imdbID,
        title: details.Title,
        description: details.Plot,
        poster_url: details.Poster !== 'N/A' ? details.Poster : '/placeholder.svg',
        streaming_sources: streamingSources,
        available_platforms: availablePlatforms,
        duration: parseDuration(details.Runtime),
        release_year: parseInt(details.Year),
        genre: details.Genre.split(', '),
        rating: parseFloat(details.imdbRating) || 0,
        director: details.Director,
        cast: details.Actors.split(', '),
        age_rating: details.Rated,
        country: details.Country,
        language: details.Language,
        awards: details.Awards !== 'N/A' ? details.Awards : undefined,
        box_office: details.BoxOffice !== 'N/A' ? details.BoxOffice : undefined,
        metascore: details.Metascore !== 'N/A' ? parseInt(details.Metascore) : undefined,
        imdb_votes: details.imdbVotes !== 'N/A' ? details.imdbVotes : undefined,
        trailer_url: trailerUrl || undefined,
        is_streamable: streamingSources.length > 0
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error getting movie details';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Import movie to our database (function not implemented)
  const importMovie = async (imdbId: string, streamingUrl?: string) => {
    try {
      setLoading(true);
      toast({
        title: "Información",
        description: "Función de importación no implementada aún.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error importing movie';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get popular movies
  const getPopularMovies = async () => {
    // Avoid multiple calls if already loading or has movies
    if (loading || movies.length > 0) return;
    
    try {
      setLoading(true);
      const popularResults = await omdbService.getPopularMovies();
      await processMovieList(popularResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error getting popular movies';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Get movies by genre (commented out - function doesn't exist)
  const getMoviesByGenre = async (genre: string) => {
    try {
      setLoading(true);
      // Function doesn't exist in omdbService
      toast({
        title: "Información",
        description: "Búsqueda por género no implementada aún.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error getting movies by genre';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to process movie list
  const processMovieList = async (movieList: any[]) => {
    const enhancedMovies: EnhancedMovie[] = [];

    for (const movie of movieList) {
      try {
        const details = await omdbService.getMovieDetails(movie.imdbID);
        const streamingSources = await streamingService.getStreamingSources(movie.imdbID);
        const availablePlatforms = await streamingService.getAvailablePlatforms(movie.imdbID);

        const enhancedMovie: EnhancedMovie = {
          imdb_id: details.imdbID,
          title: details.Title,
          description: details.Plot,
          poster_url: details.Poster !== 'N/A' ? details.Poster : '/placeholder.svg',
          streaming_sources: streamingSources,
          available_platforms: availablePlatforms,
          duration: parseDuration(details.Runtime),
          release_year: parseInt(details.Year),
          genre: details.Genre.split(', '),
          rating: parseFloat(details.imdbRating) || 0,
          director: details.Director,
          cast: details.Actors.split(', '),
          age_rating: details.Rated,
          country: details.Country,
          language: details.Language,
          trailer_url: await streamingService.getTrailerUrl(movie.imdbID) || undefined,
          is_streamable: streamingSources.length > 0
        };

        enhancedMovies.push(enhancedMovie);
      } catch (movieError) {
        console.error(`Error processing movie ${movie.imdbID}:`, movieError);
      }
    }

    setMovies(enhancedMovies);
  };

  const parseDuration = (runtime: string): number | null => {
    if (!runtime || runtime === 'N/A') return null;
    const match = runtime.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  return {
    movies,
    loading,
    error,
    searchMovies,
    getMovieDetails,
    importMovie,
    getPopularMovies,
    getMoviesByGenre,
  };
};
