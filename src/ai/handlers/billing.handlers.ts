/**
 * =============================================================================
 * BILLING HANDLERS - Ejecutores de Acciones del Módulo de Facturación
 * =============================================================================
 */

import type {
    CreateBillingOperationArgs,
    QueryBillingOperationsArgs,
    UpdateBillingOperationArgs,
    DeleteBillingOperationArgs,
    ManageBillingCategoriesArgs,
} from '../tools/billing.tools';
import type { ActionContext, ActionResult } from './types';

// ═════════════════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════════════════

type MembershipRole = 'OWNER' | 'ADMIN' | 'CREATOR' | 'VIEWER';

interface TeamMemberDoc {
    userEmail: string;
    prefs: { role: MembershipRole };
}

interface BillingOperationDoc {
    $id: string;
    type: 'income' | 'expense';
    import: number;
    category: string;
    date: string;
    partyName?: string;
    invoiceNumber?: string;
    status?: 'PENDING' | 'PAID' | 'OVERDUE';
    dueDate?: string;
    paymentMethod?: string;
    currency?: string;
    taxRate?: number;
    taxAmount?: number;
    note?: string;
    isArchived?: boolean;
    isDraft?: boolean;
}

interface BillingOptionsDoc {
    $id: string;
    incomeCategories: string[];
    expenseCategories: string[];
    teamId: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// HELPERS PRIVADOS
// ═════════════════════════════════════════════════════════════════════════════

async function fetchTeamMembers(baseUrl: string, cookie: string): Promise<TeamMemberDoc[]> {
    const res = await fetch(`${baseUrl}/api/team`, { headers: { 'Cookie': cookie } });
    if (!res.ok) return [];
    const json = await res.json() as { data?: TeamMemberDoc[] };
    return json.data || [];
}

function isViewer(teamMembers: TeamMemberDoc[], userEmail: string): boolean {
    const member = teamMembers.find(m => m.userEmail === userEmail);
    return member?.prefs?.role === 'VIEWER';
}

async function fetchActiveBillingOperations(baseUrl: string, cookie: string): Promise<BillingOperationDoc[]> {
    const res = await fetch(`${baseUrl}/api/billing`, { headers: { 'Cookie': cookie } });
    if (!res.ok) return [];
    const json = await res.json() as { data?: { documents?: BillingOperationDoc[] } };
    return json.data?.documents || [];
}

async function fetchArchivedBillingOperations(baseUrl: string, cookie: string): Promise<BillingOperationDoc[]> {
    const res = await fetch(`${baseUrl}/api/billing/archived`, { headers: { 'Cookie': cookie } });
    if (!res.ok) return [];
    const json = await res.json() as { data?: { documents?: BillingOperationDoc[] } };
    return json.data?.documents || [];
}

async function fetchDraftBillingOperations(baseUrl: string, cookie: string): Promise<BillingOperationDoc[]> {
    const res = await fetch(`${baseUrl}/api/billing/drafts`, { headers: { 'Cookie': cookie } });
    if (!res.ok) return [];
    const json = await res.json() as { data?: { documents?: BillingOperationDoc[] } };
    return json.data?.documents || [];
}

async function fetchBillingOptions(baseUrl: string, cookie: string): Promise<BillingOptionsDoc | null> {
    const res = await fetch(`${baseUrl}/api/billing/options`, { headers: { 'Cookie': cookie } });
    if (!res.ok) return null;
    const json = await res.json() as { data?: { documents?: BillingOptionsDoc[] } };
    const docs = json.data?.documents || [];
    return docs.length > 0 ? docs[0] : null;
}

const TYPE_LABEL: Record<string, string> = {
    income: 'Ingreso',
    expense: 'Gasto',
};

const STATUS_LABEL: Record<string, string> = {
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    OVERDUE: 'Vencido',
};

function formatCurrency(amount: number, currency?: string): string {
    const code = currency || 'EUR';
    try {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: code }).format(amount);
    } catch {
        return `${amount} ${code}`;
    }
}

function formatDate(dateStr: string): string {
    try {
        return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return dateStr;
    }
}

function formatOperationSummary(op: BillingOperationDoc): string {
    const typeLabel = TYPE_LABEL[op.type] || op.type;
    const amount = formatCurrency(op.import, op.currency);
    const date = formatDate(op.date);
    const party = op.partyName ? ` · ${op.partyName}` : '';
    const status = op.status ? ` · ${STATUS_LABEL[op.status] || op.status}` : '';
    const invoice = op.invoiceNumber ? ` · Factura: ${op.invoiceNumber}` : '';
    return `- **${typeLabel}** ${amount} — ${op.category}${party}${status}${invoice} — ${date}`;
}

type FindOperationOk = { ok: true; operation: BillingOperationDoc };
type FindOperationErr = { ok: false; result: ActionResult };
type FindOperationResult = FindOperationOk | FindOperationErr;

async function findBillingOperation(
    baseUrl: string,
    cookie: string,
    operationSearch: string,
    filterType: 'income' | 'expense' | undefined,
    actionName: string,
): Promise<FindOperationResult> {
    const [active, archived, drafts] = await Promise.all([
        fetchActiveBillingOperations(baseUrl, cookie),
        fetchArchivedBillingOperations(baseUrl, cookie),
        fetchDraftBillingOperations(baseUrl, cookie),
    ]);
    const all = [...active, ...archived, ...drafts];
    const lower = operationSearch.toLowerCase();

    let candidates = all.filter(op => {
        const matchParty = op.partyName?.toLowerCase().includes(lower);
        const matchInvoice = op.invoiceNumber?.toLowerCase().includes(lower);
        const matchNote = op.note?.toLowerCase().includes(lower);
        const matchCategory = op.category?.toLowerCase().includes(lower);
        return matchParty || matchInvoice || matchNote || matchCategory;
    });

    if (filterType) {
        candidates = candidates.filter(op => op.type === filterType);
    }

    if (candidates.length === 0) {
        return {
            ok: false,
            result: {
                success: false,
                actionName,
                message: `❌ No encontré ninguna operación que coincida con "${operationSearch}". Intenta con el nombre del cliente, número de factura o categoría.`,
            },
        };
    }

    if (candidates.length > 1) {
        const list = candidates.slice(0, 5).map(op => {
            const party = op.partyName ? `${op.partyName} · ` : '';
            const invoice = op.invoiceNumber ? `Fac. ${op.invoiceNumber} · ` : '';
            return `- **${TYPE_LABEL[op.type]}** ${formatCurrency(op.import, op.currency)} — ${party}${invoice}${op.category} (${formatDate(op.date)})`;
        }).join('\n');
        return {
            ok: false,
            result: {
                success: false,
                actionName,
                message: `Encontré varias operaciones que coinciden con "${operationSearch}":\n${list}\n\nSé más específico: usa el número de factura o el nombre exacto del cliente.`,
            },
        };
    }

    return { ok: true, operation: candidates[0] };
}

// ═════════════════════════════════════════════════════════════════════════════
// HANDLERS
// ═════════════════════════════════════════════════════════════════════════════

