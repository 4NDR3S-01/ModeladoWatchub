import { useState, useRef, useEffect } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchSuggestion {
  id: string;
  title: string;
  type: "recent" | "trending" | "movie" | "series";
  category?: string;
}

interface SearchWithSuggestionsProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchWithSuggestions({ 
  placeholder = "Buscar contenido...", 
  onSearch,
  className 
}: SearchWithSuggestionsProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions] = useState<SearchSuggestion[]>([
    { id: "1", title: "El Último Guardián", type: "trending", category: "Acción" },
    { id: "2", title: "Neo Tokyo 2099", type: "movie", category: "Sci-Fi" },
    { id: "3", title: "Corazones en París", type: "recent", category: "Romance" },
    { id: "4", title: "John Wick", type: "trending", category: "Acción" },
    { id: "5", title: "Mad Max", type: "movie", category: "Acción" },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    onSearch?.(suggestion.title);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const filteredSuggestions = suggestions.filter(s =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </form>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {query ? (
            filteredSuggestions.length > 0 ? (
              <div className="p-2">
                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                  Resultados para "{query}"
                </div>
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-left"
                  >
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.title}</div>
                      <div className="text-xs text-muted-foreground">{suggestion.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                No se encontraron resultados para "{query}"
              </div>
            )
          ) : (
            <div className="p-2">
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                Búsquedas populares
              </div>
              {suggestions.slice(0, 5).map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent text-left"
                >
                  {suggestion.type === "trending" ? (
                    <TrendingUp className="w-4 h-4 text-primary" />
                  ) : (
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{suggestion.title}</div>
                    <div className="text-xs text-muted-foreground">{suggestion.category}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}