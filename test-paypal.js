import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://amypgzmmlukvgzukihea.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteXBnem1tbHVrdmd6dWtpaGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjE5MDY3ODQsImV4cCI6MjAzNzQ4Mjc4NH0.U5vXJNAFp7qMhDc6Vqz8PkcNcJzCGTt-eUpJDBW1PKQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPayPalIntegration() {
  console.log('🔄 Probando integración de PayPal...\n');
  
  try {
    // 1. Probar función de creación de pago
    console.log('1. Probando crear pago PayPal...');
    const { data: createResponse, error: createError } = await supabase.functions.invoke('create-paypal-payment', {
      body: {
        amount: 9.99,
        currency: 'USD'
      },
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    if (createError) {
      console.error('❌ Error al crear pago:', createError);
    } else {
      console.log('✅ Pago creado exitosamente:', createResponse);
    }

    // 2. Probar función de verificación (simulando un pago completado)
    console.log('\n2. Probando verificar pago PayPal...');
    const { data: verifyResponse, error: verifyError } = await supabase.functions.invoke('verify-paypal-payment', {
      body: {
        orderID: 'test-order-123'
      },
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    if (verifyError) {
      console.error('❌ Error al verificar pago:', verifyError);
    } else {
      console.log('✅ Verificación exitosa:', verifyResponse);
    }

    // 3. Probar función de suscripción
    console.log('\n3. Probando crear suscripción PayPal...');
    const { data: subscriptionResponse, error: subscriptionError } = await supabase.functions.invoke('create-paypal-subscription', {
      body: {
        planName: 'premium',
        amount: 9.99
      },
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    if (subscriptionError) {
      console.error('❌ Error al crear suscripción:', subscriptionError);
    } else {
      console.log('✅ Suscripción creada exitosamente:', subscriptionResponse);
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar pruebas
testPayPalIntegration();
