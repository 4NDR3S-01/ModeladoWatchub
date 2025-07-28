# Tests - WatchHub

Esta carpeta contiene todas las pruebas para la aplicación WatchHub.

## Estructura de Tests

```
tests/
├── unit/           # Pruebas unitarias
├── integration/    # Pruebas de integración
├── e2e/           # Pruebas end-to-end
├── __mocks__/     # Mocks para testing
├── fixtures/      # Datos de prueba
└── utils/         # Utilidades para tests
```

## Tipos de Pruebas

### Unit Tests
- Componentes individuales
- Funciones utilitarias
- Hooks personalizados
- Servicios

### Integration Tests
- Integración con Supabase
- Flujos de autenticación
- Procesamiento de pagos
- APIs

### E2E Tests
- Flujos completos de usuario
- Funcionalidades críticas
- Casos de uso principales

## Comandos de Testing

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con coverage
npm run test:coverage

# Ejecutar pruebas e2e
npm run test:e2e
```

## Configuración

Las pruebas utilizan:
- **Vitest** para unit e integration tests
- **Testing Library** para testing de componentes React
- **Playwright** para pruebas e2e
- **MSW** para mocking de APIs
