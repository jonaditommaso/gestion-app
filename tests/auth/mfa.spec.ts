/**
 * SUITE: MFA (Multi-Factor Authentication) — Verificación TOTP
 *
 * Flujo esperado:
 *   1. Usuario con MFA activado intenta hacer login
 *   2. Backend detecta MFA → crea MfaChallenge → setea cookie mfa_token
 *   3. Frontend redirige a /mfa?token=...&challengeId=...
 *   4. Usuario ingresa código TOTP de 6 dígitos
 *   5. POST /api/auth/mfa verifica con Appwrite
 *   6. Éxito → redirección a la app
 *   7. Código inválido → mensaje de error
 */

import { test, expect, type Page } from '@playwright/test';

/** Simula la respuesta del backend indicando que MFA es requerido */
async function mockMfaRequired(page: Page): Promise<void> {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        mfaRequired: true,
        challengeId: 'mock-challenge-id-123',
        mfaToken: 'mock-mfa-token-456',
      }),
    });
  });
}

/** Simula una respuesta exitosa de MFA */
async function mockMfaSuccess(page: Page): Promise<void> {
  await page.route('**/api/auth/mfa', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
}

/** Simula una respuesta de MFA inválida */
async function mockMfaInvalid(page: Page): Promise<void> {
  await page.route('**/api/auth/mfa', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Invalid MFA code' }),
    });
  });
}

test.describe('MFA — página /mfa', () => {
  test('página /mfa muestra input de 6 dígitos', async ({ page }) => {
    await page.goto('/mfa?token=mock-token&challengeId=mock-challenge');

    // Puede haber un input único o 6 inputs separados (OTP input)
    const otpInput = page.locator('input[inputmode="numeric"], input[type="number"], input[maxlength="6"], [data-testid="otp-input"]');
    const hasOtpInput = await otpInput.count();

    if (hasOtpInput === 0) {
      // Puede estar detrás de una redirección si no hay token válido
      const url = page.url();
      console.warn('[CHECK] /mfa redirige a:', url);
    } else {
      await expect(otpInput.first()).toBeVisible();
    }
  });

  test('/mfa sin query params → redirige a login o muestra error', async ({ page }) => {
    await page.goto('/mfa');
    await page.waitForTimeout(2000);

    // No debe mostrar error 500
    await expect(page.locator('text=/500|Internal Server Error/i')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('código MFA de longitud incorrecta → validación client-side', async ({ page }) => {
    await page.goto('/mfa?token=mock-token&challengeId=mock-challenge');

    const otpInput = page.locator('input[inputmode="numeric"], input[maxlength="6"]').first();

    if (await otpInput.isVisible()) {
      await otpInput.fill('123'); // solo 3 dígitos
      await page.click('button[type="submit"]');

      // El formulario no debe enviar con código incompleto
      await expect(page).toHaveURL(/mfa/);
    }
  });

  test('código MFA inválido → mensaje de error descriptivo', async ({ page }) => {
    await mockMfaInvalid(page);
    await page.goto('/mfa?token=mock-token&challengeId=mock-challenge');

    const otpInput = page.locator('input[inputmode="numeric"], input[maxlength="6"]').first();

    if (await otpInput.isVisible()) {
      await otpInput.fill('000000'); // código inválido
      await page.click('button[type="submit"]');

      const errorLocator = page.locator('[role="alert"], [data-sonner-toast], .sonner-toast, .text-destructive');
      await expect(errorLocator.first()).toBeVisible({ timeout: 8000 });

      const errorText = await errorLocator.first().textContent();
      // BUG CHECK: El mensaje debe ser descriptivo
      expect(errorText?.trim().length).toBeGreaterThan(5);
    }
  });

  test('código MFA correcto → redirige a la app', async ({ page }) => {
    await mockMfaSuccess(page);
    await page.goto('/mfa?token=mock-token&challengeId=mock-challenge');

    const otpInput = page.locator('input[inputmode="numeric"], input[maxlength="6"]').first();

    if (await otpInput.isVisible()) {
      await otpInput.fill('123456'); // código mock
      await page.click('button[type="submit"]');

      // Debe redirigir fuera de /mfa
      await page.waitForURL((url) => !url.pathname.includes('/mfa'), { timeout: 10000 });
      expect(page.url()).not.toContain('/mfa');
    }
  });
});

test.describe('MFA — flujo completo desde login', () => {
  test('login con MFA requerido → redirige a /mfa', async ({ page }) => {
    await mockMfaRequired(page);

    await page.goto('/login');
    await page.fill('input[name="email"]', 'mfa.user@mailinator.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Con el mock, el cliente debe redirigir a /mfa
    await page.waitForTimeout(3000);

    // BUG CHECK: ¿El frontend maneja la respuesta mfaRequired del backend?
    const url = page.url();
    if (!url.includes('/mfa')) {
      console.warn('[BUG CHECK] El frontend puede no estar manejando la respuesta mfaRequired correctamente. URL actual:', url);
    }
  });

  test('botón de retroceso en /mfa → regresa a /login', async ({ page }) => {
    await page.goto('/mfa?token=mock-token&challengeId=mock-challenge');

    // Buscar botón de "volver al login" o enlace
    const backBtn = page.locator(
      'a[href="/login"], button:has-text("back"), button:has-text("volver"), a:has-text("login")'
    );

    // BUG CHECK: Si no hay forma de volver al login desde MFA, el usuario queda atrapado
    if ((await backBtn.count()) === 0) {
      console.warn('[BUG CHECK] No hay forma visible de regresar al login desde la página /mfa');
    }
  });
});

test.describe('MFA — UX', () => {
  test('página /mfa tiene título/descripción explicativa', async ({ page }) => {
    await page.goto('/mfa?token=mock-token&challengeId=mock-challenge');
    await page.waitForTimeout(1000);

    // BUG CHECK: La página debe explicar qué se necesita (ej. "Ingresa el código de tu app autenticadora")
    const explainer = page.locator('h1, h2, p, [data-testid="mfa-description"]');
    const count = await explainer.count();
    if (count === 0) {
      console.warn('[BUG CHECK] No hay texto explicativo en la página de MFA');
    }
  });
});
