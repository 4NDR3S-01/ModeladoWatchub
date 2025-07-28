# WatchHub - Streaming Platform

WatchHub es una plataforma de streaming completa construida con React, TypeScript, Vite, Tailwind CSS y Supabase.

## 🚀 Características

### Frontend
- ⚡ Vite + React + TypeScript
- 🎨 Tailwind CSS + shadcn/ui
- 📱 Diseño responsivo
- 🔐 Autenticación de usuarios
- 💳 Integración de pagos (Stripe + PayPal)
- 🎬 Reproductor de video avanzado
- 📊 Panel de administración

### Backend (Supabase Edge Functions)
- 🔒 Autenticación y autorización
- 💰 Procesamiento de pagos
- 📹 Gestión de contenido
- 👥 Gestión de usuarios
- 🎯 Sistema de recomendaciones
- 📈 Analytics y reportes

## 🛠️ Instalación

### Prerequisitos
- Node.js 18+
- Supabase CLI
- Cuenta de Supabase
- Cuentas de Stripe y/o PayPal (para pagos)

### Configuración Rápida

1. **Clonar el repositorio**
```bash
git clone <your-repo>
cd modeladoconjunto
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar entorno**
```bash
npm run setup
```
Este comando te guiará por la configuración interactiva de todas las variables de entorno.

4. **Verificar configuración**
```bash
npm run check-env
```

5. **Configurar secretos en Supabase**
```bash
npm run set-secrets
```

6. **Iniciar servicios**
```bash
# Iniciar Supabase local
npm run supabase:start

# Servir Edge Functions localmente
npm run supabase:functions:serve

# Iniciar aplicación frontend
npm run dev
```

## 📁 Estructura del Proyecto

```
├── src/
│   ├── components/          # Componentes UI y layout
│   ├── contexts/           # Context providers (Auth, Subscription)
│   ├── hooks/              # Custom hooks
│   ├── pages/              # Páginas de la aplicación
│   └── lib/                # Utilidades
├── supabase/
│   ├── functions/          # Edge Functions
│   └── migrations/         # Migraciones de base de datos
├── scripts/                # Scripts de configuración
└── public/                 # Assets estáticos
```

## 🔧 Edge Functions Disponibles

### Autenticación y Usuarios
- `user-profile-management`: Gestión de perfiles y preferencias
- `admin-user-management`: Administración de usuarios (admin)

### Pagos y Suscripciones
- `check-subscription`: Verificación de estado de suscripción
- `create-checkout`: Creación de sesiones de pago
- `verify-payment`: Verificación de pagos completados

### Contenido
- `content-search`: Búsqueda y filtrado de contenido
- `watchlist-management`: Gestión de listas de reproducción
- `continue-watching`: Progreso de visualización
- `reviews-management`: Sistema de reseñas y calificaciones
- `video-access-control`: Control de acceso a videos
- `generate-recommendations`: Sistema de recomendaciones

### Administración
- `admin-manage-content`: Gestión de contenido (admin)
- `admin-approve-content`: Aprobación de contenido
- `process-video-upload`: Procesamiento de uploads

## 🎬 Características de la Plataforma

### Para Usuarios
- **Registro y autenticación**: Sistema completo de usuarios
- **Suscripciones**: Planes Basic ($9.99), Standard ($14.99), Premium ($19.99)
- **Biblioteca de contenido**: Películas y series organizadas por categorías
- **Búsqueda avanzada**: Filtros por género, calificación, año, etc.
- **Listas personalizadas**: Watchlist y continuar viendo
- **Recomendaciones**: Sistema inteligente basado en preferencias
- **Reseñas**: Sistema de calificaciones y comentarios
- **Control parental**: Restricciones por edad
- **Múltiples perfiles**: Hasta 4 perfiles por cuenta

### Para Administradores
- **Panel de control**: Dashboard con métricas y analytics
- **Gestión de contenido**: Upload, moderación y organización
- **Gestión de usuarios**: Administración de cuentas y suscripciones
- **Analytics**: Reportes de uso y engagement
- **Moderación**: Sistema de aprobación de contenido

## 💳 Integración de Pagos

### Stripe
- Checkout sessions seguras
- Webhooks para verificación
- Gestión de suscripciones
- Portal del cliente

### PayPal
- Pagos únicos y suscripciones
- Verificación de pagos
- Integración con PayPal API

## 🔐 Autenticación y Seguridad

- **Supabase Auth**: Sistema robusto de autenticación
- **RLS (Row Level Security)**: Seguridad a nivel de fila
- **JWT Tokens**: Autenticación segura
- **CORS**: Configurado para dominios autorizados
- **Roles**: Sistema de permisos (user, admin, moderator)

## 📊 Base de Datos

### Tablas Principales
- `profiles`: Perfiles de usuario
- `content`: Catálogo de películas y series
- `subscriptions`: Suscripciones activas
- `watchlist`: Listas de reproducción
- `watching_history`: Historial de visualización
- `reviews`: Reseñas y calificaciones
- `content_access_logs`: Logs de acceso

## 🚀 Despliegue

### Frontend (Vercel/Netlify)
```bash
npm run build
```

### Edge Functions (Supabase)
```bash
npm run deploy
```

### Variables de Entorno Requeridas
```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=

# Aplicación
VITE_APP_URL=
NEXT_PUBLIC_APP_URL=
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev                    # Iniciar aplicación
npm run build                  # Construir para producción
npm run preview               # Vista previa de producción

# Configuración
npm run setup                 # Configuración interactiva
npm run check-env            # Verificar configuración
npm run set-secrets          # Configurar secretos Supabase

# Supabase
npm run supabase:start       # Iniciar Supabase local
npm run supabase:stop        # Detener Supabase local
npm run supabase:status      # Estado de servicios
npm run supabase:functions:serve  # Servir functions localmente
npm run supabase:functions:deploy # Desplegar functions

# Despliegue
npm run deploy               # Despliegue completo
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request
