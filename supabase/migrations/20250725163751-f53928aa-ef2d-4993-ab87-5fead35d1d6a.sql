-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  subscription_plan TEXT DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create movies/content table
CREATE TABLE public.movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  video_url TEXT,
  duration INTEGER, -- in minutes
  release_year INTEGER,
  genre TEXT[],
  rating DECIMAL(2,1) DEFAULT 0,
  views INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user watchlist table
CREATE TABLE public.watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Create watch history table
CREATE TABLE public.watch_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress INTEGER DEFAULT 0, -- percentage watched
  UNIQUE(user_id, movie_id)
);

-- Create movie ratings table
CREATE TABLE public.movie_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for movies (public read access)
CREATE POLICY "Movies are viewable by everyone" ON public.movies
  FOR SELECT USING (true);

-- RLS Policies for watchlist
CREATE POLICY "Users can view their own watchlist" ON public.watchlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own watchlist" ON public.watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own watchlist" ON public.watchlist
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for watch history
CREATE POLICY "Users can view their own watch history" ON public.watch_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watch history" ON public.watch_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch history" ON public.watch_history
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for movie ratings
CREATE POLICY "Users can view all ratings" ON public.movie_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own ratings" ON public.movie_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON public.movie_ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_movies_updated_at
  BEFORE UPDATE ON public.movies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample movies
INSERT INTO public.movies (title, description, poster_url, duration, release_year, genre, rating, featured) VALUES
('Acción Extrema', 'Una película llena de adrenalina y secuencias de acción espectaculares.', '/placeholder.svg', 120, 2023, ARRAY['Acción', 'Aventura'], 4.5, true),
('Romance en París', 'Una hermosa historia de amor que se desarrolla en las calles de París.', '/placeholder.svg', 105, 2023, ARRAY['Romance', 'Drama'], 4.2, false),
('Misterio Nocturno', 'Un thriller psicológico que te mantendrá al borde de tu asiento.', '/placeholder.svg', 95, 2023, ARRAY['Thriller', 'Misterio'], 4.7, true),
('Comedia Familiar', 'Diversión garantizada para toda la familia con humor inteligente.', '/placeholder.svg', 88, 2023, ARRAY['Comedia', 'Familia'], 4.0, false),
('Ciencia Ficción 2050', 'Un viaje al futuro con efectos visuales impresionantes.', '/placeholder.svg', 135, 2023, ARRAY['Ciencia Ficción', 'Aventura'], 4.6, true),
('Drama Histórico', 'Una emotiva historia basada en eventos reales del siglo XX.', '/placeholder.svg', 145, 2023, ARRAY['Drama', 'Historia'], 4.3, false);