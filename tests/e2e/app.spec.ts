import { test, expect } from '@playwright/test';

test.describe('WatchHub E2E Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que la página se carga correctamente
    await expect(page).toHaveTitle(/WatchHub/);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Buscar y hacer click en el botón de login
    const loginButton = page.getByRole('button', { name: /login|iniciar sesión/i });
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await expect(page).toHaveURL(/.*login.*/);
    }
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que existe navegación
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });
});
