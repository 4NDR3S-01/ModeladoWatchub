import { test, expect } from '@playwright/test';

test.describe('WatchHub - Panel de Administración', () => {
  
  test('acceso al login de administrador', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en la página de admin login
    await expect(page).toHaveURL(/.*admin.*login.*/);
    
    // Buscar formulario de login de admin
    const adminLoginElements = [
      'form',
      'input[type="email"]',
      'input[type="password"]',
      'button:has-text("Login")',
      'button:has-text("Iniciar")',
      'text=Admin',
      'text=Administrador'
    ];
    
    let adminElementsFound = 0;
    for (const selector of adminLoginElements) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        adminElementsFound += count;
      }
    }
    
    // Debe tener elementos típicos de login de admin
    expect(adminElementsFound).toBeGreaterThan(0);
  });
  
  test('navegación al dashboard de admin', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Verificar URL de dashboard
    await expect(page).toHaveURL(/.*admin.*dashboard.*/);
    
    // Buscar elementos típicos de dashboard
    const dashboardElements = [
      'text=Dashboard',
      'text=Panel',
      'text=Estadísticas',
      'text=Analytics',
      'text=Usuarios',
      'text=Users',
      'text=Contenido',
      'text=Content',
      '.dashboard',
      '.admin-panel',
      '[data-testid*="dashboard"]'
    ];
    
    let dashboardFound = false;
    for (const selector of dashboardElements) {
      if (await page.locator(selector).first().isVisible({ timeout: 3000 })) {
        dashboardFound = true;
        break;
      }
    }
    
    expect(dashboardFound).toBeTruthy();
  });
  
  test('página de gestión de usuarios admin', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    // Verificar URL de gestión de usuarios
    await expect(page).toHaveURL(/.*admin.*user.*/);
    
    // Buscar elementos de gestión de usuarios
    const userManagementElements = [
      'text=Usuarios',
      'text=Users',
      'text=Gestión',
      'text=Lista',
      'table',
      'tbody',
      'tr',
      'td',
      '.user-list',
      '.users-table',
      '[data-testid*="user"]'
    ];
    
    let userElementsFound = 0;
    for (const selector of userManagementElements) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        userElementsFound += count;
      }
    }
    
    // Debe tener estructura para mostrar usuarios
    expect(userElementsFound).toBeGreaterThan(0);
  });
  
  test('página de gestión de contenido admin', async ({ page }) => {
    await page.goto('/admin/content');
    await page.waitForLoadState('networkidle');
    
    // Verificar URL de gestión de contenido
    await expect(page).toHaveURL(/.*admin.*content.*/);
    
    // Buscar elementos de gestión de contenido
    const contentManagementElements = [
      'text=Contenido',
      'text=Content',
      'text=Películas',
      'text=Movies',
      'text=Series',
      'text=Agregar',
      'text=Add',
      'button:has-text("Nuevo")',
      'button:has-text("New")',
      '.content-list',
      '.movies-table'
    ];
    
    let contentElementsFound = 0;
    for (const selector of contentManagementElements) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        contentElementsFound += count;
      }
    }
    
    expect(contentElementsFound).toBeGreaterThan(0);
  });
  
  test('página de analíticas admin', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');
    
    // Verificar URL de analytics
    await expect(page).toHaveURL(/.*admin.*analytics.*/);
    
    // Buscar elementos de analytics
    const analyticsElements = [
      'text=Analytics',
      'text=Analíticas',
      'text=Estadísticas',
      'text=Reportes',
      'text=Reports',
      'text=Métricas',
      'text=Metrics',
      'canvas', // Para gráficos
      '.chart',
      '.analytics',
      '.metrics'
    ];
    
    let analyticsFound = false;
    for (const selector of analyticsElements) {
      if (await page.locator(selector).first().isVisible({ timeout: 3000 })) {
        analyticsFound = true;
        break;
      }
    }
    
    expect(analyticsFound).toBeTruthy();
  });
  
  test('página de gestión de suscripciones admin', async ({ page }) => {
    await page.goto('/admin/subscriptions');
    await page.waitForLoadState('networkidle');
    
    // Verificar URL de gestión de suscripciones
    await expect(page).toHaveURL(/.*admin.*subscription.*/);
    
    // Buscar elementos de gestión de suscripciones
    const subscriptionElements = [
      'text=Suscripciones',
      'text=Subscriptions',
      'text=Planes',
      'text=Plans',
      'text=Pagos',
      'text=Payments',
      'text=Básico',
      'text=Premium',
      'table',
      '.subscription-list',
      '.plans-table'
    ];
    
    let subscriptionElementsFound = 0;
    for (const selector of subscriptionElements) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        subscriptionElementsFound += count;
      }
    }
    
    expect(subscriptionElementsFound).toBeGreaterThan(0);
  });
  
  test('navegación entre páginas de admin', async ({ page }) => {
    // Lista de páginas de admin a probar
    const adminPages = [
      '/admin/dashboard',
      '/admin/users', 
      '/admin/content',
      '/admin/analytics',
      '/admin/subscriptions'
    ];
    
    for (const adminPage of adminPages) {
      await page.goto(adminPage);
      await page.waitForLoadState('networkidle');
      
      // Verificar que la página responde
      const response = await page.evaluate(() => document.readyState);
      expect(response).toBe('complete');
      
      // Verificar que hay contenido
      const bodyContent = await page.locator('body').textContent();
      expect(bodyContent?.length || 0).toBeGreaterThan(0);
      
      // Verificar que mantenemos el contexto de admin
      const currentUrl = page.url();
      expect(currentUrl).toContain('admin');
    }
  });
  
  test('reset de contraseña de admin', async ({ page }) => {
    await page.goto('/admin/forgot-password');
    await page.waitForLoadState('networkidle');
    
    // Verificar URL de reset de admin
    await expect(page).toHaveURL(/.*admin.*forgot.*password.*/);
    
    // Buscar elementos de reset de contraseña
    const resetElements = [
      'form',
      'input[type="email"]',
      'button:has-text("Enviar")',
      'button:has-text("Send")',
      'button:has-text("Reset")',
      'text=Forgot',
      'text=Olvidaste',
      'text=Recuperar'
    ];
    
    let resetElementsFound = 0;
    for (const selector of resetElements) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        resetElementsFound += count;
      }
    }
    
    expect(resetElementsFound).toBeGreaterThan(0);
  });
});
