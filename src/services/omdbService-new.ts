import { supabase } from '@/integrations/supabase/client';

const OMDB_API_KEY = '6e7381aa';
const OMDB_BASE_URL = 'http://www.omdbapi.com/';

export interface OMDbMovie {
  imdbID: string;
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Array<{
    Source: string;
    Value: string;
  }>;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}

export interface OMDbSearchResult {
  Search: Array<{
    Title: string;
    Year: string;
    imdbID: string;
    Type: string;
    Poster: string;
  }>;
  totalResults: string;
  Response: string;
}

// Get movie details by IMDb ID
export const getMovieDetails = async (imdbId: string): Promise<OMDbMovie> => {
  try {
    const response = await fetch(
      `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&i=${imdbId}&plot=full`
    );
    
    if (!response.ok) {
      throw new Error('Error al obtener detalles de la película');
    }
    
    const data = await response.json();
    
    if (data.Response === 'False') {
      throw new Error(data.Error || 'Película no encontrada');
    }
    
    return data;
  } catch (error) {
    console.error('Error getting movie details:', error);
    throw error;
  }
};

// Search movies by title
export const searchMovies = async (query: string, page: number = 1): Promise<OMDbSearchResult> => {
  try {
    const response = await fetch(
      `${OMDB_BASE_URL}?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error('Error en la búsqueda de películas');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

// Get popular movies
export const getPopularMovies = async (): Promise<OMDbMovie[]> => {
  const popularImdbIds = [
    'tt0111161', // The Shawshank Redemption
    'tt0068646', // The Godfather
    'tt0468569', // The Dark Knight
    'tt0167260', // The Lord of the Rings: The Return of the King
    'tt0110912', // Pulp Fiction
    'tt0050083', // 12 Angry Men
    'tt0060196', // The Good, the Bad and the Ugly
    'tt0108052', // Schindler's List
    'tt0137523', // Fight Club
    'tt0080684', // Star Wars: Episode V - The Empire Strikes Back
  ];

  try {
    const promises = popularImdbIds.map(id => getMovieDetails(id));
    const movies = await Promise.all(promises);
    return movies.filter(movie => movie.Response !== 'False');
  } catch (error) {
    console.error('Error getting popular movies:', error);
    return [];
  }
};

// Get trending movies
export const getTrendingMovies = async (): Promise<OMDbMovie[]> => {
  const trendingImdbIds = [
    'tt15398776', // Oppenheimer
    'tt1517268', // Barbie
    'tt6710474', // Everything Everywhere All at Once
    'tt9114286', // Black Panther: Wakanda Forever  
    'tt1630029', // Avatar: The Way of Water
    'tt10872600', // Spider-Man: No Way Home
    'tt9376612', // Shang-Chi and the Legend of the Ten Rings
    'tt9032400', // Eternals
  ];

  try {
    const promises = trendingImdbIds.map(id => getMovieDetails(id));
    const movies = await Promise.all(promises);
    return movies.filter(movie => movie.Response !== 'False');
  } catch (error) {
    console.error('Error getting trending movies:', error);
    return [];
  }
};

// Add movie to user's favorites
export const addToFavorites = async (movie: OMDbMovie): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        imdb_id: movie.imdbID,
        title: movie.Title,
        poster_url: movie.Poster !== 'N/A' ? movie.Poster : null,
        year: movie.Year,
        genre: movie.Genre
      });

    if (error) {
      if (error.code === '23505') {
        throw new Error('Esta película ya está en tus favoritos');
      }
      throw error;
    }

    console.log('Movie added to favorites successfully');
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

// Remove movie from user's favorites
export const removeFromFavorites = async (imdbId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('imdb_id', imdbId);

    if (error) throw error;

    console.log('Movie removed from favorites successfully');
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

// Get user's favorite movies
export const getUserFavorites = async (): Promise<any[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return [];
  }
};

// Add movie to user's watchlist
export const addToWatchlist = async (movie: OMDbMovie): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('watchlist')
      .insert({
        user_id: user.id,
        imdb_id: movie.imdbID,
        omdb_title: movie.Title,
        omdb_poster_url: movie.Poster !== 'N/A' ? movie.Poster : null,
        omdb_year: movie.Year,
        omdb_genre: movie.Genre,
        title: movie.Title,
        poster_url: movie.Poster !== 'N/A' ? movie.Poster : null
      });

    if (error) {
      if (error.code === '23505') {
        throw new Error('Esta película ya está en tu lista');
      }
      throw error;
    }

    console.log('Movie added to watchlist successfully');
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

// Remove movie from user's watchlist
export const removeFromWatchlist = async (imdbId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('imdb_id', imdbId);

    if (error) throw error;

    console.log('Movie removed from watchlist successfully');
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
};

// Get user's watchlist
export const getUserWatchlist = async (): Promise<any[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting user watchlist:', error);
    return [];
  }
};
