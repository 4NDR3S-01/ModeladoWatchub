import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const usePayPal = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const createPayPalPayment = async (amount: number, currency = 'USD', description = 'Payment') => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-paypal-payment', {
        body: { amount, currency, description },
        headers: {
          Authorization: `Bearer ${user.id}`
        }
      });

      if (error) throw error;
      return data.url;
    } catch (error) {
      console.error('PayPal payment error:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el pago de PayPal",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createPayPalSubscription = async (plan: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-paypal-subscription', {
        body: { plan },
        headers: {
          Authorization: `Bearer ${user.id}`
        }
      });

      if (error) throw error;
      return data.url;
    } catch (error) {
      console.error('PayPal subscription error:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la suscripción de PayPal",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyPayPalPayment = async (paymentId?: string, subscriptionId?: string, type = 'payment') => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-paypal-payment', {
        body: { paymentId, subscriptionId, type },
        headers: {
          Authorization: `Bearer ${user.id}`
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('PayPal verification error:', error);
      toast({
        title: "Error",
        description: "No se pudo verificar el pago de PayPal",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelPayPalSubscription = async (subscriptionId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('paypal-cancel-subscription', {
        body: { subscriptionId },
        headers: {
          Authorization: `Bearer ${user.id}`
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('PayPal cancellation error:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción de PayPal",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkPayPalSubscription = async () => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('paypal-check-subscription', {
        headers: {
          Authorization: `Bearer ${user.id}`
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('PayPal check error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createPayPalPayment,
    createPayPalSubscription,
    verifyPayPalPayment,
    cancelPayPalSubscription,
    checkPayPalSubscription
  };
};