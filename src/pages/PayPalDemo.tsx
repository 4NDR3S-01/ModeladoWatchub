import React from 'react';
import PayPalButton from '@/components/PayPalButton';
import PayPalCheckoutButton from '@/components/PayPalCheckoutButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

export default function PayPalDemo() {
  const { user } = useAuth();
  const { toast } = useToast();

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Demo de PayPal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Debes iniciar sesión para probar PayPal
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Iniciar Sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Demo de PayPal Integration</h1>
          <p className="text-muted-foreground mb-4">
            Prueba ambos métodos de integración con PayPal
          </p>
          
          <div className="flex gap-2 mb-6">
            <Link to="/paypal-diagnostic">
              <Button variant="outline" className="flex items-center gap-2">
                Ver Diagnóstico Completo <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/env-diagnostic">
              <Button variant="outline" className="flex items-center gap-2">
                Variables de Entorno <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        <Tabs defaultValue="checkout" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="checkout">Checkout Directo (Recomendado)</TabsTrigger>
            <TabsTrigger value="sdk">SDK PayPal (Con error actual)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="checkout">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Método de Checkout Directo</h2>
              <p className="text-muted-foreground mb-4">
                Este método abre PayPal en una nueva ventana y funciona sin necesidad de Plan IDs específicos.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan Básico */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan Básico</CardTitle>
                  <p className="text-2xl font-bold">$9.99/mes</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Calidad HD</li>
                    <li>1 pantalla</li>
                    <li>Sin anuncios</li>
                  </ul>
                  
                  <PayPalCheckoutButton
                    plan="basic"
                    amount={9.99}
                    onSuccess={() => {
                      toast({
                        title: "¡Éxito!",
                        description: "Checkout de PayPal iniciado para plan básico"
                      });
                    }}
                    onError={(error) => {
                      console.error('Error PayPal:', error);
                      toast({
                        title: "Error",
                        description: "Error al abrir checkout de PayPal",
                        variant: "destructive"
                      });
                    }}
                  />
                </CardContent>
              </Card>

              {/* Plan Estándar */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Plan Estándar</CardTitle>
                  <p className="text-2xl font-bold">$14.99/mes</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Calidad Full HD</li>
                    <li>2 pantallas</li>
                    <li>Perfiles familiares</li>
                    <li>Sin anuncios</li>
                  </ul>
                  
                  <PayPalCheckoutButton
                    plan="standard"
                    amount={14.99}
                    onSuccess={() => {
                      toast({
                        title: "¡Éxito!",
                        description: "Checkout de PayPal iniciado para plan estándar"
                      });
                    }}
                    onError={(error) => {
                      console.error('Error PayPal:', error);
                      toast({
                        title: "Error",
                        description: "Error al abrir checkout de PayPal",
                        variant: "destructive"
                      });
                    }}
                  />
                </CardContent>
              </Card>

              {/* Plan Premium */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan Premium</CardTitle>
                  <p className="text-2xl font-bold">$19.99/mes</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Calidad 4K + HDR</li>
                    <li>4 pantallas</li>
                    <li>Contenido exclusivo</li>
                    <li>Audio espacial</li>
                    <li>Sin anuncios</li>
                  </ul>
                  
                  <PayPalCheckoutButton
                    plan="premium"
                    amount={19.99}
                    onSuccess={() => {
                      toast({
                        title: "¡Éxito!",
                        description: "Checkout de PayPal iniciado para plan premium"
                      });
                    }}
                    onError={(error) => {
                      console.error('Error PayPal:', error);
                      toast({
                        title: "Error",
                        description: "Error al abrir checkout de PayPal",
                        variant: "destructive"
                      });
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sdk">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Método SDK PayPal (Con error actual)</h2>
              <p className="text-muted-foreground mb-4">
                Este método usa el SDK oficial pero requiere Plan IDs válidos configurados.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Plan Básico */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan Básico</CardTitle>
                  <p className="text-2xl font-bold">$9.99/mes</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Calidad HD</li>
                    <li>1 pantalla</li>
                    <li>Sin anuncios</li>
                  </ul>
                  
                  <PayPalButton
                    plan="basic"
                    amount={9.99}
                    onSuccess={() => {
                      toast({
                        title: "¡Éxito!",
                        description: "Suscripción básica activada con PayPal"
                      });
                    }}
                    onError={(error) => {
                      console.error('Error PayPal:', error);
                      toast({
                        title: "Error",
                        description: "Error al procesar pago con PayPal",
                        variant: "destructive"
                      });
                    }}
                  />
                </CardContent>
              </Card>

              {/* Plan Estándar */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle>Plan Estándar</CardTitle>
                  <p className="text-2xl font-bold">$14.99/mes</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Calidad Full HD</li>
                    <li>2 pantallas</li>
                    <li>Perfiles familiares</li>
                    <li>Sin anuncios</li>
                  </ul>
                  
                  <PayPalButton
                    plan="standard"
                    amount={14.99}
                    onSuccess={() => {
                      toast({
                        title: "¡Éxito!",
                        description: "Suscripción estándar activada con PayPal"
                      });
                    }}
                    onError={(error) => {
                      console.error('Error PayPal:', error);
                      toast({
                        title: "Error",
                        description: "Error al procesar pago con PayPal",
                        variant: "destructive"
                      });
                    }}
                  />
                </CardContent>
              </Card>

              {/* Plan Premium */}
              <Card>
                <CardHeader>
                  <CardTitle>Plan Premium</CardTitle>
                  <p className="text-2xl font-bold">$19.99/mes</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Calidad 4K + HDR</li>
                    <li>4 pantallas</li>
                    <li>Contenido exclusivo</li>
                    <li>Audio espacial</li>
                    <li>Sin anuncios</li>
                  </ul>
                  
                  <PayPalButton
                    plan="premium"
                    amount={19.99}
                    onSuccess={() => {
                      toast({
                        title: "¡Éxito!",
                        description: "Suscripción premium activada con PayPal"
                      });
                    }}
                    onError={(error) => {
                      console.error('Error PayPal:', error);
                      toast({
                        title: "Error",
                        description: "Error al procesar pago con PayPal",
                        variant: "destructive"
                      });
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Estado Actual</h2>
          <div className="text-sm space-y-2">
            <p><strong>✅ Variables de entorno:</strong> Configuradas</p>
            <p><strong>❌ Plan IDs:</strong> Usando valores de ejemplo (causan error RESOURCE_NOT_FOUND)</p>
            <p><strong>✅ Checkout directo:</strong> Funcionando como alternativa</p>
            <p><strong>🔧 Solución:</strong> Crear planes reales en PayPal Developer Console</p>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Recomendación:</strong> Usa el método de "Checkout Directo" que funciona inmediatamente, 
            mientras configuras los Plan IDs reales para el método SDK.
          </p>
        </div>
      </div>
    </div>
  );
}
