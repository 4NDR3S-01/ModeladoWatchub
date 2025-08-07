import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, CircleDollarSign, Settings, Trash2 } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { usePayPal } from "@/hooks/usePayPal";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import PaymentMethodsDialog from "@/components/PaymentMethodsDialog";
import { useToast } from "@/hooks/use-toast";

export default function PaymentSettings() {
  const { 
    subscribed, 
    subscriptionTier, 
    subscriptionProvider, 
    openCustomerPortal,
    checkPayPalSubscription,
    checkSubscription 
  } = useSubscription();
  const { cancelPayPalSubscription, loading: paypalLoading } = usePayPal();
  const { paymentMethods, loading: cardLoading } = usePaymentMethods();
  const { toast } = useToast();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paypalSubscriptions, setPaypalSubscriptions] = useState<any[]>([]);

  const handleOpenStripePortal = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo abrir el portal de gestión de Stripe",
        variant: "destructive",
      });
    }
  };

  const handleCancelPayPalSubscription = async (subscriptionId: string) => {
    try {
      await cancelPayPalSubscription(subscriptionId);
      toast({
        title: "Suscripción cancelada",
        description: "Tu suscripción de PayPal ha sido cancelada exitosamente",
      });
      // Actualizar estado
      await checkSubscription();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción de PayPal",
        variant: "destructive",
      });
    }
  };

  const loadPayPalSubscriptions = async () => {
    try {
      const data = await checkPayPalSubscription();
      setPaypalSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Error loading PayPal subscriptions:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Configuración de Pagos
        </h1>
        <p className="text-muted-foreground">
          Gestiona tus métodos de pago y suscripciones
        </p>
      </div>

      {/* Subscription Status */}
      {subscribed && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Estado de Suscripción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default">Activa</Badge>
                  <span className="text-sm text-muted-foreground">
                    {subscriptionTier} - {subscriptionProvider === 'paypal' ? 'PayPal' : 'Stripe'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tu suscripción está activa y al día
                </p>
              </div>
              <Button
                onClick={subscriptionProvider === 'stripe' ? handleOpenStripePortal : loadPayPalSubscriptions}
                variant="outline"
              >
                Gestionar Suscripción
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cards" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Tarjetas de Crédito
          </TabsTrigger>
          <TabsTrigger value="paypal" className="flex items-center gap-2">
            <CircleDollarSign className="w-4 h-4" />
            PayPal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tarjetas Guardadas</CardTitle>
              <CardDescription>
                Gestiona tus tarjetas de crédito y débito
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cardLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Cargando tarjetas...</p>
                </div>
              ) : paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((card) => (
                    <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {card.card_brand.charAt(0).toUpperCase() + card.card_brand.slice(1)} •••• {card.card_last4}
                            </span>
                            {card.is_default && (
                              <Badge variant="default" className="text-xs">
                                Por defecto
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Expira {card.exp_month.toString().padStart(2, '0')}/{card.exp_year}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No tienes tarjetas guardadas
                  </p>
                </div>
              )}
              
              <Button 
                onClick={() => setShowPaymentDialog(true)}
                className="w-full mt-4"
                variant="outline"
              >
                {paymentMethods.length > 0 ? 'Agregar otra tarjeta' : 'Agregar tarjeta'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paypal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suscripciones de PayPal</CardTitle>
              <CardDescription>
                Gestiona tus suscripciones activas de PayPal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paypalLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Cargando suscripciones...</p>
                </div>
              ) : paypalSubscriptions.length > 0 ? (
                <div className="space-y-3">
                  {paypalSubscriptions.map((subscription) => (
                    <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CircleDollarSign className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{subscription.plan_name}</span>
                            <Badge variant="default" className="text-xs">
                              {subscription.paypal_status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            ${subscription.amount}/mes - PayPal
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCancelPayPalSubscription(subscription.paypal_subscription_id)}
                        variant="destructive"
                        size="sm"
                        disabled={paypalLoading}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CircleDollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No tienes suscripciones activas de PayPal
                  </p>
                  <Button onClick={loadPayPalSubscriptions} variant="outline">
                    Buscar suscripciones
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PaymentMethodsDialog 
        open={showPaymentDialog} 
        onOpenChange={setShowPaymentDialog} 
      />
    </div>
  );
}
