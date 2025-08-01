# 🚀 Configuración de Supabase - WatchHub

## 📋 Resumen del Estado Actual

✅ **Proyecto configurado**: `amypgzmmlukvgzukihea`  
✅ **URL actualizada**: `https://amypgzmmlukvgzukihea.supabase.co`  
✅ **Scripts de verificación**: Instalados y funcionando  
⚠️ **Claves API**: Pendientes de configuración  

## 🔧 Comandos Disponibles

```bash
# Verificar estado de configuración
npm run supabase:status

# Configurar proyecto automáticamente
npm run supabase:setup

# Iniciar Supabase local (requiere Docker)
npm run supabase:start

# Detener Supabase local
npm run supabase:stop

# Resetear base de datos local
npm run supabase:reset
```

## 📡 Configuración de Variables de Entorno

### 1. Obtener Claves API

Ve a tu dashboard de Supabase:
🔗 https://amypgzmmlukvgzukihea.supabase.co/project/settings/api

### 2. Configurar Variables en `.env`

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://amypgzmmlukvgzukihea.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_publica_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_clave_privada_aqui
```

### 3. Verificar Configuración

```bash
npm run supabase:status
```

## 🐳 Desarrollo Local con Docker

### Requisitos Previos
- Docker Desktop instalado y ejecutándose
- Supabase CLI instalado (ya incluido en el proyecto)

### Iniciar Servicios Locales
```bash
npm run supabase:start
```

Esto iniciará:
- **Base de datos PostgreSQL**: `localhost:54322`
- **API de Supabase**: `http://localhost:54321`
- **Dashboard local**: `http://localhost:54323`
- **Inbucket (email testing)**: `http://localhost:54324`

### URLs Locales
- 🎯 **API**: http://localhost:54321
- 📊 **Dashboard**: http://localhost:54323
- 📧 **Email Testing**: http://localhost:54324
- 🗄️ **Database**: localhost:54322

## 📊 Estado de la Base de Datos

### Tablas Esperadas
- `profiles` - Perfiles de usuario
- `subscriptions` - Suscripciones
- `content` - Contenido de video
- `reviews` - Reseñas
- `watchlist` - Lista de reproducción
- `categories` - Categorías de contenido

### Migraciones
Las migraciones se encuentran en: `supabase/migrations/`

Para aplicar migraciones:
```bash
npx supabase db push
```

## 🔐 Información de Seguridad

**Clave proporcionada**: `adminroot123`

⚠️ **IMPORTANTE**: Esta clave es solo para identificación del proyecto. Las claves API reales deben obtenerse del dashboard de Supabase.

## 🛠️ Solución de Problemas

### Error: Docker no encontrado
```bash
# Verificar Docker
docker --version

# Iniciar Docker Desktop manualmente
```

### Error: Puerto en uso
```bash
# Detener servicios y reiniciar
npm run supabase:stop
npm run supabase:start
```

### Configuración incorrecta
```bash
# Regenerar configuración
npm run supabase:setup
npm run supabase:status
```

## 📚 Recursos Adicionales

- 📖 [Documentación de Supabase](https://supabase.com/docs)
- 🎥 [Guías de Supabase](https://supabase.com/docs/guides)
- 💬 [Comunidad de Supabase](https://github.com/supabase/supabase/discussions)

## 🏁 Próximos Pasos

1. **Obtener claves API** del dashboard de Supabase
2. **Actualizar `.env`** con las claves reales
3. **Ejecutar `npm run supabase:status`** para verificar
4. **Iniciar desarrollo** con `npm run dev`

---

*Última actualización: ${new Date().toLocaleDateString('es-ES')}*
