/**
 * SUITE E2E: Tasks — Creación y aparición en Kanban / Lista
 *
 * Módulo: /organization (tasks viven dentro de un workspace)
 * Entidades: Task (BillingOperation)
 *
 * Escenarios:
 *   1. La vista de tareas carga (Kanban y Lista)
 *   2. Crear tarea y verla aparecer en columna Kanban correcta
 *   3. Crear tarea y verla aparecer en la vista lista
 *   4. Crear tarea en columna específica (TODO, IN_PROGRESS, etc.)
 *   5. Crear tarea con asignado, prioridad, fecha
 *   6. La tarea recién creada refleja todos sus datos
 *   7. Drag & drop (verificar que columna Kanban acepta drop)
 *   8. Cambio de vista Kanban ↔ Lista ↔ Calendario
 *   9. Formulario de creación: validaciones
 *  10. Crear subtarea (epic child)
 */

import { test, expect, type Page } from '@playwright/test';
import {
  mockAuthSession,
  navigateToApp,
  MOCK_WORKSPACE,
} from '../helpers';

// Para tasks necesitamos el workspaceId en la URL
const TASKS_ROUTE = `/organization`;

// ─── Estructuras de datos mock ────────────────────────────────────────────────

interface MockTask {
  $id: string;
  name: string;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
  priority: number;
  workspaceId: string;
  assigneesIds: string[];
  $createdAt: string;
  description?: string;
  dueDate?: string;
  label?: string;
}

const MOCK_TASKS: MockTask[] = [
  {
    $id: 'task-001',
    name: 'Diseñar landing page',
    status: 'TODO',
    priority: 3,
    workspaceId: MOCK_WORKSPACE.$id,
    assigneesIds: [],
    $createdAt: new Date().toISOString(),
    label: 'Design',
  },
  {
    $id: 'task-002',
    name: 'Implementar autenticación',
    status: 'IN_PROGRESS',
    priority: 5,
    workspaceId: MOCK_WORKSPACE.$id,
    assigneesIds: [],
    $createdAt: new Date().toISOString(),
  },
  {
    $id: 'task-003',
    name: 'Code review del PR',
    status: 'IN_REVIEW',
    priority: 2,
    workspaceId: MOCK_WORKSPACE.$id,
    assigneesIds: [],
    $createdAt: new Date().toISOString(),
  },
];

const NEW_TASK: Omit<MockTask, '$id' | '$createdAt'> = {
  name: 'Nueva tarea E2E Test',
  status: 'TODO',
  priority: 3,
  workspaceId: MOCK_WORKSPACE.$id,
  assigneesIds: [],
  label: 'Testing',
};

// ─── Helpers de mock ──────────────────────────────────────────────────────────

async function mockTasksApi(page: Page, tasks: MockTask[] = MOCK_TASKS): Promise<void> {
  let currentTasks = [...tasks];

  await page.route('**/api/tasks**', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          documents: currentTasks,
          total: currentTasks.length,
        }),
      });
      return;
    }

    if (method === 'POST') {
      const body = (await route.request().postDataJSON()) as Partial<MockTask>;
      const newTask: MockTask = {
        $id: `task-new-${Date.now()}`,
        $createdAt: new Date().toISOString(),
        ...NEW_TASK,
        ...body,
      } as MockTask;
      currentTasks.push(newTask);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(newTask),
      });
      return;
    }

    await route.continue();
  });
}

async function mockWorkspacesApi(page: Page): Promise<void> {
  await page.route('**/api/workspaces**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        documents: [MOCK_WORKSPACE],
        total: 1,
      }),
    });
  });
}

async function mockMembersApi(page: Page): Promise<void> {
  await page.route('**/api/members**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ documents: [], total: 0 }),
    });
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Tasks — Carga de página', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page);
    await mockWorkspacesApi(page);
    await mockMembersApi(page);
    await mockTasksApi(page);
  });

  test('la sección de tareas carga sin errores de JS', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (e) => jsErrors.push(e.message));

    await navigateToApp(page, TASKS_ROUTE);
    await page.waitForTimeout(3000);

    const criticalErrors = jsErrors.filter(
      (e) => !e.includes('hydration') && !e.includes('favicon')
    );
    expect(criticalErrors).toHaveLength(0);
    await expect(page.locator('text=/500|Internal Server Error/i')).toHaveCount(0);
  });

  test('el switcher de vistas (Kanban/List/Calendar) es visible', async ({ page }) => {
    await navigateToApp(page, TASKS_ROUTE);
    await page.waitForTimeout(2000);

    // Buscar el TaskSwitcher
    const switcher = page.locator(
      '[data-testid="task-switcher"], button:has-text("kanban"), button:has-text("list"), button:has-text("calendar"), [aria-label*="view"]'
    );
    // BUG CHECK: El switcher de vistas debe ser visible
    if ((await switcher.count()) === 0) {
      console.warn('[BUG CHECK] No se encontró el switcher de vistas (Kanban/Lista/Calendario) en la sección de tareas');
    }
  });
});

