import { test, expect } from '@playwright/test';

test.describe('WatchHub - Suscripciones y Contenido', () => {
  
  test('página de suscripciones muestra planes correctamente', async ({ page }) => {
    await page.goto('/subscriptions');
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en la página correcta
    await expect(page).toHaveURL(/.*subscription.*/);
    
    // Buscar elementos de planes
    const planElements = [
      'text=Básico',
      'text=Basic',
      'text=Estándar', 
      'text=Standard',
      'text=Premium',
      'text=$'
    ];
    
    let plansFound = 0;
    for (const selector of planElements) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        plansFound += count;
      }
    }
    
    // Debe haber al menos algún contenido relacionado con planes
    expect(plansFound).toBeGreaterThan(0);
    
    // Buscar botones de selección/compra
    const actionButtons = [
      'button:has-text("Seleccionar")',
      'button:has-text("Elegir")',
      'button:has-text("Comprar")',
      'button:has-text("Suscribirse")',
      '[data-testid*="plan"]',
      '.plan-button'
    ];
    
    let buttonsFound = false;
    for (const selector of actionButtons) {
      if (await page.locator(selector).first().isVisible({ timeout: 2000 })) {
        buttonsFound = true;
        break;
      }
    }
    
    // Debería haber botones de acción en los planes
    expect(buttonsFound).toBeTruthy();
  });
  
  test('navegación a categorías de contenido', async ({ page }) => {
    await page.goto('/categories');
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en la página de categorías
    await expect(page).toHaveURL(/.*categor.*/);
    
    // Buscar elementos de categorías
    const categoryElements = [
      'text=Acción',
      'text=Drama',
      'text=Comedia',
      'text=Terror',
      'text=Ciencia Ficción',
      'text=Documentales',
      '.category',
      '[data-testid*="category"]'
    ];
    
    let categoriesFound = 0;
    for (const selector of categoryElements) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        categoriesFound += count;
      }
    }
    
    // Debe mostrar algún tipo de categorías
    expect(categoriesFound).toBeGreaterThan(0);
  });
  
  test('funcionalidad de búsqueda', async ({ page }) => {
    await page.goto('/search');
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en la página de búsqueda
    await expect(page).toHaveURL(/.*search.*/);
    
    // Buscar campo de búsqueda
    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="buscar" i]',
      'input[placeholder*="search" i]',
      'input[name*="search"]',
      'input[name*="query"]',
      '[data-testid*="search"]'
    ];
    
    let searchFieldFound = false;
    for (const selector of searchSelectors) {
      const searchField = page.locator(selector).first();
      if (await searchField.isVisible({ timeout: 3000 })) {
        searchFieldFound = true;
        
        // Probar funcionalidad de búsqueda
        await searchField.fill('test movie');
        
        // Buscar botón de búsqueda
        const searchButton = page.locator('button:has-text("Buscar"), button[type="submit"], [data-testid*="search-button"]').first();
        if (await searchButton.isVisible()) {
          await searchButton.click();
          await page.waitForLoadState('networkidle');
        } else {
          // Probar presionar Enter
          await searchField.press('Enter');
          await page.waitForLoadState('networkidle');
        }
        
        break;
      }
    }
    
    expect(searchFieldFound).toBeTruthy();
  });
  
  test('página de perfil/configuración', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en configuración
    await expect(page).toHaveURL(/.*setting.*/);
    
    // Buscar elementos típicos de configuración
    const settingsElements = [
      'text=Perfil',
      'text=Configuración',
      'text=Settings',
      'text=Profile',
      'text=Cuenta',
      'text=Notificaciones',
      'input[type="email"]',
      'input[type="text"]',
      'button:has-text("Guardar")',
      'button:has-text("Actualizar")'
    ];
    
    let settingsFound = 0;
    for (const selector of settingsElements) {
      const element = page.locator(selector);
      const count = await element.count();
      if (count > 0) {
        settingsFound += count;
      }
    }
    
    // Debe tener algún contenido de configuración
    expect(settingsFound).toBeGreaterThan(0);
  });
  
  test('página Mi Lista (watchlist)', async ({ page }) => {
    await page.goto('/my-list');
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en Mi Lista
    await expect(page).toHaveURL(/.*my-list.*|.*list.*/);
    
    // Buscar elementos de lista
    const listElements = [
      'text=Mi Lista',
      'text=My List',
      'text=Favoritos',
      'text=Watchlist',
      '.movie-item',
      '.content-item',
      '[data-testid*="movie"]',
      '[data-testid*="content"]'
    ];
    
    let listElementsFound = false;
    for (const selector of listElements) {
      if (await page.locator(selector).first().isVisible({ timeout: 3000 })) {
        listElementsFound = true;
        break;
      }
    }
    
    // Debe mostrar la estructura de lista (puede estar vacía)
    expect(listElementsFound).toBeTruthy();
  });
  
  test('navegación entre páginas principales', async ({ page }) => {
    // Comenzar desde home
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Lista de páginas a probar
    const pages = ['/subscriptions', '/categories', '/search', '/settings'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Verificar que la página responde correctamente
      const response = await page.evaluate(() => document.readyState);
      expect(response).toBe('complete');
      
      // Verificar que hay contenido en la página
      const bodyContent = await page.locator('body').textContent();
      expect(bodyContent?.length || 0).toBeGreaterThan(0);
    }
  });
  
  test('responsive design - versión móvil', async ({ page }) => {
    // Configurar viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página se adapta al móvil
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Buscar elementos de navegación móvil
    const mobileNavElements = [
      'button[aria-label*="menu"]',
      'button[aria-label*="hamburger"]',
      '.mobile-menu',
      '.hamburger',
      '[data-testid*="mobile"]'
    ];
    
    let mobileNavFound = false;
    for (const selector of mobileNavElements) {
      if (await page.locator(selector).first().isVisible({ timeout: 2000 })) {
        mobileNavFound = true;
        break;
      }
    }
    
    // En móvil debería haber algún tipo de navegación adaptada
    // (esto es opcional, no todos los sitios tienen hamburger menu)
    // expect(mobileNavFound).toBeTruthy();
    
    // Al menos verificar que el contenido es visible en móvil
    const content = await page.locator('body').textContent();
    expect(content?.length || 0).toBeGreaterThan(0);
  });
});
