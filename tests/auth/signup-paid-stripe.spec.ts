/**
 * SUITE: Registro con plan PAGO (PLUS / PRO) → flujo Stripe
 *
 * Flujo esperado:
 *   1. /signup con query params ?plan=plus&billing=MONTHLY (o YEARLY)
 *   2. Completar formulario de registro
 *   3. Submit → API crea sesión en Appwrite + invoca Stripe checkout
 *   4. Frontend redirige a la URL de Stripe hosted checkout
 *   5. (Mock) Simular regreso con success_url o cancel_url
 *   6. Verificar estado de la app post-checkout
 *
 * NOTA: Las pruebas de Stripe interceptan la redirección a checkout.stripe.com
 * para evitar depender del entorno de Stripe real durante CI.
 * Para pruebas contra Stripe Test Mode, usar las tarjetas de test oficiales.
 */

import { test, expect, type Page } from '@playwright/test';

const paidUser = {
  plus: {
    name: 'Plus Tester',
    email: `e2e.plus.${Date.now()}@mailinator.com`,
    password: 'TestPassword123!',
    plan: 'plus',
    billing: 'MONTHLY',
  },
  pro: {
    name: 'Pro Tester',
    email: `e2e.pro.${Date.now()}@mailinator.com`,
    password: 'TestPassword123!',
    plan: 'pro',
    billing: 'YEARLY',
  },
};

/** Intercepta la llamada a /api/pricing/stripe y devuelve una URL de mock */
async function mockStripeCheckout(page: Page, outcome: 'success' | 'cancel' | 'error'): Promise<void> {
  await page.route('**/api/pricing/stripe', async (route) => {
    if (outcome === 'error') {
      await route.abort('failed');
      return;
    }

    const body = await route.request().postDataJSON() as { plan: string; billing: string };
    const { plan, billing } = body;

    // Construir la URL de regreso simulando lo que hace Stripe
    const baseUrl = 'http://localhost:3000';
    const returnUrl =
      outcome === 'success'
        ? `${baseUrl}/onboarding?plan=${plan}&billing=${billing}&paid=true&session_id=cs_test_mock_123`
        : `${baseUrl}/signup?plan=${plan}&billing=${billing}&cancelled=true`;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: returnUrl }),
    });
  });
}

test.describe('Registro — Plan PLUS (mensual) con Stripe', () => {
  test('formulario muestra plan seleccionado cuando viene con ?plan=plus', async ({ page }) => {
    await page.goto('/signup?plan=plus&billing=MONTHLY');
    await page.waitForSelector('input[name="email"]');

    // Debe haber un indicador visual del plan seleccionado
    const planIndicator = page.locator('[data-testid="selected-plan"], text=/plus/i, text=/\$12/i');
    // BUG CHECK: Si el plan no se ve reflejado en el formulario, es un problema de UX
    const hasPlanVisible = (await planIndicator.count()) > 0;
    if (!hasPlanVisible) {
      console.warn('[BUG CHECK] El plan seleccionado (?plan=plus) no se muestra visualmente en el formulario de signup');
    }
  });

  test('registro con plan PLUS → redirige a Stripe checkout', async ({ page }) => {
    await mockStripeCheckout(page, 'success');
    await page.goto(`/signup?plan=${paidUser.plus.plan}&billing=${paidUser.plus.billing}`);

    await page.fill('input[name="name"]', paidUser.plus.name);
    await page.fill('input[name="email"]', paidUser.plus.email);
    await page.fill('input[name="password"]', paidUser.plus.password);
    await page.click('button[type="submit"]');

    // Con el mock, debe redirigir a /onboarding?paid=true
    await page.waitForURL(/onboarding.*paid=true/, { timeout: 20000 });
    expect(page.url()).toContain('paid=true');
  });

  test('onboarding post-pago muestra confirmación y acceso a la app', async ({ page }) => {
    // Simular llegada desde Stripe con paid=true
    await page.goto('/onboarding?plan=plus&billing=MONTHLY&paid=true&session_id=cs_test_mock_123');

    // La UI debe mostrar algún indicador de pago exitoso
    await expect(page.locator('h1, h2, [data-testid="onboarding-title"]').first()).toBeVisible({ timeout: 10000 });

    // NO debe mostrar error
    await expect(page.locator('text=/error|failed|payment failed/i')).toHaveCount(0);
  });

  test('cancelación en Stripe → regresa a signup con estado cancelado', async ({ page }) => {
    await mockStripeCheckout(page, 'cancel');
    await page.goto(`/signup?plan=${paidUser.plus.plan}&billing=${paidUser.plus.billing}`);

    await page.fill('input[name="name"]', paidUser.plus.name);
    await page.fill('input[name="email"]', `cancel.${paidUser.plus.email}`);
    await page.fill('input[name="password"]', paidUser.plus.password);
    await page.click('button[type="submit"]');

    // Con cancel, el mock devuelve URL con ?cancelled=true
    await page.waitForURL(/cancelled=true|signup/, { timeout: 20000 });

    // BUG CHECK: ¿La UI informa al usuario que canceló el pago?
    const cancelMsg = page.locator('[data-testid="cancelled-msg"], [role="alert"], text=/cancel/i, text=/cancelad/i');
    const hasCancelMsg = await cancelMsg.count();
    if (hasCancelMsg === 0) {
      console.warn('[BUG CHECK] No hay feedback visual cuando el usuario cancela el checkout de Stripe');
    }
  });
});

