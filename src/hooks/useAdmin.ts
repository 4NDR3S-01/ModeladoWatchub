import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const manageContent = async (action: string, contentData: any) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-content', {
        body: { action, contentData },
        headers: {
          Authorization: `Bearer ${user.id}`
        }
      });

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Contenido gestionado correctamente",
      });
      
      return data;
    } catch (error) {
      console.error('Content management error:', error);
      toast({
        title: "Error",
        description: "Error al gestionar el contenido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const uploadContent = async (contentData: FormData) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-upload-content', {
        body: contentData,
        headers: {
          Authorization: `Bearer ${user.id}`
        }
      });

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Contenido subido correctamente",
      });
      
      return data;
    } catch (error) {
      console.error('Content upload error:', error);
      toast({
        title: "Error",
        description: "Error al subir el contenido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const manageUsers = async (action: string, userData: any) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: { action, userData },
        headers: {
          Authorization: `Bearer ${user.id}`
        }
      });

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "Usuario gestionado correctamente",
      });
      
      return data;
    } catch (error) {
      console.error('User management error:', error);
      toast({
        title: "Error",
        description: "Error al gestionar el usuario",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const approveContent = async (contentId: string, approved: boolean) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-approve-content', {
        body: { contentId, approved },
        headers: {
          Authorization: `Bearer ${user.id}`
        }
      });

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: `Contenido ${approved ? 'aprobado' : 'rechazado'} correctamente`,
      });
      
      return data;
    } catch (error) {
      console.error('Content approval error:', error);
      toast({
        title: "Error",
        description: "Error al aprobar/rechazar el contenido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    manageContent,
    uploadContent,
    manageUsers,
    approveContent
  };
};