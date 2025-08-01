import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EnhancedVideoPlayer } from "@/components/ui/enhanced-video-player";
import { useOMDbMovies, EnhancedMovie } from "@/hooks/useOMDbMovies";
import { streamingService } from "@/services/streamingService";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Play, 
  Plus, 
  Star,
  Clock,
  Calendar,
  Globe,
  Award,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MovieSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<EnhancedMovie | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playerSource, setPlayerSource] = useState<any>(null);
  
  const { movies, loading, error, searchMovies, getMovieDetails, importMovie } = useOMDbMovies();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    await searchMovies(searchQuery);
  };

  const handleMovieClick = async (movie: EnhancedMovie) => {
    const details = await getMovieDetails(movie.imdb_id);
    if (details) {
      setSelectedMovie(details);
    }
  };

  const handlePlayMovie = async (movie: EnhancedMovie) => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para reproducir películas.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const bestSource = await streamingService.getBestQualitySource(movie.imdb_id);
    if (bestSource) {
      setPlayerSource(bestSource);
      setSelectedMovie(movie);
      setShowPlayer(true);
    } else {
      toast({
        title: "No disponible",
        description: "Esta película no está disponible para streaming en este momento.",
        variant: "destructive",
      });
    }
  };

  const handleImportMovie = async (movie: EnhancedMovie) => {
    if (!user) {
      toast({
        title: "Acceso denegado",
        description: "Solo los administradores pueden importar películas.",
        variant: "destructive",
      });
      return;
    }

    const bestSource = await streamingService.getBestQualitySource(movie.imdb_id);
    await importMovie(movie.imdb_id, bestSource?.url);
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <h1 className="text-4xl font-bold mb-4">Inicia sesión para continuar</h1>
          <p className="text-muted-foreground mb-8">
            Necesitas una cuenta para buscar y reproducir películas.
          </p>
          <Button onClick={() => navigate("/login")}>
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  if (showPlayer && selectedMovie && playerSource) {
    return (
      <EnhancedVideoPlayer
        source={playerSource}
        title={selectedMovie.title}
        onClose={() => setShowPlayer(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Buscar Películas</h1>
          <p className="text-muted-foreground">
            Busca cualquier película de la base de datos de IMDb y reprodúcela al instante
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar películas por título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <LoadingSpinner /> : "Buscar"}
            </Button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner />
          </div>
        )}

        {/* Movie Results Grid */}
        {!loading && movies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <Card key={movie.imdb_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-64 object-cover cursor-pointer"
                    onClick={() => handleMovieClick(movie)}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Badge variant="secondary" className="bg-black/70 text-white">
                      {movie.rating}/10
                    </Badge>
                    {movie.is_streamable && (
                      <Badge className="bg-green-600 text-white">
                        Disponible
                      </Badge>
                    )}
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1">{movie.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {movie.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {movie.release_year}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(movie.duration)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {movie.rating}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4" />
                    <span>{movie.language}</span>
                    <span>•</span>
                    <span>{movie.country}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {movie.genre.slice(0, 3).map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>

                  {movie.awards && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <Award className="w-4 h-4" />
                      <span className="line-clamp-1">{movie.awards}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handlePlayMovie(movie)}
                      className="flex-1"
                      disabled={!movie.is_streamable}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {movie.is_streamable ? "Reproducir" : "No disponible"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => handleImportMovie(movie)}
                      size="sm"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  {movie.available_platforms.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      También en: {movie.available_platforms.join(", ")}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && movies.length === 0 && searchQuery && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No se encontraron películas</h3>
            <p className="text-muted-foreground">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        )}

        {/* Initial State */}
        {!loading && movies.length === 0 && !searchQuery && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Busca cualquier película</h3>
            <p className="text-muted-foreground">
              Utiliza el buscador para encontrar películas de la base de datos de IMDb
            </p>
          </div>
        )}
      </div>

      {/* Movie Detail Modal */}
      {selectedMovie && !showPlayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{selectedMovie.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span>{selectedMovie.release_year}</span>
                    <span>•</span>
                    <span>{formatDuration(selectedMovie.duration)}</span>
                    <span>•</span>
                    <span>{selectedMovie.age_rating}</span>
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedMovie(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={selectedMovie.poster_url}
                  alt={selectedMovie.title}
                  className="w-32 h-48 object-cover rounded"
                />
                <div className="flex-1 space-y-3">
                  <p>{selectedMovie.description}</p>
                  
                  <div>
                    <strong>Director:</strong> {selectedMovie.director}
                  </div>
                  
                  <div>
                    <strong>Reparto:</strong> {selectedMovie.cast.slice(0, 3).join(", ")}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {selectedMovie.genre.map((genre) => (
                      <Badge key={genre} variant="outline">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{selectedMovie.rating}/10</span>
                    </div>
                    {selectedMovie.metascore && (
                      <div>
                        <span className="text-sm">Metascore: {selectedMovie.metascore}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handlePlayMovie(selectedMovie)}
                  className="flex-1"
                  disabled={!selectedMovie.is_streamable}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {selectedMovie.is_streamable ? "Reproducir" : "No disponible"}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleImportMovie(selectedMovie)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Importar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