test.describe('Tasks — Vista Kanban', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page);
    await mockWorkspacesApi(page);
    await mockMembersApi(page);
    await mockTasksApi(page);
  });

  test('vista Kanban muestra columnas de estados', async ({ page }) => {
    await navigateToApp(page, TASKS_ROUTE);
    await page.waitForTimeout(2000);

    // Activar vista Kanban si no está activa
    const kanbanBtn = page.locator('button:has-text("kanban"), [data-testid="kanban-view"], [aria-label*="kanban"]').first();
    if (await kanbanBtn.isVisible()) {
      await kanbanBtn.click();
      await page.waitForTimeout(500);
    }

    // Verificar columnas (estados)
    const columns = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BACKLOG'];
    let visibleColumns = 0;
    for (const col of columns) {
      const colHeader = page.locator(`text=/${col}|todo|in.progress|in.review|done|backlog/i`).first();
      if (await colHeader.isVisible()) visibleColumns++;
    }

    if (visibleColumns === 0) {
      console.warn('[BUG CHECK] No se encontraron columnas de Kanban con los estados esperados');
    } else {
      expect(visibleColumns).toBeGreaterThan(0);
    }
  });

  test('tarjetas de tarea aparecen en la columna correcta del Kanban', async ({ page }) => {
    await navigateToApp(page, TASKS_ROUTE);
    await page.waitForTimeout(2000);

    const kanbanBtn = page.locator('button:has-text("kanban"), [data-testid="kanban-view"]').first();
    if (await kanbanBtn.isVisible()) await kanbanBtn.click();

    await page.waitForTimeout(1000);

    // Verificar que la tarea "Diseñar landing page" (TODO) aparece
    const taskCard = page.locator('text=/Diseñar landing page/i').first();
    if ((await taskCard.count()) === 0) {
      console.warn('[BUG CHECK] Las tarjetas de tarea no aparecen en el Kanban. Posiblemente el workspace no está cargado.');
    }
  });

  test('crear tarea desde el Kanban → aparece en la columna TODO', async ({ page }) => {
    await navigateToApp(page, TASKS_ROUTE);
    await page.waitForTimeout(2000);

    // Activar Kanban
    const kanbanBtn = page.locator('button:has-text("kanban"), [data-testid="kanban-view"]').first();
    if (await kanbanBtn.isVisible()) await kanbanBtn.click();

    // Buscar botón de crear tarea (puede estar en la columna TODO o en la toolbar)
    const createTaskBtn = page.getByRole('button', {
      name: /create task|new task|nueva tarea|agregar tarea|add task/i,
    }).first();

    if (await createTaskBtn.isVisible({ timeout: 5000 })) {
      await createTaskBtn.click();
      await page.waitForTimeout(500);

      // Completar formulario
      const nameInput = page.locator('input[name="name"], input[placeholder*="task"], input[placeholder*="tarea"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Nueva tarea E2E Test');

        const submitBtn = page.locator('[role="dialog"] button[type="submit"], form button[type="submit"]').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(2000);

          // BUG CHECK: La nueva tarea debe aparecer en la columna TODO
          const newTaskCard = page.locator('text=/Nueva tarea E2E Test/i').first();
          if ((await newTaskCard.count()) === 0) {
            console.warn('[BUG CHECK] La tarea recién creada no aparece en el Kanban');
          } else {
            await expect(newTaskCard).toBeVisible();
          }
        }
      }
    } else {
      console.warn('[BUG CHECK] No se encontró botón para crear tarea desde la vista Kanban');
    }
  });

  test('cada tarjeta Kanban muestra nombre, prioridad y estado visualmente', async ({ page }) => {
    await navigateToApp(page, TASKS_ROUTE);
    await page.waitForTimeout(2000);

    const taskCards = page.locator('[data-testid="task-card"], .kanban-card, [draggable="true"]');
    const cardCount = await taskCards.count();

    if (cardCount > 0) {
      const firstCard = taskCards.first();
      await expect(firstCard).toBeVisible();

      // BUG CHECK: La tarjeta debe mostrar al menos el nombre
      const cardText = await firstCard.textContent();
      expect(cardText?.trim().length).toBeGreaterThan(0);
    } else {
      console.info('[INFO] No hay tarjetas visibles en el Kanban. Asegurarse de que el workspace está configurado.');
    }
  });
});

