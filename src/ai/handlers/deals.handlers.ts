/**
 * =============================================================================
 * DEALS HANDLERS - Ejecutores de Acciones del Módulo de Ventas (Pipeline)
 * =============================================================================
 */

import type {
    CreateDealArgs,
    UpdateDealArgs,
    DeleteDealArgs,
    QueryDealsArgs,
    AddDealCommentArgs,
    ManageDealAssigneesArgs,
    BulkUpdateDealsArgs,
    QueryDealGoalsArgs,
} from '../tools/deals.tools';
import type { ActionContext, ActionResult } from './types';

// ═════════════════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════════════════

interface DealAssignee {
    id: string;
    memberId: string;
    name: string;
    email: string;
    avatarId: string | null;
}

interface DealActivity {
    id: string;
    content: string;
    author: string;
    timestamp: string;
    type?: string;
}

interface DealDoc {
    id: string;
    title: string;
    description: string;
    company: string;
    companyResponsabileName: string;
    companyResponsabileEmail: string;
    companyResponsabilePhoneNumber: string;
    amount: number;
    currency: string;
    status: string;
    priority: number;
    expectedCloseDate: string | null;
    lastStageChangedAt: string | null;
    outcome: string;
    nextStep: string;
    linkedDraftId: string | null;
    createdAt: string;
    assignees: DealAssignee[];
    activities: DealActivity[];
}

interface SellerDoc {
    $id: string;
    memberId: string;
    name: string;
    email: string;
    avatarId: string | null;
}

interface BoardDoc {
    id: string;
    name: string;
    currencies: string[];
    activeGoalId: string | null;
    createdAt: string;
}

