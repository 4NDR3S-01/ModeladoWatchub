import { useEffect, useState } from 'react';
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { usePayPal } from '@/hooks/usePayPal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PAYPAL_CONFIG, paypalScriptOptions } from '@/utils/paypal-config';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface PayPalButtonProps {
  plan: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  className?: string;
  disabled?: boolean;
}

// Componente interno que usa el contexto de PayPal
function PayPalSubscriptionButton({ 
  plan, 
  amount, 
  onSuccess, 
  onError, 
  className = '',
  disabled = false 
}: PayPalButtonProps) {
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();
  const { handleSubscriptionApproval, getPayPalPlanId, loading } = usePayPal();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) {
    return (
      <Button disabled className={className}>
        Debes iniciar sesión
      </Button>
    );
  }

  if (isPending) {
    return (
      <Button disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Cargando PayPal...
      </Button>
    );
  }

  if (isRejected) {
    return (
      <Button disabled variant="destructive" className={className}>
        Error cargando PayPal
      </Button>
    );
  }

  if (!isResolved) {
    return (
      <Button disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Iniciando PayPal...
      </Button>
    );
  }

  let paypalPlanId: string;
  try {
    paypalPlanId = getPayPalPlanId(plan);
  } catch (error) {
    console.error('Error obteniendo plan ID:', error);
    return (
      <Button disabled variant="destructive" className={className}>
        Plan no válido
      </Button>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {(loading || isProcessing || disabled) && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      
      <PayPalButtons
        disabled={disabled || loading || isProcessing}
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'subscribe',
          height: 45
        }}
        createSubscription={(data, actions) => {
          console.log('🔧 Creando suscripción PayPal para plan:', paypalPlanId);
          setIsProcessing(true);
          
          return actions.subscription.create({
            plan_id: paypalPlanId,
            application_context: {
              brand_name: 'WatchHub',
              locale: 'es-ES',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'SUBSCRIBE_NOW',
              payment_method: {
                payer_selected: 'PAYPAL',
                payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
              },
              return_url: PAYPAL_CONFIG.returnUrl,
              cancel_url: PAYPAL_CONFIG.cancelUrl
            }
          });
        }}
        onApprove={async (data, actions) => {
          try {
            console.log('✅ Suscripción aprobada:', data);
            
            if (!data.subscriptionID) {
              throw new Error('No se recibió ID de suscripción');
            }

            // Guardar la suscripción en nuestra base de datos
            await handleSubscriptionApproval(data.subscriptionID, plan);
            
            toast({
              title: "¡Suscripción exitosa!",
              description: `Tu suscripción ${plan} con PayPal ha sido activada.`,
              variant: "default",
            });

            onSuccess?.();
            
          } catch (error) {
            console.error('Error al procesar aprobación:', error);
            toast({
              title: "Error",
              description: "Hubo un problema al activar tu suscripción. Contacta al soporte.",
              variant: "destructive",
            });
            onError?.(error);
          } finally {
            setIsProcessing(false);
          }
        }}
        onError={(err) => {
          console.error('Error de PayPal:', err);
          setIsProcessing(false);
          
          let errorMessage = "Error al procesar el pago con PayPal";
          
          if (err && typeof err === 'object' && 'message' in err) {
            errorMessage = `Error de PayPal: ${err.message}`;
          }
          
          toast({
            title: "Error de PayPal",
            description: errorMessage,
            variant: "destructive",
          });
          
          onError?.(err);
        }}
        onCancel={(data) => {
          console.log('❌ Pago cancelado por el usuario:', data);
          setIsProcessing(false);
          
          toast({
            title: "Pago cancelado",
            description: "Has cancelado el proceso de pago.",
            variant: "default",
          });
        }}
      />
    </div>
  );
}

// Componente principal que envuelve con PayPalScriptProvider
export default function PayPalButton(props: PayPalButtonProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <Button disabled className={props.className}>
        Debes iniciar sesión para pagar con PayPal
      </Button>
    );
  }

  return (
    <PayPalScriptProvider options={paypalScriptOptions}>
      <div className="relative">
        <PayPalSubscriptionButton {...props} />
      </div>
    </PayPalScriptProvider>
  );
}