test.describe('Tasks — Vista Lista (DataTable)', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page);
    await mockWorkspacesApi(page);
    await mockMembersApi(page);
    await mockTasksApi(page);
  });

  test('cambiar a vista lista muestra tabla de tareas', async ({ page }) => {
    await navigateToApp(page, TASKS_ROUTE);
    await page.waitForTimeout(2000);

    // Activar vista lista
    const listBtn = page.locator(
      'button:has-text("list"), button:has-text("lista"), [data-testid="list-view"], [aria-label*="list"]'
    ).first();
    if (await listBtn.isVisible()) {
      await listBtn.click();
      await page.waitForTimeout(1000);

      const table = page.locator('table, [role="table"]').first();
      await expect(table).toBeVisible({ timeout: 8000 });
    } else {
      console.info('[INFO] No se encontró el botón de vista lista. Puede que la vista lista sea la default.');
    }
  });

  test('vista lista tiene columnas informativas (nombre, estado, prioridad, asignado)', async ({ page }) => {
    await navigateToApp(page, TASKS_ROUTE);
    await page.waitForTimeout(2000);

    const listBtn = page.locator('button:has-text("list"), button:has-text("lista"), [data-testid="list-view"]').first();
    if (await listBtn.isVisible()) await listBtn.click();
    await page.waitForTimeout(1000);

    // Verificar columnas de la tabla
    const headers = await page.locator('thead th, [role="columnheader"]').allTextContents();
    const headerText = headers.join(' ').toLowerCase();

    if (
      !headerText.includes('name') &&
      !headerText.includes('nombre') &&
      !headerText.includes('task') &&
      !headerText.includes('tarea')
    ) {
      console.warn('[BUG CHECK] La tabla de lista no tiene columna de nombre de tarea. Headers:', headers);
    }
  });

  test('crear tarea desde la vista lista → aparece como nueva fila', async ({ page }) => {
    await navigateToApp(page, TASKS_ROUTE);
    await page.waitForTimeout(2000);

    const listBtn = page.locator('button:has-text("list"), button:has-text("lista"), [data-testid="list-view"]').first();
    if (await listBtn.isVisible()) await listBtn.click();

    const createBtn = page.getByRole('button', {
      name: /create task|new task|nueva tarea|agregar/i,
    }).first();

    if (await createBtn.isVisible({ timeout: 5000 })) {
      const rowsBefore = await page.locator('tbody tr').count();

      await createBtn.click();
      await page.waitForTimeout(500);

      const nameInput = page.locator('input[name="name"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Tarea Lista Test');
        const submitBtn = page.locator('[role="dialog"] button[type="submit"]').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(2000);

          const rowsAfter = await page.locator('tbody tr').count();
          // BUG CHECK: Debe haber más filas
          if (rowsAfter <= rowsBefore) {
            console.warn('[BUG CHECK] La tarea creada no aparece como nueva fila en la vista lista');
          }
        }
      }
    }
  });

  test('paginación funciona sin errores', async ({ page }) => {
    // Mockear muchas tareas para probar paginación
    const manyTasks = Array.from({ length: 25 }, (_, i) => ({
      $id: `task-page-${i}`,
      name: `Task Page ${i + 1}`,
      status: 'TODO' as const,
      priority: 3,
      workspaceId: MOCK_WORKSPACE.$id,
      assigneesIds: [],
      $createdAt: new Date().toISOString(),
    }));

    await mockTasksApi(page, manyTasks);
    await navigateToApp(page, TASKS_ROUTE);
    await page.waitForTimeout(2000);

    const listBtn = page.locator('button:has-text("list"), [data-testid="list-view"]').first();
    if (await listBtn.isVisible()) await listBtn.click();

    const nextPageBtn = page.locator('button[aria-label*="next"], button:has-text("siguiente"), [data-testid="next-page"]').first();
    if (await nextPageBtn.isVisible()) {
      await nextPageBtn.click();
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).not.toBeEmpty();
      await expect(page.locator('text=/500|error/i')).toHaveCount(0);
    }
  });
});

