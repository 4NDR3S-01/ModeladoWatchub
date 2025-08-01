import { useState, useEffect } from "react";
import { Search as SearchIcon, Filter, X, Calendar, Star, Clock, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ContentCard } from "@/components/ui/content-card";
import { MovieDetailModal } from "@/components/ui/movie-detail-modal";
import { Navbar } from "@/components/layout/navbar";
import { useSearch } from "@/hooks/useSearch";
import movie1 from "@/assets/movie-1.jpg";
import movie2 from "@/assets/movie-2.jpg";
import movie3 from "@/assets/movie-3.jpg";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [yearRange, setYearRange] = useState([2000, 2024]);
  const [ratingMin, setRatingMin] = useState([70]);
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { loading, results, searchContent, getRecommendations } = useSearch();

  const genres = [
    "Acción", "Drama", "Comedia", "Thriller", "Sci-Fi", 
    "Romance", "Terror", "Aventura", "Fantasía", "Crimen"
  ];

  const searchResults = [
    {
      id: "1",
      title: "El Último Guardián",
      image: movie1,
      rating: "98%",
      year: "2024",
      duration: "2h 15m",
      category: "Acción",
      isNew: true,
      description: "Un épico thriller de acción que sigue a un antiguo soldado...",
      cast: ["Ryan Gosling", "Scarlett Johansson", "Oscar Isaac"],
      director: "Denis Villeneuve"
    },
    {
      id: "2",
      title: "Corazones en París",
      image: movie2,
      rating: "92%",
      year: "2024",
      duration: "1h 58m",
      category: "Romance",
      description: "Una emotiva historia de amor en las calles de París...",
      cast: ["Emma Stone", "Timothée Chalamet", "Marion Cotillard"],
      director: "Céline Sciamma"
    },
    {
      id: "3",
      title: "Neo Tokyo 2099",
      image: movie3,
      rating: "95%",
      year: "2024",
      duration: "2h 32m",
      category: "Sci-Fi",
      isNew: true,
      description: "En un futuro distópico, un detective cibernético...",
      cast: ["John Cho", "Rinko Kikuchi", "Brian Cox"],
      director: "The Wachowskis"
    },
    // Más resultados...
    {
      id: "4",
      title: "La Conspiración",
      image: movie1,
      rating: "89%",
      year: "2023",
      duration: "2h 08m",
      category: "Thriller"
    },
    {
      id: "5",
      title: "Memorias Perdidas",
      image: movie2,
      rating: "94%",
      year: "2024",
      duration: "1h 45m",
      category: "Drama"
    },
    {
      id: "6",
      title: "Guerra de Estrellas",
      image: movie3,
      rating: "96%",
      year: "2024",
      duration: "2h 25m",
      category: "Aventura",
      isNew: true
    }
  ];

  const trendingSearches = [
    "El Último Guardián", "Neo Tokyo 2099", "Películas de acción 2024",
    "Thrillers psicológicos", "Comedias románticas", "Sci-Fi espacial"
  ];

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleContentClick = (content: any) => {
    setSelectedContent(content);
    setIsModalOpen(true);
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setYearRange([2000, 2024]);
    setRatingMin([70]);
    setSortBy("relevance");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Buscar en WatchHub
          </h1>
          <p className="text-muted-foreground">
            Descubre tu próxima película favorita
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar películas, actores, directores..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12 h-12 text-lg bg-card border-border"
          />
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Trending Searches */}
        {!searchQuery && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Búsquedas populares
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((search, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setSearchQuery(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Filtros</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Géneros */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Géneros
                </label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Badge
                      key={genre}
                      variant={selectedGenres.includes(genre) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleGenreToggle(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Año */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Año de lanzamiento
                </label>
                <div className="px-2">
                  <Slider
                    value={yearRange}
                    onValueChange={setYearRange}
                    min={1950}
                    max={2024}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{yearRange[0]}</span>
                    <span>{yearRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Calificación */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Calificación mínima
                </label>
                <div className="px-2">
                  <Slider
                    value={ratingMin}
                    onValueChange={setRatingMin}
                    min={0}
                    max={100}
                    step={5}
                    className="mb-2"
                  />
                  <div className="text-sm text-muted-foreground">
                    {ratingMin[0]}% o más
                  </div>
                </div>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Ordenar por
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevancia</SelectItem>
                    <SelectItem value="year-desc">Año (más reciente)</SelectItem>
                    <SelectItem value="year-asc">Año (más antiguo)</SelectItem>
                    <SelectItem value="rating-desc">Calificación (mayor)</SelectItem>
                    <SelectItem value="title-asc">Título (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Results Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todo</TabsTrigger>
            <TabsTrigger value="movies">Películas</TabsTrigger>
            <TabsTrigger value="actors">Actores</TabsTrigger>
            <TabsTrigger value="directors">Directores</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-8">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {searchQuery ? `Resultados para "${searchQuery}"` : "Películas populares"}
                <span className="ml-2 text-sm">({searchResults.length} resultados)</span>
              </p>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {searchResults.map((content) => (
                <ContentCard
                  key={content.id}
                  title={content.title}
                  image={content.image}
                  rating={content.rating}
                  year={content.year}
                  isNew={content.isNew}
                  onClick={() => handleContentClick(content)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="movies" className="mt-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {searchResults.map((content) => (
                <ContentCard
                  key={content.id}
                  title={content.title}
                  image={content.image}
                  rating={content.rating}
                  year={content.year}
                  isNew={content.isNew}
                  onClick={() => handleContentClick(content)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="actors" className="mt-8">
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                Búsqueda de actores disponible próximamente
              </p>
            </div>
          </TabsContent>

          <TabsContent value="directors" className="mt-8">
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                Búsqueda de directores disponible próximamente
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Movie Detail Modal */}
      {selectedContent && (
        <MovieDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          content={selectedContent}
        />
      )}
    </div>
  );
}