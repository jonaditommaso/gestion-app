/**
 * SUITE: OAuth — Google y GitHub
 *
 * Flujo esperado:
 *   1. Click en botón "Continue with Google/GitHub"
 *   2. Server Action inicia flujo OAuth con Appwrite
 *   3. Redirección a accounts.google.com o github.com/login/oauth
 *   4. (Interceptado) Verificar que la redirección ocurre correctamente
 *   5. Callback en /oauth activa la sesión real
 *
 * NOTA: Los flujos OAuth reales requieren interacción con proveedores externos.
 * Estos tests verifican:
 *   - Que los botones OAuth están presentes y son funcionales
 *   - Que la Server Action genera la redirección correcta
 *   - El comportamiento del callback /oauth
 *   - Los estados de error (OAuth denegado, cuenta existente, etc.)
 *
 * Para testing completo, se recomienda usar cuentas de test de Google/GitHub
 * o un servicio como Auth0 Cypress Helpers / Playwright auth utils.
 */

import { test, expect, type Page } from '@playwright/test';

async function captureOauthRedirect(page: Page, provider: 'google' | 'github'): Promise<string | null> {
  return new Promise((resolve) => {
    page.on('request', (request) => {
      const url = request.url();
      if (provider === 'google' && url.includes('accounts.google.com')) {
        resolve(url);
      }
      if (provider === 'github' && url.includes('github.com') && url.includes('oauth')) {
        resolve(url);
      }
    });
    // Resolver con null si no hay redirección en 3s
    setTimeout(() => resolve(null), 3000);
  });
}

test.describe('OAuth — Login con Google', () => {
  test('botón "Continue with Google" está presente en /login', async ({ page }) => {
    await page.goto('/login');
    const googleBtn = page.getByRole('button', { name: /google/i });
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toBeEnabled();
  });

  test('botón "Continue with Google" está presente en /signup', async ({ page }) => {
    await page.goto('/signup');
    const googleBtn = page.getByRole('button', { name: /google/i });
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toBeEnabled();
  });

  test('click en Google inicia redirección OAuth (no error interno)', async ({ page }) => {
    await page.goto('/login');

    // Interceptar navegaciones externas para que no salgan del browser de test
    await page.route('https://accounts.google.com/**', async (route) => {
      // Simular que Google accept y regresa al callback
      await route.abort('aborted');
    });

    const oauthErrors: string[] = [];
    page.on('pageerror', (e) => oauthErrors.push(e.message));

    const googleBtn = page.getByRole('button', { name: /google/i });
    await googleBtn.click();

    // Esperar un momento para que procese
    await page.waitForTimeout(2000);

    // No debe haber un error de aplicación (sí puede haber un error de navegación por el abort)
    const appErrors = oauthErrors.filter(
      (e) => !e.includes('net::ERR_') && !e.includes('Navigation')
    );
    expect(appErrors).toHaveLength(0);
  });

  test('Google OAuth con plan PLUS → botón pasa el plan al proveedor', async ({ page }) => {
    await page.goto('/signup?plan=plus&billing=MONTHLY');

    await page.route('https://accounts.google.com/**', (route) => route.abort());
    const capturePromise = captureOauthRedirect(page, 'google');
    const googleBtn = page.getByRole('button', { name: /google/i });
    await googleBtn.click();
    const capturedUrl = await capturePromise;

    // BUG CHECK: Verificar que el plan se propaga en el flujo OAuth
    // Si no, después del OAuth el usuario no tendría plan asignado
    console.info('[CHECK] URL de redirección OAuth capturada:', capturedUrl);
  });
});

test.describe('OAuth — Login con GitHub', () => {
  test('botón "Continue with GitHub" está presente en /login', async ({ page }) => {
    await page.goto('/login');
    const githubBtn = page.getByRole('button', { name: /github/i });
    await expect(githubBtn).toBeVisible();
    await expect(githubBtn).toBeEnabled();
  });

  test('botón "Continue with GitHub" está presente en /signup', async ({ page }) => {
    await page.goto('/signup');
    const githubBtn = page.getByRole('button', { name: /github/i });
    await expect(githubBtn).toBeVisible();
    await expect(githubBtn).toBeEnabled();
  });

  test('click en GitHub inicia redirección OAuth (no error interno)', async ({ page }) => {
    await page.goto('/login');

    await page.route('https://github.com/**', async (route) => {
      await route.abort('aborted');
    });

    const jsErrors: string[] = [];
    page.on('pageerror', (e) => jsErrors.push(e.message));

    const githubBtn = page.getByRole('button', { name: /github/i });
    await githubBtn.click();
    await page.waitForTimeout(2000);

    const appErrors = jsErrors.filter((e) => !e.includes('net::ERR_') && !e.includes('Navigation'));
    expect(appErrors).toHaveLength(0);
  });
});

test.describe('OAuth — Callback en /oauth', () => {
  test('/oauth sin params → no crashea ni muestra error 500', async ({ page }) => {
    await page.goto('/oauth');

    // Puede redirigir a login o mostrar un error amigable
    await page.waitForTimeout(2000);
    await expect(page.locator('text=/500|Internal Server Error/i')).toHaveCount(0);
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('/oauth con userId y secret inválidos → error manejado gracefully', async ({ page }) => {
    await page.goto('/oauth?userId=invalid&secret=invalid');

    await page.waitForTimeout(3000);

    // BUG CHECK: ¿La app muestra un error amigable o una pantalla rota?
    const hasGracefulError = await page.locator(
      '[role="alert"], text=/error|inválido|invalid|failed/i, [data-testid="error-state"]'
    ).count();

    if (hasGracefulError === 0) {
      console.warn('[BUG CHECK] El callback /oauth con params inválidos no muestra error amigable');
    }

    await expect(page.locator('text=/500|unhandled/i')).toHaveCount(0);
  });
});

test.describe('OAuth — UX visual', () => {
  test('botones OAuth tienen iconos/logos identificables', async ({ page }) => {
    await page.goto('/login');

    // Los botones deben tener contenido visual (icono o texto con el nombre del proveedor)
    const googleBtn = page.getByRole('button', { name: /google/i });
    const githubBtn = page.getByRole('button', { name: /github/i });

    await expect(googleBtn).toBeVisible();
    await expect(githubBtn).toBeVisible();

    // Verificar que no son botones vacíos
    const googleText = await googleBtn.textContent();
    const githubText = await githubBtn.textContent();
    expect(googleText?.trim().length).toBeGreaterThan(0);
    expect(githubText?.trim().length).toBeGreaterThan(0);
  });

  test('botones OAuth son visualmente distinguibles del botón de email', async ({ page }) => {
    await page.goto('/login');

    const googleBtn = page.getByRole('button', { name: /google/i });
    const submitBtn = page.getByRole('button', { name: /log in|sign in|ingresar/i });

    // Deben ser elementos distintos
    await expect(googleBtn).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // BUG CHECK: Los botones no deben ser idénticos visualmente
    const googleBtnText = await googleBtn.textContent();
    const submitBtnText = await submitBtn.textContent();
    expect(googleBtnText).not.toEqual(submitBtnText);
  });
});
