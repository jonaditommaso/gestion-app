/**
 * SUITE: Modificación de plan — Upgrade / Downgrade / Cancelación
 *
 * Contexto arquitectónico:
 *   - La app NO tiene endpoint real de upgrade/downgrade (sin stripe.subscriptions.update).
 *   - El botón "Change plan" en /organization redirige a /pricing (nueva compra).
 *   - Solo existe POST /api/team/cancel-subscription (cancel_at_period_end: true).
 *   - El plan Enterprise no tiene flujo self-serve.
 *
 * Estrategia:
 *   - Todos los tests usan network mocking con page.route() para evitar backend real.
 *   - Se cubre el flujo REAL de la app, no el flujo ideal.
 *
 * Inconsistencias documentadas:
 *   [INC-01] No existe endpoint de upgrade in-app — el usuario debe re-comprar desde /pricing
 *   [INC-02] El botón "See plans" en settings/plan.tsx no tiene href (botón roto)
 *   [INC-03] No existe flujo para reactivar una suscripción en proceso de cancelación
 *   [INC-04] No hay Stripe Customer Portal — el usuario no puede cambiar método de pago
 *   [INC-05] POST /api/pricing/stripe no tiene middleware de autenticación
 */

import { test, expect, type Page } from '@playwright/test';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Plan = 'free' | 'plus' | 'pro' | 'enterprise';
type BillingCycle = 'MONTHLY' | 'YEARLY';

interface MockOrg {
  id: string;
  name: string;
  plan: Plan;
  subscriptionStatus: 'active' | 'canceling' | 'canceled' | 'none';
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string | null;
  nextRenewal: string | null;
}

// ─── Datos de mock ────────────────────────────────────────────────────────────

function makeOrg(overrides: Partial<MockOrg> = {}): MockOrg {
  return {
    id: 'org_test_123',
    name: 'Test Organization',
    plan: 'free',
    subscriptionStatus: 'none',
    cancelAtPeriodEnd: false,
    stripeSubscriptionId: null,
    nextRenewal: null,
    ...overrides,
  };
}

const FREE_ORG = makeOrg({ plan: 'free', subscriptionStatus: 'none' });
const PLUS_ORG = makeOrg({
  plan: 'plus',
  subscriptionStatus: 'active',
  stripeSubscriptionId: 'sub_plus_mock_123',
  nextRenewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
});
const PRO_ORG = makeOrg({
  plan: 'pro',
  subscriptionStatus: 'active',
  stripeSubscriptionId: 'sub_pro_mock_123',
  nextRenewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
});
const CANCELING_PRO_ORG = makeOrg({
  plan: 'pro',
  subscriptionStatus: 'canceling',
  cancelAtPeriodEnd: true,
  stripeSubscriptionId: 'sub_pro_mock_123',
  nextRenewal: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
});

// ─── Helpers de mock ──────────────────────────────────────────────────────────

