import type { Page } from '@playwright/test';

// ─── Credenciales de test ───────────────────────────────────────────────────
export const TEST_USER = {
  name: 'Test E2E User',
  email: `e2e.test+${Date.now()}@mailinator.com`,
  password: 'TestPassword123!',
};

export const EXISTING_FREE_USER = {
  email: process.env.TEST_FREE_EMAIL ?? 'e2e.free@mailinator.com',
  password: process.env.TEST_FREE_PASSWORD ?? 'TestPassword123!',
};

export const EXISTING_PAID_USER = {
  email: process.env.TEST_PAID_EMAIL ?? 'e2e.paid@mailinator.com',
  password: process.env.TEST_PAID_PASSWORD ?? 'TestPassword123!',
};

// ─── Helpers de navegación ──────────────────────────────────────────────────

/** Navega a /signup y espera a que el formulario esté visible */
export async function goToSignup(page: Page): Promise<void> {
  await page.goto('/signup');
  await page.waitForSelector('input[name="email"]', { state: 'visible' });
}

/** Navega a /login y espera a que el formulario esté visible */
export async function goToLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForSelector('input[name="email"]', { state: 'visible' });
}

/** Realiza login con email/password y espera redirección */
export async function loginWith(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await goToLogin(page);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
}

/** Espera a que la URL no sea /login ni /signup (redirección post-auth) */
export async function waitForAuthRedirect(page: Page): Promise<void> {
  await page.waitForURL((url) => {
    const p = url.pathname;
    return !p.startsWith('/login') && !p.startsWith('/signup') && !p.startsWith('/mfa');
  }, { timeout: 20000 });
}

/** Realiza logout desde cualquier pantalla */
export async function logout(page: Page): Promise<void> {
  // El UserButton está en la sidebar/navbar
  const userBtn = page.locator('[data-testid="user-button"]').first();
  if (await userBtn.isVisible()) {
    await userBtn.click();
    const logoutBtn = page.getByRole('menuitem', { name: /logout|sign out|cerrar sesión|esci/i });
    await logoutBtn.click();
    await page.waitForURL(/\/(login|signup)/);
  }
}
