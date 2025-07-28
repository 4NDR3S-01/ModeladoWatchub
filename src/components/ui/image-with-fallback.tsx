import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  fallbackSrc,
  className,
  containerClassName 
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  if (error && !fallbackSrc) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted rounded-md",
        containerClassName
      )}>
        <ImageOff className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {loading && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-md" />
      )}
      <img
        src={error ? fallbackSrc : src}
        alt={alt}
        className={cn("transition-opacity duration-300", className)}
        onError={handleError}
        onLoad={handleLoad}
        style={{ opacity: loading ? 0 : 1 }}
      />
    </div>
  );
}