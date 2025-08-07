import { supabase } from '@/integrations/supabase/client';

export const testPayPalCredentials = async () => {
  try {
    console.log('🧪 Testing PayPal credentials...');
    
    const { data, error } = await supabase.functions.invoke('create-paypal-subscription', {
      body: { plan: 'basic' },
      headers: {
        Authorization: `Bearer test-user-id`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📋 PayPal test response:', { data, error });
    
    if (error) {
      console.error('❌ PayPal test failed:', error);
      return false;
    }
    
    console.log('✅ PayPal credentials working!');
    return true;
  } catch (error) {
    console.error('💥 PayPal test error:', error);
    return false;
  }
};

// Exportar para uso en desarrollo
if (typeof window !== 'undefined') {
  (window as any).testPayPalCredentials = testPayPalCredentials;
}
