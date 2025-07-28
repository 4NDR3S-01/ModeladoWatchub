import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { useRef } from "react";

interface ContinueWatchingItem {
  id: string;
  title: string;
  image: string;
  progress: number;
  episode: string;
  duration: string;
  timeLeft: string;
}

interface ContinueWatchingRowProps {
  title: string;
  items: ContinueWatchingItem[];
}

export function ContinueWatchingRow({ title, items }: ContinueWatchingRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
              {title}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollLeft}
              className="rounded-full p-2 w-10 h-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollRight}
              className="rounded-full p-2 w-10 h-10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content scroll */}
        <div className="relative overflow-hidden">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item) => (
              <div key={item.id} className="flex-none w-72 lg:w-80">
                <div className="group relative bg-card rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-card-hover">
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90">
                        <Play className="w-6 h-6" />
                      </Button>
                    </div>

                    {/* Remove button */}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="absolute top-2 right-2 rounded-full p-1 w-8 h-8 bg-black/50 border-white/20 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>

                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <Progress value={item.progress} className="h-1 mb-2" />
                    </div>
                  </div>

                  {/* Content info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span>{item.episode}</span>
                      <span>•</span>
                      <span>{item.duration}</span>
                    </div>
                    <p className="text-xs text-accent">
                      {item.timeLeft}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}