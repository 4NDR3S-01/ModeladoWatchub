import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function ContentRating({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  showText = true,
  className 
}: ContentRatingProps) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, i) => {
          const filled = i < Math.floor(rating);
          const partialFill = i === Math.floor(rating) && rating % 1 !== 0;
          
          return (
            <Star
              key={i}
              className={cn(
                sizeClasses[size],
                filled || partialFill 
                  ? "text-yellow-500 fill-yellow-500" 
                  : "text-muted-foreground"
              )}
            />
          );
        })}
      </div>
      {showText && (
        <span className={cn("text-muted-foreground ml-1", textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}