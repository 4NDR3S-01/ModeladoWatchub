import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Plus, ThumbsUp, Info, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { VideoPlayer } from "./video-player";

interface ContentCardProps {
  id?: string;
  title: string;
  image: string;
  rating?: string | number;
  duration?: string | number;
  category?: string;
  isNew?: boolean;
  isOriginal?: boolean;
  year?: string | number;
  type?: "movie" | "series";
  className?: string;
  onClick?: () => void;
  // OMDb specific fields for direct play
  imdbID?: string;
  Genre?: string;
  Poster?: string;
  Title?: string;
  Year?: string;
}

export function ContentCard({ 
  id,
  title, 
  image, 
  rating, 
  duration, 
  category, 
  isNew,
  isOriginal,
  year,
  type = "movie",
  className,
  onClick,
  // OMDb fields
  imdbID,
  Genre,
  Poster,
  Title,
  Year
}: ContentCardProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, loading: watchlistLoading } = useWatchlist();
  const { user } = useAuth();
  const { subscribed } = useSubscription();
  const navigate = useNavigate();
  const [showPlayer, setShowPlayer] = useState(false);
  
  const inWatchlist = id ? isInWatchlist(id) : false;

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!id) return;
    
    if (inWatchlist) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist(id);
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!subscribed) {
      navigate("/subscriptions");
      return;
    }
    
    setShowPlayer(true);
  };

  // Helper functions to format values
  const formatDuration = (duration: string | number | undefined) => {
    if (!duration) return "";
    
    if (typeof duration === "string") return duration;
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatRating = (rating: string | number | undefined) => {
    if (!rating) return null;
    
    if (typeof rating === "string") return rating;
    
    // Assume rating is 0-5, convert to percentage
    return `${Math.round(rating * 20)}%`;
  };

  const formatYear = (year: string | number | undefined) => {
    if (!year) return "";
    return year.toString();
  };

  // If showing video player, render it instead of the card
  if (showPlayer) {
    return (
      <VideoPlayer
        title={Title || title}
        onClose={() => setShowPlayer(false)}
      />
    );
  }
  
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border-0 bg-card transition-all duration-300 hover:scale-105 hover:shadow-card-hover cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Top badges */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              {isNew && (
                <Badge variant="destructive" className="bg-red-600 text-white text-xs font-semibold">
                  NUEVO
                </Badge>
              )}
              {isOriginal && (
                <Badge className="bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold">
                  WATCHHUB
                </Badge>
              )}
            </div>
            {formatRating(rating) && (
              <Badge variant="secondary" className="bg-black/70 text-white border-0 text-xs font-semibold">
                {formatRating(rating)} coincidencia
              </Badge>
            )}
          </div>
          
          {/* Bottom controls */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                className="rounded-full bg-white text-black hover:bg-white/90 px-4"
                onClick={handlePlay}
              >
                <Play className="w-4 h-4 mr-1" />
                Reproducir
              </Button>
              {user && id && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-full border-white text-white hover:bg-white hover:text-black p-2"
                  onClick={handleWatchlistToggle}
                  disabled={watchlistLoading}
                >
                  {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
              )}
              <Button size="sm" variant="outline" className="rounded-full border-white text-white hover:bg-white hover:text-black p-2">
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="rounded-full border-white text-white hover:bg-white hover:text-black p-2">
                <Info className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="text-white">
              <h3 className="font-semibold text-sm mb-2 line-clamp-2">{title}</h3>
              <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
                {year && <span className="text-green-400 font-semibold">{formatYear(year)}</span>}
                {duration && <span>{formatDuration(duration)}</span>}
                {category && <span>• {category}</span>}
              </div>
              <div className="flex items-center gap-1 text-xs text-white/60">
                <span className="bg-white/20 px-1 rounded text-xs">HD</span>
                <span className="bg-white/20 px-1 rounded text-xs">5.1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}