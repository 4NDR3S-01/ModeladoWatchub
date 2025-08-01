import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorState {
  isEnabled: boolean;
  qrCode: string | null;
  secret: string | null;
  backupCodes: string[];
}

export function use2FA() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [twoFactor, setTwoFactor] = useState<TwoFactorState>({
    isEnabled: false,
    qrCode: null,
    secret: null,
    backupCodes: []
  });

  const checkTwoFactorStatus = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Verificar si el usuario tiene MFA habilitado
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) {
        console.error('Error checking MFA factors:', factorsError);
        return;
      }

      const totpFactor = factors?.totp?.find(factor => factor.status === 'verified');
      
      setTwoFactor(prev => ({
        ...prev,
        isEnabled: !!totpFactor
      }));

    } catch (error) {
      console.error('Error checking 2FA status:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Verificar el estado actual del 2FA
  useEffect(() => {
    if (user) {
      checkTwoFactorStatus();
    }
  }, [user, checkTwoFactorStatus]);

  const enable2FA = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return null;
    }

    try {
      setLoading(true);
      
      // Crear un nuevo factor TOTP
      const { data: enrollResponse, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'WatchHub 2FA'
      });

      if (enrollError) {
        throw enrollError;
      }

      if (!enrollResponse) {
        throw new Error('No se pudo crear el factor TOTP');
      }

      // Extraer el QR code y el secret
      const qrCode = enrollResponse.totp.qr_code;
      const secret = enrollResponse.totp.secret;

      setTwoFactor(prev => ({
        ...prev,
        qrCode,
        secret
      }));

      toast({
        title: "2FA iniciado",
        description: "Escanea el código QR con tu aplicación de autenticación",
      });

      return { qrCode, secret, factorId: enrollResponse.id };

    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast({
        title: "Error",
        description: "No se pudo activar la verificación en dos pasos",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (factorId: string, code: string) => {
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

      // Verificar el código TOTP
      const { data: verifyResponse, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: factorId, // En algunos casos puede ser diferente
        code
      });

      if (verifyError) {
        throw verifyError;
      }

      // Generar códigos de respaldo
      const backupCodes = generateBackupCodes();

      // Guardar los códigos de respaldo en la base de datos
      await saveBackupCodes(backupCodes);

      setTwoFactor(prev => ({
        ...prev,
        isEnabled: true,
        qrCode: null,
        secret: null,
        backupCodes
      }));

      toast({
        title: "¡2FA activado!",
        description: "La verificación en dos pasos está ahora activa en tu cuenta",
      });

      return true;

    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast({
        title: "Código incorrecto",
        description: "El código ingresado no es válido. Intenta nuevamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async () => {
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

      // Obtener los factores MFA activos
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) {
        throw factorsError;
      }

      const totpFactor = factors?.totp?.find(factor => factor.status === 'verified');
      
      if (!totpFactor) {
        toast({
          title: "Error",
          description: "No se encontró configuración de 2FA activa",
          variant: "destructive",
        });
        return false;
      }

      // Desactivar el factor TOTP
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({
        factorId: totpFactor.id
      });

      if (unenrollError) {
        throw unenrollError;
      }

      // Eliminar códigos de respaldo de la base de datos
      await removeBackupCodes();

      setTwoFactor({
        isEnabled: false,
        qrCode: null,
        secret: null,
        backupCodes: []
      });

      toast({
        title: "2FA desactivado",
        description: "La verificación en dos pasos ha sido desactivada",
      });

      return true;

    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: "Error",
        description: "No se pudo desactivar la verificación en dos pasos",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateBackupCodes = (): string[] => {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const saveBackupCodes = async (codes: string[]) => {
    if (!user) return;

    try {
      // Guardar en localStorage
      localStorage.setItem(`backup_codes_${user.id}`, JSON.stringify(codes));
    } catch (error) {
      console.error('Error saving backup codes:', error);
    }
  };

  const removeBackupCodes = async () => {
    if (!user) return;

    try {
      // Eliminar de localStorage
      localStorage.removeItem(`backup_codes_${user.id}`);
    } catch (error) {
      console.error('Error removing backup codes:', error);
    }
  };

  const getBackupCodes = async (): Promise<string[]> => {
    if (!user) return [];

    try {
      // Obtener desde localStorage
      const localCodes = localStorage.getItem(`backup_codes_${user.id}`);
      if (localCodes) {
        return JSON.parse(localCodes);
      }

      return [];
    } catch (error) {
      console.error('Error getting backup codes:', error);
      return [];
    }
  };

  return {
    twoFactor,
    loading,
    enable2FA,
    verify2FA,
    disable2FA,
    getBackupCodes,
    checkTwoFactorStatus
  };
}
