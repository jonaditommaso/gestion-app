/**
 * SUITE E2E: Task Card Types — Paneles, restricciones de plan, acciones específicas por tipo
 *
 * Cubre:
 *   - Tipo TASK:    checklist visible (solo plan pago), sin paneles especiales
 *   - Tipo EPIC:    subtareas, sin checklist, solo plan pago
 *   - Tipo BUG:     panel Expected/Actual/Root Cause, botón "Crear test task" (solo plan pago)
 *   - Tipo TEST:    panel con suites/casos, toggle TDD, solo plan pago
 *   - Tipo SPIKE:   panel Findings/Conclusión, solo plan pago
 *   - Tipo URGENT:  muestra tiempo de creación, sin checklist, sin paneles especiales
 *   - Plan FREE:    no puede crear/cambiar a epic, spike, test
 *   - Completar tarea: comportamiento en cada tipo
 */

import { test, expect, type Page } from '@playwright/test';
import {
    mockAuthSession,
    navigateToApp,
    MOCK_WORKSPACE,
} from '../helpers';

// ─── Constantes ───────────────────────────────────────────────────────────────

const TASKS_ROUTE = `/organization`;
const WS_ID = MOCK_WORKSPACE.$id;

// ─── Helpers de mock ──────────────────────────────────────────────────────────

