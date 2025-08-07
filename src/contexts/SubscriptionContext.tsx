import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { usePayPal, PayPalSubscriptionData } from '@/hooks/usePayPal';

interface SubscriptionContextType {
  subscribed: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  subscriptionProvider: 'stripe' | 'paypal' | null;
  loading: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: (plan: string) => Promise<string>;
  openCustomerPortal: () => Promise<void>;
  checkPayPalSubscription: () => Promise<PayPalSubscriptionData | null>;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth();
  const { checkPayPalSubscription: checkPayPalSub } = usePayPal();
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [subscriptionProvider, setSubscriptionProvider] = useState<'stripe' | 'paypal' | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStripeSubscription = async () => {
    if (!session) return null;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.log('Stripe subscription check error (Edge Function might not exist):', error);
        return null;
      }

      return data;
    } catch (error) {
      console.log('Stripe subscription check error:', error);
      return null;
    }
  };

  const checkPayPalSubscription = async (): Promise<PayPalSubscriptionData | null> => {
    try {
      return await checkPayPalSub();
    } catch (error) {
      console.error('Error checking PayPal subscription:', error);
      return null;
    }
  };

  const checkProfileSubscription = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, subscription_provider, subscription_id')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('Profile subscription check error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error checking profile subscription:', error);
      return null;
    }
  };

  const checkSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('🔍 Verificando suscripciones para usuario:', user.id);

      // Verificar PayPal primero (nuestro método principal)
      const paypalData = await checkPayPalSubscription();
      
      // Verificar perfil de usuario
      const profileData = await checkProfileSubscription();
      
      // Intentar verificar Stripe (fallback)
      const stripeData = await checkStripeSubscription();

      console.log('📊 Datos de suscripciones:', { paypalData, profileData, stripeData });

      // Prioridad: PayPal > Perfil > Stripe
      if (paypalData && paypalData.status === 'ACTIVE') {
        console.log('✅ Suscripción activa de PayPal encontrada');
        setSubscribed(true);
        setSubscriptionTier(paypalData.plan);
        setSubscriptionEnd(paypalData.nextBillingTime || null);
        setSubscriptionProvider('paypal');
      } else if (profileData && profileData.subscription_status === 'active') {
        console.log('✅ Suscripción activa en perfil encontrada');
        setSubscribed(true);
        setSubscriptionTier(profileData.subscription_tier);
        setSubscriptionEnd(null); // Se podría obtener de otra tabla
        setSubscriptionProvider(profileData.subscription_provider || 'stripe');
      } else if (stripeData && stripeData.subscribed) {
        console.log('✅ Suscripción activa de Stripe encontrada');
        setSubscribed(true);
        setSubscriptionTier(stripeData.subscription_tier);
        setSubscriptionEnd(stripeData.subscription_end);
        setSubscriptionProvider('stripe');
      } else {
        console.log('ℹ️ No se encontraron suscripciones activas');
        setSubscribed(false);
        setSubscriptionTier(null);
        setSubscriptionEnd(null);
        setSubscriptionProvider(null);
      }
    } catch (error) {
      console.error('💥 Error checking subscription:', error);
      setSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
      setSubscriptionProvider(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    await checkSubscription();
  };

  const createCheckout = async (plan: string): Promise<string> => {
    if (!session) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data.url;
    } catch (error) {
      console.error('Error creating Stripe checkout:', error);
      throw new Error('No se pudo crear el checkout de Stripe. Intenta con PayPal.');
    }
  };

  const openCustomerPortal = async () => {
    if (!session) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw new Error('No se pudo abrir el portal de cliente.');
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
      setSubscriptionProvider(null);
    }
  }, [user, session]);

  const value = {
    subscribed,
    subscriptionTier,
    subscriptionEnd,
    subscriptionProvider,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
    checkPayPalSubscription,
    refreshSubscription,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};