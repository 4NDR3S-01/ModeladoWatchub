import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PayPalCheckoutButton from '@/components/PayPalCheckoutButton';
import { PAYPAL_CONFIG } from '@/utils/paypal-config';

export default function PayPalDiagnostic() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showSensitive, setShowSensitive] = useState(false);
  const [testResults, setTestResults] = useState<any>({});
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Diagnóstico de configuración
  const diagnostics = {
    environment: {
      name: 'Entorno',
      value: PAYPAL_CONFIG.environment,
      status: PAYPAL_CONFIG.environment ? 'success' : 'error',
      description: 'Debe ser "sandbox" o "live"'
    },
    clientId: {
      name: 'Client ID',
      value: PAYPAL_CONFIG.clientId,
      status: PAYPAL_CONFIG.clientId && PAYPAL_CONFIG.clientId.length > 10 ? 'success' : 'error',
      description: 'ID público de PayPal para autenticación'
    },
    envVarClientId: {
      name: 'Variable VITE_PAYPAL_CLIENT_ID',
      value: import.meta.env.VITE_PAYPAL_CLIENT_ID,
      status: import.meta.env.VITE_PAYPAL_CLIENT_ID ? 'success' : 'warning',
      description: 'Variable de entorno configurada'
    },
    envVarEnvironment: {
      name: 'Variable VITE_PAYPAL_ENVIRONMENT',
      value: import.meta.env.VITE_PAYPAL_ENVIRONMENT,
      status: import.meta.env.VITE_PAYPAL_ENVIRONMENT ? 'success' : 'warning',
      description: 'Variable de entorno configurada'
    },
    plans: {
      name: 'Plan IDs',
      value: JSON.stringify(PAYPAL_CONFIG.plans, null, 2),
      status: 'warning',
      description: 'IDs de planes - DEBEN ser reales de tu cuenta PayPal'
    },
    authentication: {
      name: 'Usuario autenticado',
      value: user ? user.email : 'No autenticado',
      status: user ? 'success' : 'error',
      description: 'Necesario para crear suscripciones'
    }
  };

  const testPayPalConnection = async () => {
    setIsTestingConnection(true);
    const results: any = {};

    try {
      // Test 1: Verificar que el SDK se puede cargar
      results.sdkLoad = {
        name: 'Carga del SDK',
        status: 'testing',
        message: 'Verificando carga del SDK de PayPal...'
      };

      // Intentar cargar el SDK de PayPal
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CONFIG.clientId}&currency=USD&intent=subscription`;
      
      const loadPromise = new Promise((resolve, reject) => {
        script.onload = () => resolve('success');
        script.onerror = () => reject('error');
        setTimeout(() => reject('timeout'), 10000);
      });

      try {
        await loadPromise;
        results.sdkLoad = {
          name: 'Carga del SDK',
          status: 'success',
          message: 'SDK de PayPal cargado correctamente'
        };
      } catch (error) {
        results.sdkLoad = {
          name: 'Carga del SDK',
          status: 'error',
          message: `Error cargando SDK: ${error}`
        };
      }

      // Test 2: Verificar Client ID
      results.clientIdTest = {
        name: 'Validación Client ID',
        status: PAYPAL_CONFIG.clientId.startsWith('A') && PAYPAL_CONFIG.clientId.length > 50 ? 'success' : 'warning',
        message: PAYPAL_CONFIG.clientId.startsWith('A') ? 'Client ID tiene formato válido' : 'Client ID podría ser de ejemplo'
      };

      // Test 3: Verificar conectividad con PayPal
      results.connectivity = {
        name: 'Conectividad PayPal',
        status: 'testing',
        message: 'Verificando conectividad...'
      };

      try {
        const response = await fetch(`https://api-m.${PAYPAL_CONFIG.environment}.paypal.com/v1/oauth2/token`, {
          method: 'HEAD'
        });
        
        results.connectivity = {
          name: 'Conectividad PayPal',
          status: 'success',
          message: 'Conexión exitosa con PayPal API'
        };
      } catch (error) {
        results.connectivity = {
          name: 'Conectividad PayPal',
          status: 'warning',
          message: 'No se pudo verificar conectividad (normal en algunos navegadores)'
        };
      }

    } catch (error) {
      results.general = {
        name: 'Error general',
        status: 'error',
        message: `Error en las pruebas: ${error}`
      };
    }

    setTestResults(results);
    setIsTestingConnection(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado",
        description: "Contenido copiado al portapapeles",
      });
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'testing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'testing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const maskValue = (value: string, show: boolean) => {
    if (!show && value && value.length > 20) {
      return value.substring(0, 10) + '...' + value.substring(value.length - 5);
    }
    return value;
  };

  useEffect(() => {
    // Auto-ejecutar pruebas al cargar
    testPayPalConnection();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Diagnóstico Completo de PayPal</h1>
          <p className="text-muted-foreground mb-4">
            Diagnóstico detallado del estado de PayPal y resolución del error RESOURCE_NOT_FOUND
          </p>
          
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSensitive(!showSensitive)}
              className="flex items-center gap-2"
            >
              {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSensitive ? 'Ocultar valores' : 'Mostrar valores completos'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={testPayPalConnection}
              disabled={isTestingConnection}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isTestingConnection ? 'animate-spin' : ''}`} />
              Ejecutar pruebas
            </Button>
          </div>
        </div>

        {/* Error principal */}
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error RESOURCE_NOT_FOUND:</strong> Los Plan IDs configurados no existen en tu cuenta de PayPal.
            Los IDs actuales son solo ejemplos y necesitan ser reemplazados con IDs reales de tu PayPal Developer Console.
          </AlertDescription>
        </Alert>

        {/* Configuración actual */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuración de PayPal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(diagnostics).map(([key, diagnostic]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(diagnostic.status)}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{diagnostic.name}</p>
                      <p className="text-sm text-muted-foreground">{diagnostic.description}</p>
                      <div className="text-sm font-mono bg-gray-100 p-2 rounded mt-2 break-all">
                        {maskValue(diagnostic.value || 'No configurado', showSensitive)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(diagnostic.status)}>
                      {diagnostic.status === 'success' ? 'OK' : 
                       diagnostic.status === 'warning' ? 'Atención' : 'Error'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(diagnostic.value || '')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resultados de pruebas */}
        {Object.keys(testResults).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Resultados de Pruebas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(testResults).map(([key, result]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.name}</p>
                        <p className="text-sm text-muted-foreground">{result.message}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Solución alternativa */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Solución Alternativa - Checkout Directo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Mientras configuras los Plan IDs reales, puedes probar este método alternativo que abre PayPal en una nueva página:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Plan Básico - $9.99</h4>
                <PayPalCheckoutButton
                  plan="basic"
                  amount={9.99}
                  onSuccess={() => {
                    toast({
                      title: "¡Éxito!",
                      description: "Checkout de PayPal iniciado"
                    });
                  }}
                  className="w-full"
                />
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Plan Estándar - $14.99</h4>
                <PayPalCheckoutButton
                  plan="standard"
                  amount={14.99}
                  onSuccess={() => {
                    toast({
                      title: "¡Éxito!",
                      description: "Checkout de PayPal iniciado"
                    });
                  }}
                  className="w-full"
                />
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Plan Premium - $19.99</h4>
                <PayPalCheckoutButton
                  plan="premium"
                  amount={19.99}
                  onSuccess={() => {
                    toast({
                      title: "¡Éxito!",
                      description: "Checkout de PayPal iniciado"
                    });
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pasos para solucionar */}
        <Card>
          <CardHeader>
            <CardTitle>Pasos para Solucionar el Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-semibold">Ir a PayPal Developer Console</p>
                  <p className="text-sm text-muted-foreground">
                    <a href="https://developer.paypal.com/" target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline flex items-center gap-1">
                      https://developer.paypal.com/ <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-semibold">Crear Productos y Planes</p>
                  <p className="text-sm text-muted-foreground">
                    En la sección "Products & Plans", crear 3 productos para los planes básico, estándar y premium
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-semibold">Copiar Plan IDs</p>
                  <p className="text-sm text-muted-foreground">
                    Copiar los Plan IDs generados y reemplazar los valores en <code>src/utils/paypal-config.ts</code>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <p className="font-semibold">Verificar Client ID</p>
                  <p className="text-sm text-muted-foreground">
                    Asegurar que el Client ID en las variables de entorno sea el correcto de tu aplicación
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
