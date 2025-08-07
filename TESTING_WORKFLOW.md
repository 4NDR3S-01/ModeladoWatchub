# WatchHub - Workflow de Testing Automatizado

Este documento describe la configuración del workflow de testing automatizado para WatchHub.

## 🚀 Configuración Completa

### GitHub Actions Workflow

El archivo `.github/workflows/ci.yml` está configurado para ejecutar automáticamente:

- **Tests unitarios e integración** (Vitest)
- **Tests end-to-end** (Playwright)
- **Generación de coverage**
- **Subida de artefactos**

### Estructura de Testing

```
tests/
├── unit/               # Tests unitarios
├── integration/        # Tests de integración  
├── e2e/               # Tests end-to-end (Playwright)
├── __mocks__/         # Mocks para testing
├── fixtures/          # Datos de prueba
└── utils/             # Utilidades para tests
```

## 🔧 Scripts Disponibles

```bash
# Tests unitarios e integración
npm test                    # Ejecutar todos los tests
npm run test:watch         # Modo watch
npm run test:coverage      # Con coverage

# Tests end-to-end
npm run test:e2e           # Ejecutar tests e2e
npm run test:e2e:headless  # Modo headless
```

## 📊 Workflow de CI

### Jobs Configurados

1. **unit_and_integration_tests**
   - Node.js 20
   - Cache npm
   - Ejecución de tests con coverage
   - Upload de reportes de coverage

2. **e2e_tests**
   - Dependiente del job anterior
   - Instalación de browsers Playwright
   - Ejecución de tests e2e
   - Upload de reportes Playwright

### Triggers

- Push a `main`
- Pull requests a `main`

## 🛠️ Tecnologías

- **Vitest**: Tests unitarios e integración
- **Testing Library**: Testing de componentes React
- **Playwright**: Tests end-to-end
- **GitHub Actions**: CI/CD

## ✅ Estado Actual

- ✅ Workflow configurado y funcional
- ✅ Tests unitarios pasando (21 tests)
- ✅ **Tests e2e funcionando en CI**
- ✅ Configuración de Playwright optimizada para CI
- ✅ Scripts de package.json configurados
- ✅ Dependencias instaladas
- ✅ Exclusión de conflictos entre Vitest y Playwright
- ✅ **Timeout de webServer ajustado (120s)**
- ✅ **Solo Chromium en CI para velocidad**

## 🔄 Ejecución Local

Para ejecutar los tests localmente:

```bash
# Instalar dependencias
npm install

# Instalar browsers de Playwright
npx playwright install

# Ejecutar tests
npm test                  # Tests unitarios
npm run test:e2e         # Tests e2e (todos los browsers)
npm run test:e2e:ci      # Tests e2e modo CI (solo Chromium)
```

### Configuración Optimizada:
- **Local**: `npm run dev` (desarrollo rápido)  
- **CI**: `npm run preview` (build estable)

## 🐛 Troubleshooting

- Timeout en webServer (era 60s, ahora 120s)
- Si Playwright falla por dependencias del sistema, usar `npx playwright install --with-deps`
- Los tests e2e están excluidos de Vitest para evitar conflictos
- Coverage se genera automáticamente en CI
- En CI solo ejecuta Chromium para velocidad

---

**Workflow actualizado y listo para desarrollo continuo** ✨
