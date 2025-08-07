import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  status: string;
  joinDate: string;
  lastLogin: string;
  watchTime: string;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    newUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener usuarios con sus perfiles, incluyendo email de auth.users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          display_name,
          avatar_url,
          subscription_plan,
          created_at,
          updated_at,
          is_active,
          profile_type
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      // Obtener emails de los usuarios desde auth.users usando user_roles
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role
        `);

      if (userRolesError) {
        console.warn('Error fetching user roles:', userRolesError);
      }

      // Obtener información adicional de subscribers que incluye email
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('subscribers')
        .select('user_id, email, subscribed, subscription_tier');

      if (subscribersError) {
        console.warn('Error fetching subscribers:', subscribersError);
      }

      // Obtener suscripciones para determinar roles premium (esta tabla no existe en el schema, usar paypal y subscribers)
      // const { data: subscriptionsData, error: subscriptionsError } = await supabase
      //   .from('subscriptions')
      //   .select('user_id, status, plan');

      // if (subscriptionsError) {
      //   console.warn('Error fetching subscriptions:', subscriptionsError);
      // }

      // Obtener suscripciones de PayPal
      const { data: paypalSubscriptionsData, error: paypalError } = await supabase
        .from('paypal_subscriptions')
        .select('user_id, status, plan_name');

      if (paypalError) {
        console.warn('Error fetching PayPal subscriptions:', paypalError);
      }

      // Obtener historial de visualización (usar viewing_sessions ya que watching_history no existe)
      const { data: viewingData, error: viewingError } = await supabase
        .from('viewing_sessions')
        .select('user_id, total_watch_time')
        .order('session_start', { ascending: false });

      if (viewingError) {
        console.warn('Error fetching viewing sessions:', viewingError);
      }

      // Procesar datos de usuarios
      const processedUsers: User[] = (profilesData || []).map((profile: any) => {
        // Buscar email del usuario en subscribers
        const subscriberInfo = subscribersData?.find(sub => sub.user_id === profile.user_id);
        
        // Buscar rol del usuario
        const userRole = userRolesData?.find(role => role.user_id === profile.user_id);
        
        // Buscar suscripciones de PayPal
        const paypalSubscription = paypalSubscriptionsData?.find(sub => 
          sub.user_id === profile.user_id && sub.status === 'ACTIVE'
        );
        
        // Determinar el rol/plan del usuario
        let role = 'Basic';
        
        // Verificar suscripción de PayPal
        if (paypalSubscription) {
          const planName = paypalSubscription.plan_name.toLowerCase();
          role = planName.includes('premium') ? 'Premium' : 
                 planName.includes('estándar') || planName.includes('standard') ? 'Standard' : 'Basic';
        } 
        // Verificar datos de subscribers
        else if (subscriberInfo?.subscribed && subscriberInfo.subscription_tier) {
          role = subscriberInfo.subscription_tier === 'premium' ? 'Premium' : 
                 subscriberInfo.subscription_tier === 'standard' ? 'Standard' : 'Basic';
        }
        // Usar subscription_plan del perfil
        else if (profile.subscription_plan && profile.subscription_plan !== 'basic') {
          role = profile.subscription_plan === 'premium' ? 'Premium' : 
                 profile.subscription_plan === 'standard' ? 'Standard' : 'Basic';
        }

        // Calcular tiempo total de visualización para este usuario
        const userViewing = viewingData?.filter(view => view.user_id === profile.user_id) || [];
        const totalWatchTime = userViewing.reduce((total, view) => total + (view.total_watch_time || 0), 0);
        const hours = Math.floor(totalWatchTime / 3600);
        const minutes = Math.floor((totalWatchTime % 3600) / 60);

        // Determinar estado del usuario
        let status = profile.is_active ? 'active' : 'suspended';

        return {
          id: profile.id,
          name: profile.display_name || 'Usuario sin nombre',
          email: subscriberInfo?.email || 'No disponible',
          avatar: profile.avatar_url,
          role,
          status,
          joinDate: new Date(profile.created_at).toLocaleDateString('es-ES'),
          lastLogin: profile.updated_at 
            ? new Date(profile.updated_at).toLocaleDateString('es-ES')
            : 'Nunca',
          watchTime: `${hours}h ${minutes}m`
        };
      });

      setUsers(processedUsers);

      // Calcular estadísticas
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const totalUsers = processedUsers.length;
      const activeUsers = processedUsers.filter(user => user.status === 'active').length;
      const premiumUsers = processedUsers.filter(user => user.role === 'Premium').length;
      const newUsers = processedUsers.filter(user => {
        const joinDateParts = user.joinDate.split('/');
        const joinDate = new Date(
          parseInt(joinDateParts[2]), 
          parseInt(joinDateParts[1]) - 1, 
          parseInt(joinDateParts[0])
        );
        return joinDate >= thirtyDaysAgo;
      }).length;

      setStats({
        totalUsers,
        activeUsers,
        premiumUsers,
        newUsers
      });

    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    stats,
    loading,
    error,
    refetch: fetchUsers
  };
};
