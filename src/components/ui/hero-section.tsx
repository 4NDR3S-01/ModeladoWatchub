import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Info, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-banner.jpg";

export function HeroSection() {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="WatchHub Hero" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* WatchHub branding */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-2">
              Watch<span className="text-primary">Hub</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-300">
              Streaming Premium
            </p>
          </div>

          {/* Featured content */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
              <Badge className="bg-red-600 text-white hover:bg-red-700 text-xs sm:text-sm">
                PELÍCULA ORIGINAL
              </Badge>
              <Badge variant="outline" className="border-white text-white text-xs sm:text-sm">
                2024
              </Badge>
              <Badge variant="outline" className="border-white text-white text-xs sm:text-sm">
                18+
              </Badge>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              El Último Guardián
            </h2>
            
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-4 sm:mb-6 leading-relaxed">
              Un épico thriller de acción que sigue a un antiguo soldado que debe proteger a una misteriosa 
              joven con poderes sobrenaturales de una organización secreta que busca explotar sus habilidades.
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8">
              <span>2h 15m</span>
              <span className="hidden sm:inline">•</span>
              <span>Acción, Thriller</span>
              <span className="hidden sm:inline">•</span>
              <span>4K Ultra HD</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-6 sm:px-8 w-full sm:w-auto">
              <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Reproducir
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-6 sm:px-8 w-full sm:w-auto">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Más información
            </Button>
          </div>

          {/* Audio control */}
          <div className="flex items-center justify-center sm:justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMuted(!isMuted)}
              className="rounded-full border border-white/30 text-white hover:bg-white/20"
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