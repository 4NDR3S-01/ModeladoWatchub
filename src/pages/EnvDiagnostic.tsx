import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function EnvDiagnostic() {
  const [showSensitive, setShowSensitive] = useState(false);

  // Variables de entorno que deberían estar disponibles
  const envVars = {
    // PayPal Variables
    VITE_PAYPAL_CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID,
    VITE_PAYPAL_ENVIRONMENT: import.meta.env.VITE_PAYPAL_ENVIRONMENT,
    
    // Supabase Variables
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    
    // Stripe Variables
    VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    
    // App Variables
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
    
    // External APIs
    TMDB_API_KEY: import.meta.env.TMDB_API_KEY,
    OMDB_API_KEY: import.meta.env.OMDB_API_KEY,
    
    // Debug Variables
    VITE_DEBUG: import.meta.env.VITE_DEBUG,
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE,
  };

  const getStatus = (value: string | undefined) => {
    if (!value) return 'missing';
    if (value.includes('your-') || value.includes('...') || value.includes('EXAMPLE')) return 'placeholder';
    return 'configured';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'configured':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'placeholder':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'configured':
        return 'bg-green-100 text-green-800';
      case 'placeholder':
        return 'bg-yellow-100 text-yellow-800';
      case 'missing':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const maskValue = (value: string | undefined, show: boolean) => {
    if (!value) return 'No definida';
    if (!show && value.length > 20) {
      return value.substring(0, 10) + '...' + value.substring(value.length - 5);
    }
    return value;
  };

  const criticalVars = ['VITE_PAYPAL_CLIENT_ID', 'VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const paypalVars = ['VITE_PAYPAL_CLIENT_ID', 'VITE_PAYPAL_ENVIRONMENT'];

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Diagnóstico de Variables de Entorno</h1>
          <p className="text-muted-foreground mb-4">
            Esta página muestra el estado de las variables de entorno necesarias para el funcionamiento de la aplicación.
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
          </div>
        </div>

        {/* Resumen general */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Variables Críticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {criticalVars.filter(key => getStatus(envVars[key as keyof typeof envVars]) === 'configured').length}/{criticalVars.length}
              </div>
              <p className="text-xs text-muted-foreground">Configuradas correctamente</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">PayPal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {paypalVars.filter(key => getStatus(envVars[key as keyof typeof envVars]) === 'configured').length}/{paypalVars.length}
              </div>
              <p className="text-xs text-muted-foreground">Variables PayPal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(envVars).filter(value => getStatus(value) === 'configured').length}/{Object.keys(envVars).length}
              </div>
              <p className="text-xs text-muted-foreground">Todas las variables</p>
            </CardContent>
          </Card>
        </div>

        {/* Configuración PayPal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔵 Configuración PayPal</span>
              <Badge className={getStatusColor(
                paypalVars.every(key => getStatus(envVars[key as keyof typeof envVars]) === 'configured') 
                  ? 'configured' : 'placeholder'
              )}>
                {paypalVars.every(key => getStatus(envVars[key as keyof typeof envVars]) === 'configured') 
                  ? 'Configurado' : 'Requiere atención'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paypalVars.map((key) => {
                const value = envVars[key as keyof typeof envVars];
                const status = getStatus(value);
                
                return (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      <div>
                        <p className="font-medium">{key}</p>
                        <p className="text-sm text-muted-foreground">
                          {maskValue(value, showSensitive)}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(status)}>
                      {status === 'configured' ? 'OK' : status === 'placeholder' ? 'Placeholder' : 'Faltante'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Todas las variables */}
        <Card>
          <CardHeader>
            <CardTitle>Todas las Variables de Entorno</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(envVars).map(([key, value]) => {
                const status = getStatus(value);
                
                return (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status)}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{key}</p>
                        <p className="text-sm text-muted-foreground break-all">
                          {maskValue(value, showSensitive)}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(status)}>
                      {status === 'configured' ? 'OK' : status === 'placeholder' ? 'Placeholder' : 'Faltante'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Estado de PayPal</h3>
          <div className="text-sm space-y-2">
            <p><strong>Client ID:</strong> {envVars.VITE_PAYPAL_CLIENT_ID ? '✅ Configurado' : '❌ Faltante'}</p>
            <p><strong>Environment:</strong> {envVars.VITE_PAYPAL_ENVIRONMENT || 'sandbox (por defecto)'}</p>
            <p><strong>Configuración actual:</strong> El Client ID está usando un valor de sandbox para testing</p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Para corregir el error de PayPal</h3>
          <div className="text-sm space-y-2">
            <p><strong>1.</strong> Ve a PayPal Developer Console: https://developer.paypal.com/</p>
            <p><strong>2.</strong> Crea planes de suscripción reales</p>
            <p><strong>3.</strong> Copia los Plan IDs y actualiza <code>src/utils/paypal-config.ts</code></p>
            <p><strong>4.</strong> Los Plan IDs actuales son solo de ejemplo y no funcionan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
