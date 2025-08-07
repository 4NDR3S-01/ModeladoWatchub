# PayPal Integration sin Edge Functions

## Resumen

Esta documentación describe la implementación de PayPal como método de pago para WatchHub sin usar Supabase Edge Functions. La implementación se basa completamente en el SDK oficial de PayPal para React (`@paypal/react-paypal-js`) y funciona del lado del cliente.

## Características Principales

- ✅ **Sin dependencia de Edge Functions**: Toda la lógica se ejecuta en el cliente
- ✅ **SDK Oficial de PayPal**: Usa `@paypal/react-paypal-js` para integración segura
- ✅ **Suscripciones Recurrentes**: Soporte completo para suscripciones mensuales
- ✅ **Interfaz Unificada**: Botón de PayPal integrado con el diseño de la app
- ✅ **Gestión de Estado**: Almacenamiento local de suscripciones en Supabase
- ✅ **Manejo de Errores**: Gestión robusta de errores y estados de carga

## Arquitectura

### Componentes Principales

1. **PayPalButton.tsx**: Componente del botón de pago con PayPal
2. **usePayPal.ts**: Hook para gestión de suscripciones de PayPal
3. **paypal-config.ts**: Configuración y constantes de PayPal
4. **SubscriptionContext.tsx**: Contexto unificado de suscripciones

### Flujo de Pago

```
Usuario selecciona plan → Clic en botón PayPal → 
SDK de PayPal → Redirección a PayPal → 
Usuario completa pago → Callback de aprobación → 
Guardado en base de datos → Activación de suscripción
```

## Configuración Requerida

### 1. Variables de Entorno

Agregar a tu archivo `.env`:

```bash
# PayPal Client ID (público - puede estar en frontend)
VITE_PAYPAL_CLIENT_ID=tu-client-id-de-paypal

# Ambiente PayPal: 'sandbox' para desarrollo, 'live' para producción
VITE_PAYPAL_ENVIRONMENT=sandbox
```

### 2. Configuración en PayPal Developer

#### Crear Aplicación PayPal:
1. Ir a https://developer.paypal.com/
2. Crear nueva aplicación
3. Obtener Client ID
4. Configurar webhooks (opcional)

#### Crear Planes de Suscripción:
Debes crear planes en tu cuenta de PayPal Developer con estos nombres:
- **Plan Básico**: $9.99/mes
- **Plan Estándar**: $14.99/mes  
- **Plan Premium**: $19.99/mes

Después, actualizar los IDs en `src/utils/paypal-config.ts`:

```typescript
plans: {
  basic: 'P-TU-PLAN-BASICO-ID',
  standard: 'P-TU-PLAN-ESTANDAR-ID', 
  premium: 'P-TU-PLAN-PREMIUM-ID'
}
```

### 3. Base de Datos

Ejecutar la migración SQL incluida:

```bash
# La migración está en: supabase/migrations/20240806_create_paypal_tables.sql
# Ejecutar en tu proyecto de Supabase
```

Esta migración crea:
- Tabla `paypal_subscriptions`
- Tabla `paypal_payments` (opcional)
- Políticas RLS
- Índices para rendimiento
- Triggers para timestamps

## Implementación

### Instalar Dependencias

```bash
npm install @paypal/react-paypal-js
```

### Uso del Componente PayPal

```tsx
import PayPalButton from '@/components/PayPalButton';

<PayPalButton
  plan="premium"
  amount={19.99}
  onSuccess={() => {
    // Manejar éxito
    toast({ title: "¡Suscripción exitosa!" });
  }}
  onError={(error) => {
    // Manejar error
    console.error('Error PayPal:', error);
  }}
/>
```

### Hook usePayPal

```tsx
import { usePayPal } from '@/hooks/usePayPal';

const { 
  loading,
  handleSubscriptionApproval,
  cancelPayPalSubscription,
  checkPayPalSubscription 
} = usePayPal();
```

## Funcionalidades

### 1. Crear Suscripción
- Usuario hace clic en botón PayPal
- SDK abre ventana de PayPal
- Usuario completa el pago
- Sistema guarda suscripción automáticamente

### 2. Verificar Suscripción
- Consulta la base de datos local
- Verifica estado de suscripción activa
- Actualiza contexto de suscripción

### 3. Cancelar Suscripción
- Marca suscripción como cancelada localmente
- Usuario debe cancelar también en PayPal
- Actualiza estado en la aplicación

## Páginas Actualizadas

### Subscriptions.tsx
- Selector de método de pago (Stripe/PayPal)
- Botones PayPal integrados para cada plan
- Interfaz unificada con tabs

### PaymentSuccess.tsx
- Verificación automática del pago
- Actualización del estado de suscripción
- Mensaje específico para pagos PayPal

### SubscriptionContext.tsx
- Detección automática del proveedor
- Estado unificado para Stripe y PayPal
- Funciones de verificación consolidadas

## Seguridad

### Cliente Side
- Solo se expone el Client ID (público)
- Client Secret nunca se incluye en frontend
- Validación de planes y precios

### Base de Datos
- Row Level Security (RLS) habilitado
- Políticas por usuario
- Validación de datos

### PayPal
- SDK oficial con validación automática
- Redirección segura a PayPal
- Callback verificado

## Testing

### Modo Sandbox
1. Usar credenciales de sandbox de PayPal
2. Crear cuentas de prueba en PayPal Developer
3. Probar flujo completo de suscripción

### Verificaciones
- [ ] Creación de suscripción
- [ ] Guardado en base de datos
- [ ] Actualización de contexto
- [ ] Página de éxito
- [ ] Cancelación local

## Ventajas de esta Implementación

### ✅ Pros
- **Simplicidad**: No requiere Edge Functions
- **Mantenimiento**: Menos código del lado del servidor
- **Rapidez**: Implementación más rápida
- **Costo**: Sin costo adicional de funciones serverless
- **SDK Oficial**: Usa herramientas oficiales de PayPal

### ⚠️ Limitaciones
- **Verificación**: No verifica pagos directamente con PayPal API
- **Webhooks**: No incluye notificaciones automáticas
- **Sincronización**: Depende de la base de datos local
- **Gestión**: Cancelaciones deben hacerse manualmente en PayPal

## Mejoras Futuras

### Webhooks (Opcional)
Si necesitas verificación en tiempo real:
1. Configurar webhook endpoint
2. Verificar firmas de PayPal
3. Actualizar estado automáticamente

### API de PayPal (Servidor)
Para verificación completa:
1. Implementar endpoint de verificación
2. Usar Client Secret del lado del servidor
3. Consultar directamente API de PayPal

### Portal de Gestión
Para cancelaciones automáticas:
1. Implementar cliente PayPal server-side
2. Crear endpoints de gestión
3. Permitir cancelación desde la app

## Solución de Problemas

### Error: "Plan no válido"
- Verificar IDs de planes en `paypal-config.ts`
- Asegurar que los planes existan en PayPal
- Verificar nombres de planes (case-sensitive)

### Error: "PayPal script failed to load"
- Verificar Client ID en variables de entorno
- Verificar conexión a internet
- Revisar console del navegador

### Suscripción no se guarda
- Verificar autenticación del usuario
- Revisar permisos de base de datos (RLS)
- Verificar estructura de tabla

### Estado no se actualiza
- Verificar función `refreshSubscription`
- Revisar contexto de suscripción
- Comprobar logs del navegador

## Conclusión

Esta implementación de PayPal sin Edge Functions proporciona una solución robusta y fácil de mantener para pagos recurrentes en WatchHub. Aunque tiene algunas limitaciones comparado con una implementación server-side completa, ofrece una excelente relación entre funcionalidad y simplicidad de implementación.
