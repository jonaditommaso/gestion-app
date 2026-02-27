/**
 * =============================================================================
 * TASKS HANDLERS - Ejecutores de Acciones del Módulo de Tareas
 * =============================================================================
 */

import type {
    CreateTaskArgs,
    DeleteTaskArgs,
    UpdateTaskArgs,
    AddTaskCommentArgs,
    AddChecklistItemArgs,
    AssignTaskMemberArgs,
    BulkMoveTasksArgs,
    ArchiveTaskArgs,
    QueryTasksArgs,
} from '../tools/tasks.tools';
import type { ActionContext, ActionResult } from './types';

// ═════════════════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════════════════

type MembershipRole = 'OWNER' | 'ADMIN' | 'CREATOR' | 'VIEWER';

interface TeamMemberDoc {
    userEmail: string;
    prefs: { role: MembershipRole };
}

interface WorkspaceDoc {
    $id: string;
    name: string;
}

interface TaskDoc {
    $id: string;
    name: string;
    workspaceId: string;
    status?: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    position?: number;
    dueDate?: string | null;
    completedAt?: string | null;
    createdAt?: string;
    priority?: number;
    archived?: boolean;
    description?: string | null;
    assignees?: WorkspaceMemberDoc[];
    checklistTitle?: string;
    checklistCount?: number;
}

