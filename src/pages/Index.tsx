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
import { useMovies } from "@/hooks/useMovies";
import movie1 from "@/assets/movie-1.jpg";
import movie2 from "@/assets/movie-2.jpg";
import movie3 from "@/assets/movie-3.jpg";

const Index = () => {
  const { movies, loading, getFeaturedMovies, getMoviesByGenre } = useMovies();
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const navigate = useNavigate();
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/welcome");
    }
  }, [user, navigate]);

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

  const featuredMovies = getFeaturedMovies();
  const actionMovies = getMoviesByGenre("Acción");
  const dramaMovies = getMoviesByGenre("Drama");
  const comedyMovies = getMoviesByGenre("Comedia");

  const handleContentClick = (content: any) => {
    const detailContent = {
      ...content,
      description: getContentDescription(content.title),
      cast: getContentCast(content.title),
      director: getContentDirector(content.title)
    };
    setSelectedContent(detailContent);
    setIsDetailModalOpen(true);
  };

  const getContentDescription = (title: string) => {
    const descriptions: { [key: string]: string } = {
      "El Último Guardián": "Un épico thriller de acción que sigue a un antiguo soldado que debe proteger a una misteriosa joven con poderes sobrenaturales de una organización secreta que busca explotar sus habilidades.",
      "Corazones en París": "Una emotiva historia de amor que se desarrolla en las pintorescas calles de París, donde dos almas solitarias encuentran el amor verdadero en los lugares más inesperados.",
      "Neo Tokyo 2099": "En un futuro distópico, un detective cibernético debe desentrañar una conspiración que amenaza con destruir la última ciudad habitada de la Tierra.",
      "John Wick: Capítulo 5": "El legendario asesino regresa para una última misión que pondrá a prueba todas sus habilidades y cambiará su destino para siempre.",
      "Mad Max: Furiosa": "En un mundo post-apocalíptico, una guerrera feroz lucha por sobrevivir mientras busca venganza en las tierras baldías."
    };
    return descriptions[title] || "Una experiencia cinematográfica única que te mantendrá al borde de tu asiento.";
  };

  const getContentCast = (title: string) => {
    const cast: { [key: string]: string[] } = {
      "El Último Guardián": ["Ryan Gosling", "Scarlett Johansson", "Oscar Isaac"],
      "Corazones en París": ["Emma Stone", "Timothée Chalamet", "Marion Cotillard"],
      "Neo Tokyo 2099": ["John Cho", "Rinko Kikuchi", "Brian Cox"],
      "John Wick: Capítulo 5": ["Keanu Reeves", "Laurence Fishburne", "Ian McShane"],
      "Mad Max: Furiosa": ["Anya Taylor-Joy", "Chris Hemsworth", "Tom Burke"]
    };
    return cast[title] || ["Actor Principal", "Actor Secundario", "Actor de Reparto"];
  };

  const getContentDirector = (title: string) => {
    const directors: { [key: string]: string } = {
      "El Último Guardián": "Denis Villeneuve",
      "Corazones en París": "Céline Sciamma",
      "Neo Tokyo 2099": "The Wachowskis",
      "John Wick: Capítulo 5": "Chad Stahelski",
      "Mad Max: Furiosa": "George Miller"
    };
    return directors[title] || "Director Reconocido";
  };

  // Convert database movies to display format
  const mapMoviesToContent = (dbMovies: any[]) => {
    return dbMovies.map(movie => ({
      id: movie.id,
      title: movie.title,
      image: movie.poster_url || "/placeholder.svg",
      rating: movie.rating ? `${Math.round(movie.rating * 20)}%` : "N/A",
      duration: movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : "N/A",
      category: movie.genre?.[0] || "Película",
      isNew: movie.release_year === 2024,
      year: movie.release_year?.toString() || "2024"
    }));
  };

  // Sample content data for sections that don't have database equivalent
  const trendingMovies = mapMoviesToContent(featuredMovies.slice(0, 6));
  
  const netflixOriginals = [
    {
      id: "7",
      title: "El Proyecto Atlas",
      image: movie1,
      rating: "97%",
      duration: "2h 15m",
      category: "Sci-Fi",
      isNew: true,
      year: "2024",
      isOriginal: true
    },
    {
      id: "8",
      title: "Contra el Tiempo",
      image: movie2,
      rating: "93%",
      duration: "1h 58m",
      category: "Thriller",
      isNew: true,
      year: "2024",
      isOriginal: true
    },
    {
      id: "9",
      title: "Renacer",
      image: movie3,
      rating: "91%",
      duration: "2h 12m",
      category: "Drama",
      isNew: true,
      year: "2024",
      isOriginal: true
    },
    {
      id: "10",
      title: "Fuego Cruzado",
      image: movie1,
      rating: "88%",
      duration: "2h 05m",
      category: "Acción",
      isNew: true,
      year: "2024",
      isOriginal: true
    }
  ];

  const topTenToday = movies.slice(0, 10).map((movie, index) => ({
    id: movie.id,
    title: movie.title,
    image: movie.poster_url || "/placeholder.svg",
    rank: index + 1,
    category: movie.genre?.[0] || "Película"
  }));

  const continueWatching = [
    { 
      id: "c1", 
      title: "El Último Guardián", 
      image: movie1, 
      progress: 75, 
      episode: "", 
      duration: "2h 15m",
      timeLeft: "32 min restantes"
    },
    { 
      id: "c2", 
      title: "John Wick: Capítulo 5", 
      image: movie2, 
      progress: 30, 
      episode: "", 
      duration: "2h 18m",
      timeLeft: "1h 35m restantes"
    },
    { 
      id: "c3", 
      title: "Mad Max: Furiosa", 
      image: movie3, 
      progress: 90, 
      episode: "", 
      duration: "2h 28m",
      timeLeft: "15 min restantes"
    },
    { 
      id: "c4", 
      title: "Neo Tokyo 2099", 
      image: movie1, 
      progress: 45, 
      episode: "", 
      duration: "2h 32m",
      timeLeft: "1h 24m restantes"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Content Sections */}
      <div className="space-y-8 pb-16">
        {/* Continue Watching - Solo aparece si hay contenido */}
        <ContinueWatchingRow 
          title="Continuar viendo"
          items={continueWatching}
        />

        {/* Top 10 Today */}
        <TopTenRow 
          title="Top 10 en México hoy"
          items={topTenToday}
        />

        {/* Featured Movies from Database */}
        {featuredMovies.length > 0 && (
          <ContentRow
            title="Destacadas"
            subtitle="Lo mejor del catálogo"
            items={mapMoviesToContent(featuredMovies)}
            onItemClick={handleContentClick}
          />
        )}

        {/* Trending */}
        <ContentRow
          title="Tendencias ahora"
          subtitle="Lo más visto en WatchHub"
          items={trendingMovies}
          onItemClick={handleContentClick}
        />

        {/* Netflix Originals */}
        <ContentRow
          title="Originales de WatchHub"
          subtitle="Contenido exclusivo de nuestra plataforma"
          items={netflixOriginals}
          onItemClick={handleContentClick}
        />

        {/* Action Movies from Database */}
        {actionMovies.length > 0 && (
          <ContentRow
            title="Películas de acción explosivas"
            subtitle="Adrenalina y aventura sin límites"
            items={mapMoviesToContent(actionMovies)}
            onItemClick={handleContentClick}
          />
        )}

        {/* Drama Movies from Database */}
        {dramaMovies.length > 0 && (
          <ContentRow
            title="Dramas aclamados"
            subtitle="Historias que marcan la diferencia"
            items={mapMoviesToContent(dramaMovies)}
            onItemClick={handleContentClick}
          />
        )}

        {/* Comedy Movies from Database */}
        {comedyMovies.length > 0 && (
          <ContentRow
            title="Comedias divertidas"
            subtitle="Para reír sin parar"
            items={mapMoviesToContent(comedyMovies)}
            onItemClick={handleContentClick}
          />
        )}

        {/* Other Genres */}
        <ContentRow
          title="Ciencia Ficción"
          subtitle="El futuro en pantalla"
          items={mapMoviesToContent(getMoviesByGenre("Ciencia Ficción"))}
          onItemClick={handleContentClick}
        />

        <ContentRow
          title="Thriller"
          subtitle="Suspense y emoción"
          items={mapMoviesToContent(getMoviesByGenre("Thriller"))}
          onItemClick={handleContentClick}
        />

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
                  <span>+{movies.length} películas</span>
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
