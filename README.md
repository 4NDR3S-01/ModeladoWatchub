# WatchHub - Plataforma de Streaming

## 📖 Descripción del Proyecto

WatchHub es una plataforma de streaming moderna construida con React y TypeScript que ofrece una experiencia completa de entretenimiento digital con funcionalidades avanzadas de seguridad, gestión de suscripciones y administración de contenido.

## 🚀 Funcionalidades Principales

### 🔐 Sistema de Autenticación y Seguridad
- **Autenticación completa** con Supabase Auth
- **Verificación en dos pasos (2FA)** con códigos TOTP y QR
- **Códigos de respaldo** para recuperación de cuenta
- **Gestión de sesiones** y dispositivos conectados
- **Perfiles de usuario** personalizables

### 💳 Sistema de Facturación Integral
- **Gestión de métodos de pago** por perfil
- **Múltiples tarjetas** con validación completa
- **Tarjeta predeterminada** configurable
- **Agregar y eliminar tarjetas** de forma segura
- **Validación de datos** de tarjeta en tiempo real

### 📺 Gestión de Suscripciones
- **Tres planes disponibles**: Básico ($9.99), Estándar ($14.99), Premium ($19.99)
- **Cambio de plan** en tiempo real
- **Cancelación de suscripción** con período de gracia
- **Reactivación** de suscripciones canceladas
- **Historial completo** de suscripciones por usuario
- **Fechas de inicio/fin** guardadas en base de datos

### 🎬 Catálogo de Contenido
- **Películas y series** organizadas por categorías
- **Sistema de búsqueda** avanzado
- **Lista personal** (Mi Lista) para cada usuario
- **Recomendaciones** personalizadas
- **Control parental** y modo infantil

### ⚙️ Panel de Configuración Avanzado
- **Configuración de perfil** con avatares
- **Preferencias de reproducción** (autoplay, subtítulos, calidad)
- **Gestión de notificaciones**
- **Configuración de privacidad** y seguridad
- **Administración de dispositivos** conectados
- **Configuración de idioma** y región

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** como bundler y servidor de desarrollo
- **Tailwind CSS** para estilos
- **shadcn/ui** para componentes de interfaz
- **Lucide React** para iconografía

### Backend y Base de Datos
- **Supabase** para autenticación y base de datos
- **Supabase Auth** con MFA (Multi-Factor Authentication)
- **PostgreSQL** como base de datos principal
- **Edge Functions** para lógica del servidor

### Herramientas de Desarrollo
- **TypeScript** para tipado estático
- **ESLint** para linting
- **PostCSS** para procesamiento de CSS
- **Vitest** para testing

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── layout/          # Componentes de layout (navbar, footer)
│   ├── ui/              # Componentes de UI (botones, inputs, etc.)
│   ├── PaymentMethodsDialog.tsx    # Gestión de métodos de pago
│   ├── SubscriptionDialog.tsx      # Gestión de suscripciones
│   └── TwoFactorDialog.tsx         # Configuración de 2FA
├── contexts/            # Contextos de React
│   ├── AuthContext.tsx  # Contexto de autenticación
│   └── SubscriptionContext.tsx     # Contexto de suscripciones
├── hooks/               # Custom hooks
│   ├── use2FA.ts        # Hook para autenticación 2FA
│   ├── usePaymentMethods.ts        # Hook para métodos de pago
│   ├── useSubscriptions.ts         # Hook para suscripciones
│   ├── useMovies.ts     # Hook para gestión de películas
│   └── useWatchlist.ts  # Hook para lista personal
├── pages/               # Páginas principales
│   ├── Settings.tsx     # Página de configuración
│   ├── Login.tsx        # Página de inicio de sesión
│   ├── Register.tsx     # Página de registro
│   └── Index.tsx        # Página principal
└── integrations/        # Integraciones externas
    └── supabase/        # Configuración de Supabase
```

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 18 o superior)
- npm o yarn
- Cuenta de Supabase

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/CarlosJChileS/ModeladoWatchub.git
cd ModeladoWatchub
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

4. **Configurar Supabase**
- Crear un proyecto en [Supabase](https://supabase.com)
- Copiar las credenciales al archivo `.env.local`
- Ejecutar las migraciones de base de datos

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

## 🎯 Funcionalidades Destacadas

### 🔒 Verificación en Dos Pasos
- Configuración paso a paso con códigos QR
- Verificación con aplicaciones como Google Authenticator
- Códigos de respaldo descargables
- Desactivación segura con verificación

### 💰 Sistema de Pagos
- Soporte para múltiples tarjetas por usuario
- Validación en tiempo real de datos de tarjeta
- Detección automática del tipo de tarjeta (Visa, MasterCard, etc.)
- Gestión de tarjeta predeterminada

### 📊 Gestión de Suscripciones
- Cambio inmediato entre planes
- Historial detallado de transacciones
- Cancelación con período de gracia
- Reactivación automática disponible

### 🎨 Interfaz de Usuario
- Diseño responsivo para todos los dispositivos
- Modo oscuro/claro
- Animaciones fluidas
- Accesibilidad completa

## 📈 Estado del Proyecto

### ✅ Completado
- [x] Sistema de autenticación completo
- [x] Verificación en dos pasos funcional
- [x] Gestión de métodos de pago
- [x] Sistema de suscripciones integral
- [x] Panel de configuración avanzado
- [x] Interfaz de usuario moderna

### 🚧 En Desarrollo
- [ ] Integración con pasarelas de pago reales
- [ ] Sistema de notificaciones push
- [ ] Análisis y métricas de usuario
- [ ] API de recomendaciones con IA

## 🛡️ Seguridad

- **Autenticación robusta** con Supabase Auth
- **MFA obligatorio** para administradores
- **Validación de datos** en frontend y backend
- **Encriptación** de datos sensibles
- **Gestión segura** de sesiones

## 📱 Compatibilidad

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Dispositivos móviles (iOS/Android)

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🌐 Deploy y Producción

### Plataformas de Deploy
Puedes desplegar este proyecto en diferentes plataformas como:
- **Netlify**: Conecta tu repositorio de GitHub para deploys automáticos
- **Vercel**: Ideal para aplicaciones React con integración GitHub
- **Railway**: Para aplicaciones full-stack con base de datos
- **Render**: Hosting gratuito con SSL automático

### Dominio Personalizado
Configura tu dominio personalizado en la plataforma de hosting elegida siguiendo su documentación específica.
