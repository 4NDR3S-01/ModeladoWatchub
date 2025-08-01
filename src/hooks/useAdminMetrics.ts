import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalRevenue: number;
  totalContent: number;
  publishedContent: number;
  draftContent: number;
}

export interface ContentMetric {
  title: string;
  views: number;
  engagement: number;
  completion: number;
  category: string;
  rating: number;
}

export const useAdminMetrics = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [contentMetrics, setContentMetrics] = useState<ContentMetric[]>([]);
  const [topMovies, setTopMovies] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAdminMetrics();
    }
  }, [user]);

  const fetchAdminMetrics = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get active users (logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      // Get new users (created within last 30 days)
      const { count: newUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Get content counts
      const { count: totalContent } = await supabase
        .from('movies')
        .select('*', { count: 'exact', head: true });

      const { count: publishedContent } = await supabase
        .from('movies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      const { count: draftContent } = await supabase
        .from('movies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');

      // Get top movies by views
      const { data: topMoviesData } = await supabase
        .from('movies')
        .select('title, views, rating, poster_url')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .limit(5);

      // Get content for performance metrics
      const { data: contentData } = await supabase
        .from('movies')
        .select('title, views, rating, genre')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .limit(10);

      const formattedContentMetrics = contentData?.map(movie => ({
        title: movie.title,
        views: movie.views || 0,
        engagement: Math.floor(Math.random() * 30) + 70, // Placeholder for now
        completion: Math.floor(Math.random() * 40) + 60, // Placeholder for now
        category: movie.genre?.[0] || 'Sin categoría',
        rating: movie.rating || 0
      })) || [];

      setMetrics({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        newUsers: newUsers || 0,
        totalRevenue: 0, // TODO: Calculate from subscriptions
        totalContent: totalContent || 0,
        publishedContent: publishedContent || 0,
        draftContent: draftContent || 0,
      });

      setContentMetrics(formattedContentMetrics);
      setTopMovies(topMoviesData || []);

      // Mock recent activities for now
      setRecentActivities([
        { type: "user", message: "Nuevo usuario registrado", time: "Hace 2 min" },
        { type: "content", message: "Nueva película agregada al catálogo", time: "Hace 15 min" },
        { type: "payment", message: "Pago recibido: Plan Premium", time: "Hace 23 min" },
        { type: "system", message: "Backup automático completado", time: "Hace 1 hora" },
      ]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching admin metrics');
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    contentMetrics,
    topMovies,
    recentActivities,
    loading,
    error,
    fetchAdminMetrics,
  };
};
