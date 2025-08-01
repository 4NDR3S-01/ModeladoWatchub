import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  avatar_id?: string;
  type: 'adult' | 'teen' | 'kids';
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

export const useProfiles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const MAX_PROFILES = 4;

  // Fetch profiles from database
  const fetchProfiles = async () => {
    if (!user) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('is_main', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setProfiles(data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching profiles:', err);
      toast({
        title: "Error",
        description: `No se pudieron cargar los perfiles: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new profile
  const createProfile = async (profileData: {
    name: string;
    avatar_id?: string;
    type: 'adult' | 'teen' | 'kids';
  }): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "No hay usuario autenticado",
        variant: "destructive",
      });
      return false;
    }

    if (profiles.length >= MAX_PROFILES) {
      toast({
        title: "Límite alcanzado",
        description: `Solo puedes tener un máximo de ${MAX_PROFILES} perfiles.`,
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          name: profileData.name,
          avatar_id: profileData.avatar_id,
          type: profileData.type,
          is_main: profiles.length === 0, // First profile is main
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfiles(prev => [...prev, data]);
      
      toast({
        title: "Perfil creado",
        description: `El perfil "${profileData.name}" ha sido creado exitosamente.`,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      toast({
        title: "Error",
        description: `No se pudo crear el perfil: ${errorMessage}`,
        variant: "destructive",
      });
      return false;
    }
  };

  // Update profile
  const updateProfile = async (profileId: string, updates: {
    name?: string;
    avatar_id?: string;
    type?: 'adult' | 'teen' | 'kids';
  }): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "No hay usuario autenticado",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfiles(prev => prev.map(profile => 
        profile.id === profileId ? data : profile
      ));

      toast({
        title: "Perfil actualizado",
        description: "El perfil ha sido actualizado exitosamente.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      toast({
        title: "Error",
        description: `No se pudo actualizar el perfil: ${errorMessage}`,
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete profile
  const deleteProfile = async (profileId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "No hay usuario autenticado",
        variant: "destructive",
      });
      return false;
    }

    const profileToDelete = profiles.find(p => p.id === profileId);
    if (!profileToDelete) {
      toast({
        title: "Error",
        description: "Perfil no encontrado",
        variant: "destructive",
      });
      return false;
    }

    if (profileToDelete.is_main) {
      toast({
        title: "No se puede eliminar",
        description: "No puedes eliminar el perfil principal.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', profileId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setProfiles(prev => prev.filter(profile => profile.id !== profileId));

      toast({
        title: "Perfil eliminado",
        description: `El perfil "${profileToDelete.name}" ha sido eliminado.`,
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      toast({
        title: "Error",
        description: `No se pudo eliminar el perfil: ${errorMessage}`,
        variant: "destructive",
      });
      return false;
    }
  };

  // Load profiles on user change
  useEffect(() => {
    fetchProfiles();
  }, [user]);

  return {
    profiles,
    loading,
    error,
    MAX_PROFILES,
    createProfile,
    updateProfile,
    deleteProfile,
    refetchProfiles: fetchProfiles,
  };
};