interface GoalDoc {
    id: string;
    boardId: string;
    period: string;
    targetAmount: number;
    targetReached: boolean;
    currency: string;
    totalDeals: number;
    totalDealsWon: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// LABELS
// ═════════════════════════════════════════════════════════════════════════════

const STAGE_LABEL: Record<string, string> = {
    LEADS: 'Leads',
    QUALIFICATION: 'Calificación',
    NEGOTIATION: 'Negociación',
    CLOSED: 'Cerrado',
};

const OUTCOME_LABEL: Record<string, string> = {
    PENDING: 'Pendiente',
    WON: 'Ganado',
    LOST: 'Perdido',
};

const PRIORITY_LABEL: Record<number, string> = {
    1: 'Baja',
    2: 'Media',
    3: 'Alta',
};

// ═════════════════════════════════════════════════════════════════════════════
// HELPERS PRIVADOS
// ═════════════════════════════════════════════════════════════════════════════

async function fetchDeals(baseUrl: string, cookie: string): Promise<DealDoc[]> {
    const res = await fetch(`${baseUrl}/api/sells`, { headers: { 'Cookie': cookie } });
    if (!res.ok) return [];
    const json = await res.json() as { data?: { documents?: DealDoc[] } };
    return json.data?.documents ?? [];
}

async function fetchSellers(baseUrl: string, cookie: string): Promise<SellerDoc[]> {
    const res = await fetch(`${baseUrl}/api/sells/sellers`, { headers: { 'Cookie': cookie } });
    if (!res.ok) return [];
    const json = await res.json() as { data?: { documents?: SellerDoc[] } };
    return json.data?.documents ?? [];
}

async function fetchBoards(baseUrl: string, cookie: string): Promise<BoardDoc[]> {
    const res = await fetch(`${baseUrl}/api/sells/boards`, { headers: { 'Cookie': cookie } });
    if (!res.ok) return [];
    const json = await res.json() as { data?: { documents?: BoardDoc[] } };
    return json.data?.documents ?? [];
}

async function fetchGoalsForBoard(baseUrl: string, cookie: string, boardId: string): Promise<GoalDoc[]> {
    const res = await fetch(`${baseUrl}/api/sells/boards/${boardId}/goals`, { headers: { 'Cookie': cookie } });
    if (!res.ok) return [];
    const json = await res.json() as { data?: { documents?: GoalDoc[] } };
    return json.data?.documents ?? [];
}

function findDeal(deals: DealDoc[], search: string): DealDoc | null {
    const q = search.toLowerCase().trim();
    return (
        deals.find((d) => d.id === search) ??
        deals.find((d) => d.title.toLowerCase() === q) ??
        deals.find((d) => d.title.toLowerCase().includes(q)) ??
        deals.find((d) => d.company.toLowerCase().includes(q)) ??
        null
    );
}

function findSeller(sellers: SellerDoc[], nameOrEmail: string): SellerDoc | null {
    const q = nameOrEmail.toLowerCase().trim();
    return (
        sellers.find((s) => s.name.toLowerCase() === q) ??
        sellers.find((s) => s.email.toLowerCase() === q) ??
        sellers.find((s) => s.name.toLowerCase().includes(q)) ??
        null
    );
}

function getPeriodRange(period: string): { start: Date; end: Date } {
    const now = new Date();
    switch (period) {
        case 'THIS_WEEK': {
            const start = new Date(now);
            start.setDate(now.getDate() - now.getDay());
            start.setHours(0, 0, 0, 0);
            return { start, end: new Date() };
        }
        case 'THIS_MONTH': {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return { start, end: new Date() };
        }
        case 'LAST_MONTH': {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
            return { start, end };
        }
        case 'THIS_YEAR': {
            const start = new Date(now.getFullYear(), 0, 1);
            return { start, end: new Date() };
        }
        default:
            return { start: new Date(0), end: new Date() };
    }
}

function formatCurrency(amount: number, currency: string): string {
    return `${currency} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function dealSummaryLine(deal: DealDoc): string {
    const stage = STAGE_LABEL[deal.status] ?? deal.status;
    const outcome = OUTCOME_LABEL[deal.outcome] ?? deal.outcome;
    const amount = formatCurrency(deal.amount, deal.currency);
    const assigneeNames = deal.assignees.map((a) => a.name).filter(Boolean).join(', ') || '—';
    return `• **${deal.title}** (${deal.company}) — ${amount} | ${stage} | ${outcome} | Asignado: ${assigneeNames}`;
}

// ═════════════════════════════════════════════════════════════════════════════
// HANDLERS
// ═════════════════════════════════════════════════════════════════════════════

async function handleCreateDeal(ctx: ActionContext): Promise<ActionResult> {
    const { baseUrl, cookie } = ctx;
    const {
        title, company, amount, currency,
        status, priority, description,
        companyResponsabileName, companyResponsabileEmail, companyResponsabilePhoneNumber,
        expectedCloseDate, nextStep, outcome,
    } = ctx.args as unknown as CreateDealArgs;

    if (process.env.NODE_ENV === 'development') console.log('[CREATE_DEAL] Args received:', { title, company, amount, currency, status });

    const body: Record<string, unknown> = { title, company, amount, currency };
    if (status) body.status = status;
    if (priority) body.priority = priority;
    if (description) body.description = description;
    if (companyResponsabileName) body.companyResponsabileName = companyResponsabileName;
    if (companyResponsabileEmail) body.companyResponsabileEmail = companyResponsabileEmail;
    if (companyResponsabilePhoneNumber) body.companyResponsabilePhoneNumber = companyResponsabilePhoneNumber;
    if (expectedCloseDate) body.expectedCloseDate = expectedCloseDate;
    if (nextStep) body.nextStep = nextStep;
    if (outcome) body.outcome = outcome;

    const res = await fetch(`${baseUrl}/api/sells`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        return { success: false, message: `❌ Error al crear el deal: ${err}`, actionName: 'create_deal' };
    }

    const { data } = await res.json() as { data: { id: string } };
    const stageName = STAGE_LABEL[status ?? 'LEADS'] ?? 'Leads';
    const currencyAmount = formatCurrency(amount, currency);

    return {
        success: true,
        message: `✅ Deal creado: **${title}** — ${company} — ${currencyAmount} en etapa ${stageName}.`,
        actionName: 'create_deal',
        data,
    };
}

async function handleUpdateDeal(ctx: ActionContext): Promise<ActionResult> {
    const { baseUrl, cookie } = ctx;
    const {
        dealSearch,
        clearExpectedCloseDate,
        expectedCloseDate,
        increasePriority,
        decreasePriority,
        ...updateFields
    } = ctx.args as unknown as UpdateDealArgs;

    const deals = await fetchDeals(baseUrl, cookie);
    const deal = findDeal(deals, dealSearch);
    if (!deal) {
        return {
            success: false,
            message: `❌ No encontré ningún deal que coincida con "${dealSearch}".`,
            actionName: 'update_deal',
        };
    }

    // Handle relative priority changes (1=Baja, 2=Media, 3=Alta)
    if (increasePriority) {
        const current = deal.priority ?? 2;
        const next = Math.min(3, current + 1);
        if (next !== current) updateFields.priority = next;
    } else if (decreasePriority) {
        const current = deal.priority ?? 2;
        const next = Math.max(1, current - 1);
        if (next !== current) updateFields.priority = next;
    }

    const body: Record<string, unknown> = { ...updateFields };

    if (clearExpectedCloseDate) {
        body.expectedCloseDate = null;
    } else if (expectedCloseDate) {
        body.expectedCloseDate = expectedCloseDate;
    }

    const res = await fetch(`${baseUrl}/api/sells/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        return { success: false, message: `❌ Error al actualizar el deal: ${err}`, actionName: 'update_deal' };
    }

