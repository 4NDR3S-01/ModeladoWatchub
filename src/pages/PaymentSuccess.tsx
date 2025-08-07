import { Button } from "@/components/ui/button";
import { CheckCircle, Heart, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { checkSubscription, refreshSubscription, subscriptionTier, subscriptionProvider } = useSubscription();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const provider = searchParams.get('provider') || 'stripe';
  const paymentId = searchParams.get('payment_id');
  const subscriptionId = searchParams.get('subscription_id');
  const type = searchParams.get('type') || 'payment';

  // Mapeo de precios por plan
  const planPrices = {
    basic: '$9.99',
    standard: '$14.99',
    premium: '$19.99'
  };

  const currentPrice = subscriptionTier ? 
    planPrices[subscriptionTier.toLowerCase() as keyof typeof planPrices] || '$19.99' 
    : '$19.99';

  useEffect(() => {
    const verifyAndRefresh = async () => {
      setIsVerifying(true);
      try {
        console.log('🔄 Actualizando estado de suscripción...');
        
        // Esperar un poco para que se procese la suscripción
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Actualizar el estado de suscripción
        await refreshSubscription();
        
        // Mostrar mensaje de éxito
        toast({
          title: "¡Pago exitoso!",
          description: provider === 'paypal' 
            ? "Tu suscripción con PayPal ha sido activada" 
            : "Tu suscripción ha sido activada exitosamente",
          variant: "default",
        });
        
        console.log('✅ Estado de suscripción actualizado');
        
      } catch (error) {
        console.error('❌ Error actualizando suscripción:', error);
        toast({
          title: "Verificación pendiente",
          description: "Tu pago fue exitoso. El estado de tu suscripción se actualizará en breve.",
          variant: "default",
        });
      } finally {
        setIsVerifying(false);
        setVerificationComplete(true);
      }
    };

    if (!verificationComplete) {
      verifyAndRefresh();
    }
  }, [provider, paymentId, subscriptionId, type, refreshSubscription, toast, verificationComplete]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-background flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
            Verificando pago...
          </h1>
          <p className="text-lg text-muted-foreground">
            {provider === 'paypal' 
              ? 'Estamos procesando tu pago de PayPal. Por favor espera un momento.'
              : 'Estamos verificando tu pago. Por favor espera un momento.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-background flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-pulse">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          Tu suscripción a WatchHub {subscriptionTier || 'Premium'} ha sido activada correctamente.
          {provider === 'paypal' && (
            <span className="block text-sm mt-2 text-blue-600">
              Pago procesado a través de PayPal
            </span>
          )}
        </p>

        {/* Subscription Details */}
        <div className="bg-card border border-border rounded-lg p-6 text-left mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Detalles de tu suscripción:
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-medium capitalize">{subscriptionTier || 'Premium'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precio:</span>
              <span className="font-medium">{currentPrice}/mes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Método de pago:</span>
              <span className="font-medium">
                {provider === 'paypal' ? 'PayPal' : 
                 subscriptionProvider === 'paypal' ? 'PayPal' : 
                 'Tarjeta de Crédito'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Próximo pago:</span>
              <span className="font-medium">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <span className="font-medium text-green-600">Activo</span>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-left mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Heart className="w-5 h-5 text-primary mr-2" />
            Ahora puedes disfrutar de:
          </h3>
          
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3" />
              Contenido en alta calidad
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3" />
              Múltiples dispositivos simultáneos
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3" />
              Catálogo completo sin restricciones
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3" />
              Sin anuncios publicitarios
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-primary rounded-full mr-3" />
              Perfiles familiares personalizados
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link to="/" className="block">
            <Button size="lg" className="w-full">
              Comenzar a ver contenido
            </Button>
          </Link>
          
          <Link to="/settings" className="block">
            <Button variant="outline" size="lg" className="w-full">
              Gestionar suscripción
            </Button>
          </Link>
        </div>

        {/* Additional Information */}
        {provider === 'paypal' && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <p>
              <strong>Nota:</strong> Para gestionar o cancelar tu suscripción de PayPal, 
              también puedes hacerlo directamente desde tu cuenta de PayPal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}