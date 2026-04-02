/**
 * =============================================================================
 * TOOLS INDEX - Punto Central de Todas las Herramientas
 * =============================================================================
 *
 * Este archivo centraliza todas las tools de diferentes módulos.
 * Importa y combina las tools de cada feature para formar ALL_TOOLS.
 *
 * Para agregar una nueva tool:
 * 1. Créala en el archivo correspondiente (ej: tasks.tools.ts)
 * 2. Impórtala y agrégala a ALL_TOOLS aquí
 */

import { HOME_TOOLS } from './home.tools';
import { TASKS_TOOLS } from './tasks.tools';
import { BILLING_TOOLS } from './billing.tools';
import { DEALS_TOOLS } from './deals.tools';

/**
 * Lista completa de todas las herramientas disponibles.
 * La IA recibirá este array y decidirá cuál usar.
 */
export const ALL_TOOLS = [
    ...HOME_TOOLS,
    ...TASKS_TOOLS,
    ...BILLING_TOOLS,
    ...DEALS_TOOLS,
    // Cuando agregues más módulos, impórtalos aquí:
    // ...RECORDS_TOOLS,
    // ...TEAM_TOOLS,
];

// Tools available on PLUS plan: only tasks and notes (no deals, billing)
export const PLUS_TOOLS = [
    ...HOME_TOOLS,
    ...TASKS_TOOLS,
];

// Re-exportar tipos de tools específicas para conveniencia
export type { CreateNoteArgs, UpdateNoteArgs, DeleteNoteArgs, SendMessageArgs } from './home.tools';
export type {
    CreateTaskArgs,
    DeleteTaskArgs,
    UpdateTaskArgs,
    AddTaskCommentArgs,
    AddChecklistItemArgs,
    AssignTaskMemberArgs,
    BulkMoveTasksArgs,
    ArchiveTaskArgs,
    QueryTasksArgs,
} from './tasks.tools';
export type {
    CreateBillingOperationArgs,
    QueryBillingOperationsArgs,
    UpdateBillingOperationArgs,
    DeleteBillingOperationArgs,
    ManageBillingCategoriesArgs,
} from './billing.tools';
export type {
    CreateDealArgs,
    UpdateDealArgs,
    DeleteDealArgs,
    QueryDealsArgs,
    AddDealCommentArgs,
    ManageDealAssigneesArgs,
    BulkUpdateDealsArgs,
    QueryDealGoalsArgs,
} from './deals.tools';
