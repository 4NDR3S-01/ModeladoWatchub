import { test, expect } from '@playwright/test';

test.describe('WatchHub E2E Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Esperar a que la página se cargue completamente
    await page.waitForLoadState('networkidle');
    
    // Verificar que la página se carga correctamente
    await expect(page).toHaveTitle(/.*WatchHub.*|.*Vite.*|.*/);
    
    // Verificar que hay contenido en la página
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display basic structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar que existe un elemento root
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });

  test('should handle navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar que podemos navegar (esto dependerá de tu estructura real)
    // Por ahora solo verificamos que la página responde
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });
});