interface WorkspaceMemberDoc {
    $id: string;
    name: string;
    email: string;
    userId: string;
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

async function fetchWorkspaces(baseUrl: string, cookie: string): Promise<WorkspaceDoc[]> {
    const res = await fetch(`${baseUrl}/api/workspaces`, { headers: { 'Cookie': cookie } });
    if (!res.ok) return [];
    const json = await res.json() as { data?: { documents?: WorkspaceDoc[] } };
    return json.data?.documents || [];
}

async function fetchTasksForWorkspace(baseUrl: string, cookie: string, workspaceId: string): Promise<TaskDoc[]> {
    const url = `${baseUrl}/api/tasks?workspaceId=${encodeURIComponent(workspaceId)}&limit=5000`;
    const res = await fetch(url, { headers: { 'Cookie': cookie } });
    if (!res.ok) return [];
    const json = await res.json() as { data?: { documents?: TaskDoc[] } };
    return json.data?.documents || [];
}

async function fetchWorkspaceMembers(baseUrl: string, cookie: string, workspaceId: string): Promise<WorkspaceMemberDoc[]> {
    const url = `${baseUrl}/api/members?workspaceId=${encodeURIComponent(workspaceId)}`;
    const res = await fetch(url, { headers: { 'Cookie': cookie } });
    if (!res.ok) return [];
    const json = await res.json() as { data?: { documents?: WorkspaceMemberDoc[] } };
    return json.data?.documents || [];
}

/** true si el usuario tiene rol VIEWER a nivel organización */
function isViewer(teamMembers: TeamMemberDoc[], userEmail: string): boolean {
    const member = teamMembers.find(m => m.userEmail === userEmail);
    return member?.prefs?.role === 'VIEWER';
}

type ResolveWorkspaceOk = { ok: true; workspace: WorkspaceDoc };
type ResolveWorkspaceErr = { ok: false; result: ActionResult };
type ResolveWorkspaceResult = ResolveWorkspaceOk | ResolveWorkspaceErr;

/** Resuelve el workspace según la cantidad disponible y el nombre indicado. */
function resolveWorkspace(
    workspaces: WorkspaceDoc[],
    workspaceName: string | undefined,
    actionName: string,
): ResolveWorkspaceResult {
    if (workspaces.length === 0) {
        return { ok: false, result: { success: false, actionName, message: '❌ No tienes ningún workspace disponible.' } };
    }

    if (workspaceName) {
        const lower = workspaceName.toLowerCase();
        const matches = workspaces.filter(w => w.name.toLowerCase().includes(lower));
        if (matches.length === 0) {
            const available = workspaces.map(w => `**${w.name}**`).join(', ');
            return { ok: false, result: { success: false, actionName, message: `❌ No encontré ningún workspace que coincida con "${workspaceName}".\n\nWorkspaces disponibles: ${available}.` } };
        }
        if (matches.length > 1) {
            const names = matches.map(w => `**${w.name}**`).join(', ');
            return { ok: false, result: { success: false, actionName, message: `Encontré varios workspaces que coinciden con "${workspaceName}": ${names}. ¿En cuál quieres operar?` } };
        }
        return { ok: true, workspace: matches[0] };
    }

    if (workspaces.length === 1) {
        return { ok: true, workspace: workspaces[0] };
    }

    const names = workspaces.map(w => `**${w.name}**`).join(', ');
    return { ok: false, result: { success: false, actionName, message: `Tienes varios workspaces: ${names}. ¿En cuál quieres realizar esta acción?` } };
}

type FindTaskOk = { ok: true; task: TaskDoc; workspace: WorkspaceDoc };
type FindTaskErr = { ok: false; result: ActionResult };
type FindTaskResult = FindTaskOk | FindTaskErr;

/** Busca una tarea por fragmento de nombre en uno o todos los workspaces del usuario. */
async function findTask(
    baseUrl: string,
    cookie: string,
    taskSearch: string,
    workspaceName: string | undefined,
    actionName: string,
): Promise<FindTaskResult> {
    const allWorkspaces = await fetchWorkspaces(baseUrl, cookie);

    // Determinar workspace(s) donde buscar
    let candidateWorkspaces: WorkspaceDoc[];
    if (workspaceName) {
        const lower = workspaceName.toLowerCase();
        candidateWorkspaces = allWorkspaces.filter(w => w.name.toLowerCase().includes(lower));
        if (candidateWorkspaces.length === 0) {
            const available = allWorkspaces.map(w => `**${w.name}**`).join(', ');
            return { ok: false, result: { success: false, actionName, message: `❌ No encontré ningún workspace que coincida con "${workspaceName}".\n\nWorkspaces disponibles: ${available}.` } };
        }
    } else {
        candidateWorkspaces = allWorkspaces;
    }

    // Buscar la tarea en cada workspace candidato
    type Match = { task: TaskDoc; workspace: WorkspaceDoc };
    const matches: Match[] = [];
    const lower = taskSearch.toLowerCase();

    for (const ws of candidateWorkspaces) {
        const tasks = await fetchTasksForWorkspace(baseUrl, cookie, ws.$id);
        const found = tasks.filter(t => t.name.toLowerCase().includes(lower));
        for (const t of found) {
            matches.push({ task: t, workspace: ws });
        }
    }

    if (matches.length === 0) {
        return { ok: false, result: { success: false, actionName, message: `❌ No encontré ninguna tarea que coincida con "${taskSearch}".` } };
    }

    if (matches.length > 1) {
        const names = matches.map(m => `**"${m.task.name}"** (workspace: ${m.workspace.name})`).join(', ');
        return { ok: false, result: { success: false, actionName, message: `Encontré varias tareas que coinciden con "${taskSearch}": ${names}. ¿A cuál te refieres? Por favor, sé más específico.` } };
    }

    return { ok: true, task: matches[0].task, workspace: matches[0].workspace };
}

const PRIORITY_LABEL: Record<number, string> = { 1: 'Muy baja', 2: 'Baja', 3: 'Media', 4: 'Alta', 5: 'Muy alta' };
const STATUS_LABEL: Record<string, string> = {
    BACKLOG: 'Backlog', TODO: 'Por hacer', IN_PROGRESS: 'En progreso', IN_REVIEW: 'En revisión', DONE: 'Hecho',
};

/**
 * Matching bidireccional con prefijos por palabra.
 * Cubre casos como "jona di tommaso" vs "jonathan di tommaso".
 */
function fuzzyMatchName(memberName: string, searchTerm: string): boolean {
    const mLower = memberName.toLowerCase();
    const sLower = searchTerm.toLowerCase();
    if (mLower.includes(sLower) || sLower.includes(mLower)) return true;
    const mWords = mLower.split(/\s+/).filter(w => w.length >= 3);
    const sWords = sLower.split(/\s+/).filter(w => w.length >= 3);
    if (mWords.length === 0 || sWords.length === 0) return false;
    const matched = mWords.filter(mw => sWords.some(sw => mw.startsWith(sw) || sw.startsWith(mw)));
    return matched.length >= Math.ceil(mWords.length * 0.6);
}

/** true si el término es una auto-referencia del usuario actual */
function isSelfReference(term: string): boolean {
    const n = term.toLowerCase().trim();
    return ['yo', 'me', 'mi', 'mí', 'myself', 'yo mismo', 'yo misma', 'a mí', 'a mi'].includes(n);
}

function getPeriodRange(period: 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR'): { start: Date; end: Date } {
    const now = new Date();

    if (period === 'THIS_WEEK') {
        const day = now.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const start = new Date(now);
        start.setDate(now.getDate() + diff);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        return { start, end };
    }

    if (period === 'THIS_MONTH') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
        return { start, end };
    }

