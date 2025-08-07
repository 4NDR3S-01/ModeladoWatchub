import { ContentCard } from "@/components/ui/content-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface ContentItem {
  id: string;
  title: string;
  image: string;
  rating?: string;
  duration?: string;
  category?: string;
  isNew?: boolean;
  isOriginal?: boolean;
  year?: string;
}

interface ContentRowProps {
  title: string;
  subtitle?: string;
  items: ContentItem[];
  onItemClick?: (item: ContentItem) => void;
}

export function ContentRow({ title, subtitle, items, onItemClick }: ContentRowProps) {
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
    <section className="py-6 sm:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground text-sm sm:text-base">{subtitle}</p>
            )}
          </div>
          
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollLeft}
              className="rounded-full p-2 w-8 h-8 sm:w-10 sm:h-10"
            >
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollRight}
              className="rounded-full p-2 w-8 h-8 sm:w-10 sm:h-10"
            >
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>

        {/* Content scroll */}
        <div className="relative overflow-hidden">
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item) => (
              <div key={item.id} className="flex-none w-36 sm:w-44 lg:w-52 snap-start">
                <ContentCard
                  title={item.title}
                  image={item.image}
                  rating={item.rating}
                  duration={item.duration}
                  category={item.category}
                  isNew={item.isNew}
                  isOriginal={item.isOriginal}
                  year={item.year}
                  onClick={() => onItemClick?.(item)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}