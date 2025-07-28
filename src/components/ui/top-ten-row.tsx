import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Play, Plus } from "lucide-react";
import { useRef } from "react";

interface TopTenItem {
  id: string;
  title: string;
  image: string;
  rank: number;
  category: string;
}

interface TopTenRowProps {
  title: string;
  items: TopTenItem[];
}

export function TopTenRow({ title, items }: TopTenRowProps) {
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
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item) => (
              <div key={item.id} className="flex-none w-80 lg:w-96">
                <div className="group relative bg-card rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-card-hover">
                  <div className="flex items-center h-24 lg:h-28">
                    {/* Rank number */}
                    <div className="flex-none w-16 lg:w-20 flex items-center justify-center">
                      <span className="text-4xl lg:text-6xl font-black text-foreground/20 group-hover:text-primary transition-colors">
                        {item.rank}
                      </span>
                    </div>

                    {/* Content image */}
                    <div className="flex-none w-16 lg:w-20 h-16 lg:h-20 overflow-hidden rounded-md">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Content info */}
                    <div className="flex-1 px-4 py-2">
                      <h3 className="font-semibold text-foreground text-sm lg:text-base mb-1 line-clamp-2">
                        {item.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>

                    {/* Action buttons */}
                    <div className="flex-none px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="rounded-full bg-white text-black hover:bg-white/90 p-2">
                          <Play className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full border-muted-foreground text-muted-foreground hover:bg-muted p-2">
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
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