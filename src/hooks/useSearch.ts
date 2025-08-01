import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SearchFilters {
  query?: string;
  genres?: string[];
  yearRange?: [number, number];
  ratingMin?: number;
  sortBy?: string;
  contentType?: 'movie' | 'series' | 'all';
}

export const useSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { user } = useAuth();

  const searchContent = async (filters: SearchFilters) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('content-search', {
        body: filters,
        headers: user ? {
          Authorization: `Bearer ${user.id}`
        } : {}
      });

      if (error) throw error;
      setResults(data.results || []);
      return data;
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        headers: {
          Authorization: `Bearer ${user.id}`
        }
      });

      if (error) throw error;
      return data.recommendations || [];
    } catch (error) {
      console.error('Recommendations error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    results,
    searchContent,
    getRecommendations
  };
};