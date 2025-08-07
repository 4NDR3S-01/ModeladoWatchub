import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Info, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-banner.jpg";
import { VideoPlayer } from "./video-player";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";

interface HeroSectionProps {
  movies?: Array<{
    id?: string;
    imdb_id: string;
    title: string;
    description: string;
    poster_url: string;
    genre?: string[];
    duration?: number | null;
    release_year?: number;
    rating?: number;
    director?: string;
  }>;
  onMovieClick?: (movie: any) => void;
}

export function HeroSection({ movies = [], onMovieClick }: HeroSectionProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const { subscribed } = useSubscription();
  const navigate = useNavigate();

  // Auto-rotate movies every 8 seconds
  useEffect(() => {
    if (movies.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentMovieIndex((prev) => (prev + 1) % movies.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [movies.length]);

  // Use the current movie or fallback to static content
  const currentMovie = movies[currentMovieIndex];
  const hasMovies = movies.length > 0 && currentMovie;

  const handlePlay = () => {
    if (!subscribed) {
      navigate("/subscriptions");
      return;
    }
    setShowPlayer(true);
  };

  // If showing video player, render it instead of the hero section
  if (showPlayer) {
    return (
      <VideoPlayer
        title={hasMovies ? currentMovie.title : "El Último Guardián"}
        onClose={() => setShowPlayer(false)}
      />
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img 
          src={hasMovies ? currentMovie.poster_url : heroImage} 
          alt={hasMovies ? currentMovie.title : "WatchHub Hero"} 
          className="w-full h-full object-cover scale-105 sm:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30 sm:from-black/80 sm:via-black/40 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-0">
        <div className="max-w-full sm:max-w-2xl text-center sm:text-left">
          {/* WatchHub branding */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-4xl sm:text-4xl lg:text-6xl font-bold text-white mb-2">
              Watch<span className="text-primary">Hub</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300">
              Streaming Premium
            </p>
          </div>

          {/* Featured content */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-4">
              <Badge className="bg-red-600 text-white hover:bg-red-700 text-xs sm:text-sm">
                {hasMovies ? "PELÍCULA DE OMDB" : "PELÍCULA ORIGINAL"}
              </Badge>
              <Badge variant="outline" className="border-white text-white text-xs sm:text-sm">
                {hasMovies ? currentMovie.release_year || "2024" : "2024"}
              </Badge>
              <Badge variant="outline" className="border-white text-white text-xs sm:text-sm">
                {hasMovies ? (currentMovie.rating ? `${currentMovie.rating}/10` : "18+") : "18+"}
              </Badge>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              {hasMovies ? currentMovie.title : "El Último Guardián"}
            </h2>
            
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-4 sm:mb-6 leading-relaxed max-w-lg mx-auto sm:mx-0">
              {hasMovies 
                ? (currentMovie.description.length > 200 ? `${currentMovie.description.substring(0, 200)}...` : currentMovie.description)
                : "Un épico thriller de acción que sigue a un antiguo soldado que debe proteger a una misteriosa joven con poderes sobrenaturales de una organización secreta que busca explotar sus habilidades."
              }
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8">
              <span>
                {hasMovies && currentMovie.duration && currentMovie.duration > 0
                  ? `${Math.floor(currentMovie.duration / 60)}h ${currentMovie.duration % 60}m`
                  : "2h 15m"
                }
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="text-center">
                {hasMovies && currentMovie.genre && currentMovie.genre.length > 0
                  ? currentMovie.genre.slice(0, 2).join(', ')
                  : "Acción, Thriller"
                }
              </span>
              <span className="hidden sm:inline">•</span>
              <span>4K Ultra HD</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-200 px-6 sm:px-8 w-full sm:w-auto"
              onClick={handlePlay}
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {subscribed ? "Reproducir" : "Suscríbete para ver"}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-black px-6 sm:px-8 w-full sm:w-auto"
              onClick={() => hasMovies && onMovieClick && onMovieClick(currentMovie)}
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Más información
            </Button>
          </div>

          {/* Audio control */}
          <div className="flex items-center justify-center sm:justify-between">
            {/* Movie indicators */}
            {movies.length > 1 && (
              <div className="flex items-center gap-2 mb-4 sm:mb-0">
                {movies.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMovieIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentMovieIndex 
                        ? 'bg-white w-6' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMuted(!isMuted)}
              className="rounded-full border border-white/30 text-white hover:bg-white/20 mx-auto sm:ml-auto sm:mr-0"
            >
              {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-4 h-8 sm:w-6 sm:h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-white/50 rounded-full mt-1 sm:mt-2"></div>
        </div>
      </div>
    </section>
  );
}