    if (period === 'LAST_MONTH') {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        return { start, end };
    }

    const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
    return { start, end };
}

// ═════════════════════════════════════════════════════════════════════════════
// HANDLERS
// ═════════════════════════════════════════════════════════════════════════════

export async function handleCreateTask(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as CreateTaskArgs;

    try {
        const teamMembers = await fetchTeamMembers(ctx.baseUrl, ctx.cookie || '');
        if (isViewer(teamMembers, ctx.userEmail)) {
            return { success: false, actionName: 'create_task', message: '❌ No tienes permisos para crear tareas. Tu rol actual es **VIEWER**.' };
        }

        const workspaces = await fetchWorkspaces(ctx.baseUrl, ctx.cookie || '');
        const resolved = resolveWorkspace(workspaces, args.workspaceName, 'create_task');
        if (!resolved.ok) return resolved.result;

        const payload = {
            name: args.name,
            workspaceId: resolved.workspace.$id,
            status: args.status || 'TODO',
            priority: args.priority ?? 3,
            dueDate: args.dueDate || null,
            description: args.description || null,
        };

        const response = await fetch(`${ctx.baseUrl}/api/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json() as { error?: string };
            return { success: false, actionName: 'create_task', message: `❌ No se pudo crear la tarea: ${error.error || 'Error desconocido'}` };
        }

        const resolvedPriority = args.priority ?? 3;
        const resolvedStatus = args.status || 'TODO';
        let message = `✅ Tarea **"${args.name}"** creada en **${resolved.workspace.name}**.\n\n`;
        message += `- Estado: ${STATUS_LABEL[resolvedStatus]}\n- Prioridad: ${PRIORITY_LABEL[resolvedPriority]}`;
        if (args.dueDate) message += `\n- Fecha límite: ${args.dueDate}`;

        return { success: true, actionName: 'create_task', message };
    } catch (error) {
        console.error('[CREATE_TASK] Exception:', error);
        return { success: false, actionName: 'create_task', message: '❌ Error al crear la tarea. Por favor, intenta de nuevo.' };
    }
}

export async function handleDeleteTask(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as DeleteTaskArgs;

    try {
        const teamMembers = await fetchTeamMembers(ctx.baseUrl, ctx.cookie || '');
        if (isViewer(teamMembers, ctx.userEmail)) {
            return { success: false, actionName: 'delete_task', message: '❌ No tienes permisos para eliminar tareas. Tu rol actual es **VIEWER**.' };
        }

        const found = await findTask(ctx.baseUrl, ctx.cookie || '', args.taskSearch, args.workspaceName, 'delete_task');
        if (!found.ok) return found.result;

        const response = await fetch(`${ctx.baseUrl}/api/tasks/${found.task.$id}`, {
            method: 'DELETE',
            headers: { 'Cookie': ctx.cookie || '' },
        });

        if (!response.ok) {
            const error = await response.json() as { error?: string };
            return { success: false, actionName: 'delete_task', message: `❌ No se pudo eliminar la tarea: ${error.error || 'Error desconocido'}` };
        }

        return { success: true, actionName: 'delete_task', message: `✅ Tarea **"${found.task.name}"** eliminada correctamente.` };
    } catch (error) {
        console.error('[DELETE_TASK] Exception:', error);
        return { success: false, actionName: 'delete_task', message: '❌ Error al eliminar la tarea. Por favor, intenta de nuevo.' };
    }
}

export async function handleUpdateTask(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as UpdateTaskArgs;

    try {
        const teamMembers = await fetchTeamMembers(ctx.baseUrl, ctx.cookie || '');
        if (isViewer(teamMembers, ctx.userEmail)) {
            return { success: false, actionName: 'update_task', message: '❌ No tienes permisos para editar tareas. Tu rol actual es **VIEWER**.' };
        }

        const found = await findTask(ctx.baseUrl, ctx.cookie || '', args.taskSearch, args.workspaceName, 'update_task');
        if (!found.ok) return found.result;

        const payload: Record<string, unknown> = {};
        if (args.name !== undefined) payload.name = args.name;
        if (args.description !== undefined) payload.description = args.description;
        if (args.status !== undefined) payload.status = args.status;

        // Prioridad: relativa o absoluta
        let resolvedPriority: number | undefined;
        if (args.increasePriority) {
            const current = found.task.priority ?? 3;
            const next = Math.min(5, current + 1);
            if (next !== current) {
                resolvedPriority = next;
                payload.priority = resolvedPriority;
            }
        } else if (args.decreasePriority) {
            const current = found.task.priority ?? 3;
            const next = Math.max(1, current - 1);
            if (next !== current) {
                resolvedPriority = next;
                payload.priority = resolvedPriority;
            }
        } else if (args.priority !== undefined) {
            resolvedPriority = args.priority;
            payload.priority = resolvedPriority;
        }

        if (args.clearDueDate) {
            payload.dueDate = null;
        } else if (args.dueDate !== undefined) {
            payload.dueDate = args.dueDate;
        }
        if (args.clearCompletedAt) {
            payload.completedAt = null;
        } else if (args.completedAt !== undefined) {
            payload.completedAt = args.completedAt;
        }

        const changes: string[] = [];

        // Informar si la prioridad ya estaba en el límite
        if (args.increasePriority && resolvedPriority === undefined) {
            changes.push('la prioridad ya estaba en el máximo (**Muy alta**)');
        }
        if (args.decreasePriority && resolvedPriority === undefined) {
            changes.push('la prioridad ya estaba en el mínimo (**Muy baja**)');
        }

        // Ejecutar PATCH solo si hay campos de tarea para actualizar
        if (Object.keys(payload).length > 0) {
            const response = await fetch(`${ctx.baseUrl}/api/tasks/${found.task.$id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json() as { error?: string };
                return { success: false, actionName: 'update_task', message: `❌ No se pudo actualizar la tarea: ${error.error || 'Error desconocido'}` };
            }

            if (args.name) changes.push(`nombre → "${args.name}"`);
            if (args.status) changes.push(`estado → ${STATUS_LABEL[args.status] || args.status}`);
            if (resolvedPriority !== undefined) changes.push(`prioridad → ${PRIORITY_LABEL[resolvedPriority] || resolvedPriority}`);
            if (args.description !== undefined) changes.push('descripción actualizada');
            if (args.clearDueDate) changes.push('fecha límite eliminada');
            else if (args.dueDate) changes.push(`fecha límite → ${args.dueDate}`);
            if (args.completedAt) changes.push('marcada como completada');
            if (args.clearCompletedAt) changes.push('desmarcada como completada');
        }

        // Asignación integrada: assignToSelf
        if (args.assignToSelf) {
            const wsMembers = await fetchWorkspaceMembers(ctx.baseUrl, ctx.cookie || '', found.workspace.$id);
            const selfMember = wsMembers.find(m => m.email?.toLowerCase() === ctx.userEmail.toLowerCase());
            if (selfMember) {
                const assignRes = await fetch(`${ctx.baseUrl}/api/tasks/${found.task.$id}/assign`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
                    body: JSON.stringify({ workspaceMemberId: selfMember.$id }),
                });
                if (assignRes.ok) {
                    changes.push(`asignado a **${selfMember.name || 'ti'}**`);
                } else {
                    const err = await assignRes.json() as { error?: string };
                    if (err.error === 'Member already assigned') {
                        changes.push('ya estabas asignado a esta tarea');
                    } else {
                        changes.push(`⚠️ No se pudo asignar: ${err.error || 'Error desconocido'}`);
                    }
                }
            } else {
                changes.push('⚠️ No encontré tu usuario en este workspace');
            }
        }

        // Asignación integrada: assignMemberName
        if (args.assignMemberName) {
            const wsMembers = await fetchWorkspaceMembers(ctx.baseUrl, ctx.cookie || '', found.workspace.$id);
            const memberMatches = wsMembers.filter(m =>
                fuzzyMatchName(m.name || '', args.assignMemberName!) ||
                fuzzyMatchName(m.email || '', args.assignMemberName!)
            );
            if (memberMatches.length === 1) {
                const target = memberMatches[0];
                const assignRes = await fetch(`${ctx.baseUrl}/api/tasks/${found.task.$id}/assign`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
                    body: JSON.stringify({ workspaceMemberId: target.$id }),
                });
                if (assignRes.ok) {
                    changes.push(`asignado a **${target.name}**`);
                } else {
                    const err = await assignRes.json() as { error?: string };
                    changes.push(err.error === 'Member already assigned'
                        ? `**${target.name}** ya estaba asignado`
                        : `⚠️ No se pudo asignar a ${target.name}`);
                }
            } else if (memberMatches.length === 0) {
                const available = wsMembers.map(m => m.name || m.email).join(', ');
                changes.push(`⚠️ No encontré al miembro "${args.assignMemberName}" (disponibles: ${available})`);
            } else {
                const names = memberMatches.map(m => m.name || m.email).join(', ');
                changes.push(`⚠️ Varios miembros coinciden con "${args.assignMemberName}": ${names}. Sé más específico.`);
            }
        }

        // Desasignación integrada: unassignMemberName
        if (args.unassignMemberName) {
            const wsMembers = await fetchWorkspaceMembers(ctx.baseUrl, ctx.cookie || '', found.workspace.$id);
            const isSelf = isSelfReference(args.unassignMemberName);
            const memberMatches = isSelf
                ? wsMembers.filter(m => m.email?.toLowerCase() === ctx.userEmail.toLowerCase())
                : wsMembers.filter(m =>
                    fuzzyMatchName(m.name || '', args.unassignMemberName!) ||
                    fuzzyMatchName(m.email || '', args.unassignMemberName!)
                );
            if (memberMatches.length === 1) {
                const target = memberMatches[0];
                const unassignRes = await fetch(`${ctx.baseUrl}/api/tasks/${found.task.$id}/assign/${target.$id}`, {
                    method: 'DELETE',
                    headers: { 'Cookie': ctx.cookie || '' },
                });
                if (unassignRes.ok) {
                    changes.push(`desasignado **${target.name}**`);
                } else {
                    changes.push(`⚠️ No se pudo desasignar a ${target.name}`);
                }
            }
        }

        if (changes.length === 0) {
            return { success: false, actionName: 'update_task', message: '❌ No indicaste ningún campo para actualizar.' };
        }

        return {
            success: true,
            actionName: 'update_task',
            message: `✅ Tarea **"${found.task.name}"** actualizada:\n${changes.map(c => `- ${c}`).join('\n')}`,
        };
    } catch (error) {
        console.error('[UPDATE_TASK] Exception:', error);
        return { success: false, actionName: 'update_task', message: '❌ Error al actualizar la tarea. Por favor, intenta de nuevo.' };
    }
}

