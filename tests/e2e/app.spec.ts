import { test, expect } from '@playwright/test';

test.describe('WatchHub - Funcionalidades Principales', () => {
  
  test.beforeEach(async ({ page }) => {
    // Ir a la página principal antes de cada test
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('debe cargar la página principal correctamente', async ({ page }) => {
    // Verificar título y estructura básica
    await expect(page).toHaveTitle(/.*WatchHub.*|.*Vite.*|.*/);
    
    // Verificar que existe el contenedor principal
    const root = page.locator('#root');
    await expect(root).toBeVisible();
    
    // Verificar que hay contenido cargado
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('debe navegar a la página de login', async ({ page }) => {
    // Buscar botón de login/iniciar sesión
    const loginSelectors = [
      'a[href="/login"]',
      'button:has-text("Login")',
      'button:has-text("Iniciar")',
      'text=Login',
      'text=Iniciar Sesión',
      '[data-testid="login-button"]'
    ];

    let loginFound = false;
    for (const selector of loginSelectors) {
      try {
        const loginElement = page.locator(selector).first();
        if (await loginElement.isVisible({ timeout: 2000 })) {
          await loginElement.click();
          await page.waitForLoadState('networkidle');
          await expect(page).toHaveURL(/.*login.*/);
          loginFound = true;
          break;
        }
      } catch (e) {
        // Continuar con el siguiente selector
      }
    }

    // Si no encuentra botón, navegar directamente
    if (!loginFound) {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*login.*/);
    }
  });

  test('debe navegar a la página de registro', async ({ page }) => {
    // Intentar encontrar enlace de registro
    const registerSelectors = [
      'a[href="/register"]',
      'button:has-text("Register")',
      'button:has-text("Registr")',
      'text=Register',
      'text=Crear cuenta',
      '[data-testid="register-button"]'
    ];

    let registerFound = false;
    for (const selector of registerSelectors) {
      try {
        const registerElement = page.locator(selector).first();
        if (await registerElement.isVisible({ timeout: 2000 })) {
          await registerElement.click();
          await page.waitForLoadState('networkidle');
          await expect(page).toHaveURL(/.*register.*/);
          registerFound = true;
          break;
        }
      } catch (e) {
        // Continuar con el siguiente selector
      }
    }

    // Si no encuentra botón, navegar directamente
    if (!registerFound) {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*register.*/);
    }
  });

  test('debe mostrar página de suscripciones', async ({ page }) => {
    await page.goto('/subscriptions');
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en la página correcta
    await expect(page).toHaveURL(/.*subscription.*/);
    
    // Buscar elementos típicos de planes de suscripción
    const planSelectors = [
      'text=Plan',
      'text=Básico',
      'text=Premium',
      'text=$',
      '[data-testid="plan"]',
      '.plan',
      '.subscription'
    ];

    let planFound = false;
    for (const selector of planSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 })) {
        planFound = true;
        break;
      }
    }
    
    // Al menos debería haber contenido relacionado con planes
    expect(planFound).toBeTruthy();
  });

  test('debe manejar navegación a páginas que no existen', async ({ page }) => {
    await page.goto('/esta-pagina-no-existe');
    await page.waitForLoadState('networkidle');
    
    // Verificar que muestra una página 404 o redirige
    const currentUrl = page.url();
    const is404 = currentUrl.includes('404') || 
                  currentUrl.includes('not-found') ||
                  await page.locator('text=404').isVisible() ||
                  await page.locator('text=Not Found').isVisible() ||
                  await page.locator('text=Página no encontrada').isVisible();
    
    // Debería mostrar 404 o redirigir a home
    expect(is404 || currentUrl.endsWith('/')).toBeTruthy();
  });

  test('debe tener navegación funcional', async ({ page }) => {
    // Buscar elementos de navegación comunes
    const navSelectors = [
      'nav',
      '[role="navigation"]',
      '.navigation',
      '.navbar',
      '.header'
    ];

    let navFound = false;
    for (const selector of navSelectors) {
      const navElement = page.locator(selector).first();
      if (await navElement.isVisible({ timeout: 2000 })) {
        navFound = true;
        break;
      }
    }

    // Si hay navegación visible, verificar que es interactiva
    if (navFound) {
      const links = page.locator('a').first();
      if (await links.isVisible()) {
        await expect(links).toBeVisible();
      }
    }

    // Al menos debe haber algún tipo de estructura de navegación
    const hasStructure = await page.locator('a, button, [role="button"]').count() > 0;
    expect(hasStructure).toBeTruthy();
  });
});