    const appliedChanges: string[] = [];
    if (updateFields.status) appliedChanges.push(`etapa → ${STAGE_LABEL[updateFields.status] ?? updateFields.status}`);
    if (updateFields.outcome) appliedChanges.push(`resultado → ${OUTCOME_LABEL[updateFields.outcome] ?? updateFields.outcome}`);
    if (updateFields.title) appliedChanges.push(`título → "${updateFields.title}"`);
    if (updateFields.amount !== undefined) appliedChanges.push(`monto → ${formatCurrency(updateFields.amount, updateFields.currency ?? deal.currency)}`);
    if (updateFields.priority !== undefined) appliedChanges.push(`prioridad → ${PRIORITY_LABEL[updateFields.priority] ?? updateFields.priority}`);
    if (updateFields.nextStep) appliedChanges.push(`próximo paso → "${updateFields.nextStep}"`);
    if (clearExpectedCloseDate) appliedChanges.push('fecha de cierre eliminada');
    else if (expectedCloseDate) appliedChanges.push(`fecha de cierre → ${expectedCloseDate}`);

    const summary = appliedChanges.length > 0 ? appliedChanges.join(', ') : 'campos actualizados';

    return {
        success: true,
        message: `✅ Deal **${deal.title}** (${deal.company}) actualizado: ${summary}.`,
        actionName: 'update_deal',
    };
}

async function handleDeleteDeal(ctx: ActionContext): Promise<ActionResult> {
    const { baseUrl, cookie } = ctx;
    const { dealSearch } = ctx.args as unknown as DeleteDealArgs;

    const deals = await fetchDeals(baseUrl, cookie);
    const deal = findDeal(deals, dealSearch);
    if (!deal) {
        return {
            success: false,
            message: `❌ No encontré ningún deal que coincida con "${dealSearch}".`,
            actionName: 'delete_deal',
        };
    }

    const res = await fetch(`${baseUrl}/api/sells/${deal.id}`, {
        method: 'DELETE',
        headers: { 'Cookie': cookie },
    });

    if (!res.ok) {
        const err = await res.text();
        return { success: false, message: `❌ Error al eliminar el deal: ${err}`, actionName: 'delete_deal' };
    }

    return {
        success: true,
        message: `✅ Deal **${deal.title}** (${deal.company}) eliminado correctamente.`,
        actionName: 'delete_deal',
    };
}

async function handleQueryDeals(ctx: ActionContext): Promise<ActionResult> {
    const { baseUrl, cookie } = ctx;
    const {
        status, outcome, assigneeName, search,
        period, minAmount, maxAmount, currency,
        limit = 20, includeSummary = false,
    } = ctx.args as unknown as QueryDealsArgs;

    const allDeals = await fetchDeals(baseUrl, cookie);

    let filtered = allDeals;

    if (status) {
        filtered = filtered.filter((d) => d.status === status);
    }
    if (outcome) {
        filtered = filtered.filter((d) => d.outcome === outcome);
    }
    if (currency) {
        filtered = filtered.filter((d) => d.currency.toUpperCase() === currency.toUpperCase());
    }
    if (minAmount !== undefined) {
        filtered = filtered.filter((d) => d.amount >= minAmount);
    }
    if (maxAmount !== undefined) {
        filtered = filtered.filter((d) => d.amount <= maxAmount);
    }
    if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
            (d) =>
                d.title.toLowerCase().includes(q) ||
                d.company.toLowerCase().includes(q)
        );
    }
    if (assigneeName) {
        const q = assigneeName.toLowerCase();
        filtered = filtered.filter((d) =>
            d.assignees.some(
                (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
            )
        );
    }
    if (period) {
        const { start, end } = getPeriodRange(period);
        filtered = filtered.filter((d) => {
            const createdAt = new Date(d.createdAt);
            return createdAt >= start && createdAt <= end;
        });
    }

    const total = filtered.length;
    const capped = filtered.slice(0, limit);

    if (total === 0) {
        return {
            success: true,
            message: '📭 No se encontraron deals con los filtros indicados.',
            actionName: 'query_deals',
        };
    }

    const lines = capped.map(dealSummaryLine);
    let text = `📊 **${total} deal${total !== 1 ? 's' : ''}** encontrado${total !== 1 ? 's' : ''}`;
    if (capped.length < total) text += ` (mostrando ${capped.length})`;
    text += ':\n\n' + lines.join('\n');

    if (includeSummary || (total > 5 && !search)) {
        const currencyTotals: Record<string, { total: number; won: number; lost: number; pending: number }> = {};
        for (const d of filtered) {
            if (!currencyTotals[d.currency]) {
                currencyTotals[d.currency] = { total: 0, won: 0, lost: 0, pending: 0 };
            }
            currencyTotals[d.currency].total += d.amount;
            if (d.outcome === 'WON') currencyTotals[d.currency].won += d.amount;
            else if (d.outcome === 'LOST') currencyTotals[d.currency].lost += d.amount;
            else currencyTotals[d.currency].pending += d.amount;
        }

        const wonCount = filtered.filter((d) => d.outcome === 'WON').length;
        const lostCount = filtered.filter((d) => d.outcome === 'LOST').length;
        const pendingCount = filtered.filter((d) => d.outcome === 'PENDING').length;
        const conversionRate = total > 0 ? Math.round((wonCount / total) * 100) : 0;

        text += '\n\n**Resumen:**\n';
        text += `• Ganados: ${wonCount} | Perdidos: ${lostCount} | Pendientes: ${pendingCount}\n`;
        text += `• Tasa de conversión: ${conversionRate}%\n`;
        for (const [curr, amounts] of Object.entries(currencyTotals)) {
            text += `• Monto total (${curr}): ${formatCurrency(amounts.total, curr)} — Ganado: ${formatCurrency(amounts.won, curr)} | Pendiente: ${formatCurrency(amounts.pending, curr)}\n`;
        }
    }

    return {
        success: true,
        message: text,
        actionName: 'query_deals',
        data: { total, shown: capped.length },
    };
}

