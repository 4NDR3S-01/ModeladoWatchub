import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { ContentCard } from "@/components/ui/content-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Movie } from "@/hooks/useMovies";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MyList = () => {
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/welcome");
      return;
    }
    fetchWatchlist();
  }, [user, navigate]);

  const fetchWatchlist = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('watchlist')
        .select(`
          movie_id,
          movies (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      const movies = data?.map(item => item.movies).filter(Boolean) || [];
      setWatchlistMovies(movies as Movie[]);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (movieId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId);

      if (error) throw error;
      
      setWatchlistMovies(prev => prev.filter(movie => movie.id !== movieId));
      toast({
        title: "Eliminado de Mi Lista",
        description: "La película se ha eliminado de tu lista.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la película de tu lista.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Mi Lista</h1>
          <p className="text-muted-foreground">
            Películas y series que has guardado para ver más tarde ({watchlistMovies.length} elementos)
          </p>
        </div>

        {watchlistMovies.length === 0 ? (
          <EmptyState
            title="Tu lista está vacía"
            description="Agrega películas y series a tu lista para verlas más tarde"
            action={{
              label: "Explorar contenido",
              onClick: () => navigate("/categories")
            }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchlistMovies.map((movie) => (
              <div key={movie.id} className="relative group">
                <ContentCard
                  id={movie.id}
                  title={movie.title}
                  image={movie.poster_url || "/placeholder.svg"}
                  type="movie"
                  rating={movie.rating || 0}
                  year={movie.release_year}
                  duration={movie.duration}
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFromWatchlist(movie.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyList;