import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ExternalLink } from 'lucide-react';

interface PayPalCheckoutButtonProps {
  plan: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  className?: string;
  disabled?: boolean;
}

export default function PayPalCheckoutButton({ 
  plan, 
  amount, 
  onSuccess, 
  onError, 
  className = '',
  disabled = false 
}: PayPalCheckoutButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayPalCheckout = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión requerida",
        description: "Debes iniciar sesión para proceder con el pago",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Crear URL de checkout de PayPal manualmente
      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AYGMJsJkhMRlCT3EYdAP5qW3iBGABONE8oFdxQ2IXVF4mVR5Uy9jOD3K4kxQ';
      const environment = import.meta.env.VITE_PAYPAL_ENVIRONMENT || 'sandbox';
      
      // Construir URL de PayPal para checkout directo
      const paypalBaseUrl = environment === 'sandbox' 
        ? 'https://www.sandbox.paypal.com' 
        : 'https://www.paypal.com';
      
      // Parámetros para el checkout
      const checkoutParams = new URLSearchParams({
        cmd: '_xclick-subscriptions',
        business: clientId,
        item_name: `WatchHub ${plan} Plan`,
        item_number: plan.toLowerCase(),
        currency_code: 'USD',
        a3: amount.toString(), // Precio recurrente
        p3: '1', // Período
        t3: 'M', // Tipo de período (M = mensual)
        src: '1', // Suscripción recurrente
        sra: '1', // Reintentar automáticamente
        return: `${window.location.origin}/payment-success?provider=paypal&plan=${plan}&amount=${amount}`,
        cancel_return: `${window.location.origin}/subscriptions`,
        notify_url: `${window.location.origin}/api/paypal-ipn`, // Para webhooks (si implementas)
        custom: JSON.stringify({
          userId: user.id,
          plan: plan,
          timestamp: Date.now()
        })
      });

      const checkoutUrl = `${paypalBaseUrl}/cgi-bin/webscr?${checkoutParams.toString()}`;
      
      console.log('🔗 Opening PayPal checkout URL:', checkoutUrl);
      
      // Abrir en nueva ventana
      const paypalWindow = window.open(
        checkoutUrl, 
        'paypal_checkout',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (paypalWindow) {
        // Monitorear el cierre de la ventana
        const checkClosed = setInterval(() => {
          if (paypalWindow.closed) {
            clearInterval(checkClosed);
            setIsProcessing(false);
            
            toast({
              title: "Ventana cerrada",
              description: "Si completaste el pago, tu suscripción se activará en breve.",
            });
            
            // Refrescar estado después de un momento
            setTimeout(() => {
              onSuccess?.();
            }, 2000);
          }
        }, 1000);
        
        // Timeout de seguridad
        setTimeout(() => {
          if (!paypalWindow.closed) {
            clearInterval(checkClosed);
          }
        }, 300000); // 5 minutos
        
      } else {
        // Fallback: redirigir en la misma ventana
        window.location.href = checkoutUrl;
      }
      
    } catch (error) {
      console.error('Error creating PayPal checkout:', error);
      toast({
        title: "Error de PayPal",
        description: "No se pudo crear el checkout de PayPal. Inténtalo de nuevo.",
        variant: "destructive",
      });
      onError?.(error);
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handlePayPalCheckout}
      disabled={disabled || isProcessing}
      className={`bg-[#0070ba] hover:bg-[#005ea6] text-white ${className}`}
      size="lg"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Abriendo PayPal...
        </>
      ) : (
        <>
          <svg 
            viewBox="0 0 24 24" 
            className="mr-2 h-5 w-5 fill-current"
            aria-hidden="true"
          >
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.721-.094 1.472-.318 2.31C19.414 13.344 16.048 15.09 11.75 15.09H9.56c-.524 0-.968.382-1.05.9l-1.12 7.106-.32 2.028a.641.641 0 0 0 .633.74h3.94c.524 0 .968-.382 1.05-.9l.043-.273.82-5.203.053-.331c.082-.518.526-.9 1.05-.9h.66c3.743 0 6.671-1.52 7.526-5.917.357-1.836.174-3.368-.777-4.471z"/>
          </svg>
          Pagar con PayPal
          <ExternalLink className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