async function handleAddDealComment(ctx: ActionContext): Promise<ActionResult> {
    const { baseUrl, cookie } = ctx;
    const { dealSearch, content, markStepCompleted } = ctx.args as unknown as AddDealCommentArgs;

    const deals = await fetchDeals(baseUrl, cookie);
    const deal = findDeal(deals, dealSearch);
    if (!deal) {
        return {
            success: false,
            message: `❌ No encontré ningún deal que coincida con "${dealSearch}".`,
            actionName: 'add_deal_comment',
        };
    }

    const body: Record<string, unknown> = { content };
    if (markStepCompleted) body.type = 'step-completed';

    const res = await fetch(`${baseUrl}/api/sells/${deal.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.text();
        return { success: false, message: `❌ Error al agregar el comentario: ${err}`, actionName: 'add_deal_comment' };
    }

    const label = markStepCompleted ? 'paso completado registrado' : 'comentario agregado';
    return {
        success: true,
        message: `✅ Deal **${deal.title}**: ${label} — "${content}".`,
        actionName: 'add_deal_comment',
    };
}

async function handleManageDealAssignees(ctx: ActionContext): Promise<ActionResult> {
    const { baseUrl, cookie } = ctx;
    const { dealSearch, action, sellerName } = ctx.args as unknown as ManageDealAssigneesArgs;

    const deals = await fetchDeals(baseUrl, cookie);
    const deal = findDeal(deals, dealSearch);
    if (!deal) {
        return {
            success: false,
            message: `❌ No encontré ningún deal que coincida con "${dealSearch}".`,
            actionName: 'manage_deal_assignees',
        };
    }

    // LIST
    if (action === 'list') {
        if (deal.assignees.length === 0) {
            return {
                success: true,
                message: `📋 El deal **${deal.title}** no tiene vendedores asignados.`,
                actionName: 'manage_deal_assignees',
            };
        }
        const names = deal.assignees.map((a) => `• ${a.name} (${a.email})`).join('\n');
        return {
            success: true,
            message: `📋 **${deal.title}** — Vendedores asignados:\n${names}`,
            actionName: 'manage_deal_assignees',
        };
    }

    // ASSIGN / UNASSIGN require sellerName
    if (!sellerName) {
        return {
            success: false,
            message: `❌ Necesito el nombre del vendedor para ${action === 'assign' ? 'asignar' : 'desasignar'}.`,
            actionName: 'manage_deal_assignees',
        };
    }

    // ASSIGN
    if (action === 'assign') {
        const sellers = await fetchSellers(baseUrl, cookie);
        const seller = findSeller(sellers, sellerName);
        if (!seller) {
            const available = sellers.map((s) => s.name).join(', ') || 'ninguno';
            return {
                success: false,
                message: `❌ No encontré un vendedor llamado "${sellerName}". Vendedores disponibles: ${available}.`,
                actionName: 'manage_deal_assignees',
            };
        }

        const alreadyAssigned = deal.assignees.some(
            (a) => a.memberId === seller.$id || a.email === seller.email
        );
        if (alreadyAssigned) {
            return {
                success: false,
                message: `⚠️ **${seller.name}** ya está asignado al deal **${deal.title}**.`,
                actionName: 'manage_deal_assignees',
            };
        }

        const res = await fetch(`${baseUrl}/api/sells/${deal.id}/assignees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
            body: JSON.stringify({ memberId: seller.memberId }),
        });

        if (!res.ok) {
            const err = await res.text();
            return { success: false, message: `❌ Error al asignar: ${err}`, actionName: 'manage_deal_assignees' };
        }

        return {
            success: true,
            message: `✅ **${seller.name}** asignado al deal **${deal.title}** correctamente.`,
            actionName: 'manage_deal_assignees',
        };
    }

    // UNASSIGN
    const q = sellerName.toLowerCase();
    const assignee = deal.assignees.find(
        (a) =>
            a.name.toLowerCase().includes(q) ||
            a.email.toLowerCase().includes(q)
    );
    if (!assignee) {
        const names = deal.assignees.map((a) => a.name).join(', ') || 'ninguno';
        return {
            success: false,
            message: `❌ No encontré a "${sellerName}" entre los asignados de **${deal.title}**. Asignados: ${names}.`,
            actionName: 'manage_deal_assignees',
        };
    }

    const res = await fetch(`${baseUrl}/api/sells/${deal.id}/assignees/${assignee.id}`, {
        method: 'DELETE',
        headers: { 'Cookie': cookie },
    });

    if (!res.ok) {
        const err = await res.text();
        return { success: false, message: `❌ Error al desasignar: ${err}`, actionName: 'manage_deal_assignees' };
    }

    return {
        success: true,
        message: `✅ **${assignee.name}** desasignado del deal **${deal.title}** correctamente.`,
        actionName: 'manage_deal_assignees',
    };
}

