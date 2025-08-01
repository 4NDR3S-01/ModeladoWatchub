import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  user_id: string;
  plan: 'basic' | 'standard' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  start_date: string;
  end_date?: string;
  cancelled_at?: string;
  price: number;
  currency: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

interface SubscriptionHistory {
  id: string;
  user_id: string;
  plan: string;
  action: 'subscribed' | 'cancelled' | 'renewed' | 'upgraded' | 'downgraded';
  date: string;
  price: number;
  details: string;
}

const PLAN_PRICES = {
  basic: 9.99,
  standard: 14.99,
  premium: 19.99
};

export function useSubscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionHistory[]>([]);

  const loadCurrentSubscription = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Obtener suscripción actual desde localStorage (simulado)
      const storageKey = `subscription_${user.id}`;
      const storedSubscription = localStorage.getItem(storageKey);
      
      if (storedSubscription) {
        const subscription = JSON.parse(storedSubscription);
        
        // Verificar si la suscripción no ha expirado
        if (subscription.end_date && new Date(subscription.end_date) < new Date()) {
          subscription.status = 'expired';
          localStorage.setItem(storageKey, JSON.stringify(subscription));
        }
        
        setCurrentSubscription(subscription);
      } else {
        setCurrentSubscription(null);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadSubscriptionHistory = useCallback(async () => {
    if (!user) return;

    try {
      // Obtener historial desde localStorage
      const historyKey = `subscription_history_${user.id}`;
      const storedHistory = localStorage.getItem(historyKey);
      
      if (storedHistory) {
        setSubscriptionHistory(JSON.parse(storedHistory));
      } else {
        setSubscriptionHistory([]);
      }
    } catch (error) {
      console.error('Error loading subscription history:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadCurrentSubscription();
      loadSubscriptionHistory();
    }
  }, [user, loadCurrentSubscription, loadSubscriptionHistory]);

  const subscribe = async (plan: 'basic' | 'standard' | 'premium', paymentMethodId?: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);

      // Crear nueva suscripción
      const newSubscription: Subscription = {
        id: `sub_${Date.now()}`,
        user_id: user.id,
        plan,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
        price: PLAN_PRICES[plan],
        currency: 'USD',
        payment_method: paymentMethodId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Guardar suscripción
      const storageKey = `subscription_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(newSubscription));

      // Agregar al historial
      await addToHistory('subscribed', plan, PLAN_PRICES[plan], `Suscripción a plan ${plan}`);

      setCurrentSubscription(newSubscription);

      toast({
        title: "¡Suscripción activada!",
        description: `Te has suscrito al plan ${plan} exitosamente`,
      });

      return true;
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la suscripción",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePlan = async (newPlan: 'basic' | 'standard' | 'premium'): Promise<boolean> => {
    if (!user || !currentSubscription) return false;

    try {
      setLoading(true);

      const oldPlan = currentSubscription.plan;
      const action = PLAN_PRICES[newPlan] > PLAN_PRICES[oldPlan] ? 'upgraded' : 'downgraded';

      const updatedSubscription: Subscription = {
        ...currentSubscription,
        plan: newPlan,
        price: PLAN_PRICES[newPlan],
        updated_at: new Date().toISOString()
      };

      // Guardar suscripción actualizada
      const storageKey = `subscription_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedSubscription));

      // Agregar al historial
      await addToHistory(action, newPlan, PLAN_PRICES[newPlan], 
        `Cambio de plan ${oldPlan} a ${newPlan}`);

      setCurrentSubscription(updatedSubscription);

      toast({
        title: "Plan actualizado",
        description: `Tu plan ha sido cambiado a ${newPlan}`,
      });

      return true;
    } catch (error) {
      console.error('Error changing plan:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el plan",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    if (!user || !currentSubscription) return false;

    try {
      setLoading(true);

      const updatedSubscription: Subscription = {
        ...currentSubscription,
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Guardar suscripción cancelada
      const storageKey = `subscription_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedSubscription));

      // Agregar al historial
      await addToHistory('cancelled', currentSubscription.plan, 0, 
        `Cancelación de plan ${currentSubscription.plan}`);

      setCurrentSubscription(updatedSubscription);

      toast({
        title: "Suscripción cancelada",
        description: "Tu suscripción ha sido cancelada. Tendrás acceso hasta el final del periodo actual.",
      });

      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const reactivateSubscription = async (): Promise<boolean> => {
    if (!user || !currentSubscription) return false;

    try {
      setLoading(true);

      const updatedSubscription: Subscription = {
        ...currentSubscription,
        status: 'active',
        cancelled_at: undefined,
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };

      // Guardar suscripción reactivada
      const storageKey = `subscription_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedSubscription));

      // Agregar al historial
      await addToHistory('renewed', currentSubscription.plan, PLAN_PRICES[currentSubscription.plan], 
        `Reactivación de plan ${currentSubscription.plan}`);

      setCurrentSubscription(updatedSubscription);

      toast({
        title: "Suscripción reactivada",
        description: "Tu suscripción ha sido reactivada exitosamente",
      });

      return true;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      toast({
        title: "Error",
        description: "No se pudo reactivar la suscripción",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = async (
    action: 'subscribed' | 'cancelled' | 'renewed' | 'upgraded' | 'downgraded',
    plan: string,
    price: number,
    details: string
  ) => {
    if (!user) return;

    const historyEntry: SubscriptionHistory = {
      id: `hist_${Date.now()}`,
      user_id: user.id,
      plan,
      action,
      date: new Date().toISOString(),
      price,
      details
    };

    // Obtener historial actual
    const historyKey = `subscription_history_${user.id}`;
    const currentHistory = subscriptionHistory.length > 0 ? subscriptionHistory : [];
    
    // Agregar nueva entrada al principio
    const updatedHistory = [historyEntry, ...currentHistory];
    
    // Guardar historial actualizado
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    setSubscriptionHistory(updatedHistory);
  };

  const getPlanDisplayName = (plan: string): string => {
    switch (plan) {
      case 'basic':
        return 'Plan Básico';
      case 'standard':
        return 'Plan Estándar';
      case 'premium':
        return 'Plan Premium';
      default:
        return 'Plan Desconocido';
    }
  };

  const isSubscriptionActive = (): boolean => {
    return currentSubscription?.status === 'active' && 
           (!currentSubscription.end_date || new Date(currentSubscription.end_date) > new Date());
  };

  return {
    currentSubscription,
    subscriptionHistory,
    loading,
    subscribe,
    changePlan,
    cancelSubscription,
    reactivateSubscription,
    getPlanDisplayName,
    isSubscriptionActive,
    loadCurrentSubscription,
    loadSubscriptionHistory,
    PLAN_PRICES
  };
}
