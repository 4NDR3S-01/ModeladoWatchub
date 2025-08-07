# Configuración de PayPal para WatchHub

## 🚀 Estado Actual

✅ **Edge Functions desplegadas:**
- `create-paypal-payment` - Crear pagos únicos
- `create-paypal-subscription` - Crear suscripciones recurrentes  
- `verify-paypal-payment` - Verificar estado de pagos
- `paypal-cancel-subscription` - Cancelar suscripciones
- `paypal-check-subscription` - Verificar estado de suscripciones

✅ **Variables de entorno configuradas en Supabase:**
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

✅ **Frontend implementado:**
- Componente `PayPalButton`
- Integración en página de suscripciones
- Hook `usePayPal` para operaciones
- Verificación automática de pagos

## ⚙️ Configuración Pendiente

### 1. Cuenta de Desarrollador PayPal

1. **Crear cuenta**: Ve a https://developer.paypal.com/
2. **Crear aplicación**: 
   - Nombre: "WatchHub Subscriptions"
   - Tipo: "Merchant"
   - Características: ✅ Subscriptions

### 2. Configurar Planes de Suscripción

Necesitas crear estos planes en PayPal Developer Console:

```json
{
  "plans": [
    {
      "id": "WATCHHUB_BASIC_MONTHLY",
      "name": "Plan Básico WatchHub",
      "description": "Suscripción mensual básica",
      "amount": "9.99",
      "currency": "USD"
    },
    {
      "id": "WATCHHUB_STANDARD_MONTHLY", 
      "name": "Plan Estándar WatchHub",
      "description": "Suscripción mensual estándar",
      "amount": "14.99",
      "currency": "USD"
    },
    {
      "id": "WATCHHUB_PREMIUM_MONTHLY",
      "name": "Plan Premium WatchHub", 
      "description": "Suscripción mensual premium",
      "amount": "19.99",
      "currency": "USD"
    }
  ]
}
```

### 3. Actualizar Variables de Entorno

```bash
# Obtener de PayPal Developer Console
PAYPAL_CLIENT_ID=tu_client_id_real
PAYPAL_CLIENT_SECRET=tu_client_secret_real

# Para testing
PAYPAL_MODE=sandbox

# Para producción  
PAYPAL_MODE=live
```

### 4. Crear Tablas de Base de Datos

```sql
-- Tabla para suscripciones de PayPal
CREATE TABLE paypal_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  paypal_subscription_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para pagos únicos de PayPal
CREATE TABLE paypal_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  paypal_order_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🧪 Pruebas

### Cuentas de Prueba PayPal

1. **Merchant (tu cuenta)**: Para recibir pagos
2. **Personal (cliente)**: Para hacer pagos

Crear en: https://developer.paypal.com/tools/sandbox/accounts/

### URLs de Testing

- **Sandbox API**: `https://api-m.sandbox.paypal.com`
- **Sandbox Checkout**: `https://www.sandbox.paypal.com`

## 🐛 Resolución de Errores Comunes

### Error: "PayPal credentials not configured"
- ✅ Verificar variables de entorno en Supabase
- ✅ Confirmar que las credenciales son correctas

### Error: "Invalid plan selected"  
- ✅ Crear planes en PayPal Developer Console
- ✅ Verificar IDs de planes en el código

### Error: "Failed to get PayPal access token"
- ✅ Verificar Client ID y Client Secret
- ✅ Confirmar que la aplicación está activa

### Error: "Authentication error"
- ✅ Verificar token de usuario en headers
- ✅ Confirmar que el usuario está autenticado

## 📞 Soporte

Si tienes problemas:

1. **Logs de Edge Functions**: Ver en Dashboard de Supabase
2. **PayPal Developer**: https://developer.paypal.com/support
3. **Documentación**: https://developer.paypal.com/docs/

## 🎯 Próximos Pasos

1. ✅ Crear cuenta PayPal Developer
2. ✅ Configurar credenciales reales
3. ✅ Crear planes de suscripción
4. ✅ Probar flujo completo en sandbox
5. ✅ Configurar webhooks (opcional)
6. ✅ Migrar a producción

---

**¡La implementación de PayPal está lista para usar!** 🎉
