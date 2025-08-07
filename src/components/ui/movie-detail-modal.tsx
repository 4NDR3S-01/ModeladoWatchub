import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Check, ThumbsUp, ThumbsDown, Share, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VideoPlayer } from "./video-player";
import { RatingSystem } from "./rating-system";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useOMDbWatchlist } from "@/hooks/useOMDbWatchlist";

interface MovieDetailModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly content: {
    id: string;
    title: string;
    image: string;
    rating?: string;
    duration?: string;
    category?: string;
    year?: string;
    description?: string;
    cast?: string[];
    director?: string;
    isNew?: boolean;
    isOriginal?: boolean;
    // OMDb specific fields
    imdbID?: string;
    Genre?: string;
    Poster?: string;
    Title?: string;
    Year?: string;
  } | null;
}

export function MovieDetailModal({ isOpen, onClose, content }: MovieDetailModalProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const { subscribed } = useSubscription();
  const { isInWatchlist, toggleWatchlist, loading: watchlistLoading } = useOMDbWatchlist();
  const navigate = useNavigate();

  // If content is null or undefined, don't render the modal
  if (!content) {
    return null;
  }

  // Convert content to simple movie format for watchlist operations
  const watchlistMovie = {
    imdbID: content.imdbID || content.id,
    Title: content.Title || content.title,
    Year: content.Year || content.year || '',
    Poster: content.Poster || content.image,
    Genre: content.Genre || content.category || ''
  };

  const inWatchlist = isInWatchlist(watchlistMovie.imdbID);

  const handlePlay = () => {
    if (!subscribed) {
      navigate("/subscriptions");
      return;
    }
    setShowPlayer(true);
  };

  const handleWatchlistToggle = async () => {
    await toggleWatchlist(watchlistMovie);
  };

  if (showPlayer) {
    return (
      <VideoPlayer
        title={content.title}
        videoId={content.imdbID || content.title}
        onClose={() => setShowPlayer(false)}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto bg-background border-0 p-0 w-[95vw] sm:w-full">
        <DialogTitle className="sr-only">{content.title}</DialogTitle>
        <DialogDescription className="sr-only">
          {content.description || `Detalles de la película ${content.title}`}
        </DialogDescription>
        <div className="relative">
          {/* Hero image */}
          <div className="relative aspect-video overflow-hidden rounded-t-lg">
            <img 
              src={content.image} 
              alt={content.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            
            {/* Close button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:bg-white/20 rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            {/* Play controls overlay */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4 leading-tight">{content.title}</h1>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                <Button
                  size="lg"
                  onClick={handlePlay}
                  className="bg-white text-black hover:bg-white/90 px-6 sm:px-8 w-full sm:w-auto"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {subscribed ? "Reproducir" : "Suscríbete para ver"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleWatchlistToggle}
                  disabled={watchlistLoading}
                  className="border-white text-white hover:bg-white hover:text-black px-6 sm:px-8 w-full sm:w-auto"
                >
                  {inWatchlist ? (
                    <>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      En Mi lista
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Mi lista
                    </>
                  )}
                </Button>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-white text-white hover:bg-white hover:text-black w-8 h-8 sm:w-10 sm:h-10 p-0"
                  >
                    <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-white text-white hover:bg-white hover:text-black w-8 h-8 sm:w-10 sm:h-10 p-0"
                  >
                    <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-white text-white hover:bg-white hover:text-black w-8 h-8 sm:w-10 sm:h-10 p-0"
                  >
                    <Share className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content details */}
          <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
              {content.rating && (
                <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                  {content.rating} coincidencia
                </Badge>
              )}
              {content.year && <span className="text-green-400 font-semibold">{content.year}</span>}
              {content.duration && <span className="text-muted-foreground">{content.duration}</span>}
              {content.category && <Badge variant="outline" className="text-xs">{content.category}</Badge>}
              <div className="flex items-center gap-1">
                <span className="bg-muted px-2 py-1 rounded text-xs">HD</span>
                <span className="bg-muted px-2 py-1 rounded text-xs">5.1</span>
              </div>
              {content.isNew && (
                <Badge variant="destructive" className="bg-red-600 text-xs">NUEVO</Badge>
              )}
              {content.isOriginal && (
                <Badge className="bg-gradient-to-r from-primary to-accent text-white text-xs">
                  WATCHHUB ORIGINAL
                </Badge>
              )}
            </div>

            {/* Description */}
            {content.description && (
              <p className="text-foreground leading-relaxed max-w-full text-sm sm:text-base">
                {content.description}
              </p>
            )}

            {/* Cast and crew */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 text-sm">
              {content.cast && (
                <div>
                  <span className="text-muted-foreground">Reparto: </span>
                  <span className="text-foreground">{content.cast.join(', ')}</span>
                </div>
              )}
              {content.director && (
                <div>
                  <span className="text-muted-foreground">Director: </span>
                  <span className="text-foreground">{content.director}</span>
                </div>
              )}
            </div>

            {/* Rating System */}
            <div className="border-t border-border pt-4 sm:pt-6">
              <RatingSystem
                contentId={content.id}
                onRatingChange={(rating) => console.log(`Rated ${content.title}: ${rating} stars`)}
                onLikeChange={(liked) => console.log(`${content.title} liked: ${liked}`)}
              />
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}