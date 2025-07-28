# End-to-End Tests

Esta carpeta contiene las pruebas end-to-end para WatchHub.

## Configuración

Los tests e2e utilizan Playwright para simular interacciones reales del usuario.

## Tests Incluidos

### Flujos de Usuario
- Registro y login
- Navegación por la plataforma
- Búsqueda de contenido
- Reproducción de videos
- Gestión de watchlist

### Flujos de Pago
- Proceso de suscripción
- Actualización de plan
- Cancelación de suscripción

### Flujos de Administración
- Panel de administración
- Gestión de contenido
- Gestión de usuarios

## Comandos

```bash
# Ejecutar todos los tests e2e
npm run test:e2e

# Ejecutar tests en modo headless
npm run test:e2e:headless

# Ejecutar tests específicos
npm run test:e2e -- --grep "authentication"
```
