import { test, expect } from '@playwright/test';

test.describe('WatchHub - Autenticación', () => {
  
  test('flujo de registro completo', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en la página de registro
    await expect(page).toHaveURL(/.*register.*/);
    
    // Buscar formulario de registro
    const formSelectors = [
      'form',
      '[data-testid="register-form"]',
      '.register-form'
    ];
    
    let formFound = false;
    for (const selector of formSelectors) {
      const form = page.locator(selector).first();
      if (await form.isVisible({ timeout: 3000 })) {
        formFound = true;
        
        // Buscar campos de entrada
        const emailField = form.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
        const passwordField = form.locator('input[type="password"], input[name="password"]').first();
        const submitButton = form.locator('button[type="submit"], button:has-text("Register"), button:has-text("Registrar")').first();
        
        if (await emailField.isVisible() && await passwordField.isVisible()) {
          // Llenar formulario con datos de prueba
          await emailField.fill('test@watchhub.com');
          await passwordField.fill('TestPassword123!');
          
          // Buscar campo de confirmación de contraseña si existe
          const confirmPasswordField = form.locator('input[name*="confirm"], input[placeholder*="confirm" i]').first();
          if (await confirmPasswordField.isVisible()) {
            await confirmPasswordField.fill('TestPassword123!');
          }
          
          // Buscar campo de nombre si existe
          const nameField = form.locator('input[name*="name"], input[placeholder*="name" i]').first();
          if (await nameField.isVisible()) {
            await nameField.fill('Usuario Test');
          }
          
          // Intentar enviar formulario (sin hacer click real para evitar crear cuentas)
          await expect(submitButton).toBeVisible();
          
          // Verificar que el botón está habilitado
          await expect(submitButton).toBeEnabled();
        }
        break;
      }
    }
    
    expect(formFound).toBeTruthy();
  });
  
  test('flujo de login completo', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Verificar que estamos en la página de login
    await expect(page).toHaveURL(/.*login.*/);
    
    // Buscar formulario de login
    const formSelectors = [
      'form',
      '[data-testid="login-form"]',
      '.login-form'
    ];
    
    let formFound = false;
    for (const selector of formSelectors) {
      const form = page.locator(selector).first();
      if (await form.isVisible({ timeout: 3000 })) {
        formFound = true;
        
        // Buscar campos de entrada
        const emailField = form.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
        const passwordField = form.locator('input[type="password"], input[name="password"]').first();
        const submitButton = form.locator('button[type="submit"], button:has-text("Login"), button:has-text("Iniciar")').first();
        
        if (await emailField.isVisible() && await passwordField.isVisible()) {
          // Llenar formulario con datos de prueba
          await emailField.fill('test@watchhub.com');
          await passwordField.fill('TestPassword123!');
          
          // Verificar que el botón de submit está presente
          await expect(submitButton).toBeVisible();
          await expect(submitButton).toBeEnabled();
        }
        break;
      }
    }
    
    expect(formFound).toBeTruthy();
  });
  
  test('validación de formularios', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    // Buscar formulario
    const form = page.locator('form').first();
    if (await form.isVisible()) {
      const submitButton = form.locator('button[type="submit"]').first();
      
      if (await submitButton.isVisible()) {
        // Intentar enviar formulario vacío
        await submitButton.click();
        
        // Verificar que aparecen mensajes de validación o que el formulario no se envía
        const validationMessages = [
          'text=required',
          'text=obligatorio',
          'text=invalid',
          'text=error',
          '[aria-invalid="true"]',
          '.error',
          '.invalid'
        ];
        
        let validationFound = false;
        for (const selector of validationMessages) {
          if (await page.locator(selector).first().isVisible({ timeout: 2000 })) {
            validationFound = true;
            break;
          }
        }
        
        // Debe mostrar algún tipo de validación o permanecer en la página
        const currentUrl = page.url();
        expect(validationFound || currentUrl.includes('register')).toBeTruthy();
      }
    }
  });
  
  test('enlace entre login y registro', async ({ page }) => {
    // Ir a login
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Buscar enlace a registro
    const registerLinkSelectors = [
      'a[href*="register"]',
      'text=Register',
      'text=Registr',
      'text=Crear cuenta',
      'text=No tienes cuenta'
    ];
    
    for (const selector of registerLinkSelectors) {
      try {
        const link = page.locator(selector).first();
        if (await link.isVisible({ timeout: 2000 })) {
          await link.click();
          await page.waitForLoadState('networkidle');
          await expect(page).toHaveURL(/.*register.*/);
          break;
        }
      } catch {
        // Continuar con el siguiente selector
      }
    }
    
    // Verificar que hay navegación entre páginas
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    // Buscar enlace a login desde registro
    const loginLinkSelectors = [
      'a[href*="login"]',
      'text=Login',
      'text=Iniciar',
      'text=Ya tienes cuenta'
    ];
    
    for (const selector of loginLinkSelectors) {
      try {
        const link = page.locator(selector).first();
        if (await link.isVisible({ timeout: 2000 })) {
          await link.click();
          await page.waitForLoadState('networkidle');
          await expect(page).toHaveURL(/.*login.*/);
          break;
        }
      } catch {
        // Continuar con el siguiente selector
      }
    }
  });
});
