import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { mapPlanToPayPal } from '@/utils/paypal-config';

export interface PayPalSubscriptionData {
  subscriptionId: string;
  plan: string;
  status: string;
  amount: number;
  startTime: string;
  nextBillingTime?: string;
}

export const usePayPal = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Función para manejar la aprobación de suscripción
  const handleSubscriptionApproval = async (subscriptionId: string, plan: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      console.log('💾 Guardando suscripción de PayPal:', { subscriptionId, plan, userId: user.id });
      
      // Guardar la suscripción en la base de datos
      const { error: insertError } = await supabase
        .from('paypal_subscriptions')
        .insert({
          user_id: user.id,
          paypal_subscription_id: subscriptionId,
          plan_name: plan,
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Error guardando suscripción:', insertError);
        throw insertError;
      }

      // Actualizar el perfil del usuario
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_tier: plan,
          subscription_status: 'active',
          subscription_provider: 'paypal',
          subscription_id: subscriptionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('❌ Error actualizando perfil:', profileError);
        throw profileError;
      }

      console.log('✅ Suscripción de PayPal guardada exitosamente');
      
      toast({
        title: "¡Suscripción activada!",
        description: `Tu suscripción ${plan} ha sido activada con PayPal.`,
        variant: "default",
      });

      return { success: true, subscriptionId };
    } catch (error) {
      console.error('💥 Error al procesar suscripción de PayPal:', error);
      toast({
        title: "Error",
        description: "No se pudo activar la suscripción. Contacta al soporte.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar suscripción (solo marcar como cancelada localmente)
  const cancelPayPalSubscription = async (subscriptionId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      console.log('🚫 Cancelando suscripción de PayPal:', subscriptionId);

      // Actualizar estado en la base de datos
      const { error: updateError } = await supabase
        .from('paypal_subscriptions')
        .update({
          status: 'CANCELLED',
          updated_at: new Date().toISOString()
        })
        .eq('paypal_subscription_id', subscriptionId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('❌ Error actualizando suscripción:', updateError);
        throw updateError;
      }

      // Actualizar perfil del usuario
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('❌ Error actualizando perfil:', profileError);
        throw profileError;
      }

      console.log('✅ Suscripción cancelada exitosamente');
      
      toast({
        title: "Suscripción cancelada",
        description: "Tu suscripción ha sido cancelada. Para cancelar en PayPal, visita tu cuenta de PayPal.",
        variant: "default",
      });

      return { success: true };
    } catch (error) {
      console.error('💥 Error al cancelar suscripción:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar suscripciones activas
  const checkPayPalSubscription = async (): Promise<PayPalSubscriptionData | null> => {
    if (!user) return null;
    
    setLoading(true);
    try {
      console.log('🔍 Verificando suscripción de PayPal para usuario:', user.id);

      const { data, error } = await supabase
        .from('paypal_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Error verificando suscripción:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Suscripción activa encontrada:', data);
        return {
          subscriptionId: data.paypal_subscription_id,
          plan: data.plan_name,
          status: data.status,
          amount: data.amount || 0,
          startTime: data.created_at,
          nextBillingTime: data.next_billing_time
        };
      }

      console.log('ℹ️ No se encontró suscripción activa de PayPal');
      return null;
    } catch (error) {
      console.error('💥 Error al verificar suscripción:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el plan ID de PayPal
  const getPayPalPlanId = (plan: string): string => {
    try {
      return mapPlanToPayPal(plan);
    } catch (error) {
      console.error('❌ Error obteniendo plan ID:', error);
      throw new Error(`Plan no válido: ${plan}`);
    }
  };

  return {
    loading,
    handleSubscriptionApproval,
    cancelPayPalSubscription,
    checkPayPalSubscription,
    getPayPalPlanId
  };
};