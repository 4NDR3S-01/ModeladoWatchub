# Integración de PayPal en WatchHub

## Resumen
Esta documentación describe la implementación completa de PayPal como método de pago alternativo en WatchHub, permitiendo a los usuarios suscribirse usando PayPal además de tarjetas de crédito.

## Arquitectura de la Implementación

### 1. Frontend Components

#### PayPalButton Component
- **Ubicación**: `src/components/PayPalButton.tsx`
- **Propósito**: Botón reutilizable para pagos de PayPal
- **Características**:
  - Manejo de suscripciones de PayPal
  - UI consistente con el diseño de la aplicación
  - Estados de carga y error
  - Ventana emergente para checkout de PayPal

#### Páginas Actualizadas
- **Subscriptions**: Selector de método de pago (Stripe/PayPal)
- **PaymentSuccess**: Verificación automática de pagos de PayPal
- **PaymentSettings**: Gestión de suscripciones de PayPal

### 2. Backend Functions (Supabase Edge Functions)

#### create-paypal-subscription
- **Propósito**: Crear suscripciones recurrentes en PayPal
- **Endpoint**: `POST /create-paypal-subscription`
- **Funcionalidad**:
  - Autenticación con PayPal API
  - Creación de suscripción basada en plan
  - Almacenamiento en base de datos
  - URLs de retorno configurables

#### create-paypal-payment
- **Propósito**: Crear pagos únicos en PayPal
- **Endpoint**: `POST /create-paypal-payment`
- **Funcionalidad**:
  - Pagos únicos (no recurrentes)
  - Integración con órdenes de PayPal

#### verify-paypal-payment
- **Propósito**: Verificar estado de pagos y suscripciones
- **Endpoint**: `POST /verify-paypal-payment`
- **Funcionalidad**:
  - Verificación de pagos únicos
  - Verificación de suscripciones
  - Actualización de estado en base de datos
  - Notificaciones a usuarios

#### paypal-cancel-subscription
- **Propósito**: Cancelar suscripciones activas
- **Endpoint**: `POST /paypal-cancel-subscription`
- **Funcionalidad**:
  - Cancelación en PayPal API
  - Actualización de estado local
  - Notificaciones de cancelación

#### paypal-check-subscription
- **Propósito**: Verificar estado actual de suscripciones
- **Endpoint**: `GET /paypal-check-subscription`
- **Funcionalidad**:
  - Consulta de suscripciones activas
  - Sincronización con PayPal API
  - Reporte de estado consolidado

### 3. Hooks y Estado

#### usePayPal Hook
- **Ubicación**: `src/hooks/usePayPal.ts`
- **Funcionalidades**:
  - `createPayPalPayment()`: Pagos únicos
  - `createPayPalSubscription()`: Suscripciones recurrentes
  - `verifyPayPalPayment()`: Verificación de pagos
  - `cancelPayPalSubscription()`: Cancelación de suscripciones
  - `checkPayPalSubscription()`: Estado de suscripciones

#### SubscriptionContext Actualizado
- **Nuevas propiedades**:
  - `subscriptionProvider`: 'stripe' | 'paypal' | null
  - `checkPayPalSubscription()`: Verificación de PayPal
- **Funcionalidad**:
  - Detección automática del proveedor activo
  - Unificación de estado de suscripción

## Flujo de Usuario

### 1. Selección de Plan con PayPal
```
Usuario selecciona plan → Elige PayPal como método → Clic en botón PayPal → 
Redirección a PayPal → Completar pago → Retorno a aplicación → 
Verificación automática → Activación de suscripción
```

### 2. Gestión de Suscripción
```
Usuario en configuración → Pestaña PayPal → Ver suscripciones activas → 
Opción de cancelar → Confirmación → Actualización de estado
```

## Configuración Requerida

### Variables de Entorno
```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox  # o 'live' para producción
```

### Configuración de PayPal Developer

1. **Crear Aplicación PayPal**:
   - Visitar: https://developer.paypal.com/
   - Crear nueva aplicación
   - Configurar webhooks (opcional para notificaciones automáticas)

2. **Planes de Suscripción**:
   - Los planes deben existir en PayPal con IDs específicos:
     - `WATCHHUB_BASIC_MONTHLY`
     - `WATCHHUB_STANDARD_MONTHLY`
     - `WATCHHUB_PREMIUM_MONTHLY`

3. **URLs de Retorno**:
   - Success: `{origin}/payment-success?provider=paypal&type=subscription`
   - Cancel: `{origin}/payment-canceled`

## Base de Datos

### Tabla: paypal_subscriptions
```sql
CREATE TABLE paypal_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  paypal_subscription_id VARCHAR(255) UNIQUE,
  plan_name VARCHAR(100),
  amount DECIMAL(10,2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: paypal_payments
```sql
CREATE TABLE paypal_payments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  paypal_order_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Seguridad

### 1. Autenticación
- Todas las Edge Functions verifican JWT de Supabase
- Validación de usuario en cada operación
- Tokens de PayPal gestionados server-side

### 2. Validación
- Verificación de pagos con PayPal API
- Sincronización periódica de estados
- Manejo de errores y reintentos

### 3. Datos Sensibles
- Credenciales de PayPal solo en server
- No almacenamiento de datos de pago sensibles
- Logging seguro sin credenciales

## Testing

### Modo Sandbox
- Usar credenciales de sandbox para desarrollo
- PayPal proporciona cuentas de prueba
- URLs de API sandbox: `api-m.sandbox.paypal.com`

### Cuentas de Prueba
- Crear compradores de prueba en PayPal Developer
- Usar credenciales de sandbox específicas
- Probar flujos completos de pago

## Monitoreo y Logging

### Logs de Edge Functions
- Cada función incluye logging detallado
- Información de debugging sin datos sensibles
- Rastreo de errores y estados

### Métricas Recomendadas
- Tasa de conversión PayPal vs Stripe
- Errores de pago por método
- Cancelaciones por proveedor
- Tiempos de respuesta de API

## Mejoras Futuras

### 1. Webhooks de PayPal
- Notificaciones automáticas de cambios de estado
- Reducción de polling manual
- Mejor sincronización en tiempo real

### 2. Gestión Avanzada
- Cambio de planes dentro de PayPal
- Promociones y descuentos
- Facturación detallada

### 3. Analytics
- Dashboard de métricas de PayPal
- Comparación de métodos de pago
- Análisis de retención por proveedor

## Solución de Problemas

### Errores Comunes
1. **Credenciales inválidas**: Verificar PAYPAL_CLIENT_ID y SECRET
2. **Planes no encontrados**: Crear planes en PayPal Developer Console
3. **Webhooks fallando**: Verificar URLs y certificados SSL
4. **Estados inconsistentes**: Ejecutar sincronización manual

### Debugging
- Revisar logs de Edge Functions en Supabase
- Usar PayPal Developer Dashboard para rastrear transacciones
- Verificar estado de base de datos vs PayPal API

## Conclusión

La integración de PayPal proporciona a WatchHub una alternativa de pago robusta que complementa Stripe, ofreciendo más opciones a los usuarios y potencialmente aumentando las conversiones. La implementación mantiene la seguridad y consistencia con el resto del sistema mientras proporciona una experiencia de usuario fluida.
