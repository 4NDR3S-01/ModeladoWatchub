import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/ui/hero-section";
import { ContentRow } from "@/components/ui/content-row";
import { TopTenRow } from "@/components/ui/top-ten-row";
import { MovieDetailModal } from "@/components/ui/movie-detail-modal";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Star, TrendingUp, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getPopularMovies, getTrendingMovies } from "@/services/omdbService";
import type { OMDbMovie } from "@/services/omdbService";

const Index = () => {
  const { user } = useAuth();
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

  // Map OMDb movies to content format
  const mapOMDbMoviesToContent = (movies: OMDbMovie[]) => movies.map((movie) => ({
    id: movie.imdbID,
    title: movie.Title,
    image: movie.Poster !== 'N/A' ? movie.Poster : '/placeholder.svg',
    genre: movie.Genre?.split(',')[0] || 'Drama',
    description: movie.Plot !== 'N/A' ? movie.Plot : 'No description available',
    rating: movie.imdbRating !== 'N/A' ? movie.imdbRating : '0',
    year: movie.Year !== 'N/A' ? movie.Year : new Date().getFullYear().toString(),
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
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Content Sections */}
      <div className="space-y-8 pb-16">
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
                Descubre tu próxima película favorita
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 lg:mb-8">
                Explora nuestra colección de películas seleccionadas con datos reales de IMDb
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <button 
                  onClick={() => navigate("/search")}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  Buscar Películas
                </button>
                <button 
                  onClick={() => navigate("/subscriptions")}
                  className="w-full sm:w-auto bg-accent hover:bg-accent/80 text-accent-foreground px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Award className="w-4 h-4" />
                  Ver Planes
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Movie Detail Modal */}
      <MovieDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        content={selectedContent}
      />
    </div>
  );
};

export default Index;