export async function handleAddTaskComment(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as AddTaskCommentArgs;

    try {
        const found = await findTask(ctx.baseUrl, ctx.cookie || '', args.taskSearch, args.workspaceName, 'add_task_comment');
        if (!found.ok) return found.result;

        const response = await fetch(`${ctx.baseUrl}/api/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
            body: JSON.stringify({ taskId: found.task.$id, content: args.content }),
        });

        if (!response.ok) {
            const error = await response.json() as { error?: string };
            return { success: false, actionName: 'add_task_comment', message: `❌ No se pudo agregar el comentario: ${error.error || 'Error desconocido'}` };
        }

        return {
            success: true,
            actionName: 'add_task_comment',
            message: `✅ Comentario agregado en la tarea **"${found.task.name}"**.`,
        };
    } catch (error) {
        console.error('[ADD_TASK_COMMENT] Exception:', error);
        return { success: false, actionName: 'add_task_comment', message: '❌ Error al agregar el comentario. Por favor, intenta de nuevo.' };
    }
}

export async function handleAddChecklistItem(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as AddChecklistItemArgs;

    try {
        const teamMembers = await fetchTeamMembers(ctx.baseUrl, ctx.cookie || '');
        if (isViewer(teamMembers, ctx.userEmail)) {
            return { success: false, actionName: 'add_checklist_item', message: '❌ No tienes permisos para modificar tareas. Tu rol actual es **VIEWER**.' };
        }

        const found = await findTask(ctx.baseUrl, ctx.cookie || '', args.taskSearch, args.workspaceName, 'add_checklist_item');
        if (!found.ok) return found.result;

        const failures: string[] = [];
        const created: string[] = [];

        for (let i = 0; i < args.items.length; i++) {
            const item = args.items[i];
            const payload: Record<string, unknown> = {
                taskId: found.task.$id,
                workspaceId: found.workspace.$id,
                title: item.title,
            };
            if (item.dueDate) payload.dueDate = item.dueDate;
            // El checklistTitle solo aplica al primer ítem si la tarea no tiene checklist aún
            if (i === 0 && args.checklistTitle && !found.task.checklistTitle) {
                payload.checklistTitle = args.checklistTitle;
            }

            const response = await fetch(`${ctx.baseUrl}/api/checklist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                created.push(item.title);
            } else {
                failures.push(item.title);
            }
        }

        if (created.length === 0) {
            return { success: false, actionName: 'add_checklist_item', message: `❌ No se pudo agregar ningún ítem a la tarea **"${found.task.name}"**.` };
        }

        let message = `✅ ${created.length} ítem(s) agregado(s) a la tarea **"${found.task.name}"**:\n`;
        message += created.map(t => `- ${t}`).join('\n');
        if (failures.length > 0) message += `\n\n⚠️ No se pudieron agregar: ${failures.join(', ')}`;

        return { success: true, actionName: 'add_checklist_item', message };
    } catch (error) {
        console.error('[ADD_CHECKLIST_ITEM] Exception:', error);
        return { success: false, actionName: 'add_checklist_item', message: '❌ Error al agregar ítems. Por favor, intenta de nuevo.' };
    }
}

