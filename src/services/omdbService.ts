import { supabase } from '@/integrations/supabase/client';

const OMDB_API_KEY = '6e7381aa';
const OMDB_BASE_URL = 'https://www.omdbapi.com/';

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

// Search movies by title
export async function searchMovies(query: string, page: number = 1): Promise<OMDbSearchResult> {
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
}

// Get movie details by IMDb ID
export async function getMovieDetails(imdbId: string): Promise<OMDbMovie> {
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
}

// Add movie to user's favorites (using new user_favorites table)
export async function addToFavorites(movie: OMDbMovie): Promise<void> {
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

    if (error) throw error;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
}

// Remove movie from user's favorites
export async function removeFromFavorites(imdbId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('imdb_id', imdbId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
}

// Get user's favorite movies
export async function getUserFavorites(): Promise<any[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
}

// Add movie to user's watchlist (using existing watchlist table)
export async function addToWatchlist(movie: OMDbMovie): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('watchlist')
      .insert({
        user_id: user.id,
        movie_id: null, // For OMDb movies, we don't have a local movie_id
        imdb_id: movie.imdbID,
        omdb_title: movie.Title,
        omdb_poster_url: movie.Poster !== 'N/A' ? movie.Poster : null,
        omdb_year: movie.Year,
        omdb_genre: movie.Genre
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
}

// Remove movie from user's watchlist
export async function removeFromWatchlist(imdbId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('imdb_id', imdbId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    throw error;
  }
}

// Get user's watchlist (OMDb movies)
export async function getUserWatchlist(): Promise<any[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .not('imdb_id', 'is', null) // Only OMDb movies
      .order('added_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting watchlist:', error);
    throw error;
  }
}

// Update continue watching progress (using watch_history table)
export async function updateWatchProgress(
  imdbId: string, 
  title: string, 
  posterUrl: string, 
  progress: number, 
  timeLeft: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('watch_history')
      .upsert({
        user_id: user.id,
        movie_id: null, // For OMDb movies, we don't have a local movie_id
        progress: progress,
        watched_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating watch progress:', error);
    throw error;
  }
}

// Get user's continue watching list (using watch_history)
export async function getContinueWatching(): Promise<any[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('user_id', user.id)
      .order('watched_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting continue watching:', error);
    throw error;
  }
}

// Get popular movies (using predefined IMDb IDs)
export async function getPopularMovies(): Promise<OMDbMovie[]> {
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
}

// Get trending movies (mix of recent popular movies)
export async function getTrendingMovies(): Promise<OMDbMovie[]> {
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
}
