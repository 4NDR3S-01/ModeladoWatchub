import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { ContentCard } from "@/components/ui/content-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOMDbMovies } from "@/hooks/useOMDbMovies";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Search, Grid, List } from "lucide-react";

const Categories = () => {
  const { movies: omdbMovies, loading: omdbLoading, getPopularMovies, searchMovies } = useOMDbMovies();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [sortBy, setSortBy] = useState("title");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [omdbSearchTerm, setOmdbSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/welcome");
    } else {
      // Load popular movies from OMDb when user is logged in
      getPopularMovies();
    }
  }, [user, navigate, getPopularMovies]);

  // Use only OMDb movies instead of combining with local movies
  const allMovies = omdbMovies.map(movie => ({
    id: movie.imdb_id,
    title: movie.title,
    description: movie.description,
    poster_url: movie.poster_url,
    video_url: movie.video_url,
    duration: movie.duration,
    release_year: movie.release_year,
    genre: movie.genre,
    rating: movie.rating,
    director: movie.director,
    cast: movie.cast,
    age_rating: movie.age_rating,
    country: movie.country,
    language: movie.language,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    imdb_id: movie.imdb_id,
    is_featured: false,
    is_trending: false
  }));

  useEffect(() => {
    if (!user) {
      navigate("/welcome");
    } else {
      // Load popular movies from OMDb when user is logged in
      getPopularMovies();
    }
  }, [user, navigate]); // Removed getPopularMovies from dependencies

  // Handle OMDb search
  const handleOMDbSearch = () => {
    if (omdbSearchTerm.trim()) {
      searchMovies(omdbSearchTerm);
    }
  };

  // Get unique genres from all movies
  const genres = Array.from(
    new Set(
      allMovies.flatMap(movie => movie.genre || [])
    )
  ).sort();

  // Filter and sort movies
  const filteredMovies = allMovies
    .filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === "all" || movie.genre?.includes(selectedGenre);
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "year":
          return (b.release_year || 0) - (a.release_year || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  if (!user) {
    return null;
  }

  if (omdbLoading && omdbMovies.length === 0) {
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Explorar Películas</h1>
          <p className="text-muted-foreground">
            Descubre nuestro catálogo completo de películas y series
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar películas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Genre Filter */}
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todos los géneros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los géneros</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Título (A-Z)</SelectItem>
                <SelectItem value="year">Año (Nuevo)</SelectItem>
                <SelectItem value="rating">Calificación</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border border-border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <Badge variant="secondary" className="gap-2">
                Búsqueda: "{searchTerm}"
                <button onClick={() => setSearchTerm("")} className="hover:text-destructive">
                  ×
                </button>
              </Badge>
            )}
            {selectedGenre !== "all" && (
              <Badge variant="secondary" className="gap-2">
                Género: {selectedGenre}
                <button onClick={() => setSelectedGenre("all")} className="hover:text-destructive">
                  ×
                </button>
              </Badge>
            )}
          </div>
        </div>

        {/* OMDb Search Section */}
        <div className="mb-8 p-4 bg-card rounded-lg border">
          <h3 className="text-lg font-semibold mb-3">Buscar más películas (OMDb)</h3>
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar en OMDb (ej: Inception, Batman)..."
                value={omdbSearchTerm}
                onChange={(e) => setOmdbSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleOMDbSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleOMDbSearch} disabled={!omdbSearchTerm.trim() || omdbLoading}>
              {omdbLoading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Busca películas adicionales en la base de datos de OMDb y las agregaremos a tu catálogo.
          </p>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Mostrando {filteredMovies.length} de {allMovies.length} películas
          </p>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No se encontraron películas</h3>
            <p className="text-muted-foreground mb-4">
              Intenta cambiar los filtros o términos de búsqueda
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedGenre("all");
            }}>
              Limpiar filtros
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMovies.map((movie) => (
              <ContentCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                image={movie.poster_url || "/placeholder.svg"}
                type="movie"
                rating={movie.rating || 0}
                year={movie.release_year}
                duration={movie.duration}
                category={movie.genre?.[0]}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-card/50 transition-colors"
              >
                <img
                  src={movie.poster_url || "/placeholder.svg"}
                  alt={movie.title}
                  className="w-20 h-28 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{movie.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {movie.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{movie.release_year}</span>
                    {movie.duration && <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>}
                    {movie.genre?.map((g) => (
                      <Badge key={g} variant="outline" className="text-xs">
                        {g}
                      </Badge>
                    ))}
                    {movie.rating && (
                      <span className="text-primary font-medium">
                        {Math.round(movie.rating * 20)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;