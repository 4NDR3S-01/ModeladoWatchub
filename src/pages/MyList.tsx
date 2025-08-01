import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { ContentCard } from "@/components/ui/content-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/contexts/AuthContext";
import { getUserWatchlist, getUserFavorites, removeFromWatchlist, removeFromFavorites, getMovieDetails } from "@/services/omdbService";
import type { OMDbMovie } from "@/services/omdbService";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, Heart, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MyList = () => {
  const [watchlistMovies, setWatchlistMovies] = useState<any[]>([]);
  const [favoriteMovies, setFavoriteMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("watchlist");
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/welcome");
      return;
    }
    fetchUserLists();
  }, [user, navigate]);

  const fetchUserLists = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [watchlist, favorites] = await Promise.all([
        getUserWatchlist(),
        getUserFavorites()
      ]);
      
      setWatchlistMovies(watchlist);
      setFavoriteMovies(favorites);
    } catch (error) {
      console.error('Error fetching user lists:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus listas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleRemoveFromWatchlist = async (imdbId: string) => {
    if (!user) return;

    try {
      await removeFromWatchlist(imdbId);
      setWatchlistMovies(prev => prev.filter(movie => movie.imdb_id !== imdbId));
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
    }
  };

  const handleRemoveFromFavorites = async (imdbId: string) => {
    if (!user) return;

    try {
      await removeFromFavorites(imdbId);
      setFavoriteMovies(prev => prev.filter(movie => movie.imdb_id !== imdbId));
      toast({
        title: "Eliminado de Favoritos",
        description: "La película se ha eliminado de tus favoritos.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la película de tus favoritos.",
        variant: "destructive",
      });
    }
  };

  const handleMovieClick = async (imdbId: string) => {
    try {
      const movieDetails = await getMovieDetails(imdbId);
      if (movieDetails) {
        // Navigate to movie search page with the movie details
        navigate('/movie-search', { state: { selectedMovie: movieDetails } });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la película.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Mis Películas</h1>
          <p className="text-muted-foreground">
            Gestiona tus películas favoritas y lista de seguimiento
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="watchlist" className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Mi Lista ({watchlistMovies.length})
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Favoritos ({favoriteMovies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watchlist" className="mt-6">
            {watchlistMovies.length === 0 ? (
              <EmptyState
                title="Tu lista está vacía"
                description="Agrega películas a tu lista para verlas más tarde"
                action={{
                  label: "Buscar películas",
                  onClick: () => navigate("/movie-search")
                }}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {watchlistMovies.map((movie) => (
                  <div key={movie.imdb_id} className="relative group">
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleMovieClick(movie.imdb_id)}
                    >
                      <div className="relative overflow-hidden rounded-lg bg-muted">
                        <img 
                          src={movie.omdb_poster_url || movie.poster_url || "/placeholder.svg"} 
                          alt={movie.omdb_title || movie.title}
                          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm" variant="secondary">
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="font-semibold text-sm truncate">{movie.omdb_title || movie.title}</h3>
                        {movie.omdb_year && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {movie.omdb_year}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromWatchlist(movie.imdb_id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            {favoriteMovies.length === 0 ? (
              <EmptyState
                title="No tienes favoritos"
                description="Marca películas como favoritas para encontrarlas fácilmente"
                action={{
                  label: "Buscar películas",
                  onClick: () => navigate("/movie-search")
                }}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {favoriteMovies.map((movie) => (
                  <div key={movie.imdb_id} className="relative group">
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleMovieClick(movie.imdb_id)}
                    >
                      <div className="relative overflow-hidden rounded-lg bg-muted">
                        <img 
                          src={movie.poster_url || "/placeholder.svg"} 
                          alt={movie.title}
                          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm" variant="secondary">
                            Ver Detalles
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="font-semibold text-sm truncate">{movie.title}</h3>
                        {movie.year && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {movie.year}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromFavorites(movie.imdb_id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyList;