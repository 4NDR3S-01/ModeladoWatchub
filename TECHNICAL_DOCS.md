# WatchHub - Documentación Técnica

## Arquitectura del Sistema

WatchHub utiliza una arquitectura moderna de aplicación web con las siguientes tecnologías:

### Frontend
- **React 18**: Librería de interfaz de usuario
- **TypeScript**: Tipado estático para JavaScript
- **Vite**: Build tool y dev server
- **Tailwind CSS**: Framework de CSS utility-first
- **shadcn/ui**: Componentes UI pre-construidos
- **Zustand**: Gestión de estado global
- **React Query**: Gestión de estado del servidor
- **React Router**: Navegación SPA

### Backend
- **Supabase**: BaaS (Backend as a Service)
- **PostgreSQL**: Base de datos relacional
- **Supabase Auth**: Autenticación y autorización
- **Edge Functions**: Funciones serverless (Deno)
- **Row Level Security**: Seguridad a nivel de base de datos

### Servicios Externos
- **Stripe**: Procesamiento de pagos y suscripciones
- **PayPal**: Métodos de pago alternativos
- **Supabase Storage**: Almacenamiento de archivos multimedia

## Flujo de Datos

### Autenticación
1. Usuario se registra/inicia sesión → Supabase Auth
2. Supabase genera JWT token
3. Token se incluye en headers de todas las requests
4. Edge Functions verifican token en cada request

### Gestión de Contenido
1. Admin sube video → `process-video-upload` Edge Function
2. Video se almacena en Supabase Storage
3. Metadata se guarda en tabla `content`
4. Estado inicial: `processing`
5. Después de procesar: `pending_review`
6. Admin aprueba → `admin-approve-content` → estado: `published`

### Control de Acceso
1. Usuario intenta ver contenido → `video-access-control`
2. Verifica suscripción activa
3. Verifica tier de suscripción vs tier requerido
4. Verifica controles parentales
5. Genera URL firmada con expiración
6. Registra acceso en `content_access_logs`

## Edge Functions Detalladas

### 1. check-subscription
**Propósito**: Verificar estado de suscripción del usuario

**Endpoint**: `GET /check-subscription`

**Headers**: 
- `Authorization: Bearer <jwt_token>`

**Respuesta**:
```json
{
  "hasActiveSubscription": true,
  "plan": "premium",
  "expiresAt": "2024-02-01T00:00:00Z",
  "customerId": "cus_stripe_id"
}
```

### 2. create-checkout
**Propósito**: Crear sesión de pago en Stripe

**Endpoint**: `POST /create-checkout`

**Body**:
```json
{
  "priceId": "price_premium_monthly",
  "successUrl": "https://app.com/success",
  "cancelUrl": "https://app.com/cancel"
}
```

**Respuesta**:
```json
{
  "sessionId": "cs_stripe_session_id",
  "url": "https://checkout.stripe.com/session/..."
}
```

### 3. content-search
**Propósito**: Búsqueda avanzada de contenido

**Endpoint**: `GET /content-search?query=action&genre=action&page=1&limit=20`

**Parámetros**:
- `query`: Término de búsqueda
- `genre`: Filtro por género
- `year`: Filtro por año
- `rating`: Calificación mínima
- `type`: movie/series
- `page`: Número de página
- `limit`: Elementos por página

### 4. generate-recommendations
**Propósito**: Generar recomendaciones personalizadas

**Algoritmo**:
1. Analizar historial de visualización
2. Extraer géneros preferidos
3. Calcular calificaciones promedio por género
4. Buscar usuarios similares (collaborative filtering)
5. Combinar factores: género, popularidad, calificación, novedad
6. Asignar puntuación y ordenar

### 5. admin-user-management
**Propósito**: Administración de usuarios (solo admins)

**Endpoints**:
- `GET /admin-user-management?action=list`: Lista usuarios
- `POST /admin-user-management?action=suspend`: Suspender usuario
- `POST /admin-user-management?action=reactivate`: Reactivar usuario
- `DELETE /admin-user-management?user_id=uuid`: Eliminar usuario

## Esquema de Base de Datos

### Tabla: profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR NOT NULL,
  full_name VARCHAR,
  display_name VARCHAR,
  avatar_url VARCHAR,
  date_of_birth DATE,
  role VARCHAR DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  subscription_tier VARCHAR DEFAULT 'free',
  parental_controls JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla: content
```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  video_url VARCHAR NOT NULL,
  thumbnail_url VARCHAR,
  duration INTEGER, -- en segundos
  genres TEXT[] DEFAULT '{}',
  year INTEGER,
  age_rating VARCHAR DEFAULT 'G',
  required_tier VARCHAR DEFAULT 'basic',
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'pending_review', 'published', 'archived')),
  average_rating DECIMAL(3,2) DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla: subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR,
  plan VARCHAR NOT NULL CHECK (plan IN ('basic', 'standard', 'premium')),
  status VARCHAR NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Configuración de Seguridad

### Row Level Security (RLS)

```sql
-- Perfiles: usuarios solo pueden ver/editar su propio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Contenido: solo contenido publicado es visible para usuarios
CREATE POLICY "Published content is viewable by all users" ON content
  FOR SELECT USING (status = 'published');

-- Suscripciones: usuarios solo pueden ver sus propias suscripciones
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
```

### Funciones de Base de Datos

```sql
-- Función para obtener estadísticas de reseñas
CREATE OR REPLACE FUNCTION get_review_stats(content_id UUID)
RETURNS TABLE (
  average_rating DECIMAL,
  total_reviews INTEGER,
  rating_distribution JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(AVG(rating), 0)::DECIMAL as average_rating,
    COUNT(*)::INTEGER as total_reviews,
    jsonb_build_object(
      '1', COUNT(*) FILTER (WHERE rating = 1),
      '2', COUNT(*) FILTER (WHERE rating = 2),
      '3', COUNT(*) FILTER (WHERE rating = 3),
      '4', COUNT(*) FILTER (WHERE rating = 4),
      '5', COUNT(*) FILTER (WHERE rating = 5)
    ) as rating_distribution
  FROM reviews 
  WHERE reviews.content_id = $1;
END;
$$ LANGUAGE plpgsql;
```

## Configuración de Desarrollo

### Variables de Entorno Locales
```env
# Supabase Local
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Test
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# PayPal Sandbox
PAYPAL_CLIENT_ID=sandbox_client_id
PAYPAL_CLIENT_SECRET=sandbox_client_secret
```

### Comandos de Desarrollo

```bash
# Iniciar Supabase local
supabase start

# Ver logs de Edge Functions
supabase functions serve --debug

# Aplicar migraciones
supabase db push

# Generar tipos TypeScript
supabase gen types typescript --local > src/types/database.types.ts

# Ejecutar tests
npm run test

# Construir para producción
npm run build
```

## Patrones de Código

### Manejo de Errores en Edge Functions
```typescript
try {
  // Lógica de la función
  const result = await someOperation()
  
  return new Response(
    JSON.stringify({ data: result }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    }
  )
} catch (error) {
  console.error('Function error:', error)
  
  return new Response(
    JSON.stringify({ 
      error: error.message || 'Internal server error',
      code: error.code || 'UNKNOWN_ERROR'
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: error.status || 500 
    }
  )
}
```

### Autenticación en Edge Functions
```typescript
const { data: { user }, error } = await supabaseClient.auth.getUser()

if (error || !user) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401, headers: corsHeaders }
  )
}

// Verificar rol si es necesario
const { data: profile } = await supabaseClient
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (profile?.role !== 'admin') {
  return new Response(
    JSON.stringify({ error: 'Admin access required' }),
    { status: 403, headers: corsHeaders }
  )
}
```

### Paginación Estándar
```typescript
const page = parseInt(url.searchParams.get('page') || '1')
const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
const offset = (page - 1) * limit

const { data, count, error } = await supabaseClient
  .from('table_name')
  .select('*', { count: 'exact' })
  .range(offset, offset + limit - 1)

return {
  data,
  pagination: {
    page,
    limit,
    total: count,
    total_pages: Math.ceil((count || 0) / limit)
  }
}
```

## Deployment

### Variables de Producción
```env
# Supabase Production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe Live
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal Live
PAYPAL_CLIENT_ID=live_client_id
PAYPAL_CLIENT_SECRET=live_client_secret
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Deploy Edge Functions
        run: |
          npm install -g supabase
          supabase functions deploy --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

## Monitoreo y Logs

### Logging en Edge Functions
```typescript
// Structured logging
console.log(JSON.stringify({
  level: 'info',
  function: 'check-subscription',
  userId: user.id,
  action: 'subscription_check',
  timestamp: new Date().toISOString(),
  metadata: { plan: subscription.plan }
}))

// Error logging
console.error(JSON.stringify({
  level: 'error',
  function: 'check-subscription',
  userId: user?.id,
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString()
}))
```

### Métricas de Performance
- Response time de Edge Functions
- Tasa de errores por función
- Uso de recursos (memoria, CPU)
- Throughput de requests
- Latencia de base de datos

### Alertas
- Fallos de autenticación elevados
- Errores de pago
- Caídas de Edge Functions
- Uso excesivo de storage
- Problemas de conectividad con servicios externos

## Troubleshooting

### Problemas Comunes

1. **CORS Errors**: Verificar configuración de corsHeaders en Edge Functions
2. **Auth Failures**: Validar JWT tokens y permisos RLS
3. **Slow Queries**: Revisar índices de base de datos
4. **Storage Issues**: Verificar permisos de buckets
5. **Payment Failures**: Validar webhooks y configuración de Stripe/PayPal

### Debug Tools
- Supabase Dashboard para logs y métricas
- Browser DevTools para frontend debugging
- Supabase CLI para desarrollo local
- Stripe Dashboard para debugging de pagos