async function handleBulkUpdateDeals(ctx: ActionContext): Promise<ActionResult> {
    const { baseUrl, cookie } = ctx;
    const { fromStatus, fromOutcome, toStatus, toOutcome, search } = ctx.args as unknown as BulkUpdateDealsArgs;

    if (!toStatus && !toOutcome) {
        return {
            success: false,
            message: '❌ Debes especificar al menos uno de: toStatus o toOutcome para actualizar los deals.',
            actionName: 'bulk_update_deals',
        };
    }

    const deals = await fetchDeals(baseUrl, cookie);

    let targets = deals;
    if (fromStatus) targets = targets.filter((d) => d.status === fromStatus);
    if (fromOutcome) targets = targets.filter((d) => d.outcome === fromOutcome);
    if (search) {
        const q = search.toLowerCase();
        targets = targets.filter(
            (d) =>
                d.title.toLowerCase().includes(q) ||
                d.company.toLowerCase().includes(q)
        );
    }

    if (targets.length === 0) {
        return {
            success: true,
            message: '📭 No se encontraron deals que coincidan con los filtros indicados.',
            actionName: 'bulk_update_deals',
        };
    }

    const updateBody: Record<string, string> = {};
    if (toStatus) updateBody.status = toStatus;
    if (toOutcome) updateBody.outcome = toOutcome;

    const results = await Promise.allSettled(
        targets.map((deal) =>
            fetch(`${baseUrl}/api/sells/${deal.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Cookie': cookie },
                body: JSON.stringify(updateBody),
            })
        )
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.length - succeeded;

    const changes: string[] = [];
    if (toStatus) changes.push(`etapa → ${STAGE_LABEL[toStatus] ?? toStatus}`);
    if (toOutcome) changes.push(`resultado → ${OUTCOME_LABEL[toOutcome] ?? toOutcome}`);

    let message = `✅ ${succeeded} deal${succeeded !== 1 ? 's' : ''} actualizado${succeeded !== 1 ? 's' : ''}: ${changes.join(', ')}.`;
    if (failed > 0) message += ` ⚠️ ${failed} fallaron.`;

    return {
        success: true,
        message,
        actionName: 'bulk_update_deals',
        data: { updated: succeeded, failed },
    };
}

async function handleQueryDealGoals(ctx: ActionContext): Promise<ActionResult> {
    const { baseUrl, cookie } = ctx;
    const { boardName, limit = 10 } = ctx.args as unknown as QueryDealGoalsArgs;

    const boards = await fetchBoards(baseUrl, cookie);
    if (boards.length === 0) {
        return {
            success: true,
            message: '📭 No hay pipelines configurados.',
            actionName: 'query_deal_goals',
        };
    }

    const targetBoards = boardName
        ? boards.filter((b) => b.name.toLowerCase().includes(boardName.toLowerCase()))
        : boards;

    if (targetBoards.length === 0) {
        const names = boards.map((b) => b.name).join(', ');
        return {
            success: false,
            message: `❌ No encontré un pipeline llamado "${boardName}". Pipelines disponibles: ${names}.`,
            actionName: 'query_deal_goals',
        };
    }

    const goalsPerBoard = await Promise.all(
        targetBoards.map((b) => fetchGoalsForBoard(baseUrl, cookie, b.id))
    );

    const lines: string[] = [];
    for (let i = 0; i < targetBoards.length; i++) {
        const board = targetBoards[i];
        const goals = goalsPerBoard[i].slice(0, limit);

        if (goals.length === 0) {
            lines.push(`**${board.name}**: sin metas registradas.`);
            continue;
        }

        lines.push(`\n**Pipeline: ${board.name}**`);
        for (const goal of goals) {
            const reached = goal.targetReached ? '✅ Alcanzada' : '❌ No alcanzada';
            const target = formatCurrency(goal.targetAmount, goal.currency);
            lines.push(
                `• ${goal.period} — Meta: ${target} | ${reached} | Total deals: ${goal.totalDeals} | CLOSED: ${goal.totalDealsWon}`
            );
        }
    }

    return {
        success: true,
        message: `🎯 **Historial de metas de ventas:**\n${lines.join('\n')}`,
        actionName: 'query_deal_goals',
    };
}

// ═════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═════════════════════════════════════════════════════════════════════════════

export const DEALS_HANDLERS = {
    create_deal: handleCreateDeal,
    update_deal: handleUpdateDeal,
    delete_deal: handleDeleteDeal,
    query_deals: handleQueryDeals,
    add_deal_comment: handleAddDealComment,
    manage_deal_assignees: handleManageDealAssignees,
    bulk_update_deals: handleBulkUpdateDeals,
    query_deal_goals: handleQueryDealGoals,
};
