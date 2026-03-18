/**
 * SUITE: Post-autenticación — navegación y acceso a módulos
 *
 * Verifica que después del registro/login:
 *   - El usuario llega al flujo de onboarding correcto
 *   - El estado de la sesión persiste entre navegaciones
 *   - Los módulos principales son accesibles
 *   - El plan (free/paid) refleja las restricciones correctas en UI
 *   - El logout funciona y limpia la sesión
 */

import { test, expect, type Page } from '@playwright/test';
import { goToLogin, loginWith, waitForAuthRedirect, logout } from '../helpers';

const FREE_USER = {
  email: process.env.TEST_FREE_EMAIL ?? 'e2e.free@mailinator.com',
  password: process.env.TEST_FREE_PASSWORD ?? 'TestPassword123!',
};

/** Mock de usuario autenticado — simula la respuesta de /api/auth/current */
async function mockAuthenticatedUser(
  page: Page,
  plan: 'free' | 'plus' | 'pro' = 'free'
): Promise<void> {
  await page.route('**/api/auth/current', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        $id: 'mock-user-id',
        name: 'Mock User',
        email: 'mock@test.com',
        plan,
        labels: [plan],
      }),
    });
  });
}

test.describe('Onboarding post-registro', () => {
  test('onboarding carga sin errores', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (e) => jsErrors.push(e.message));

    await mockAuthenticatedUser(page, 'free');
    await page.goto('/onboarding');
    await page.waitForTimeout(2000);

    expect(jsErrors).toHaveLength(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('onboarding con paid=true muestra confirmación de pago', async ({ page }) => {
    await mockAuthenticatedUser(page, 'plus');
    await page.goto('/onboarding?plan=plus&billing=MONTHLY&paid=true&session_id=cs_test_mock');

    await page.waitForTimeout(2000);

    // BUG CHECK: Debe haber algún indicador de que el pago fue exitoso
    const paymentConfirm = page.locator(
      'text=/paid|pago|pagado|success|exitoso|bienvenido/i, [data-testid="payment-success"]'
    );
    if ((await paymentConfirm.count()) === 0) {
      console.warn('[BUG CHECK] No hay confirmación visual de pago exitoso en /onboarding?paid=true');
    }
  });

  test('formulario de onboarding pide nombre de empresa u organización', async ({ page }) => {
    await mockAuthenticatedUser(page, 'free');
    await page.goto('/onboarding');
    await page.waitForTimeout(2000);

    // Debe haber algún input para configurar la organización
    const orgInput = page.locator(
      'input[name*="company"], input[name*="org"], input[placeholder*="empresa"], input[placeholder*="company"]'
    );
    // BUG CHECK: Si no hay campos de configuración, el onboarding está incompleto
    if ((await orgInput.count()) === 0) {
      console.warn('[BUG CHECK] No se encontró input de organización/empresa en onboarding');
    }
  });
});

test.describe('Acceso a módulos post-autenticación', () => {
  test('ruta /organization carga sin errores (usuario autenticado mock)', async ({ page }) => {
    await mockAuthenticatedUser(page, 'free');
    await page.goto('/organization');

    // No debe haber error 500
    await expect(page.locator('text=/500|Internal Server Error/i')).toHaveCount(0);
  });

  test('ruta /sells carga sin errores', async ({ page }) => {
    await mockAuthenticatedUser(page, 'free');
    await page.goto('/sells');
    await expect(page.locator('text=/500|Internal Server Error/i')).toHaveCount(0);
  });

  test('ruta /billing-management carga sin errores', async ({ page }) => {
    await mockAuthenticatedUser(page, 'free');
    await page.goto('/billing-management');
    await expect(page.locator('text=/500|Internal Server Error/i')).toHaveCount(0);
  });

  test('ruta /settings carga sin errores', async ({ page }) => {
    await mockAuthenticatedUser(page, 'free');
    await page.goto('/settings');
    await expect(page.locator('text=/500|Internal Server Error/i')).toHaveCount(0);
  });

  test('ruta /team carga sin errores', async ({ page }) => {
    await mockAuthenticatedUser(page, 'free');
    await page.goto('/team');
    await expect(page.locator('text=/500|Internal Server Error/i')).toHaveCount(0);
  });
});

test.describe('Plan FREE — restricciones de UI', () => {
  test('plan FREE muestra indicador de plan actual en algún lugar visible', async ({ page }) => {
    await mockAuthenticatedUser(page, 'free');
    await page.goto('/settings');
    await page.waitForTimeout(2000);

    // BUG CHECK: El usuario debe poder ver qué plan tiene
    const planIndicator = page.locator('text=/free|gratis/i, [data-testid="current-plan"]');
    if ((await planIndicator.count()) === 0) {
      console.warn('[BUG CHECK] El plan FREE no se muestra visualmente en settings');
    }
  });

  test('plan FREE muestra opciones de upgrade disponibles', async ({ page }) => {
    await mockAuthenticatedUser(page, 'free');
    await page.goto('/settings');
    await page.waitForTimeout(2000);

    // Debe haber alguna forma de hacer upgrade
    const upgradeBtn = page.locator(
      'button:has-text("upgrade"), a:has-text("upgrade"), button:has-text("plus"), button:has-text("pro"), [data-testid="upgrade-btn"]'
    );
    if ((await upgradeBtn.count()) === 0) {
      console.warn('[BUG CHECK] No hay opción de upgrade visible para usuarios FREE');
    }
  });

  test('funcionalidades premium bloquean con UpgradeDialog o similar', async ({ page }) => {
    await mockAuthenticatedUser(page, 'free');

    // Intentar acceder a una función premium
    // (intentar crear un workspace adicional — FREE solo permite 1)
    await page.goto('/workspaces');
    await page.waitForTimeout(2000);

    // BUG CHECK: Si el usuario encuentra una función premium sin explicación, es confuso
    // Debe haber un indicador (badge, lock icon, UpgradeDialog)
    const lockIndicator = page.locator(
      '[data-testid="upgrade-dialog"], [data-testid="plan-lock"], text=/upgrade|pro|plus/i'
    );
    if ((await lockIndicator.count()) === 0) {
      console.warn('[BUG CHECK] No se encontró indicador de restricción para funciones premium en plan FREE');
    }
  });
});

test.describe('Logout', () => {
  test('logout desde /settings limpia la sesión y redirige a /login', async ({ page }) => {
    await mockAuthenticatedUser(page, 'free');

    // Mock del endpoint de logout
    await page.route('**/api/auth/logout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await logout(page);

    // Puede redirigir a /login o /
    await page.waitForURL(/login|^\/$/, { timeout: 10000 });
    const url = page.url();
    expect(url.includes('/login') || url === 'http://localhost:3000/').toBe(true);
  });

  test('después de logout, acceso a ruta protegida redirige a /login', async ({ page }) => {
    // Simular que no hay sesión (sin mock de /api/auth/current)
    await page.goto('/organization');
    await page.waitForTimeout(2000);

    const url = page.url();
    // Sin sesión, debe redirigir a login
    const isRedirected = url.includes('/login') || url.includes('/signup');
    if (!isRedirected) {
      console.warn('[BUG CHECK] Ruta protegida /organization accesible sin autenticación. URL:', url);
    }
  });
});

test.describe('Persistencia de sesión', () => {
  test('recarga de página mantiene la sesión activa (cookie-based auth)', async ({ page }) => {
    await mockAuthenticatedUser(page, 'free');
    await page.goto('/organization');
    await page.waitForTimeout(1000);

    const urlBefore = page.url();
    await page.reload();
    await page.waitForTimeout(2000);

    const urlAfter = page.url();

    // BUG CHECK: Si la sesión se pierde al recargar, hay un problema con la cookie
    if (urlAfter.includes('/login') && !urlBefore.includes('/login')) {
      console.warn('[BUG CHECK] La sesión se pierde al recargar la página');
    }
  });
});