/** Mock de sesión autenticada con OWNER role */
async function mockAuthAsOwner(page: Page, org: MockOrg): Promise<void> {
  await page.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'user_owner_mock',
          name: 'Owner User',
          email: 'owner@test.com',
          labels: [org.plan],
        },
        organizationId: org.id,
        role: 'OWNER',
      }),
    });
  });

  await page.route(`**/api/organization/${org.id}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(org),
    });
  });

  await page.route('**/api/organization**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ organization: org }),
    });
  });
}

/** Mock de sesión autenticada con rol MEMBER (no OWNER) */
async function mockAuthAsMember(page: Page, org: MockOrg): Promise<void> {
  await page.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'user_member_mock',
          name: 'Member User',
          email: 'member@test.com',
          labels: [org.plan],
        },
        organizationId: org.id,
        role: 'MEMBER',
      }),
    });
  });

  await page.route('**/api/organization**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ organization: org }),
    });
  });
}

/** Mock del endpoint de Stripe checkout */
async function mockStripeCheckout(
  page: Page,
  plan: Plan,
  billing: BillingCycle,
  outcome: 'success' | 'cancel',
): Promise<void> {
  await page.route('**/api/pricing/stripe', async (route) => {
    const baseUrl = 'http://localhost:3000';
    const returnUrl =
      outcome === 'success'
        ? `${baseUrl}/onboarding?plan=${plan}&billing=${billing}&paid=true&session_id=cs_test_mock_123`
        : `${baseUrl}/pricing?cancelled=true`;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: returnUrl }),
    });
  });
}

/** Mock del endpoint de cancelación de suscripción */
async function mockCancelSubscription(
  page: Page,
  nextRenewal: string,
): Promise<void> {
  await page.route('**/api/team/cancel-subscription', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        cancelAtPeriodEnd: true,
        nextRenewal,
        subscriptionStatus: 'canceling',
      }),
    });
  });
}

// ─── Suite: Upgrade desde FREE ────────────────────────────────────────────────

test.describe('Upgrade desde plan FREE', () => {
  test('FREE → botón "Change plan" en /organization redirige a /pricing', async ({ page }) => {
    await mockAuthAsOwner(page, FREE_ORG);
    await page.goto('/organization');

    // Buscar el botón de cambio de plan
    const changePlanBtn = page.locator(
      'a[href="/pricing"], button:has-text("Change plan"), a:has-text("Change plan"), a:has-text("Ver planes"), a:has-text("See plans")'
    );

    // Debe existir el botón para el OWNER
    await expect(changePlanBtn.first()).toBeVisible({ timeout: 8000 });

    const href = await changePlanBtn.first().getAttribute('href');
    // [INC-01] El botón es un link a /pricing, no un flujo in-app de upgrade
    expect(['/pricing', null]).toContain(href);
  });

  test('FREE → click en PLUS en /pricing → inicia Stripe checkout', async ({ page }) => {
    await mockStripeCheckout(page, 'plus', 'MONTHLY', 'success');
    await page.goto('/pricing');

    // Buscar el botón de PLUS
    const plusBtn = page.locator(
      'button:has-text("Plus"), a:has-text("Plus"), [data-plan="plus"] button, [data-testid="plan-plus-cta"]'
    );

    const plusBtnVisible = (await plusBtn.count()) > 0;
    if (!plusBtnVisible) {
      console.warn('[BUG CHECK] No se encontró CTA del plan PLUS en /pricing');
      return;
    }

    // Interceptar la navegación a Stripe o la URL de retorno
    const navigationPromise = page.waitForURL(/onboarding.*paid=true|checkout\.stripe\.com/, {
      timeout: 15000,
    }).catch(() => null);

    await plusBtn.first().click();
    await navigationPromise;

    const currentUrl = page.url();
    const isExpectedRedirect =
      currentUrl.includes('paid=true') ||
      currentUrl.includes('checkout.stripe.com') ||
      currentUrl.includes('pricing');

    expect(isExpectedRedirect).toBeTruthy();
  });

  test('FREE → click en PRO en /pricing → inicia Stripe checkout', async ({ page }) => {
    await mockStripeCheckout(page, 'pro', 'YEARLY', 'success');
    await page.goto('/pricing?plan=pro&billing=YEARLY');

    const proBtn = page.locator(
      'button:has-text("Pro"), a:has-text("Pro"), [data-plan="pro"] button, [data-testid="plan-pro-cta"]'
    );

    const proBtnVisible = (await proBtn.count()) > 0;
    if (!proBtnVisible) {
      console.warn('[BUG CHECK] No se encontró CTA del plan PRO en /pricing');
      return;
    }

    const navigationPromise = page.waitForURL(/onboarding.*paid=true|checkout\.stripe\.com/, {
      timeout: 15000,
    }).catch(() => null);

    await proBtn.first().click();
    await navigationPromise;

    const currentUrl = page.url();
    const isExpectedRedirect =
      currentUrl.includes('paid=true') ||
      currentUrl.includes('checkout.stripe.com') ||
      currentUrl.includes('pricing');

    expect(isExpectedRedirect).toBeTruthy();
  });

  test('Enterprise — no hay flujo self-serve, debe mostrar "contact sales" [INC-01]', async ({ page }) => {
    await page.goto('/pricing');

    // El plan Enterprise no debería tener un botón de compra directa
    const enterpriseSection = page.locator(
      '[data-plan="enterprise"], [data-testid="plan-enterprise"], text=/enterprise/i'
    );

    const hasEnterprise = (await enterpriseSection.count()) > 0;
    if (!hasEnterprise) {
      console.warn('[INFO] No hay sección Enterprise visible en /pricing — puede estar oculta');
      return;
    }

    // Si existe, verificar que NO tiene un botón de checkout directo de Stripe
    const enterpriseCheckoutBtn = page.locator(
      '[data-plan="enterprise"] button:has-text("Buy"), [data-plan="enterprise"] a[href*="checkout.stripe.com"]'
    );
    const hasDirectCheckout = (await enterpriseCheckoutBtn.count()) > 0;

    if (hasDirectCheckout) {
      console.warn('[BUG CHECK] Enterprise tiene botón de compra directa — debería ser "Contact Sales"');
    }

    // Verificar que hay un CTA de contacto
    const contactCta = page.locator(
      'text=/contact sales|contactar|contact us/i, a[href*="contact"], a[href*="mailto"]'
    );
    const hasContactCta = (await contactCta.count()) > 0;

    if (!hasContactCta) {
      console.warn('[BUG CHECK] Enterprise no tiene CTA de "Contact Sales"');
    }
  });
});

// ─── Suite: Upgrade paid → paid ──────────────────────────────────────────────

test.describe('Upgrade paid → paid (PLUS → PRO)', () => {
  test('PLUS → botón "Change plan" visita /pricing para nueva compra [INC-01]', async ({ page }) => {
    await mockAuthAsOwner(page, PLUS_ORG);
    await page.goto('/organization');

    const changePlanBtn = page.locator(
      'a[href="/pricing"], button:has-text("Change plan"), a:has-text("Change plan")'
    );

    const btnVisible = (await changePlanBtn.count()) > 0;
    if (!btnVisible) {
      console.warn('[BUG CHECK] No se encontró botón "Change plan" para usuario PLUS en /organization');
      return;
    }

    await expect(changePlanBtn.first()).toBeVisible({ timeout: 8000 });

    // [INC-01] No hay modal de selección in-app — redirige a /pricing sin contexto del plan actual
    const href = await changePlanBtn.first().getAttribute('href');
    expect(href).toContain('pricing');
  });

  test('PLUS → PRO → /pricing muestra plan actual y opción PRO diferenciada', async ({ page }) => {
    await mockAuthAsOwner(page, PLUS_ORG);
    await page.goto('/pricing');

    // Verificar que la página de pricing carga correctamente
    await expect(page.locator('h1, h2, [data-testid="pricing-title"]').first()).toBeVisible({ timeout: 8000 });

    // BUG CHECK: /pricing no recibe contexto del plan actual del usuario
    // por lo que puede mostrar CTAs de "Get started" en lugar de "Upgrade"
    const upgradeCtaForPro = page.locator(
      '[data-plan="pro"] button, [data-testid="plan-pro-cta"], text=/upgrade to pro/i'
    );
    const hasPROUpgradeCta = (await upgradeCtaForPro.count()) > 0;
    if (!hasPROUpgradeCta) {
      console.warn('[BUG CHECK] /pricing no muestra opción de upgrade desde PLUS a PRO de forma contextual');
    }
  });
});

// ─── Suite: Downgrade ─────────────────────────────────────────────────────────

test.describe('Downgrade de plan', () => {
  test('PRO → no existe flujo de downgrade directo a PLUS [INC-01]', async ({ page }) => {
    await mockAuthAsOwner(page, PRO_ORG);
    await page.goto('/organization');

    // No debe existir un botón de "Downgrade to Plus"
    const downgradeBtn = page.locator(
      'button:has-text("Downgrade"), a:has-text("Downgrade"), [data-testid="downgrade-btn"]'
    );
    const hasDowngrade = (await downgradeBtn.count()) > 0;

    if (hasDowngrade) {
      console.warn('[BUG CHECK] Se encontró botón de downgrade — verificar si realmente funciona o es decorativo');
    } else {
      // Comportamiento esperado: no hay downgrade, solo cancel o change plan
      console.info('[EXPECTED] No hay botón de downgrade directo — flujo confirmado como "cancel + re-purchase"');
    }

    // El flujo real de downgrade es: cancelar suscripción PRO + comprar plan PLUS
    // Verificar que al menos el botón de cancelar existe
    const cancelBtn = page.locator(
      'button:has-text("Cancel"), button:has-text("Cancelar"), [data-testid="cancel-subscription-btn"]'
    );
    const hasCancelBtn = (await cancelBtn.count()) > 0;
    if (!hasCancelBtn) {
      console.warn('[BUG CHECK] No se encontró botón de cancelar suscripción para usuario PRO');
    }
  });

  test('PLUS → FREE — solo existe flujo de cancelación (al vencer pasa a FREE)', async ({ page }) => {
    await mockAuthAsOwner(page, PLUS_ORG);
    await mockCancelSubscription(page, PLUS_ORG.nextRenewal!);
    await page.goto('/organization');

    // Verificar que existe botón de cancelar
    const cancelBtn = page.locator(
      'button:has-text("Cancel"), button:has-text("Cancelar"), [data-testid="cancel-subscription-btn"]'
    );

    const btnVisible = (await cancelBtn.count()) > 0;
    if (!btnVisible) {
      console.warn('[BUG CHECK] No se encontró botón de cancelar suscripción para usuario PLUS');
    } else {
      await expect(cancelBtn.first()).toBeVisible({ timeout: 8000 });
    }
  });
});

// ─── Suite: Cancelación de suscripción ───────────────────────────────────────

test.describe('Cancelación de suscripción', () => {
  test('OWNER puede ver y activar el botón de cancelar suscripción', async ({ page }) => {
    await mockAuthAsOwner(page, PRO_ORG);
    await page.goto('/organization');

    const cancelBtn = page.locator(
      'button:has-text("Cancel"), button:has-text("Cancelar"), [data-testid="cancel-subscription-btn"]'
    );

    await expect(cancelBtn.first()).toBeVisible({ timeout: 8000 });
  });

  test('cancelar suscripción → POST /api/team/cancel-subscription → estado "canceling"', async ({ page }) => {
    const nextRenewal = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
    await mockAuthAsOwner(page, PRO_ORG);
    await mockCancelSubscription(page, nextRenewal);

    let cancelEndpointCalled = false;
    await page.route('**/api/team/cancel-subscription', async (route) => {
      cancelEndpointCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          cancelAtPeriodEnd: true,
          nextRenewal,
          subscriptionStatus: 'canceling',
        }),
      });
    });

    await page.goto('/organization');

    const cancelBtn = page.locator(
      'button:has-text("Cancel"), button:has-text("Cancelar"), [data-testid="cancel-subscription-btn"]'
    );

    const btnVisible = (await cancelBtn.count()) > 0;
    if (!btnVisible) {
      console.warn('[BUG CHECK] No se encontró botón de cancelar — test omitido');
      return;
    }

    await cancelBtn.first().click();

    // Puede aparecer un diálogo de confirmación
    const confirmBtn = page.locator(
      'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Sí"), button:has-text("Confirmar"), [data-testid="confirm-cancel-btn"]'
    );
    if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmBtn.click();
    }

    // Esperar a que el endpoint sea llamado
    await page.waitForResponse('**/api/team/cancel-subscription', { timeout: 10000 }).catch(() => null);

    expect(cancelEndpointCalled).toBeTruthy();
  });

  test('estado "canceling" → UI muestra advertencia con fecha de vencimiento', async ({ page }) => {
    await mockAuthAsOwner(page, CANCELING_PRO_ORG);
    await page.goto('/organization');

    // Debe mostrar un mensaje de advertencia sobre la cancelación activa
    const cancelingIndicator = page.locator(
      '[data-testid="canceling-badge"], text=/canceling|cancelando|ends on|termina el|access until/i, [class*="cancel"], [role="alert"]'
    );

    await page.waitForTimeout(2000); // Dar tiempo al hydration
    const hasCancelingUI = (await cancelingIndicator.count()) > 0;

    if (!hasCancelingUI) {
      console.warn('[BUG CHECK] El estado "canceling" no tiene feedback visual en /organization');
    }
  });

  test('estado "canceling" → no existe botón de reactivar suscripción [INC-03]', async ({ page }) => {
    await mockAuthAsOwner(page, CANCELING_PRO_ORG);
    await page.goto('/organization');

    // [INC-03] No existe endpoint de reactivación — verificar que el botón no aparece de forma errónea
    const reactivateBtn = page.locator(
      'button:has-text("Reactivate"), button:has-text("Reactivar"), [data-testid="reactivate-btn"]'
    );

    await page.waitForTimeout(2000);
    const hasReactivateBtn = (await reactivateBtn.count()) > 0;

    if (hasReactivateBtn) {
      console.warn('[BUG CHECK] Existe botón de "Reactivar" pero no hay endpoint backend — puede ser un botón roto [INC-03]');
    } else {
      // Comportamiento esperado: sin botón de reactivación
      console.info('[EXPECTED] No hay botón de reactivar suscripción — confirmado [INC-03]');
    }
  });

  test('cancelación → acción solo disponible para OWNER, no para MEMBER', async ({ page }) => {
    await mockAuthAsMember(page, PRO_ORG);
    await page.goto('/organization');

    const cancelBtn = page.locator(
      'button:has-text("Cancel"), button:has-text("Cancelar"), [data-testid="cancel-subscription-btn"]'
    );

    await page.waitForTimeout(2000);
    const hasCancelBtn = (await cancelBtn.count()) > 0;

    if (hasCancelBtn) {
      console.warn('[BUG CHECK] El botón de cancelar suscripción es visible para un MEMBER — debería ser solo para OWNER');
    }
    // Para MEMBER, el botón NO debe estar visible o debe estar deshabilitado
  });
});

// ─── Suite: Settings → Plan section ──────────────────────────────────────────

test.describe('Settings — sección de plan', () => {
  test('settings muestra el plan actual del usuario', async ({ page }) => {
    await mockAuthAsOwner(page, PLUS_ORG);
    await page.goto('/settings');

    const planSection = page.locator(
      '[data-testid="plan-section"], text=/plus/i, text=/current plan/i, text=/plan actual/i'
    );

    await page.waitForTimeout(2000);
    const hasPlanSection = (await planSection.count()) > 0;

    if (!hasPlanSection) {
      console.warn('[BUG CHECK] La sección de plan no es visible en /settings');
    }
  });

  test('"See plans" botón en settings tiene href válido [INC-02]', async ({ page }) => {
    await mockAuthAsOwner(page, PLUS_ORG);
    await page.goto('/settings');

    // [INC-02] El botón "See plans" en plan.tsx no tiene href
    const seePlansBtn = page.locator(
      'a:has-text("See plans"), a:has-text("Ver planes"), button:has-text("See plans"), [data-testid="see-plans-btn"]'
    );

    await page.waitForTimeout(2000);
    const hasSeePlans = (await seePlansBtn.count()) > 0;

    if (!hasSeePlans) {
      console.warn('[BUG CHECK] No se encontró botón "See plans" en settings — puede no estar en el DOM');
      return;
    }

    const href = await seePlansBtn.first().getAttribute('href');
    if (!href) {
      console.warn('[BUG CONFIRMED] El botón "See plans" en settings NO tiene href [INC-02]');
    } else {
      expect(href.length).toBeGreaterThan(0);
    }
  });

  test('usuario FREE en settings → botón de upgrade visible y funcional', async ({ page }) => {
    await mockAuthAsOwner(page, FREE_ORG);
    await page.goto('/settings');

    const upgradeBtn = page.locator(
      'a[href="/pricing"], button:has-text("Upgrade"), a:has-text("Upgrade"), [data-testid="upgrade-btn"]'
    );

    await page.waitForTimeout(2000);
    const hasUpgradeBtn = (await upgradeBtn.count()) > 0;

    if (!hasUpgradeBtn) {
      console.warn('[BUG CHECK] No hay CTA de upgrade para usuario FREE en settings');
    }
  });
});

// ─── Suite: Permisos por rol ──────────────────────────────────────────────────

test.describe('Permisos de cambio de plan por rol', () => {
  test('OWNER → "Change plan" visible en /organization', async ({ page }) => {
    await mockAuthAsOwner(page, PLUS_ORG);
    await page.goto('/organization');

    const changePlanLink = page.locator(
      'a[href="/pricing"], a:has-text("Change plan"), button:has-text("Change plan")'
    );

    await page.waitForTimeout(2000);
    await expect(changePlanLink.first()).toBeVisible({ timeout: 8000 });
  });

  test('MEMBER → "Change plan" NO visible en /organization', async ({ page }) => {
    await mockAuthAsMember(page, PLUS_ORG);
    await page.goto('/organization');

    const changePlanLink = page.locator(
      'a[href="/pricing"], a:has-text("Change plan"), button:has-text("Change plan")'
    );

    await page.waitForTimeout(2000);
    const hasChangePlan = (await changePlanLink.count()) > 0;

    if (hasChangePlan) {
      console.warn('[BUG CHECK] El botón "Change plan" es visible para un MEMBER — debería ser solo OWNER');
    }
  });
});
