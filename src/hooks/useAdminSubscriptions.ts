import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStats {
  monthlyRevenue: number;
  activeSubscribers: number;
  conversionRate: number;
  monthlyRetention: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  subscribers: number;
  revenue: number;
  features: string[];
  active: boolean;
  conversion: number;
}

interface RecentSubscription {
  id: string;
  user: string;
  email: string;
  plan: string;
  amount: number;
  status: string;
  date: string;
  avatar: string | null;
}

export const useAdminSubscriptions = () => {
  const [stats, setStats] = useState<SubscriptionStats>({
    monthlyRevenue: 0,
    activeSubscribers: 0,
    conversionRate: 0,
    monthlyRetention: 0
  });
  
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [recentSubscriptions, setRecentSubscriptions] = useState<RecentSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener suscripciones de PayPal activas
      const { data: paypalSubscriptions, error: paypalError } = await supabase
        .from('paypal_subscriptions')
        .select(`
          id,
          user_id,
          plan_name,
          amount,
          status,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (paypalError) {
        console.warn('Error fetching PayPal subscriptions:', paypalError);
      }

      // Obtener datos de subscribers (estos son los usuarios registrados en la bienvenida)
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select(`
          id,
          user_id,
          email,
          subscribed,
          subscription_tier,
          subscription_end,
          created_at,
          updated_at
        `)
        .eq('subscribed', true) // Solo usuarios que han confirmado suscripción
        .order('updated_at', { ascending: false });

      if (subscribersError) {
        console.warn('Error fetching subscribers:', subscribersError);
      }

      // Obtener información de perfiles para nombres de usuario
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          display_name,
          avatar_url,
          subscription_plan
        `);

      if (profilesError) {
        console.warn('Error fetching profiles:', profilesError);
      }

      // Procesar datos para estadísticas
      const activePaypalSubs = paypalSubscriptions?.filter(sub => sub.status === 'ACTIVE') || [];
      const activeSubscribersFromDb = subscribersData || []; // Ya están filtrados como subscribed=true
      
      // Calcular ingresos mensuales
      const paypalRevenue = activePaypalSubs.reduce((total, sub) => total + (sub.amount || 0), 0);
      
      // Estimar ingresos de subscribers basado en sus planes
      const subscribersRevenue = activeSubscribersFromDb.reduce((total, sub) => {
        const planPrice = sub.subscription_tier === 'premium' ? 19.99 : 
                         sub.subscription_tier === 'standard' ? 14.99 : 9.99;
        return total + planPrice;
      }, 0);
      
      const totalMonthlyRevenue = paypalRevenue + subscribersRevenue;
      
      // Total de suscriptores activos
      const totalActiveSubscribers = activePaypalSubs.length + activeSubscribersFromDb.length;

      // Estadísticas básicas
      setStats({
        monthlyRevenue: totalMonthlyRevenue,
        activeSubscribers: totalActiveSubscribers,
        conversionRate: totalActiveSubscribers > 0 ? (totalActiveSubscribers / 100) * 24.8 : 0, // Estimación
        monthlyRetention: 89.3 // Valor fijo por ahora
      });

      // Crear planes basados en los datos reales - solo mostrar planes con suscriptores
      const planTypes = ['basic', 'standard', 'premium'];
      const processedPlans: SubscriptionPlan[] = planTypes.map(planType => {
        // Contar suscriptores por tipo de plan
        const paypalPlanSubs = activePaypalSubs.filter(sub => 
          sub.plan_name.toLowerCase().includes(planType)
        );
        const subscriberPlanSubs = activeSubscribersFromDb.filter(sub => 
          sub.subscription_tier === planType
        );
        const profilePlanSubs = profilesData?.filter(profile => 
          profile.subscription_plan === planType
        ) || [];

        // Precios y características según el tipo de plan
        const planInfo = {
          basic: {
            name: 'Plan Básico',
            price: 9.99,
            features: ['720p HD', '1 pantalla simultánea', 'Catálogo completo', 'Sin anuncios']
          },
          standard: {
            name: 'Plan Estándar', 
            price: 14.99,
            features: ['1080p Full HD', '2 pantallas simultáneas', 'Catálogo completo', 'Sin anuncios', 'Perfiles familiares']
          },
          premium: {
            name: 'Plan Premium',
            price: 19.99,
            features: ['4K + HDR', '4 pantallas simultáneas', 'Catálogo completo + Exclusivos', 'Sin anuncios', 'Perfiles familiares', 'Audio espacial', 'Acceso anticipado']
          }
        };

        const info = planInfo[planType as keyof typeof planInfo];

        const totalSubs = paypalPlanSubs.length + subscriberPlanSubs.length + profilePlanSubs.length;
        const paypalPlanRevenue = paypalPlanSubs.reduce((total, sub) => total + (sub.amount || 0), 0);
        const subscriberPlanRevenue = subscriberPlanSubs.length * info.price; // Estimación basada en precio del plan
        const totalRevenue = paypalPlanRevenue + subscriberPlanRevenue;

        return {
          id: planType,
          name: info.name,
          price: info.price,
          currency: 'USD',
          interval: 'month',
          subscribers: totalSubs,
          revenue: totalRevenue,
          features: info.features,
          active: true,
          conversion: totalSubs > 0 ? Math.round((totalSubs / totalActiveSubscribers) * 100 * 100) / 100 : 0
        };
      });

      setPlans(processedPlans.filter(plan => plan.subscribers >= 0)); // Mostrar todos los planes, incluso con 0 suscriptores

      // Procesar suscripciones recientes
      const recentSubs: RecentSubscription[] = [];

      // Agregar suscripciones de PayPal
      paypalSubscriptions?.slice(0, 10).forEach(sub => {
        const profile = profilesData?.find(p => p.user_id === sub.user_id);
        const subscriber = subscribersData?.find(s => s.user_id === sub.user_id);
        
        recentSubs.push({
          id: sub.id,
          user: profile?.display_name || 'Usuario sin nombre',
          email: subscriber?.email || 'No disponible',
          plan: sub.plan_name,
          amount: sub.amount || 0,
          status: sub.status === 'ACTIVE' ? 'Activa' : 
                  sub.status === 'CANCELLED' ? 'Cancelada' : 'Pendiente',
          date: sub.created_at,
          avatar: profile?.avatar_url || null
        });
      });

      // Agregar suscriptores de base de datos (solo los de la bienvenida que están suscritos)
      subscribersData?.slice(0, 10).forEach(sub => {
        if (!recentSubs.find(rs => rs.email === sub.email)) {
          const profile = profilesData?.find(p => p.user_id === sub.user_id);
          
          const planAmount = sub.subscription_tier === 'premium' ? 19.99 : 
                           sub.subscription_tier === 'standard' ? 14.99 : 9.99;
          
          recentSubs.push({
            id: sub.id,
            user: profile?.display_name || 'Usuario sin nombre',
            email: sub.email,
            plan: sub.subscription_tier || 'basic',
            amount: planAmount,
            status: 'Activa', // Si están en subscribers y subscribed=true, están activos
            date: sub.updated_at,
            avatar: profile?.avatar_url || null
          });
        }
      });

      // Ordenar por fecha más reciente
      recentSubs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setRecentSubscriptions(recentSubs.slice(0, 10));

    } catch (err: any) {
      console.error('Error fetching subscription data:', err);
      setError(err.message || 'Error al cargar los datos de suscripciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  return {
    stats,
    plans,
    recentSubscriptions,
    loading,
    error,
    refetch: fetchSubscriptionData
  };
};