export async function handleAssignTaskMember(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as AssignTaskMemberArgs;

    try {
        const teamMembers = await fetchTeamMembers(ctx.baseUrl, ctx.cookie || '');
        if (isViewer(teamMembers, ctx.userEmail)) {
            return { success: false, actionName: 'assign_task_member', message: '❌ No tienes permisos para modificar tareas. Tu rol actual es **VIEWER**.' };
        }

        const found = await findTask(ctx.baseUrl, ctx.cookie || '', args.taskSearch, args.workspaceName, 'assign_task_member');
        if (!found.ok) return found.result;

        // Buscar el workspace member por nombre/email
        const wsMembers = await fetchWorkspaceMembers(ctx.baseUrl, ctx.cookie || '', found.workspace.$id);

        // Auto-referencia: "yo", "me", "a mí", etc.
        const selfRef = isSelfReference(args.memberName);
        const memberMatches = selfRef
            ? wsMembers.filter(m => m.email?.toLowerCase() === ctx.userEmail.toLowerCase())
            : wsMembers.filter(m =>
                fuzzyMatchName(m.name || '', args.memberName) ||
                fuzzyMatchName(m.email || '', args.memberName)
            );

        if (memberMatches.length === 0) {
            const available = wsMembers.map(m => m.name || m.email).join(', ');
            return {
                success: false,
                actionName: 'assign_task_member',
                message: `❌ No encontré ningún miembro que coincida con "${args.memberName}" en el workspace **${found.workspace.name}**.\n\nMiembros disponibles: **${available}**.`,
            };
        }

        if (memberMatches.length > 1) {
            const names = memberMatches.map(m => m.name || m.email).join(', ');
            return {
                success: false,
                actionName: 'assign_task_member',
                message: `Encontré varios miembros que coinciden con "${args.memberName}": **${names}**. ¿A cuál te refieres?`,
            };
        }

        const targetMember = memberMatches[0];

        if (args.action === 'assign') {
            const response = await fetch(`${ctx.baseUrl}/api/tasks/${found.task.$id}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
                body: JSON.stringify({ workspaceMemberId: targetMember.$id }),
            });

            if (!response.ok) {
                const error = await response.json() as { error?: string };
                const msg = error.error === 'Member already assigned'
                    ? `**${targetMember.name}** ya está asignado a la tarea **"${found.task.name}"**.`
                    : `❌ No se pudo asignar: ${error.error || 'Error desconocido'}`;
                return { success: false, actionName: 'assign_task_member', message: msg };
            }

            return {
                success: true,
                actionName: 'assign_task_member',
                message: `✅ **${targetMember.name}** asignado a la tarea **"${found.task.name}"**.`,
            };
        }

        // action === 'unassign'
        const response = await fetch(`${ctx.baseUrl}/api/tasks/${found.task.$id}/assign/${targetMember.$id}`, {
            method: 'DELETE',
            headers: { 'Cookie': ctx.cookie || '' },
        });

        if (!response.ok) {
            const error = await response.json() as { error?: string };
            return { success: false, actionName: 'assign_task_member', message: `❌ No se pudo desasignar: ${error.error || 'Error desconocido'}` };
        }

        return {
            success: true,
            actionName: 'assign_task_member',
            message: `✅ **${targetMember.name}** desasignado de la tarea **"${found.task.name}"**.`,
        };
    } catch (error) {
        console.error('[ASSIGN_TASK_MEMBER] Exception:', error);
        return { success: false, actionName: 'assign_task_member', message: '❌ Error al modificar la asignación. Por favor, intenta de nuevo.' };
    }
}

export async function handleBulkMoveTasks(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as BulkMoveTasksArgs;

    try {
        const teamMembers = await fetchTeamMembers(ctx.baseUrl, ctx.cookie || '');
        if (isViewer(teamMembers, ctx.userEmail)) {
            return { success: false, actionName: 'bulk_move_tasks', message: '❌ No tienes permisos para modificar tareas. Tu rol actual es **VIEWER**.' };
        }

        if (args.fromStatus === args.toStatus) {
            return { success: false, actionName: 'bulk_move_tasks', message: '❌ El estado origen y destino son iguales.' };
        }

        const workspaces = await fetchWorkspaces(ctx.baseUrl, ctx.cookie || '');
        const resolved = resolveWorkspace(workspaces, args.workspaceName, 'bulk_move_tasks');
        if (!resolved.ok) return resolved.result;

        const tasks = await fetchTasksForWorkspace(ctx.baseUrl, ctx.cookie || '', resolved.workspace.$id);
        const tasksToMove = tasks
            .filter(task => task.status === args.fromStatus)
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

        if (tasksToMove.length === 0) {
            return {
                success: false,
                actionName: 'bulk_move_tasks',
                message: `❌ No hay tareas en **${STATUS_LABEL[args.fromStatus]}** para mover en **${resolved.workspace.name}**.`,
            };
        }

        const maxTargetPosition = tasks
            .filter(task => task.status === args.toStatus)
            .reduce((max, task) => Math.max(max, task.position ?? 0), 0);

        const updates = tasksToMove.map(async (task, index) => {
            const payload = {
                status: args.toStatus,
                position: maxTargetPosition + 1000 + (index * 1000),
            };

            const response = await fetch(`${ctx.baseUrl}/api/tasks/${task.$id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
                body: JSON.stringify(payload),
            });

            return {
                task,
                ok: response.ok,
            };
        });

        const results = await Promise.all(updates);
        const moved = results.filter(r => r.ok).map(r => r.task);
        const failed = results.filter(r => !r.ok).map(r => r.task);

        if (moved.length === 0) {
            return {
                success: false,
                actionName: 'bulk_move_tasks',
                message: '❌ No se pudo mover ninguna tarea en bloque. Intenta nuevamente.',
            };
        }

        const preview = moved.slice(0, 5).map(task => `- ${task.name}`).join('\n');
        const extra = moved.length > 5 ? `\n- ...y ${moved.length - 5} más` : '';
        const warning = failed.length > 0 ? `\n\n⚠️ No se pudieron mover ${failed.length} tarea(s).` : '';

        return {
            success: true,
            actionName: 'bulk_move_tasks',
            message: `✅ Moví **${moved.length}** tarea(s) de **${STATUS_LABEL[args.fromStatus]}** a **${STATUS_LABEL[args.toStatus]}** en **${resolved.workspace.name}**.\n\n${preview}${extra}${warning}`,
        };
    } catch (error) {
        console.error('[BULK_MOVE_TASKS] Exception:', error);
        return { success: false, actionName: 'bulk_move_tasks', message: '❌ Error al mover tareas en bloque. Por favor, intenta de nuevo.' };
    }
}