export async function handleCreateBillingOperation(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as CreateBillingOperationArgs;

    try {
        const teamMembers = await fetchTeamMembers(ctx.baseUrl, ctx.cookie || '');
        if (isViewer(teamMembers, ctx.userEmail)) {
            return {
                success: false,
                actionName: 'create_billing_operation',
                message: '❌ No tienes permisos para crear operaciones. Tu rol actual es **VIEWER**.',
            };
        }

        // Sync the category into existing billing options to avoid duplicate option documents.
        // The billing POST endpoint auto-creates a new options doc if the category is missing,
        // which would create duplicate documents if one already exists.
        const existingOptions = await fetchBillingOptions(ctx.baseUrl, ctx.cookie || '');
        if (existingOptions) {
            const field = args.type === 'income' ? 'incomeCategories' : 'expenseCategories';
            const currentCategories: string[] = existingOptions[field] || [];
            const categoryLower = args.category.toLowerCase();
            if (!currentCategories.some(c => c.toLowerCase() === categoryLower)) {
                const patchPayload: Record<string, string[]> = {
                    incomeCategories: existingOptions.incomeCategories,
                    expenseCategories: existingOptions.expenseCategories,
                };
                patchPayload[field] = [...currentCategories, args.category];
                await fetch(`${ctx.baseUrl}/api/billing/options/${existingOptions.$id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
                    body: JSON.stringify(patchPayload),
                });
            }
        }

        const today = new Date().toISOString().split('T')[0];

        const payload: Record<string, string | number | boolean | undefined> = {
            type: args.type,
            import: args.import,
            category: args.category,
            date: args.date || today,
            status: args.status || 'PENDING',
            currency: args.currency || 'EUR',
        };

        if (args.partyName) payload.partyName = args.partyName;
        if (args.invoiceNumber) payload.invoiceNumber = args.invoiceNumber;
        if (args.dueDate) payload.dueDate = args.dueDate;
        if (args.paymentMethod) payload.paymentMethod = args.paymentMethod;
        if (args.taxRate !== undefined) payload.taxRate = args.taxRate;
        if (args.note) payload.note = args.note;
        if (args.isDraft !== undefined) payload.isDraft = args.isDraft;

        const response = await fetch(`${ctx.baseUrl}/api/billing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json() as { error?: string };
            return {
                success: false,
                actionName: 'create_billing_operation',
                message: `❌ No se pudo crear la operación: ${error.error || 'Error desconocido'}`,
            };
        }

        const typeLabel = TYPE_LABEL[args.type];
        const amount = formatCurrency(args.import, args.currency);
        const statusLabel = STATUS_LABEL[args.status || 'PENDING'];
        const party = args.partyName ? `\n- Cliente/Proveedor: **${args.partyName}**` : '';
        const invoice = args.invoiceNumber ? `\n- Nº Factura: **${args.invoiceNumber}**` : '';
        const due = args.dueDate ? `\n- Vencimiento: ${formatDate(args.dueDate)}` : '';

        return {
            success: true,
            actionName: 'create_billing_operation',
            message: `✅ ${typeLabel} de **${amount}** creado correctamente.\n\n- Categoría: **${args.category}**\n- Estado: **${statusLabel}**\n- Fecha: ${formatDate(args.date || today)}${party}${invoice}${due}`,
        };
    } catch (error) {
        console.error('[CREATE_BILLING_OPERATION] Exception:', error);
        return {
            success: false,
            actionName: 'create_billing_operation',
            message: '❌ Error al crear la operación. Por favor, intenta de nuevo.',
        };
    }
}

export async function handleQueryBillingOperations(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as QueryBillingOperationsArgs;

    try {
        const source = args.source ?? 'active';
        let operations: BillingOperationDoc[];

        if (source === 'archived') {
            operations = await fetchArchivedBillingOperations(ctx.baseUrl, ctx.cookie || '');
        } else if (source === 'drafts') {
            operations = await fetchDraftBillingOperations(ctx.baseUrl, ctx.cookie || '');
        } else {
            operations = await fetchActiveBillingOperations(ctx.baseUrl, ctx.cookie || '');
        }

        // Filtrar por tipo
        if (args.type) {
            operations = operations.filter(op => op.type === args.type);
        }

        // Filtrar por estado
        if (args.status) {
            operations = operations.filter(op => op.status === args.status);
        }

        // Filtrar por cliente/proveedor
        if (args.partyName) {
            const lower = args.partyName.toLowerCase();
            operations = operations.filter(op => op.partyName?.toLowerCase().includes(lower));
        }

        // Filtrar por categoría
        if (args.category) {
            const lower = args.category.toLowerCase();
            operations = operations.filter(op => op.category.toLowerCase().includes(lower));
        }

        // Filtrar por vencimiento próximo
        if (args.upcomingDays !== undefined && args.upcomingDays > 0) {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const futureLimit = new Date(now);
            futureLimit.setDate(now.getDate() + args.upcomingDays);

            operations = operations.filter(op => {
                if (!op.dueDate) return false;
                const due = new Date(op.dueDate);
                due.setHours(0, 0, 0, 0);
                return due >= now && due <= futureLimit;
            });
        }

        // Búsqueda libre
        if (args.search) {
            const lower = args.search.toLowerCase();
            operations = operations.filter(op =>
                op.partyName?.toLowerCase().includes(lower) ||
                op.category?.toLowerCase().includes(lower) ||
                op.invoiceNumber?.toLowerCase().includes(lower) ||
                op.note?.toLowerCase().includes(lower)
            );
        }

        const limit = args.limit ?? 20;
        const total = operations.length;
        const shown = operations.slice(0, limit);

        if (shown.length === 0) {
            const sourceLabel =
                source === 'archived' ? 'archivadas' :
                    source === 'drafts' ? 'en borrador' :
                        'que coincidan con los filtros aplicados';
            return {
                success: true,
                actionName: 'query_billing_operations',
                message: `📭 No hay operaciones ${sourceLabel}.`,
            };
        }

        // Calcular totales
        const totalIncome = shown.filter(op => op.type === 'income').reduce((sum, op) => sum + op.import, 0);
        const totalExpense = shown.filter(op => op.type === 'expense').reduce((sum, op) => sum + op.import, 0);

        const list = shown.map(op => formatOperationSummary(op)).join('\n');

        let summary = `📊 **${shown.length}${total > limit ? ` de ${total}` : ''}** operaciones encontradas:\n\n${list}`;

        if (!args.type) {
            summary += `\n\n**Resumen:** Ingresos: ${formatCurrency(totalIncome)} · Gastos: ${formatCurrency(totalExpense)}`;
        } else if (args.type === 'income') {
            summary += `\n\n**Total ingresos:** ${formatCurrency(totalIncome)}`;
        } else {
            summary += `\n\n**Total gastos:** ${formatCurrency(totalExpense)}`;
        }

        if (total > limit) {
            summary += `\n\n_Mostrando los primeros ${limit}. Pide más con "muéstrame más" o filtra aún más._`;
        }

        return { success: true, actionName: 'query_billing_operations', message: summary };
    } catch (error) {
        console.error('[QUERY_BILLING_OPERATIONS] Exception:', error);
        return {
            success: false,
            actionName: 'query_billing_operations',
            message: '❌ Error al consultar las operaciones. Por favor, intenta de nuevo.',
        };
    }
}

export async function handleUpdateBillingOperation(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as UpdateBillingOperationArgs;

    try {
        const teamMembers = await fetchTeamMembers(ctx.baseUrl, ctx.cookie || '');
        if (isViewer(teamMembers, ctx.userEmail)) {
            return {
                success: false,
                actionName: 'update_billing_operation',
                message: '❌ No tienes permisos para editar operaciones. Tu rol actual es **VIEWER**.',
            };
        }

        const found = await findBillingOperation(
            ctx.baseUrl,
            ctx.cookie || '',
            args.operationSearch,
            args.filterType,
            'update_billing_operation',
        );
        if (!found.ok) return found.result;

        const operation = found.operation;

        const payload: Record<string, string | number | boolean | null | undefined> = {};

        if (args.import !== undefined) payload.import = args.import;
        if (args.category !== undefined) payload.category = args.category;
        if (args.date !== undefined) payload.date = args.date;
        if (args.partyName !== undefined) payload.partyName = args.partyName;
        if (args.invoiceNumber !== undefined) payload.invoiceNumber = args.invoiceNumber;
        if (args.status !== undefined) payload.status = args.status;
        if (args.clearDueDate) {
            payload.dueDate = null;
        } else if (args.dueDate !== undefined) {
            payload.dueDate = args.dueDate;
        }
        if (args.paymentMethod !== undefined) payload.paymentMethod = args.paymentMethod;
        if (args.currency !== undefined) payload.currency = args.currency;
        if (args.taxRate !== undefined) payload.taxRate = args.taxRate;
        if (args.note !== undefined) payload.note = args.note;
        if (args.isArchived !== undefined) payload.isArchived = args.isArchived;
        if (args.isDraft !== undefined) payload.isDraft = args.isDraft;

        if (Object.keys(payload).length === 0) {
            return {
                success: false,
                actionName: 'update_billing_operation',
                message: '⚠️ No se especificó ningún campo a actualizar.',
            };
        }

        const response = await fetch(`${ctx.baseUrl}/api/billing/${operation.$id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json() as { error?: string };
            return {
                success: false,
                actionName: 'update_billing_operation',
                message: `❌ No se pudo actualizar la operación: ${error.error || 'Error desconocido'}`,
            };
        }

        const typeLabel = TYPE_LABEL[operation.type];
        const amount = formatCurrency(operation.import, operation.currency);
        const party = operation.partyName ? ` de **${operation.partyName}**` : '';

        return {
            success: true,
            actionName: 'update_billing_operation',
            message: `✅ Operación **${typeLabel} ${amount}**${party} actualizada correctamente.`,
        };
    } catch (error) {
        console.error('[UPDATE_BILLING_OPERATION] Exception:', error);
        return {
            success: false,
            actionName: 'update_billing_operation',
            message: '❌ Error al actualizar la operación. Por favor, intenta de nuevo.',
        };
    }
}

export async function handleDeleteBillingOperation(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as DeleteBillingOperationArgs;

    try {
        const teamMembers = await fetchTeamMembers(ctx.baseUrl, ctx.cookie || '');
        if (isViewer(teamMembers, ctx.userEmail)) {
            return {
                success: false,
                actionName: 'delete_billing_operation',
                message: '❌ No tienes permisos para eliminar operaciones. Tu rol actual es **VIEWER**.',
            };
        }

        const found = await findBillingOperation(
            ctx.baseUrl,
            ctx.cookie || '',
            args.operationSearch,
            args.filterType,
            'delete_billing_operation',
        );
        if (!found.ok) return found.result;

        const operation = found.operation;

        const response = await fetch(`${ctx.baseUrl}/api/billing/${operation.$id}`, {
            method: 'DELETE',
            headers: { 'Cookie': ctx.cookie || '' },
        });

        if (!response.ok) {
            return {
                success: false,
                actionName: 'delete_billing_operation',
                message: '❌ No se pudo eliminar la operación.',
            };
        }

        const typeLabel = TYPE_LABEL[operation.type];
        const amount = formatCurrency(operation.import, operation.currency);
        const party = operation.partyName ? ` de **${operation.partyName}**` : '';

        return {
            success: true,
            actionName: 'delete_billing_operation',
            message: `✅ Operación **${typeLabel} ${amount}**${party} eliminada correctamente.`,
        };
    } catch (error) {
        console.error('[DELETE_BILLING_OPERATION] Exception:', error);
        return {
            success: false,
            actionName: 'delete_billing_operation',
            message: '❌ Error al eliminar la operación. Por favor, intenta de nuevo.',
        };
    }
}

export async function handleManageBillingCategories(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as ManageBillingCategoriesArgs;

    try {
        if (args.action !== 'list') {
            const teamMembers = await fetchTeamMembers(ctx.baseUrl, ctx.cookie || '');
            if (isViewer(teamMembers, ctx.userEmail)) {
                return {
                    success: false,
                    actionName: 'manage_billing_categories',
                    message: '❌ No tienes permisos para modificar categorías. Tu rol actual es **VIEWER**.',
                };
            }
        }

        const options = await fetchBillingOptions(ctx.baseUrl, ctx.cookie || '');

        // LIST
        if (args.action === 'list') {
            if (!options) {
                return {
                    success: true,
                    actionName: 'manage_billing_categories',
                    message: '📂 No hay categorías configuradas todavía. Puedes pedirme que las cree.',
                };
            }

            const incomeList = options.incomeCategories.length > 0
                ? options.incomeCategories.map(c => `  - ${c}`).join('\n')
                : '  _(ninguna)_';
            const expenseList = options.expenseCategories.length > 0
                ? options.expenseCategories.map(c => `  - ${c}`).join('\n')
                : '  _(ninguna)_';

            return {
                success: true,
                actionName: 'manage_billing_categories',
                message: `📂 **Categorías de facturación:**\n\n**Ingresos:**\n${incomeList}\n\n**Gastos:**\n${expenseList}`,
            };
        }

        // ADD
        if (args.action === 'add') {
            if (!args.categoryType || !args.categoryName) {
                return {
                    success: false,
                    actionName: 'manage_billing_categories',
                    message: '⚠️ Para agregar una categoría necesito saber el tipo (income/expense) y el nombre.',
                };
            }

            const field = args.categoryType === 'income' ? 'incomeCategories' : 'expenseCategories';
            const existing = options ? [...(options[field] || [])] : [];

            const nameLower = args.categoryName.toLowerCase();
            if (existing.some(c => c.toLowerCase() === nameLower)) {
                return {
                    success: false,
                    actionName: 'manage_billing_categories',
                    message: `⚠️ La categoría **"${args.categoryName}"** ya existe en ${TYPE_LABEL[args.categoryType].toLowerCase()}.`,
                };
            }

            const updated = [...existing, args.categoryName];
            const typeLabel = TYPE_LABEL[args.categoryType].toLowerCase();

            if (!options) {
                const newPayload = {
                    incomeCategories: args.categoryType === 'income' ? updated : [],
                    expenseCategories: args.categoryType === 'expense' ? updated : [],
                };
                const res = await fetch(`${ctx.baseUrl}/api/billing/options`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
                    body: JSON.stringify(newPayload),
                });
                if (!res.ok) {
                    return {
                        success: false,
                        actionName: 'manage_billing_categories',
                        message: '❌ No se pudo crear la categoría.',
                    };
                }
            } else {
                const patchPayload: Record<string, string[]> = {
                    incomeCategories: options.incomeCategories,
                    expenseCategories: options.expenseCategories,
                };
                patchPayload[field] = updated;

                const res = await fetch(`${ctx.baseUrl}/api/billing/options/${options.$id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
                    body: JSON.stringify(patchPayload),
                });
                if (!res.ok) {
                    return {
                        success: false,
                        actionName: 'manage_billing_categories',
                        message: '❌ No se pudo agregar la categoría.',
                    };
                }
            }

            return {
                success: true,
                actionName: 'manage_billing_categories',
                message: `✅ Categoría **"${args.categoryName}"** agregada a ${typeLabel}.`,
            };
        }

        // RENAME
        if (args.action === 'rename') {
            if (!args.categoryType || !args.oldCategoryName || !args.newCategoryName) {
                return {
                    success: false,
                    actionName: 'manage_billing_categories',
                    message: '⚠️ Para renombrar necesito: tipo (income/expense), nombre actual y nuevo nombre.',
                };
            }

            if (!options) {
                return {
                    success: false,
                    actionName: 'manage_billing_categories',
                    message: '❌ No hay categorías configuradas para renombrar.',
                };
            }

            const field = args.categoryType === 'income' ? 'incomeCategories' : 'expenseCategories';
            const existing: string[] = options[field] || [];
            const oldLower = args.oldCategoryName.toLowerCase();
            const idx = existing.findIndex(c => c.toLowerCase() === oldLower);

            if (idx === -1) {
                return {
                    success: false,
                    actionName: 'manage_billing_categories',
                    message: `❌ No encontré la categoría **"${args.oldCategoryName}"** en ${TYPE_LABEL[args.categoryType].toLowerCase()}.`,
                };
            }

            const updated = [...existing];
            updated[idx] = args.newCategoryName;

            const patchPayload: Record<string, string[]> = {
                incomeCategories: options.incomeCategories,
                expenseCategories: options.expenseCategories,
            };
            patchPayload[field] = updated;

            const res = await fetch(`${ctx.baseUrl}/api/billing/options/${options.$id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
                body: JSON.stringify(patchPayload),
            });
            if (!res.ok) {
                return {
                    success: false,
                    actionName: 'manage_billing_categories',
                    message: '❌ No se pudo renombrar la categoría.',
                };
            }

            return {
                success: true,
                actionName: 'manage_billing_categories',
                message: `✅ Categoría **"${args.oldCategoryName}"** renombrada a **"${args.newCategoryName}"**.`,
            };
        }

        // REMOVE
        if (args.action === 'remove') {
            if (!args.categoryType || !args.categoryName) {
                return {
                    success: false,
                    actionName: 'manage_billing_categories',
                    message: '⚠️ Para eliminar necesito el tipo (income/expense) y el nombre de la categoría.',
                };
            }

            if (!options) {
                return {
                    success: false,
                    actionName: 'manage_billing_categories',
                    message: '❌ No hay categorías configuradas.',
                };
            }

            const field = args.categoryType === 'income' ? 'incomeCategories' : 'expenseCategories';
            const existing: string[] = options[field] || [];
            const nameLower = args.categoryName.toLowerCase();
            const updated = existing.filter(c => c.toLowerCase() !== nameLower);

            if (updated.length === existing.length) {
                return {
                    success: false,
                    actionName: 'manage_billing_categories',
                    message: `❌ No encontré la categoría **"${args.categoryName}"** en ${TYPE_LABEL[args.categoryType].toLowerCase()}.`,
                };
            }

            const patchPayload: Record<string, string[]> = {
                incomeCategories: options.incomeCategories,
                expenseCategories: options.expenseCategories,
            };
            patchPayload[field] = updated;

            const res = await fetch(`${ctx.baseUrl}/api/billing/options/${options.$id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
                body: JSON.stringify(patchPayload),
            });
            if (!res.ok) {
                return {
                    success: false,
                    actionName: 'manage_billing_categories',
                    message: '❌ No se pudo eliminar la categoría.',
                };
            }

            return {
                success: true,
                actionName: 'manage_billing_categories',
                message: `✅ Categoría **"${args.categoryName}"** eliminada de ${TYPE_LABEL[args.categoryType].toLowerCase()}.`,
            };
        }

        return {
            success: false,
            actionName: 'manage_billing_categories',
            message: '⚠️ Acción no reconocida.',
        };
    } catch (error) {
        console.error('[MANAGE_BILLING_CATEGORIES] Exception:', error);
        return {
            success: false,
            actionName: 'manage_billing_categories',
            message: '❌ Error al gestionar las categorías. Por favor, intenta de nuevo.',
        };
    }
}

export const BILLING_HANDLERS = {
    create_billing_operation: handleCreateBillingOperation,
    query_billing_operations: handleQueryBillingOperations,
    update_billing_operation: handleUpdateBillingOperation,
    delete_billing_operation: handleDeleteBillingOperation,
    manage_billing_categories: handleManageBillingCategories,
};