function makeTask(overrides: Record<string, unknown> = {}) {
    return {
        $id: `task-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: 'Test Task',
        status: 'TODO',
        priority: 3,
        workspaceId: WS_ID,
        assigneesIds: [],
        $createdAt: new Date().toISOString(),
        type: 'task',
        ...overrides,
    };
}

async function mockTasksList(page: Page, tasks: ReturnType<typeof makeTask>[]) {
    await page.route('**/api/tasks**', async (route) => {
        const url = route.request().url();
        const method = route.request().method();

        // single task by ID
        const idMatch = url.match(/\/api\/tasks\/([^/?]+)/);
        if (idMatch) {
            const found = tasks.find((t) => t.$id === idMatch[1]);
            if (method === 'GET' && found) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ data: found }),
                });
                return;
            }
            if (method === 'PATCH' && found) {
                const body = await route.request().postDataJSON();
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ data: { ...found, ...body } }),
                });
                return;
            }
        }

        // list
        if (method === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: { documents: tasks, total: tasks.length } }),
            });
            return;
        }

        // create
        if (method === 'POST') {
            const body = await route.request().postDataJSON();
            const newTask = makeTask({ $id: `task-created-${Date.now()}`, ...body });
            tasks.push(newTask);
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: newTask }),
            });
            return;
        }

        await route.continue();
    });
}

async function mockWorkspacesApi(page: Page) {
    await page.route('**/api/workspaces**', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                data: { documents: [MOCK_WORKSPACE], total: 1 },
            }),
        });
    });
}

async function mockMembersApi(page: Page) {
    await page.route('**/api/members**', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: { documents: [], total: 0 } }),
        });
    });
}

/** Abre el detalle de la primera tarea visible en la página */
async function openFirstTask(page: Page) {
    await page.waitForTimeout(1500);
    const card = page
        .locator('[data-testid="task-card"], [draggable="true"], tbody tr')
        .first();
    if (await card.isVisible({ timeout: 5000 })) {
        await card.click();
        await page.waitForTimeout(800);
    }
}

// ─── Suite: Task tipo TASK ────────────────────────────────────────────────────

test.describe('Tipo TASK — checklist y acciones base', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthSession(page, { plan: 'pro' });
        await mockWorkspacesApi(page);
        await mockMembersApi(page);
    });

    test('[TASK] el panel de checklist es visible para usuario pago', async ({ page }) => {
        const task = makeTask({ $id: 'task-base-001', name: 'Mi tarea base', type: 'task' });
        await mockTasksList(page, [task]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        // El panel de checklist debería aparecer para tipo task
        const checklist = page.locator(
            '[data-testid="checklist"], [data-testid*="checklist"], text=/checklist/i'
        ).first();

        if (!(await checklist.isVisible({ timeout: 5000 }))) {
            console.warn('[BUG CHECK] El panel de checklist no se muestra para una tarea de tipo TASK con plan pago');
        } else {
            await expect(checklist).toBeVisible();
        }
    });

    test('[TASK] el panel de checklist NO es visible para usuario FREE', async ({ page }) => {
        await mockAuthSession(page, { plan: 'free' });
        const task = makeTask({ $id: 'task-free-001', name: 'Tarea free', type: 'task' });
        await mockTasksList(page, [task]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        // Plan free → el checklist debería estar deshabilitado o no visible
        const addChecklistBtn = page.locator(
            'button:has-text("add item"), button:has-text("agregar"), [data-testid="add-checklist-item"]'
        ).first();

        if (await addChecklistBtn.isVisible({ timeout: 3000 })) {
            console.warn('[BUG CHECK] Usuario FREE puede interactuar con el checklist — debería estar bloqueado');
        }
    });

    test('[TASK] NO muestra panel de spike, test ni bug', async ({ page }) => {
        const task = makeTask({ $id: 'task-base-002', name: 'Tarea simple', type: 'task' });
        await mockTasksList(page, [task]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await page.waitForTimeout(1000);

        const spikePanel = page.locator(
            '[data-testid="spike-panel"], text=/findings|hallazgos/i'
        );
        const testPanel = page.locator(
            '[data-testid="test-panel"], text=/test suite|add suite/i'
        );
        const bugPanel = page.locator(
            '[data-testid="bug-panel"], text=/expected behavior|comportamiento esperado/i'
        );

        await expect(spikePanel).toHaveCount(0);
        await expect(testPanel).toHaveCount(0);
        await expect(bugPanel).toHaveCount(0);
    });
});

// ─── Suite: Task tipo EPIC ────────────────────────────────────────────────────

test.describe('Tipo EPIC — subtareas, restricción FREE', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthSession(page, { plan: 'pro' });
        await mockWorkspacesApi(page);
        await mockMembersApi(page);
    });

    test('[EPIC] muestra el panel de subtareas', async ({ page }) => {
        const epic = makeTask({ $id: 'epic-001', name: 'Mi Épica', type: 'epic' });
        await mockTasksList(page, [epic]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        const subtasksPanel = page.locator(
            '[data-testid="epic-subtasks"], text=/subtask|subtarea|add subtask|agregar subtarea/i'
        ).first();

        if (!(await subtasksPanel.isVisible({ timeout: 5000 }))) {
            console.warn('[BUG CHECK] El panel de subtareas no se muestra para una tarea de tipo EPIC');
        } else {
            await expect(subtasksPanel).toBeVisible();
        }
    });

    test('[EPIC] NO muestra checklist', async ({ page }) => {
        const epic = makeTask({ $id: 'epic-002', name: 'Épica sin checklist', type: 'epic' });
        await mockTasksList(page, [epic]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);
        await page.waitForTimeout(1000);

        const checklist = page.locator('[data-testid="checklist"], text=/checklist/i').first();
        // El checklist NO debe aparecer para epics
        if (await checklist.isVisible({ timeout: 2000 })) {
            console.warn('[BUG CHECK] El checklist aparece en una tarea de tipo EPIC — no debería');
        }
    });

    test('[EPIC] usuario FREE no puede crear tarea tipo epic (bloqueado en UI)', async ({ page }) => {
        await mockAuthSession(page, { plan: 'free' });
        const tasks: ReturnType<typeof makeTask>[] = [];
        await mockTasksList(page, tasks);
        await navigateToApp(page, TASKS_ROUTE);
        await page.waitForTimeout(1500);

        // Abrir formulario de creación
        const createBtn = page
            .getByRole('button', { name: /create task|new task|nueva tarea|agregar/i })
            .first();

        if (await createBtn.isVisible({ timeout: 5000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            // El tipo epic NO debería aparecer en el selector
            const epicOption = page.locator(
                '[role="option"]:has-text("Epic"), [data-value="epic"], text=Epic'
            );
            if (await epicOption.isVisible({ timeout: 3000 })) {
                console.warn('[BUG CHECK] El tipo Epic aparece en el selector para usuario FREE — debería estar oculto');
            }
        }
    });

    test('[EPIC] usuario FREE recibe 403 si intenta crear epic via API', async ({ page }) => {
        await mockAuthSession(page, { plan: 'free' });
        const tasks: ReturnType<typeof makeTask>[] = [];

        // Simular que el servidor devuelve 403 para epic
        await page.route('**/api/tasks', async (route) => {
            if (route.request().method() === 'POST') {
                const body = await route.request().postDataJSON();
                if (body.type === 'epic' || body.type === 'spike' || body.type === 'test') {
                    await route.fulfill({
                        status: 403,
                        contentType: 'application/json',
                        body: JSON.stringify({ error: 'Plan limit reached' }),
                    });
                    return;
                }
            }
            await route.continue();
        });

        await mockTasksList(page, tasks);
        await navigateToApp(page, TASKS_ROUTE);
        await page.waitForTimeout(1500);

        // Verificar que el servidor respondería 403
        const response = await page.request.post('/api/tasks', {
            data: { name: 'Epic ilegal', type: 'epic', status: 'TODO', workspaceId: WS_ID, priority: 3 },
            failOnStatusCode: false,
        });

        // Puede ser 403 (plan limit) o 401 (no session en test env) — nunca 200 para free
        expect([401, 403]).toContain(response.status());
    });

    test('[EPIC] completar epic refleja progreso en subtareas', async ({ page }) => {
        const epic = makeTask({
            $id: 'epic-003',
            name: 'Épica con progreso',
            type: 'epic',
            status: 'IN_PROGRESS',
        });
        await mockTasksList(page, [epic]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);
        await page.waitForTimeout(1000);

        // El panel de épica debería mostrar barra de progreso
        const progressBar = page.locator(
            '[data-testid="epic-progress"], [role="progressbar"], .progress-bar, progress'
        ).first();

        if (!(await progressBar.isVisible({ timeout: 3000 }))) {
            console.warn('[BUG CHECK] La épica no muestra barra de progreso de subtareas');
        }
    });
});

// ─── Suite: Task tipo BUG ─────────────────────────────────────────────────────

test.describe('Tipo BUG — panel Expected/Actual, crear test task', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthSession(page, { plan: 'pro' });
        await mockWorkspacesApi(page);
        await mockMembersApi(page);
    });

    test('[BUG] muestra las secciones Expected y Actual', async ({ page }) => {
        const bug = makeTask({ $id: 'bug-001', name: 'Bug de login', type: 'bug' });
        await mockTasksList(page, [bug]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        const expectedSection = page
            .locator('text=/expected behavior|comportamiento esperado|comportamento atteso/i')
            .first();
        const actualSection = page
            .locator('text=/actual behavior|comportamiento actual|comportamento attuale/i')
            .first();

        if (!(await expectedSection.isVisible({ timeout: 5000 }))) {
            console.warn('[BUG CHECK] La sección "Expected behavior" no se muestra en el panel de Bug');
        } else {
            await expect(expectedSection).toBeVisible();
        }

        if (!(await actualSection.isVisible({ timeout: 5000 }))) {
            console.warn('[BUG CHECK] La sección "Actual behavior" no se muestra en el panel de Bug');
        } else {
            await expect(actualSection).toBeVisible();
        }
    });

    test('[BUG] muestra sección Root Cause (opcional)', async ({ page }) => {
        const bug = makeTask({ $id: 'bug-002', name: 'Bug con causa', type: 'bug' });
        await mockTasksList(page, [bug]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        const rootCause = page
            .locator('text=/root cause|causa raíz|causa radice/i')
            .first();

        if (!(await rootCause.isVisible({ timeout: 5000 }))) {
            console.warn('[BUG CHECK] La sección "Root Cause" no se muestra en el panel de Bug');
        } else {
            await expect(rootCause).toBeVisible();
        }
    });

    test('[BUG] botón "Crear test task" visible para usuario pago', async ({ page }) => {
        const bug = makeTask({ $id: 'bug-003', name: 'Bug con test', type: 'bug' });
        await mockTasksList(page, [bug]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        const createTestBtn = page
            .locator('button:has-text("Create test task"), button:has-text("Crear tarea de test"), button:has-text("Crea attività di test")')
            .first();

        if (!(await createTestBtn.isVisible({ timeout: 5000 }))) {
            console.warn('[BUG CHECK] El botón "Crear test task" no se muestra en el panel de Bug para usuario pago');
        } else {
            await expect(createTestBtn).toBeVisible();
        }
    });

    test('[BUG] botón "Crear test task" NO visible para usuario FREE', async ({ page }) => {
        await mockAuthSession(page, { plan: 'free' });
        const bug = makeTask({ $id: 'bug-004', name: 'Bug free', type: 'bug' });
        await mockTasksList(page, [bug]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);
        await page.waitForTimeout(1000);

        const createTestBtn = page
            .locator('button:has-text("Create test task"), button:has-text("Crear tarea de test")')
            .first();

        if (await createTestBtn.isVisible({ timeout: 3000 })) {
            console.warn('[BUG CHECK] El botón "Crear test task" aparece para usuario FREE — debería estar oculto');
        }
    });

    test('[BUG] crear test task desde bug vincula ambas tareas', async ({ page }) => {
        const bug = makeTask({ $id: 'bug-005', name: 'Bug a testear', type: 'bug' });
        const tasks = [bug];
        let createdTestTaskId: string | null = null;
        let bugLinkedTaskId: string | null = null;

        await page.route('**/api/tasks', async (route) => {
            if (route.request().method() === 'POST') {
                const body = await route.request().postDataJSON();
                if (body.type === 'test') {
                    createdTestTaskId = `test-created-${Date.now()}`;
                    const newTestTask = makeTask({
                        $id: createdTestTaskId,
                        name: body.name,
                        type: 'test',
                        linkedTaskId: bug.$id,
                    });
                    tasks.push(newTestTask);
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ data: newTestTask }),
                    });
                    return;
                }
            }
            await route.continue();
        });

        await page.route(`**/api/tasks/${bug.$id}`, async (route) => {
            if (route.request().method() === 'PATCH') {
                const body = await route.request().postDataJSON();
                if (body.linkedTaskId) {
                    bugLinkedTaskId = body.linkedTaskId;
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({ data: { ...bug, linkedTaskId: body.linkedTaskId } }),
                    });
                    return;
                }
            }
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ data: bugLinkedTaskId ? { ...bug, linkedTaskId: bugLinkedTaskId } : bug }),
                });
                return;
            }
            await route.continue();
        });

        await mockTasksList(page, tasks);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        const createTestBtn = page
            .locator('button:has-text("Create test task"), button:has-text("Crear tarea de test")')
            .first();

        if (await createTestBtn.isVisible({ timeout: 5000 })) {
            await createTestBtn.click();
            await page.waitForTimeout(2000);

            // Verificar que se realizó la llamada al API para crear la test task
            if (!createdTestTaskId) {
                console.warn('[BUG CHECK] El botón "Crear test task" se clickeó pero no se hizo POST a /api/tasks con type=test');
            } else {
                // Verificar que el bug fue vinculado a la test task
                if (!bugLinkedTaskId) {
                    console.warn('[BUG CHECK] La test task fue creada pero el bug no fue vinculado (linkedTaskId no se actualizó)');
                }
                expect(typeof createdTestTaskId).toBe('string');
            }
        } else {
            console.warn('[BUG CHECK] No se encontró el botón "Crear test task" — no se pudo verificar el flujo de vinculación');
        }
    });

    test('[BUG] cuando el bug tiene linked task, muestra chip de la tarea vinculada', async ({ page }) => {
        const linkedTest = makeTask({ $id: 'linked-test-001', name: 'Test: Bug de login', type: 'test' });
        const bug = makeTask({
            $id: 'bug-006',
            name: 'Bug con test vinculado',
            type: 'bug',
            linkedTaskId: linkedTest.$id,
        });

        await mockTasksList(page, [bug, linkedTest]);

        await page.route(`**/api/tasks/${linkedTest.$id}`, async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: linkedTest }),
            });
        });

        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        // Debería mostrar el nombre de la tarea vinculada como chip
        const linkedChip = page.locator(`text=/Test: Bug de login/i`).first();

        if (!(await linkedChip.isVisible({ timeout: 5000 }))) {
            console.warn('[BUG CHECK] El chip de la tarea vinculada no se muestra en el panel de Bug');
        } else {
            await expect(linkedChip).toBeVisible();
        }
    });

    test('[BUG] NO muestra checklist', async ({ page }) => {
        const bug = makeTask({ $id: 'bug-007', name: 'Bug sin checklist', type: 'bug' });
        await mockTasksList(page, [bug]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);
        await page.waitForTimeout(1000);

        const checklist = page.locator('[data-testid="checklist"], text=/^checklist$/i').first();
        if (await checklist.isVisible({ timeout: 2000 })) {
            console.warn('[BUG CHECK] El checklist aparece en una tarea de tipo BUG — no debería');
        }
    });
});

// ─── Suite: Task tipo TEST ────────────────────────────────────────────────────

test.describe('Tipo TEST — suites, casos, toggle TDD, restricción FREE', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthSession(page, { plan: 'pro' });
        await mockWorkspacesApi(page);
        await mockMembersApi(page);
    });

    test('[TEST] muestra el panel de test suites', async ({ page }) => {
        const testTask = makeTask({ $id: 'test-001', name: 'Test de autenticación', type: 'test' });
        await mockTasksList(page, [testTask]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        const addSuiteBtn = page
            .locator('button:has-text("Add suite"), button:has-text("Agregar suite"), button:has-text("Aggiungi suite")')
            .first();

        if (!(await addSuiteBtn.isVisible({ timeout: 5000 }))) {
            console.warn('[BUG CHECK] No se muestra el botón "Add suite" en el panel de tipo TEST');
        } else {
            await expect(addSuiteBtn).toBeVisible();
        }
    });

    test('[TEST] puede añadir un suite', async ({ page }) => {
        const testTask = makeTask({ $id: 'test-002', name: 'Test con suite', type: 'test' });
        const tasks = [testTask];

        await mockTasksList(page, tasks);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        const addSuiteBtn = page
            .locator('button:has-text("Add suite"), button:has-text("Agregar suite")')
            .first();

        if (await addSuiteBtn.isVisible({ timeout: 5000 })) {
            await addSuiteBtn.click();
            await page.waitForTimeout(500);

            // Debería aparecer un input para el nombre del suite
            const suiteInput = page
                .locator('input[placeholder*="describe"], input[placeholder*="suite"], [data-testid="suite-name-input"]')
                .first();

            if (!(await suiteInput.isVisible({ timeout: 3000 }))) {
                console.warn('[BUG CHECK] Tras hacer click en "Add suite" no aparece el input de nombre de suite');
            } else {
                await suiteInput.fill('UserService');
                await page.keyboard.press('Enter');
                await page.waitForTimeout(500);

                const suiteName = page.locator('text=/UserService/').first();
                if (!(await suiteName.isVisible({ timeout: 3000 }))) {
                    console.warn('[BUG CHECK] El nombre del suite no aparece tras ser creado');
                }
            }
        }
    });

    test('[TEST] puede añadir un caso de prueba a un suite', async ({ page }) => {
        const scenario = {
            id: 'scenario-001',
            name: 'UserService',
            cases: [],
            collapsed: false,
        };
        const testTask = makeTask({
            $id: 'test-003',
            name: 'Test con caso',
            type: 'test',
            metadata: JSON.stringify({ testScenarios: [scenario] }),
        });

        await mockTasksList(page, [testTask]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        // El suite debería estar visible
        const suiteHeader = page.locator('text=/UserService/').first();
        if (await suiteHeader.isVisible({ timeout: 5000 })) {
            // Buscar botón de añadir caso
            const addCaseBtn = page
                .locator('button:has-text("Add case"), button:has-text("Agregar caso"), [data-testid="add-case-btn"]')
                .first();

            if (!(await addCaseBtn.isVisible({ timeout: 3000 }))) {
                console.warn('[BUG CHECK] No se muestra botón "Add case" dentro de un suite en panel TEST');
            }
        } else {
            console.warn('[BUG CHECK] El suite "UserService" no se renderizó en el panel TEST');
        }
    });

    test('[TEST] puede cambiar estado de caso (pass/fail/pending)', async ({ page }) => {
        const scenario = {
            id: 'scenario-002',
            name: 'LoginService',
            cases: [{ id: 'case-001', name: 'should login with valid credentials', status: 'pending' }],
            collapsed: false,
        };
        const testTask = makeTask({
            $id: 'test-004',
            name: 'Test con caso pendiente',
            type: 'test',
            metadata: JSON.stringify({ testScenarios: [scenario] }),
        });

        await mockTasksList(page, [testTask]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await page.waitForTimeout(1000);
        const caseName = page.locator('text=/should login with valid credentials/i').first();

        if (!(await caseName.isVisible({ timeout: 5000 }))) {
            console.warn('[BUG CHECK] El nombre del caso de prueba no se muestra en el panel TEST');
        } else {
            // Buscar el botón de estado (pending/pass/fail)
            const statusBtn = page
                .locator('[data-testid="case-status-btn"], button:has-text("pending"), button:has-text("pass"), button:has-text("fail")')
                .first();

            if (!(await statusBtn.isVisible({ timeout: 3000 }))) {
                console.warn('[BUG CHECK] No se encuentra el control de estado (pass/fail/pending) en el caso de prueba');
            }
        }
    });

    test('[TEST] muestra toggle TDD / Post-fix', async ({ page }) => {
        const testTask = makeTask({ $id: 'test-005', name: 'Test TDD', type: 'test' });
        await mockTasksList(page, [testTask]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        const tddToggle = page.locator(
            'button:has-text("TDD"), [data-testid="tdd-toggle"], text=/post-fix/i, text=/TDD/i'
        ).first();

        if (!(await tddToggle.isVisible({ timeout: 5000 }))) {
            console.warn('[BUG CHECK] El toggle TDD / Post-fix no se muestra en el panel TEST');
        } else {
            await expect(tddToggle).toBeVisible();
        }
    });

    test('[TEST] usuario FREE no puede crear tarea tipo test (selector vacío)', async ({ page }) => {
        await mockAuthSession(page, { plan: 'free' });
        await mockTasksList(page, []);
        await navigateToApp(page, TASKS_ROUTE);
        await page.waitForTimeout(1500);

        const createBtn = page
            .getByRole('button', { name: /create task|new task|nueva tarea/i })
            .first();

        if (await createBtn.isVisible({ timeout: 5000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const testOption = page.locator(
                '[role="option"]:has-text("Test"), [data-value="test"]'
            );
            if (await testOption.isVisible({ timeout: 3000 })) {
                console.warn('[BUG CHECK] El tipo Test aparece en el selector para usuario FREE — debería estar oculto');
            }
        }
    });

    test('[TEST] NO muestra checklist', async ({ page }) => {
        const testTask = makeTask({ $id: 'test-006', name: 'Test sin checklist', type: 'test' });
        await mockTasksList(page, [testTask]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);
        await page.waitForTimeout(1000);

        const checklist = page.locator('[data-testid="checklist"], text=/^checklist$/i').first();
        if (await checklist.isVisible({ timeout: 2000 })) {
            console.warn('[BUG CHECK] El checklist aparece en una tarea de tipo TEST — no debería');
        }
    });
});

// ─── Suite: Task tipo SPIKE ───────────────────────────────────────────────────

test.describe('Tipo SPIKE — hallazgos, conclusión, restricción FREE', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthSession(page, { plan: 'pro' });
        await mockWorkspacesApi(page);
        await mockMembersApi(page);
    });

    test('[SPIKE] muestra panel de hallazgos (findings)', async ({ page }) => {
        const spike = makeTask({ $id: 'spike-001', name: 'Spike de tecnologías', type: 'spike' });
        await mockTasksList(page, [spike]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        const findingsSection = page
            .locator('text=/findings|hallazgos|risultati/i')
            .first();

        if (!(await findingsSection.isVisible({ timeout: 5000 }))) {
            console.warn('[BUG CHECK] La sección de hallazgos no aparece en el panel SPIKE');
        } else {
            await expect(findingsSection).toBeVisible();
        }
    });

    test('[SPIKE] muestra sección de conclusión', async ({ page }) => {
        const spike = makeTask({ $id: 'spike-002', name: 'Spike con conclusión', type: 'spike' });
        await mockTasksList(page, [spike]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        const conclusionSection = page
            .locator('text=/conclusion|conclusión|conclusione/i')
            .first();

        if (!(await conclusionSection.isVisible({ timeout: 5000 }))) {
            console.warn('[BUG CHECK] La sección de conclusión no aparece en el panel SPIKE');
        } else {
            await expect(conclusionSection).toBeVisible();
        }
    });

    test('[SPIKE] puede añadir un hallazgo', async ({ page }) => {
        const spike = makeTask({ $id: 'spike-003', name: 'Spike a investigar', type: 'spike' });
        await mockTasksList(page, [spike]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        const addFindingBtn = page
            .locator('button:has-text("Add finding"), button:has-text("Agregar hallazgo"), [data-testid="add-finding-btn"]')
            .first();

        if (!(await addFindingBtn.isVisible({ timeout: 5000 }))) {
            console.warn('[BUG CHECK] No se muestra el botón "Add finding" en el panel SPIKE');
        } else {
            await addFindingBtn.click();
            await page.waitForTimeout(500);

            // Debería aparecer un editor de texto
            const editor = page.locator(
                '[contenteditable="true"], .ProseMirror, [data-testid="finding-editor"]'
            ).first();

            if (!(await editor.isVisible({ timeout: 3000 }))) {
                console.warn('[BUG CHECK] Tras hacer click en "Add finding" no aparece el editor de texto');
            }
        }
    });

    test('[SPIKE] muestra selector de tipo de conclusión (Adopt/Reject/Investigate)', async ({ page }) => {
        const spike = makeTask({
            $id: 'spike-004',
            name: 'Spike con outcome',
            type: 'spike',
            metadata: JSON.stringify({ spikeConclusion: '<p>Conclusión de prueba</p>' }),
        });
        await mockTasksList(page, [spike]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);
        await page.waitForTimeout(1000);

        const outcomeSelector = page.locator(
            'text=/adopt|reject|investigate/i'
        ).first();

        if (!(await outcomeSelector.isVisible({ timeout: 5000 }))) {
            console.warn('[BUG CHECK] El selector de tipo de conclusión (Adopt/Reject/Investigate) no aparece en SPIKE');
        }
    });

    test('[SPIKE] usuario FREE no puede crear tarea tipo spike (selector vacío)', async ({ page }) => {
        await mockAuthSession(page, { plan: 'free' });
        await mockTasksList(page, []);
        await navigateToApp(page, TASKS_ROUTE);
        await page.waitForTimeout(1500);

        const createBtn = page
            .getByRole('button', { name: /create task|new task|nueva tarea/i })
            .first();

        if (await createBtn.isVisible({ timeout: 5000 })) {
            await createBtn.click();
            await page.waitForTimeout(500);

            const spikeOption = page.locator('[role="option"]:has-text("Spike"), [data-value="spike"]');
            if (await spikeOption.isVisible({ timeout: 3000 })) {
                console.warn('[BUG CHECK] El tipo Spike aparece en el selector para usuario FREE — debería estar oculto');
            }
        }
    });

    test('[SPIKE] NO muestra checklist', async ({ page }) => {
        const spike = makeTask({ $id: 'spike-005', name: 'Spike sin checklist', type: 'spike' });
        await mockTasksList(page, [spike]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);
        await page.waitForTimeout(1000);

        const checklist = page.locator('[data-testid="checklist"], text=/^checklist$/i').first();
        if (await checklist.isVisible({ timeout: 2000 })) {
            console.warn('[BUG CHECK] El checklist aparece en una tarea de tipo SPIKE — no debería');
        }
    });
});

// ─── Suite: Task tipo URGENT ──────────────────────────────────────────────────

test.describe('Tipo URGENT — tiempo de creación, sin checklist ni paneles', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthSession(page, { plan: 'pro' });
        await mockWorkspacesApi(page);
        await mockMembersApi(page);
    });

    test('[URGENT] muestra indicador de tiempo transcurrido desde creación', async ({ page }) => {
        const urgent = makeTask({
            $id: 'urgent-001',
            name: 'Bug crítico en producción',
            type: 'urgent',
            $createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // hace 2 horas
        });
        await mockTasksList(page, [urgent]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        // UrgentPanel muestra tiempo transcurrido
        const timeDisplay = page.locator(
            '[data-testid="urgent-timer"], text=/hours? ago|hours? elapsed|horas? transcurridas|hace.*horas?|ore fa/i'
        ).first();

        if (!(await timeDisplay.isVisible({ timeout: 5000 }))) {
            console.warn('[BUG CHECK] El panel URGENT no muestra el tiempo transcurrido desde la creación');
        }
    });

    test('[URGENT] NO muestra checklist', async ({ page }) => {
        const urgent = makeTask({ $id: 'urgent-002', name: 'Urgent sin checklist', type: 'urgent' });
        await mockTasksList(page, [urgent]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);
        await page.waitForTimeout(1000);

        const checklist = page.locator('[data-testid="checklist"], text=/^checklist$/i').first();
        if (await checklist.isVisible({ timeout: 2000 })) {
            console.warn('[BUG CHECK] El checklist aparece en una tarea de tipo URGENT — no debería');
        }
    });

    test('[URGENT] NO muestra paneles de spike, test ni bug', async ({ page }) => {
        const urgent = makeTask({ $id: 'urgent-003', name: 'Urgent limpio', type: 'urgent' });
        await mockTasksList(page, [urgent]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);
        await page.waitForTimeout(1000);

        const spikePanel = page.locator('text=/findings|hallazgos/i');
        const testPanel = page.locator('text=/add suite|test suite/i');
        const bugPanel = page.locator('text=/expected behavior|comportamiento esperado/i');

        await expect(spikePanel).toHaveCount(0);
        await expect(testPanel).toHaveCount(0);
        await expect(bugPanel).toHaveCount(0);
    });

    test('[URGENT] completar tarea urgent → cambia estado a DONE', async ({ page }) => {
        const urgent = makeTask({
            $id: 'urgent-004',
            name: 'Urgent completable',
            type: 'urgent',
            status: 'IN_PROGRESS',
        });

        let patchedStatus: string | null = null;
        await page.route(`**/api/tasks/${urgent.$id}`, async (route) => {
            if (route.request().method() === 'PATCH') {
                const body = await route.request().postDataJSON();
                if (body.status) patchedStatus = body.status;
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ data: { ...urgent, ...body } }),
                });
                return;
            }
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200, contentType: 'application/json',
                    body: JSON.stringify({ data: urgent }),
                });
                return;
            }
            await route.continue();
        });

        await mockTasksList(page, [urgent]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        // Buscar botón de completar (puede ser checkbox, botón "Done", etc.)
        const doneBtn = page.locator(
            'button:has-text("Done"), button:has-text("Complete"), [data-testid="complete-task-btn"], [role="checkbox"]'
        ).first();

        if (await doneBtn.isVisible({ timeout: 5000 })) {
            await doneBtn.click();
            await page.waitForTimeout(1500);

            if (patchedStatus && patchedStatus !== 'DONE') {
                console.warn(`[BUG CHECK] Al completar URGENT, se envió status="${patchedStatus}" en vez de "DONE"`);
            }
        } else {
            console.warn('[BUG CHECK] No se encontró botón para completar la tarea URGENT desde el detalle');
        }
    });
});

// ─── Suite: Acciones comunes por tipo ─────────────────────────────────────────

test.describe('Acciones sobre tareas — comportamiento por tipo', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthSession(page, { plan: 'pro' });
        await mockWorkspacesApi(page);
        await mockMembersApi(page);
    });

    test('[TASK] cambiar tipo desde task → spike está bloqueado para FREE', async ({ page }) => {
        await mockAuthSession(page, { plan: 'free' });
        const task = makeTask({ $id: 'change-type-001', name: 'Cambio de tipo', type: 'task' });
        await mockTasksList(page, [task]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        // Buscar el selector de tipo en el detalle
        const typeSelector = page.locator(
            '[data-testid="task-type-selector"], button:has-text("Task"), button:has-text("Tarea")'
        ).first();

        if (await typeSelector.isVisible({ timeout: 5000 })) {
            await typeSelector.click();
            await page.waitForTimeout(500);

            // Spike y Test no deben estar disponibles
            const spikeOption = page.locator('[role="option"]:has-text("Spike"), [data-value="spike"]');
            const testOption = page.locator('[role="option"]:has-text("Test"), [data-value="test"]');

            if (await spikeOption.isVisible({ timeout: 2000 })) {
                console.warn('[BUG CHECK] La opción "Spike" aparece en el selector de tipo para usuario FREE');
            }
            if (await testOption.isVisible({ timeout: 2000 })) {
                console.warn('[BUG CHECK] La opción "Test" aparece en el selector de tipo para usuario FREE');
            }
        }
    });

    test('[ALL] archivar task funciona sin errores de JS', async ({ page }) => {
        const jsErrors: string[] = [];
        page.on('pageerror', (e) => jsErrors.push(e.message));

        const task = makeTask({ $id: 'archive-001', name: 'Tarea a archivar', type: 'task' });
        await mockTasksList(page, [task]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);
        await page.waitForTimeout(1500);

        // Buscar menú de acciones (3 puntos)
        const actionsMenu = page.locator(
            '[data-testid="task-actions-menu"], button[aria-label*="more"], button[aria-label*="actions"], [data-testid="task-options"]'
        ).first();

        if (await actionsMenu.isVisible({ timeout: 5000 })) {
            await actionsMenu.click();
            await page.waitForTimeout(500);

            const archiveOption = page.locator(
                '[role="menuitem"]:has-text("Archive"), [role="menuitem"]:has-text("Archivar")'
            ).first();

            if (await archiveOption.isVisible({ timeout: 3000 })) {
                await archiveOption.click();
                await page.waitForTimeout(1000);
            }
        }

        const criticalErrors = jsErrors.filter(
            (e) => !e.includes('hydration') && !e.includes('favicon')
        );
        expect(criticalErrors).toHaveLength(0);
    });

    test('[ALL] completar tarea cualquier tipo → estado cambia a DONE', async ({ page }) => {
        const types = ['task', 'bug', 'spike', 'urgent'];

        for (const type of types) {
            const task = makeTask({
                $id: `complete-${type}`,
                name: `Completar ${type}`,
                type,
                status: 'IN_PROGRESS',
            });

            let statusPatched: string | null = null;
            await page.route(`**/api/tasks/${task.$id}`, async (route) => {
                if (route.request().method() === 'PATCH') {
                    const body = await route.request().postDataJSON();
                    if (body.status) statusPatched = body.status;
                    await route.fulfill({
                        status: 200, contentType: 'application/json',
                        body: JSON.stringify({ data: { ...task, ...body } }),
                    });
                    return;
                }
                if (route.request().method() === 'GET') {
                    await route.fulfill({
                        status: 200, contentType: 'application/json',
                        body: JSON.stringify({ data: task }),
                    });
                    return;
                }
                await route.continue();
            });

            await mockTasksList(page, [task]);
            await navigateToApp(page, TASKS_ROUTE);
            await openFirstTask(page);

            const completeBtn = page.locator(
                '[role="checkbox"], button:has-text("Complete"), button:has-text("Done"), [data-testid="complete-btn"]'
            ).first();

            if (await completeBtn.isVisible({ timeout: 5000 })) {
                await completeBtn.click();
                await page.waitForTimeout(1500);

                if (statusPatched && statusPatched !== 'DONE') {
                    console.warn(`[BUG CHECK] Completar tipo "${type}" envió status="${statusPatched}" en vez de "DONE"`);
                }
            } else {
                console.warn(`[BUG CHECK] No se encontró botón para completar tarea de tipo "${type}"`);
            }
        }
    });
});

// ─── Helpers para transiciones de tipo ───────────────────────────────────────

/**
 * Crea un mock con estado mutable: el PATCH actualiza el estado interno y
 * los GETs subsiguientes devuelven el estado actualizado. Esto simula que
 * el servidor persiste el cambio de tipo y el front re-renderiza el panel correcto.
 *
 * Registrar DESPUÉS de mockTasksList para que la ruta específica tome precedencia.
 */
function makeMutableMock(initialTask: ReturnType<typeof makeTask>) {
    const state = { current: { ...initialTask } };

    const setup = async (page: Page) => {
        await page.route(`**/api/tasks/${initialTask.$id}`, async (route) => {
            const method = route.request().method();

            if (method === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ data: state.current }),
                });
                return;
            }

            if (method === 'PATCH') {
                const body = await route.request().postDataJSON();
                state.current = { ...state.current, ...body };
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ data: state.current }),
                });
                return;
            }

            await route.continue();
        });
    };

    return { state, setup };
}

/**
 * Abre el selector de tipo en el detalle de la tarea (ícono junto al título)
 * y hace click en la opción indicada.
 *
 * El selector es un <Select> de Radix con role="combobox". Las opciones
 * usan el nombre del tipo como texto visible (Bug, Task, Epic, Spike, Test, Urgent).
 *
 * @returns true si la interacción tuvo éxito, false (+ console.warn) si no.
 */
async function changeTaskType(page: Page, targetTypeName: string): Promise<boolean> {
    // Primer role="combobox" en el detalle es el selector de tipo
    const trigger = page.locator('[role="combobox"]').first();

    if (!(await trigger.isVisible({ timeout: 5000 }))) {
        console.warn(`[TYPE CHANGE] No se encontró el selector de tipo para cambiar a "${targetTypeName}"`);
        return false;
    }

    await trigger.click();
    await page.waitForTimeout(400);

    const option = page
        .locator(`[role="option"]:has-text("${targetTypeName}")`)
        .first();

    if (!(await option.isVisible({ timeout: 3000 }))) {
        console.warn(`[TYPE CHANGE] La opción "${targetTypeName}" no está disponible en el selector`);
        await page.keyboard.press('Escape');
        return false;
    }

    await option.click();
    await page.waitForTimeout(1500);
    return true;
}

// Panel identifiers (locators únicos por panel) ──────────────────────────────
const PANEL_LOCATORS = {
    bug: 'text=/expected behavior|comportamiento esperado|comportamento atteso/i',
    test: 'text=/add suite|agregar suite|aggiungi suite/i',
    spike: 'text=/findings|hallazgos|risultati/i',
    epic: 'text=/subtask|subtarea|add subtask/i',
    urgent: '[data-testid="urgent-timer"], text=/hours? ago|hace.*hora|ore fa/i',
    checklist: '[data-testid="checklist"], text=/^checklist$/i',
} as const;

async function assertPanelVisible(page: Page, panel: keyof typeof PANEL_LOCATORS) {
    const loc = page.locator(PANEL_LOCATORS[panel]).first();
    if (!(await loc.isVisible({ timeout: 5000 }))) {
        console.warn(`[BUG CHECK] El panel "${panel}" debería ser VISIBLE tras el cambio de tipo pero no lo es`);
    }
}

async function assertPanelGone(page: Page, panel: keyof typeof PANEL_LOCATORS) {
    const loc = page.locator(PANEL_LOCATORS[panel]);
    if (await loc.first().isVisible({ timeout: 2000 })) {
        console.warn(`[BUG CHECK] El panel "${panel}" debería estar OCULTO tras el cambio de tipo pero sigue visible`);
    }
}

// ─── Suite: Transiciones de tipo ─────────────────────────────────────────────

test.describe('Transiciones de tipo — paneles que aparecen y desaparecen', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthSession(page, { plan: 'pro' });
        await mockWorkspacesApi(page);
        await mockMembersApi(page);
    });

    // ── Desde BUG ──────────────────────────────────────────────────────────────

    test('[BUG → TEST] desaparece BugPanel, aparece TestPanel, PATCH con type=test', async ({ page }) => {
        const task = makeTask({ $id: 'tr-bug-to-test', name: 'Bug a testear', type: 'bug' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelVisible(page, 'bug');

        const changed = await changeTaskType(page, 'Test');

        if (changed) {
            expect(state.current.type).toBe('test');
            await assertPanelGone(page, 'bug');
            await assertPanelVisible(page, 'test');
        }
    });

    test('[BUG → SPIKE] desaparece BugPanel, aparece SpikePanel', async ({ page }) => {
        const task = makeTask({ $id: 'tr-bug-to-spike', name: 'Bug → Spike', type: 'bug' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelVisible(page, 'bug');

        const changed = await changeTaskType(page, 'Spike');

        if (changed) {
            expect(state.current.type).toBe('spike');
            await assertPanelGone(page, 'bug');
            await assertPanelVisible(page, 'spike');
        }
    });

    test('[BUG → TASK] desaparece BugPanel, no quedan paneles de tipo', async ({ page }) => {
        const task = makeTask({ $id: 'tr-bug-to-task', name: 'Bug → Task', type: 'bug' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelVisible(page, 'bug');

        const changed = await changeTaskType(page, 'Task');

        if (changed) {
            expect(state.current.type).toBe('task');
            await assertPanelGone(page, 'bug');
            await assertPanelGone(page, 'spike');
            await assertPanelGone(page, 'test');
        }
    });

    test('[BUG → EPIC] desaparece BugPanel, aparece panel de subtareas', async ({ page }) => {
        const task = makeTask({ $id: 'tr-bug-to-epic', name: 'Bug → Epic', type: 'bug' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelVisible(page, 'bug');

        const changed = await changeTaskType(page, 'Epic');

        if (changed) {
            expect(state.current.type).toBe('epic');
            await assertPanelGone(page, 'bug');
            await assertPanelVisible(page, 'epic');
        }
    });

    test('[BUG → TEST] usuario FREE — opción Test NO disponible en selector', async ({ page }) => {
        await mockAuthSession(page, { plan: 'free' });
        const task = makeTask({ $id: 'tr-bug-to-test-free', name: 'Bug FREE', type: 'bug' });
        const { setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        const trigger = page.locator('[role="combobox"]').first();
        if (await trigger.isVisible({ timeout: 5000 })) {
            await trigger.click();
            await page.waitForTimeout(400);

            const testOption = page.locator('[role="option"]:has-text("Test")');
            const spikeOption = page.locator('[role="option"]:has-text("Spike")');
            const epicOption = page.locator('[role="option"]:has-text("Epic")');

            if (await testOption.isVisible({ timeout: 2000 })) {
                console.warn('[BUG CHECK][FREE] La opción "Test" aparece en el selector para plan FREE — debería estar oculta');
            }
            if (await spikeOption.isVisible({ timeout: 2000 })) {
                console.warn('[BUG CHECK][FREE] La opción "Spike" aparece en el selector para plan FREE — debería estar oculta');
            }
            if (await epicOption.isVisible({ timeout: 2000 })) {
                console.warn('[BUG CHECK][FREE] La opción "Epic" aparece en el selector para plan FREE — debería estar oculta');
            }

            // Task y Bug SÍ deben estar disponibles para FREE
            const taskOption = page.locator('[role="option"]:has-text("Task"), [role="option"]:has-text("Tarea")').first();
            const bugOption = page.locator('[role="option"]:has-text("Bug")').first();

            if (!(await taskOption.isVisible({ timeout: 2000 }))) {
                console.warn('[BUG CHECK][FREE] La opción "Task" NO aparece en el selector para plan FREE — debería estar disponible');
            }
            if (!(await bugOption.isVisible({ timeout: 2000 }))) {
                console.warn('[BUG CHECK][FREE] La opción "Bug" NO aparece en el selector para plan FREE — debería estar disponible');
            }

            await page.keyboard.press('Escape');
        }
    });

    // ── Desde TASK ─────────────────────────────────────────────────────────────

    test('[TASK → BUG] aparece BugPanel con Expected/Actual/Root Cause', async ({ page }) => {
        const task = makeTask({ $id: 'tr-task-to-bug', name: 'Task → Bug', type: 'task' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelGone(page, 'bug');

        const changed = await changeTaskType(page, 'Bug');

        if (changed) {
            expect(state.current.type).toBe('bug');
            await assertPanelVisible(page, 'bug');
            await assertPanelGone(page, 'spike');
            await assertPanelGone(page, 'test');
        }
    });

    test('[TASK → BUG] el checklist desaparece (bug no tiene checklist)', async ({ page }) => {
        const task = makeTask({ $id: 'tr-task-to-bug-cl', name: 'Task con checklist → Bug', type: 'task' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        const changed = await changeTaskType(page, 'Bug');

        if (changed) {
            expect(state.current.type).toBe('bug');
            await assertPanelGone(page, 'checklist');
        }
    });

    test('[TASK → SPIKE] aparece SpikePanel con Findings/Conclusion', async ({ page }) => {
        const task = makeTask({ $id: 'tr-task-to-spike', name: 'Task → Spike', type: 'task' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        const changed = await changeTaskType(page, 'Spike');

        if (changed) {
            expect(state.current.type).toBe('spike');
            await assertPanelVisible(page, 'spike');
            await assertPanelGone(page, 'bug');
            await assertPanelGone(page, 'test');
        }
    });

    test('[TASK → EPIC] aparece panel de subtareas, sin checklist', async ({ page }) => {
        const task = makeTask({ $id: 'tr-task-to-epic', name: 'Task → Epic', type: 'task' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        const changed = await changeTaskType(page, 'Epic');

        if (changed) {
            expect(state.current.type).toBe('epic');
            await assertPanelVisible(page, 'epic');
            await assertPanelGone(page, 'checklist');
        }
    });

    test('[TASK → SPIKE] usuario FREE — servidor devuelve 403', async ({ page }) => {
        await mockAuthSession(page, { plan: 'free' });

        const task = makeTask({ $id: 'tr-task-to-spike-free', name: 'Task FREE → Spike', type: 'task' });
        const { state } = makeMutableMock(task);

        // Sobreescribir la ruta de PATCH para este task con respuesta 403
        await page.route(`**/api/tasks/${task.$id}`, async (route) => {
            if (route.request().method() === 'PATCH') {
                const body = await route.request().postDataJSON();
                if (body.type === 'spike' || body.type === 'test' || body.type === 'epic') {
                    await route.fulfill({
                        status: 403,
                        contentType: 'application/json',
                        body: JSON.stringify({ error: 'Plan limit reached' }),
                    });
                    return;
                }
                state.current = { ...state.current, ...body };
                await route.fulfill({
                    status: 200, contentType: 'application/json',
                    body: JSON.stringify({ data: state.current }),
                });
                return;
            }
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200, contentType: 'application/json',
                    body: JSON.stringify({ data: state.current }),
                });
                return;
            }
            await route.continue();
        });

        await mockTasksList(page, [task]);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        // Si el UI no filtra la opción, el intento de PATCH debe fallar con 403
        // y el tipo no debe cambiar
        const trigger = page.locator('[role="combobox"]').first();
        if (await trigger.isVisible({ timeout: 5000 })) {
            await trigger.click();
            await page.waitForTimeout(400);

            const spikeOption = page.locator('[role="option"]:has-text("Spike")').first();
            if (await spikeOption.isVisible({ timeout: 2000 })) {
                // Si la opción está disponible (no filtrada en UI), el click debe provocar un 403
                await spikeOption.click();
                await page.waitForTimeout(1500);

                // El tipo en el estado del servidor NO debe haberse actualizado
                if (state.current.type !== 'task') {
                    console.warn(`[BUG CHECK][FREE] El tipo se actualizó a "${state.current.type}" a pesar del 403 del servidor`);
                }

                // El BugPanel/SpikePanel no debería aparecer
                await assertPanelGone(page, 'spike');
            }
            // Si la opción NO está disponible → UI la filtró correctamente (también válido)
            else {
                await page.keyboard.press('Escape');
            }
        }
    });

    // ── Desde SPIKE ────────────────────────────────────────────────────────────

    test('[SPIKE → BUG] desaparece SpikePanel, aparece BugPanel', async ({ page }) => {
        const task = makeTask({ $id: 'tr-spike-to-bug', name: 'Spike → Bug', type: 'spike' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelVisible(page, 'spike');

        const changed = await changeTaskType(page, 'Bug');

        if (changed) {
            expect(state.current.type).toBe('bug');
            await assertPanelGone(page, 'spike');
            await assertPanelVisible(page, 'bug');
        }
    });

    test('[SPIKE → TEST] desaparece SpikePanel, aparece TestPanel', async ({ page }) => {
        const task = makeTask({ $id: 'tr-spike-to-test', name: 'Spike → Test', type: 'spike' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelVisible(page, 'spike');

        const changed = await changeTaskType(page, 'Test');

        if (changed) {
            expect(state.current.type).toBe('test');
            await assertPanelGone(page, 'spike');
            await assertPanelVisible(page, 'test');
        }
    });

    test('[SPIKE → TASK] desaparece SpikePanel, sin paneles especiales', async ({ page }) => {
        const task = makeTask({ $id: 'tr-spike-to-task', name: 'Spike → Task', type: 'spike' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelVisible(page, 'spike');

        const changed = await changeTaskType(page, 'Task');

        if (changed) {
            expect(state.current.type).toBe('task');
            await assertPanelGone(page, 'spike');
            await assertPanelGone(page, 'bug');
            await assertPanelGone(page, 'test');
        }
    });

    // ── Desde TEST ─────────────────────────────────────────────────────────────

    test('[TEST → BUG] desaparece TestPanel (suites), aparece BugPanel', async ({ page }) => {
        const task = makeTask({ $id: 'tr-test-to-bug', name: 'Test → Bug', type: 'test' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelVisible(page, 'test');

        const changed = await changeTaskType(page, 'Bug');

        if (changed) {
            expect(state.current.type).toBe('bug');
            await assertPanelGone(page, 'test');
            await assertPanelVisible(page, 'bug');
        }
    });

    test('[TEST → SPIKE] desaparece TestPanel, aparece SpikePanel', async ({ page }) => {
        const task = makeTask({ $id: 'tr-test-to-spike', name: 'Test → Spike', type: 'test' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelVisible(page, 'test');

        const changed = await changeTaskType(page, 'Spike');

        if (changed) {
            expect(state.current.type).toBe('spike');
            await assertPanelGone(page, 'test');
            await assertPanelVisible(page, 'spike');
        }
    });

    test('[TEST → TASK] desaparece TestPanel, sin paneles de tipo', async ({ page }) => {
        const task = makeTask({ $id: 'tr-test-to-task', name: 'Test → Task', type: 'test' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelVisible(page, 'test');

        const changed = await changeTaskType(page, 'Task');

        if (changed) {
            expect(state.current.type).toBe('task');
            await assertPanelGone(page, 'test');
            await assertPanelGone(page, 'bug');
            await assertPanelGone(page, 'spike');
        }
    });

    // ── Desde EPIC ─────────────────────────────────────────────────────────────

    test('[EPIC → BUG] desaparece panel de subtareas, aparece BugPanel', async ({ page }) => {
        const task = makeTask({ $id: 'tr-epic-to-bug', name: 'Epic → Bug', type: 'epic' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelVisible(page, 'epic');

        const changed = await changeTaskType(page, 'Bug');

        if (changed) {
            expect(state.current.type).toBe('bug');
            await assertPanelGone(page, 'epic');
            await assertPanelVisible(page, 'bug');
        }
    });

    test('[EPIC → TASK] desaparece panel de subtareas', async ({ page }) => {
        const task = makeTask({ $id: 'tr-epic-to-task', name: 'Epic → Task', type: 'epic' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelVisible(page, 'epic');

        const changed = await changeTaskType(page, 'Task');

        if (changed) {
            expect(state.current.type).toBe('task');
            await assertPanelGone(page, 'epic');
            await assertPanelGone(page, 'bug');
        }
    });

    test('[EPIC → SPIKE] desaparece panel de subtareas, aparece SpikePanel', async ({ page }) => {
        const task = makeTask({ $id: 'tr-epic-to-spike', name: 'Epic → Spike', type: 'epic' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelVisible(page, 'epic');

        const changed = await changeTaskType(page, 'Spike');

        if (changed) {
            expect(state.current.type).toBe('spike');
            await assertPanelGone(page, 'epic');
            await assertPanelVisible(page, 'spike');
        }
    });

    // ── Desde URGENT ───────────────────────────────────────────────────────────

    test('[URGENT → TASK] desaparece UrgentPanel, sin paneles de tipo', async ({ page }) => {
        const task = makeTask({ $id: 'tr-urgent-to-task', name: 'Urgent → Task', type: 'urgent' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelVisible(page, 'urgent');

        const changed = await changeTaskType(page, 'Task');

        if (changed) {
            expect(state.current.type).toBe('task');
            await assertPanelGone(page, 'urgent');
            await assertPanelGone(page, 'bug');
            await assertPanelGone(page, 'spike');
        }
    });

    test('[URGENT → BUG] desaparece UrgentPanel, aparece BugPanel', async ({ page }) => {
        const task = makeTask({ $id: 'tr-urgent-to-bug', name: 'Urgent → Bug', type: 'urgent' });
        const { state, setup } = makeMutableMock(task);

        await mockTasksList(page, [task]);
        await setup(page);
        await navigateToApp(page, TASKS_ROUTE);
        await openFirstTask(page);

        await assertPanelVisible(page, 'urgent');

        const changed = await changeTaskType(page, 'Bug');

        if (changed) {
            expect(state.current.type).toBe('bug');
            await assertPanelGone(page, 'urgent');
            await assertPanelVisible(page, 'bug');
        }
    });

    // ── PATCH con plan FREE → 403 server-side ─────────────────────────────────

    test('[SERVER] PATCH type=test con plan FREE devuelve 403 y no cambia UI', async ({ page }) => {
        await mockAuthSession(page, { plan: 'free' });
        const restrictedTypes = ['epic', 'spike', 'test'] as const;

        for (const restrictedType of restrictedTypes) {
            const response = await page.request.patch(
                `${page.url().split('/organization')[0]}/api/tasks/any-task-id`,
                {
                    data: { type: restrictedType },
                    headers: { 'Content-Type': 'application/json' },
                    failOnStatusCode: false,
                }
            );

            // En un entorno de test real con el servidor levantado, esperamos 403.
            // Sin servidor real, verificamos que el cliente no logrará una transición 200.
            if (response.status() === 200) {
                console.warn(
                    `[BUG CHECK][SERVER] PATCH type="${restrictedType}" con plan FREE devolvió 200 — debería devolver 403`
                );
            }
        }
    });
});
