import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, ThumbsUp, ThumbsDown, Share, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VideoPlayer } from "./video-player";
import { RatingSystem } from "./rating-system";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface MovieDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
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
  };
}

export function MovieDetailModal({ isOpen, onClose, content }: MovieDetailModalProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const { subscribed } = useSubscription();
  const navigate = useNavigate();

  const handlePlay = () => {
    if (!subscribed) {
      navigate("/subscriptions");
      return;
    }
    setShowPlayer(true);
  };

  if (showPlayer) {
    return (
      <VideoPlayer
        title={content.title}
        onClose={() => setShowPlayer(false)}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-0 p-0">
        <div className="relative">
          {/* Hero image */}
          <div className="relative aspect-video overflow-hidden rounded-t-lg">
            <img 
              src={content.image} 
              alt={content.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Close button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full w-10 h-10 p-0"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Play controls overlay */}
            <div className="absolute bottom-8 left-8 right-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">{content.title}</h1>
              <div className="flex items-center gap-4 mb-6">
                <Button
                  size="lg"
                  onClick={handlePlay}
                  className="bg-white text-black hover:bg-white/90 px-8"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {subscribed ? "Reproducir" : "Suscríbete para ver"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black px-8"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Mi lista
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-white text-white hover:bg-white hover:text-black w-10 h-10 p-0"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-white text-white hover:bg-white hover:text-black w-10 h-10 p-0"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-white text-white hover:bg-white hover:text-black w-10 h-10 p-0"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Content details */}
          <div className="p-8 space-y-6">
            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm">
              {content.rating && (
                <Badge variant="secondary" className="bg-green-600 text-white">
                  {content.rating} coincidencia
                </Badge>
              )}
              {content.year && <span className="text-green-400 font-semibold">{content.year}</span>}
              {content.duration && <span className="text-muted-foreground">{content.duration}</span>}
              {content.category && <Badge variant="outline">{content.category}</Badge>}
              <div className="flex items-center gap-1">
                <span className="bg-muted px-2 py-1 rounded text-xs">HD</span>
                <span className="bg-muted px-2 py-1 rounded text-xs">5.1</span>
              </div>
              {content.isNew && (
                <Badge variant="destructive" className="bg-red-600">NUEVO</Badge>
              )}
              {content.isOriginal && (
                <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                  WATCHHUB ORIGINAL
                </Badge>
              )}
            </div>

            {/* Description */}
            {content.description && (
              <p className="text-foreground leading-relaxed max-w-2xl">
                {content.description}
              </p>
            )}

            {/* Cast and crew */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
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
            <div className="border-t border-border pt-6">
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