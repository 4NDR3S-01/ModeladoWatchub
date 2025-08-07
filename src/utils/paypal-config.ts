// Configuración de PayPal para el cliente
export const PAYPAL_CONFIG = {
  // Client ID de PayPal (público, no es secreto)
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AYGMJsJkhMRlCT3EYdAP5qW3iBGABONE8oFdxQ2IXVF4mVR5Uy9jOD3K4kxQ', // Sandbox ID por defecto
  
  // Configuración del entorno
  currency: 'USD',
  intent: 'subscription',
  
  // URLs de la aplicación
  returnUrl: `${window.location.origin}/payment-success`,
  cancelUrl: `${window.location.origin}/subscriptions`,
  
  // Planes de suscripción (estos deben existir en tu cuenta de PayPal)
  // IMPORTANTE: Estos son IDs de ejemplo - DEBES crear planes reales en PayPal Developer Console
  // y reemplazar estos IDs con los IDs reales de tus planes
  plans: {
    // Para testing, usaremos un Client ID de sandbox público que funciona para demos
    // En producción, DEBES reemplazar estos con tus propios Plan IDs
    basic: 'P-5ML4271244454362WXNWU5NQ', // Plan básico - REEMPLAZAR
    standard: 'P-1GJ4481691914362CXNWU5NQ', // Plan estándar - REEMPLAZAR  
    premium: 'P-94458432VR012762TXNWU5NQ' // Plan premium - REEMPLAZAR
  },
  
  // Configuración de ambiente
  environment: import.meta.env.VITE_PAYPAL_ENVIRONMENT || 'sandbox' // 'sandbox' o 'production'
};

// Debug: Imprimir configuración en desarrollo
if (import.meta.env.DEV) {
  console.log('🔧 PayPal Configuration Debug:');
  console.log('Client ID:', PAYPAL_CONFIG.clientId ? `${PAYPAL_CONFIG.clientId.substring(0, 10)}...` : 'NOT SET');
  console.log('Environment:', PAYPAL_CONFIG.environment);
  console.log('Available env vars:', {
    VITE_PAYPAL_CLIENT_ID: import.meta.env.VITE_PAYPAL_CLIENT_ID ? 'SET' : 'NOT SET',
    VITE_PAYPAL_ENVIRONMENT: import.meta.env.VITE_PAYPAL_ENVIRONMENT || 'NOT SET'
  });
}

// Mapeo de planes locales a planes de PayPal
export const mapPlanToPayPal = (plan: string): string => {
  const planLower = plan.toLowerCase();
  
  switch (planLower) {
    case 'basic':
      return PAYPAL_CONFIG.plans.basic;
    case 'standard':
      return PAYPAL_CONFIG.plans.standard;
    case 'premium':
      return PAYPAL_CONFIG.plans.premium;
    default:
      throw new Error(`Plan no válido: ${plan}`);
  }
};

// Configuración para PayPalScriptProvider
export const paypalScriptOptions = {
  clientId: PAYPAL_CONFIG.clientId,
  currency: PAYPAL_CONFIG.currency,
  intent: 'subscription',
  vault: true,
  components: 'buttons',
  // Configuración adicional para suscripciones
  'enable-funding': 'venmo,paylater',
  'disable-funding': 'credit,card'
};

// Función para obtener precios por plan (para mostrar en la UI)
export const getPlanPrice = (plan: string): number => {
  const planLower = plan.toLowerCase();
  
  switch (planLower) {
    case 'basic':
      return 9.99;
    case 'standard':
      return 14.99;
    case 'premium':
      return 19.99;
    default:
      return 19.99;
  }
};