import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { ContentRow } from "@/components/ui/content-row";
import { TopTenRow } from "@/components/ui/top-ten-row";
import { ContinueWatchingRow } from "@/components/ui/continue-watching-row";
import { MovieDetailModal } from "@/components/ui/movie-detail-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Star, Play, TrendingUp, Award, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { getPopularMovies, getTrendingMovies } from "@/services/omdbService";
import type { OMDbMovie } from "@/services/omdbService";

const Index = () => {
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const navigate = useNavigate();
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popularMovies, setPopularMovies] = useState<OMDbMovie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<OMDbMovie[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/welcome");
      return;
    }
    
    loadOMDbData();
  }, [user, navigate]);

  const loadOMDbData = async () => {
    try {
      setLoading(true);
      
      const [popular, trending] = await Promise.all([
        getPopularMovies(),
        getTrendingMovies()
      ]);
      
      setPopularMovies(popular);
      setTrendingMovies(trending);
    } catch (error) {
      console.error('Error loading OMDb data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }
  // Convert OMDb movies to display format
  const mapOMDbMoviesToContent = (omdbMovies: OMDbMovie[]) => {
    return omdbMovies.map(movie => ({
      id: movie.imdbID,
      title: movie.Title,
      image: movie.Poster !== 'N/A' ? movie.Poster : "/placeholder.svg",
      rating: movie.imdbRating !== 'N/A' ? `${Math.round(parseFloat(movie.imdbRating) * 10)}%` : "N/A",
      duration: movie.Runtime !== 'N/A' ? movie.Runtime : "N/A",
      category: movie.Genre ? movie.Genre.split(', ')[0] : "Película",
      isNew: parseInt(movie.Year) >= 2022,
      year: movie.Year,
      isOriginal: false,
      description: movie.Plot,
      cast: movie.Actors ? movie.Actors.split(', ') : [],
      director: movie.Director
    }));
  };

  // Map OMDb movies to content format
  const mapOMDbMoviesToContent = (movies: OMDbMovie[]) => movies.map((movie, index) => ({
    id: movie.imdbID,
    title: movie.Title,
    image: movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.svg',
    genre: movie.Genre?.split(',')[0] || 'Drama',
    description: movie.Plot !== 'N/A' ? movie.Plot : 'No description available',
    rating: movie.imdbRating !== 'N/A' ? parseFloat(movie.imdbRating) : 0,
    year: movie.Year !== 'N/A' ? parseInt(movie.Year) : new Date().getFullYear(),
    cast: movie.Actors?.split(', ') || [],
    director: movie.Director
  }));

  const topTenToday = popularMovies.slice(0, 10).map((movie, index) => ({
    id: movie.imdbID,
    title: movie.Title,
    image: movie.Poster !== 'N/A' ? movie.Poster : "/placeholder.svg",
    rank: index + 1,
    category: movie.Genre ? movie.Genre.split(', ')[0] : "Película"
  }));

  const handleContentClick = (content: any) => {
    const detailContent = {
      ...content,
      description: content.description || "Una experiencia cinematográfica única que te mantendrá al borde de tu asiento.",
      cast: content.cast || ["Actor Principal", "Actor Secundario", "Actor de Reparto"],
      director: content.director || "Director Reconocido"
    };
    setSelectedContent(detailContent);
    setIsDetailModalOpen(true);
  };  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Content Sections */}
      <div className="space-y-8 pb-16">
        {/* Continue Watching - Only show if user has items */}
        {mapContinueWatchingData.length > 0 && (
          <ContinueWatchingRow 
            title="Continuar viendo"
            items={mapContinueWatchingData}
          />
        )}

        {/* Top 10 Today */}
        <TopTenRow 
          title="Top 10 en México hoy"
          items={topTenToday}
        />

        {/* Popular Movies from OMDb */}
        {popularMovies.length > 0 && (
          <ContentRow
            title="Películas Populares"
            subtitle="Las mejores películas según IMDb"
            items={mapOMDbMoviesToContent(popularMovies)}
            onItemClick={handleContentClick}
          />
        )}

        {/* Trending Movies from OMDb */}
        {trendingMovies.length > 0 && (
          <ContentRow
            title="Tendencias"
            subtitle="Las películas más populares del momento"
            items={mapOMDbMoviesToContent(trendingMovies)}
            onItemClick={handleContentClick}
          />
        )}

        {/* User Watchlist */}
        {mapWatchlistData.length > 0 && (
          <ContinueWatchingRow 
            title="Mi Lista"
            items={mapWatchlistData}
          />
        )}

        {/* Call to Action Section */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-500 fill-current" />
                <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-500 fill-current" />
                <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-500 fill-current" />
                <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-500 fill-current" />
                <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-500 fill-current" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                ¿Listo para la experiencia premium?
              </h2>
              
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 px-4">
                Únete a millones de usuarios que ya disfrutan del mejor contenido en streaming. 
                Miles de películas exclusivas y contenido premium te esperan.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <Button size="lg" className="px-6 sm:px-8 bg-primary hover:bg-primary/90 w-full sm:w-auto" onClick={() => navigate("/subscriptions")}>
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Ver planes
                </Button>
                
                <Button size="lg" variant="outline" className="px-6 sm:px-8 w-full sm:w-auto" onClick={() => navigate("/categories")}>
                  Explorar catálogo
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>+{popularMovies.length + trendingMovies.length} películas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="w-3 h-3 sm:w-4 sm:h-4 rounded-full p-0"></Badge>
                  <span>Calidad 4K</span>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Sin anuncios</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Movie Detail Modal */}
      {selectedContent && (
        <MovieDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          content={selectedContent}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Watch<span className="text-primary">Hub</span>
              </h3>
              <p className="text-muted-foreground text-sm">
                La mejor plataforma de streaming con contenido exclusivo y calidad premium.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contenido</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Películas</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Acción</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Drama</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Originales</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Centro de ayuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Dispositivos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Términos</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Cuenta</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Mi perfil</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Suscripción</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Configuración</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacidad</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 WatchHub Streaming. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
