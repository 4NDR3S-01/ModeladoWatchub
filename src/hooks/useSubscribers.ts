import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Subscriber {
  id: string;
  user_id: string | null;
  email: string;
  stripe_customer_id: string | null;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  updated_at: string;
  created_at: string;
}

export function useSubscribers() {
  const { user } = useAuth();
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriber = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      setSubscriber(data || null);
    } catch (err) {
      console.error('Error fetching subscriber:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscriber();
  }, [fetchSubscriber]);

  const getSubscriptionTierDisplay = (tier: string | null) => {
    if (!tier) return 'Sin suscripción';
    
    switch (tier.toLowerCase()) {
      case 'basic':
        return 'Plan Básico';
      case 'standard':
        return 'Plan Estándar';
      case 'premium':
        return 'Plan Premium';
      default:
        return tier;
    }
  };

  const getSubscriptionStatus = () => {
    if (!subscriber) return 'No encontrado';
    
    if (!subscriber.subscribed) return 'Inactivo';
    
    if (subscriber.subscription_end) {
      const endDate = new Date(subscriber.subscription_end);
      const now = new Date();
      
      if (endDate < now) {
        return 'Expirado';
      }
      
      return 'Activo';
    }
    
    return 'Activo';
  };

  const getDaysRemaining = () => {
    if (!subscriber?.subscription_end) return null;
    
    const endDate = new Date(subscriber.subscription_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const isActive = () => {
    if (!subscriber) return false;
    return subscriber.subscribed && getSubscriptionStatus() === 'Activo';
  };

  return {
    subscriber,
    loading,
    error,
    fetchSubscriber,
    getSubscriptionTierDisplay,
    getSubscriptionStatus,
    getDaysRemaining,
    isActive,
  };
}
