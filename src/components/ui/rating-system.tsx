import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RatingSystemProps {
  contentId: string;
  initialRating?: number;
  initialLiked?: boolean | null;
  onRatingChange?: (rating: number) => void;
  onLikeChange?: (liked: boolean | null) => void;
}

export function RatingSystem({ 
  contentId, 
  initialRating = 0, 
  initialLiked = null,
  onRatingChange,
  onLikeChange 
}: RatingSystemProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [liked, setLiked] = useState<boolean | null>(initialLiked);

  const handleRatingClick = (value: number) => {
    const newRating = rating === value ? 0 : value;
    setRating(newRating);
    onRatingChange?.(newRating);
  };

  const handleLikeClick = (isLike: boolean) => {
    const newLiked = liked === isLike ? null : isLike;
    setLiked(newLiked);
    onLikeChange?.(newLiked);
  };

  return (
    <div className="space-y-4">
      {/* Star Rating */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Califica este contenido</h4>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => handleRatingClick(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-colors duration-200 hover:scale-110 transform"
            >
              <Star
                className={`w-6 h-6 ${
                  value <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {rating} de 5 estrellas
            </span>
          )}
        </div>
      </div>

      {/* Like/Dislike */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">¿Te gustó?</h4>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant={liked === true ? "default" : "outline"}
            onClick={() => handleLikeClick(true)}
            className="flex items-center gap-2"
          >
            <ThumbsUp className="w-4 h-4" />
            Me gusta
          </Button>
          <Button
            size="sm"
            variant={liked === false ? "default" : "outline"}
            onClick={() => handleLikeClick(false)}
            className="flex items-center gap-2"
          >
            <ThumbsDown className="w-4 h-4" />
            No me gusta
          </Button>
        </div>
      </div>

      {/* Rating Summary */}
      {(rating > 0 || liked !== null) && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Tu valoración ha sido guardada
          </p>
        </div>
      )}
    </div>
  );
}