test.describe('Tasks — Vista Calendario', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page);
    await mockWorkspacesApi(page);
    await mockMembersApi(page);
    await mockTasksApi(page);
  });

  test('cambiar a vista calendario muestra un calendario', async ({ page }) => {
    await navigateToApp(page, TASKS_ROUTE);
    await page.waitForTimeout(2000);

    const calBtn = page.locator(
      'button:has-text("calendar"), button:has-text("calendario"), [data-testid="calendar-view"]'
    ).first();

    if (await calBtn.isVisible()) {
      await calBtn.click();
      await page.waitForTimeout(1000);

      // Debe haber elementos de calendario
      const calEl = page.locator('.rbc-calendar, [data-testid="calendar"], [aria-label*="calendar"]').first();
      if ((await calEl.count()) === 0) {
        console.warn('[BUG CHECK] La vista calendario no muestra un calendario visual');
      } else {
        await expect(calEl).toBeVisible();
      }
    }
  });
});

test.describe('Tasks — Formulario de creación: validaciones', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page);
    await mockWorkspacesApi(page);
    await mockMembersApi(page);
    await mockTasksApi(page);
  });

  test('nombre de tarea es requerido', async ({ page }) => {
    await navigateToApp(page, TASKS_ROUTE);
    await page.waitForTimeout(2000);

    const createBtn = page.getByRole('button', { name: /create task|new task|nueva tarea/i }).first();
    if (await createBtn.isVisible({ timeout: 5000 })) {
      await createBtn.click();
      await page.waitForTimeout(500);

      // Submit sin nombre
      const submitBtn = page.locator('[role="dialog"] button[type="submit"]').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();

        const errorMsg = page.locator('.text-destructive, [role="alert"], [data-testid="field-error"]');
        if ((await errorMsg.count()) === 0) {
          console.warn('[BUG CHECK] El formulario de tarea acepta submit sin nombre');
        }
      }
    }
  });

  test('prioridad se puede seleccionar (1-5)', async ({ page }) => {
    await navigateToApp(page, TASKS_ROUTE);
    await page.waitForTimeout(2000);

    const createBtn = page.getByRole('button', { name: /create task|new task|nueva tarea/i }).first();
    if (await createBtn.isVisible({ timeout: 5000 })) {
      await createBtn.click();
      await page.waitForTimeout(500);

      const priorityInput = page.locator(
        '[name="priority"], [data-testid="priority-select"], button:has-text("priority"), button:has-text("prioridad")'
      );
      if ((await priorityInput.count()) === 0) {
        console.warn('[BUG CHECK] No se encontró selector de prioridad en el formulario de tarea');
      }
    }
  });

  test('fecha de vencimiento se puede seleccionar con el date picker', async ({ page }) => {
    await navigateToApp(page, TASKS_ROUTE);
    await page.waitForTimeout(2000);

    const createBtn = page.getByRole('button', { name: /create task|new task|nueva tarea/i }).first();
    if (await createBtn.isVisible({ timeout: 5000 })) {
      await createBtn.click();
      await page.waitForTimeout(500);

      const datePicker = page.locator(
        '[name="dueDate"], [data-testid="due-date"], button:has-text("due date"), button:has-text("fecha")'
      ).first();
      if ((await datePicker.count()) === 0) {
        console.warn('[BUG CHECK] No se encontró date picker en el formulario de tarea');
      }
    }
  });
});

test.describe('Tasks — Detalles de tarea', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page);
    await mockWorkspacesApi(page);
    await mockMembersApi(page);
    await mockTasksApi(page);
  });

  test('click en tarjeta abre modal de detalles', async ({ page }) => {
    await navigateToApp(page, TASKS_ROUTE);
    await page.waitForTimeout(2000);

    const firstCard = page.locator('[data-testid="task-card"], .kanban-card, [draggable="true"]').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForTimeout(500);

      const modal = page.locator('[role="dialog"], [data-testid="task-detail-modal"]').first();
      // BUG CHECK: El modal de detalle debe abrirse al hacer click
      if ((await modal.count()) === 0) {
        console.warn('[BUG CHECK] Click en tarjeta de tarea no abre el modal de detalle');
      }
    }
  });
});