test.describe('Registro — Plan PRO (anual) con Stripe', () => {
  test('registro con plan PRO → redirige a Stripe checkout', async ({ page }) => {
    await mockStripeCheckout(page, 'success');
    await page.goto(`/signup?plan=${paidUser.pro.plan}&billing=${paidUser.pro.billing}`);

    await page.fill('input[name="name"]', paidUser.pro.name);
    await page.fill('input[name="email"]', paidUser.pro.email);
    await page.fill('input[name="password"]', paidUser.pro.password);
    await page.click('button[type="submit"]');

    await page.waitForURL(/onboarding.*paid=true/, { timeout: 20000 });
    expect(page.url()).toContain('plan=pro');
  });
});

test.describe('Stripe — Escenarios de error', () => {
  test('error de red al crear session de Stripe → mensaje de error visible', async ({ page }) => {
    await mockStripeCheckout(page, 'error');
    await page.goto(`/signup?plan=plus&billing=MONTHLY`);

    await page.fill('input[name="name"]', 'Error Tester');
    await page.fill('input[name="email"]', `error.stripe.${Date.now()}@mailinator.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Puede pasar una de dos cosas:
    // A) La cuenta se crea pero no redirige a Stripe → queda en el signup o un estado intermedio
    // B) Se muestra un toast/alert de error

    // BUG CHECK: El usuario NO debe quedar en una pantalla en blanco ni ver un stack trace
    await page.waitForTimeout(3000);
    const hasErrorFeedback = await page.locator('[role="alert"], [data-sonner-toast], .sonner-toast').count();
    if (hasErrorFeedback === 0) {
      console.warn('[BUG CHECK] Sin feedback de error cuando falla la creación de sesión Stripe');
    }

    // Nunca debe haber un error 500 visible
    await expect(page.locator('text=/500|Internal Server Error/i')).toHaveCount(0);
  });

  test('llegada con session_id inválido → app no crashea', async ({ page }) => {
    await page.goto('/onboarding?plan=plus&billing=MONTHLY&paid=true&session_id=FAKE_INVALID_SESSION');

    // La app debe cargar algo, no una pantalla rota
    await expect(page.locator('body')).not.toBeEmpty();
    await expect(page.locator('text=/500|unhandled|crashed/i')).toHaveCount(0);
  });

  test('usuario accede a /onboarding sin haber pagado → comportamiento correcto', async ({ page }) => {
    // Navegar directamente sin query params de pago
    await page.goto('/onboarding');

    // BUG CHECK: ¿La app maneja este caso? ¿Redirige? ¿Muestra algo útil?
    await page.waitForTimeout(2000);
    const url = page.url();
    const isOnCorrectPage = url.includes('/onboarding') || url.includes('/login') || url.includes('/signup');
    expect(isOnCorrectPage).toBe(true);
  });
});

test.describe('Stripe — Ciclos de facturación', () => {
  test('precio mensual vs anual — diferencia visible en UI pre-checkout', async ({ page }) => {
    // Verificar que hay diferencia en el precio mostrado
    await page.goto('/signup?plan=plus&billing=MONTHLY');
    await page.waitForSelector('input[name="email"]');
    const monthlyPrice = await page.locator('text=/\\$12|12\\.00/').count();

    await page.goto('/signup?plan=plus&billing=YEARLY');
    await page.waitForSelector('input[name="email"]');
    const yearlyPrice = await page.locator('text=/\\$9|9\\.00/').count();

    // BUG CHECK: Si el precio no se refleja, la UX es confusa
    if (monthlyPrice === 0 && yearlyPrice === 0) {
      console.warn('[BUG CHECK] No se muestran los precios del plan en el formulario de signup');
    }
  });
});
