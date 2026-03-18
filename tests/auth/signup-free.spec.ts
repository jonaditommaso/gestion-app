/**
 * SUITE: Registro de cuenta con email/password — Plan FREE
 *
 * Flujo:
 *   1. Navegar a /signup
 *   2. Completar formulario (name, email, password)
 *   3. NO se elige plan pago → plan FREE por defecto
 *   4. Submit → esperar redirección a /onboarding
 *   5. Verificar UI del onboarding
 *   6. Verificar acceso a la app principal
 */

import { test, expect } from '@playwright/test';
import { goToSignup, TEST_USER, waitForAuthRedirect, logout } from '../helpers';

const freeUser = {
  name: 'Free Tester',
  email: `e2e.free.${Date.now()}@mailinator.com`,
  password: 'TestPassword123!',
};

test.describe('Registro — Plan FREE (email/password)', () => {
  test('muestra el formulario de registro correctamente', async ({ page }) => {
    await goToSignup(page);

    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up|registrar|register|crear cuenta/i })).toBeVisible();

    // Verificar presencia de opciones OAuth
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /github/i })).toBeVisible();

    // Verificar enlace a /login
    await expect(page.getByRole('link', { name: /log in|sign in|inicia sesión|accedi/i })).toBeVisible();
  });

  test('valida campos requeridos al enviar vacío', async ({ page }) => {
    await goToSignup(page);
    await page.click('button[type="submit"]');

    // Debe mostrar mensajes de validación (HTML5 o Zod)
    // El formulario no debe navegar a otra URL
    await expect(page).toHaveURL(/signup/);
  });

  test('valida que el password sea mínimo 8 caracteres', async ({ page }) => {
    await goToSignup(page);
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123'); // muy corto
    await page.click('button[type="submit"]');

    // Debe permanecer en /signup con algún mensaje visible de error
    await expect(page).toHaveURL(/signup/);
    const errorMsg = page.locator('[role="alert"], .text-red-500, .text-destructive, [data-testid="error-msg"]');
    await expect(errorMsg.first()).toBeVisible({ timeout: 5000 });
  });

  test('registro exitoso con plan FREE → redirige a /onboarding', async ({ page }) => {
    await goToSignup(page);

    await page.fill('input[name="name"]', freeUser.name);
    await page.fill('input[name="email"]', freeUser.email);
    await page.fill('input[name="password"]', freeUser.password);

    // El plan FREE debe ser la opción por defecto; si hay selector de plan, no tocarlo
    await page.click('button[type="submit"]');

    // Esperar redireccion
    await page.waitForURL(/\/(onboarding|new-org)/, { timeout: 20000 });

    // BUG CHECK: ¿Redirige al flujo correcto?
    const url = page.url();
    expect(url).toMatch(/onboarding|new-org/);
  });

  test('onboarding muestra UI explicativa post-registro', async ({ page }) => {
    // Asume que el test anterior fue exitoso y estamos en /onboarding
    // O navegar directamente (si hay sesión activa del test anterior)
    await page.goto('/onboarding');

    // Verificar que la página de onboarding tiene contenido
    const heading = page.locator('h1, h2, [data-testid="onboarding-title"]');
    await expect(heading.first()).toBeVisible({ timeout: 10000 });

    // La UI no debe mostrar pantalla en blanco ni error 500
    await expect(page.locator('text=/error|500|failed/i')).toHaveCount(0);
  });

  test('email duplicado muestra mensaje de error claro', async ({ page }) => {
    // Intentar registrar el mismo email por segunda vez
    await goToSignup(page);
    await page.fill('input[name="name"]', 'Duplicate User');
    await page.fill('input[name="email"]', freeUser.email); // email ya existente
    await page.fill('input[name="password"]', freeUser.password);
    await page.click('button[type="submit"]');

    // Debe haber un mensaje de error visible (no redirect)
    const errorLocator = page.locator('[role="alert"], [data-testid="error-msg"], .sonner-toast, [data-sonner-toast]');
    await expect(errorLocator.first()).toBeVisible({ timeout: 8000 });

    // BUG CHECK: El mensaje debe ser descriptivo, no un código interno
    const errorText = await errorLocator.first().textContent();
    expect(errorText?.trim().length).toBeGreaterThan(5);
  });
});