export async function handleArchiveTask(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as ArchiveTaskArgs;

    try {
        const teamMembers = await fetchTeamMembers(ctx.baseUrl, ctx.cookie || '');
        if (isViewer(teamMembers, ctx.userEmail)) {
            return { success: false, actionName: 'archive_task', message: '❌ No tienes permisos para modificar tareas. Tu rol actual es **VIEWER**.' };
        }

        const found = await findTask(ctx.baseUrl, ctx.cookie || '', args.taskSearch, args.workspaceName, 'archive_task');
        if (!found.ok) return found.result;

        const shouldArchive = args.action === 'archive';
        const wsMembers = await fetchWorkspaceMembers(ctx.baseUrl, ctx.cookie || '', found.workspace.$id);
        const currentMember = wsMembers.find(member => member.email?.toLowerCase() === ctx.userEmail.toLowerCase());

        const payload: Record<string, unknown> = {
            archived: shouldArchive,
            archivedAt: shouldArchive ? new Date().toISOString() : null,
            archivedBy: shouldArchive ? (currentMember?.$id || null) : null,
        };

        const response = await fetch(`${ctx.baseUrl}/api/tasks/${found.task.$id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Cookie': ctx.cookie || '' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json() as { error?: string };
            return {
                success: false,
                actionName: 'archive_task',
                message: `❌ No se pudo ${shouldArchive ? 'archivar' : 'desarchivar'} la tarea: ${error.error || 'Error desconocido'}`,
            };
        }

        return {
            success: true,
            actionName: 'archive_task',
            message: `✅ Tarea **"${found.task.name}"** ${shouldArchive ? 'archivada' : 'desarchivada'} correctamente.`,
        };
    } catch (error) {
        console.error('[ARCHIVE_TASK] Exception:', error);
        return { success: false, actionName: 'archive_task', message: '❌ Error al actualizar el archivo de la tarea. Por favor, intenta de nuevo.' };
    }
}

export async function handleQueryTasks(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as QueryTasksArgs;

    try {
        const workspaces = await fetchWorkspaces(ctx.baseUrl, ctx.cookie || '');
        const resolved = resolveWorkspace(workspaces, args.workspaceName, 'query_tasks');
        if (!resolved.ok) return resolved.result;

        const allTasks = await fetchTasksForWorkspace(ctx.baseUrl, ctx.cookie || '', resolved.workspace.$id);
        let filtered = [...allTasks];

        if (!args.includeArchived) {
            filtered = filtered.filter(task => task.archived !== true);
        }

        if (args.status) {
            filtered = filtered.filter(task => task.status === args.status);
        }

        if (args.completed === true) {
            filtered = filtered.filter(task => !!task.completedAt);
        } else if (args.completed === false) {
            filtered = filtered.filter(task => !task.completedAt);
        }

        if (args.search) {
            const searchLower = args.search.toLowerCase();
            filtered = filtered.filter(task =>
                task.name.toLowerCase().includes(searchLower) ||
                (task.description || '').toLowerCase().includes(searchLower)
            );
        }

        if (args.assigneeName) {
            const assigneeTerm = args.assigneeName;
            const assigneeLower = assigneeTerm.toLowerCase();
            const isSelf = isSelfReference(assigneeTerm);

            filtered = filtered.filter(task => {
                const assignees = task.assignees || [];
                if (isSelf) {
                    return assignees.some(assignee => assignee.email?.toLowerCase() === ctx.userEmail.toLowerCase());
                }
                return assignees.some(assignee =>
                    fuzzyMatchName(assignee.name || '', assigneeLower) ||
                    fuzzyMatchName(assignee.email || '', assigneeLower)
                );
            });
        }

        if (args.period) {
            const field = args.dateField || (args.completed === true ? 'completedAt' : 'dueDate');
            const { start, end } = getPeriodRange(args.period);
            filtered = filtered.filter(task => {
                const rawValue = field === 'completedAt'
                    ? task.completedAt
                    : field === 'createdAt'
                        ? task.createdAt
                        : task.dueDate;

                if (!rawValue) return false;
                const date = new Date(rawValue);
                if (Number.isNaN(date.getTime())) return false;
                return date >= start && date < end;
            });
        }

        const total = filtered.length;
        if (total === 0) {
            return {
                success: true,
                actionName: 'query_tasks',
                message: 'No encontré tareas que coincidan con esos filtros.',
            };
        }

        const limit = Math.min(100, Math.max(1, args.limit ?? 20));
        filtered.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        const visible = filtered.slice(0, limit);

        const lines = visible.map(task => {
            const assignees = (task.assignees || []).map(assignee => assignee.name || assignee.email).filter(Boolean);
            const assigneeText = assignees.length > 0 ? assignees.join(', ') : 'Sin asignados';
            const statusText = STATUS_LABEL[task.status || 'TODO'] || task.status || 'Sin estado';
            const priorityText = PRIORITY_LABEL[task.priority || 3] || 'Media';
            return `- **${task.name}** · Estado: ${statusText} · Prioridad: ${priorityText} · Asignados: ${assigneeText}`;
        });

        const moreText = total > visible.length ? `\n\nMostrando ${visible.length} de ${total} resultados.` : '';

        return {
            success: true,
            actionName: 'query_tasks',
            message: `Encontré **${total}** tarea(s) en **${resolved.workspace.name}**:\n\n${lines.join('\n')}${moreText}`,
        };
    } catch (error) {
        console.error('[QUERY_TASKS] Exception:', error);
        return { success: false, actionName: 'query_tasks', message: '❌ Error al consultar tareas. Por favor, intenta de nuevo.' };
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════════════════════

export const TASKS_HANDLERS = {
    create_task: handleCreateTask,
    delete_task: handleDeleteTask,
    update_task: handleUpdateTask,
    add_task_comment: handleAddTaskComment,
    add_checklist_item: handleAddChecklistItem,
    assign_task_member: handleAssignTaskMember,
    bulk_move_tasks: handleBulkMoveTasks,
    archive_task: handleArchiveTask,
    query_tasks: handleQueryTasks,
};
