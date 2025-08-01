import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id?: string;
  card_brand: string;
  card_last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface AddPaymentMethodData {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvc: string;
  cardholderName: string;
  isDefault?: boolean;
}

export function usePaymentMethods() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const loadPaymentMethods = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Obtener métodos de pago desde localStorage (simulado)
      const storageKey = `payment_methods_${user.id}`;
      const storedMethods = localStorage.getItem(storageKey);
      
      if (storedMethods) {
        setPaymentMethods(JSON.parse(storedMethods));
      } else {
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los métodos de pago",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      loadPaymentMethods();
    }
  }, [user, loadPaymentMethods]);

  const addPaymentMethod = async (paymentData: AddPaymentMethodData): Promise<boolean> => {
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

      // Detectar el tipo de tarjeta basado en el número
      const cardBrand = detectCardBrand(paymentData.cardNumber);

      // Crear nueva tarjeta
      const newPaymentMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        user_id: user.id,
        card_brand: cardBrand,
        card_last4: paymentData.cardNumber.slice(-4),
        exp_month: paymentData.expiryMonth,
        exp_year: paymentData.expiryYear,
        is_default: paymentData.isDefault || paymentMethods.length === 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Si es la tarjeta por defecto, remover la marca de default de otras tarjetas
      let updatedMethods = [...paymentMethods];
      if (newPaymentMethod.is_default) {
        updatedMethods = updatedMethods.map(pm => ({
          ...pm,
          is_default: false
        }));
      }

      updatedMethods.push(newPaymentMethod);

      // Guardar en localStorage
      const storageKey = `payment_methods_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedMethods));
      
      setPaymentMethods(updatedMethods);

      toast({
        title: "Tarjeta agregada",
        description: "El método de pago se agregó exitosamente",
      });

      return true;
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el método de pago",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removePaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);

      const wasDefault = paymentMethods.find(pm => pm.id === paymentMethodId)?.is_default;
      const updatedMethods = paymentMethods.filter(pm => pm.id !== paymentMethodId);

      // Si se eliminó la tarjeta por defecto, hacer que la primera tarjeta restante sea por defecto
      if (wasDefault && updatedMethods.length > 0) {
        updatedMethods[0].is_default = true;
        updatedMethods[0].updated_at = new Date().toISOString();
      }

      // Guardar en localStorage
      const storageKey = `payment_methods_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedMethods));
      
      setPaymentMethods(updatedMethods);

      toast({
        title: "Tarjeta eliminada",
        description: "El método de pago se eliminó exitosamente",
      });

      return true;
    } catch (error) {
      console.error('Error removing payment method:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el método de pago",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultPaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      setLoading(true);

      // Actualizar los métodos de pago
      const updatedMethods = paymentMethods.map(pm => ({
        ...pm,
        is_default: pm.id === paymentMethodId,
        updated_at: pm.id === paymentMethodId ? new Date().toISOString() : pm.updated_at
      }));

      // Guardar en localStorage
      const storageKey = `payment_methods_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedMethods));
      
      setPaymentMethods(updatedMethods);

      toast({
        title: "Tarjeta actualizada",
        description: "Se estableció como método de pago por defecto",
      });

      return true;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el método de pago",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const detectCardBrand = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (cleanNumber.startsWith('4')) return 'visa';
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'mastercard';
    if (cleanNumber.startsWith('3')) return 'amex';
    if (cleanNumber.startsWith('6')) return 'discover';
    
    return 'unknown';
  };

  const getDefaultPaymentMethod = (): PaymentMethod | null => {
    return paymentMethods.find(pm => pm.is_default) || null;
  };

  return {
    paymentMethods,
    loading,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    getDefaultPaymentMethod,
    loadPaymentMethods
  };
}
