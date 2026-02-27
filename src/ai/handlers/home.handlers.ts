/**
 * =============================================================================
 * HOME HANDLERS - Ejecutores de Acciones del Módulo Home
 * =============================================================================
 *
 * Este archivo contiene los handlers para las acciones del módulo home:
 * - Notas (crear, actualizar, eliminar)
 * - Mensajes (enviar mensaje a miembro del equipo)
 *
 * Cada handler llama al endpoint/servicio existente.
 */

import type { CreateNoteArgs, UpdateNoteArgs, DeleteNoteArgs, SendMessageArgs } from '../tools/home.tools';
import type { ActionContext, ActionResult } from './types';

// ═════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════════════

interface NoteDocument {
    $id: string;
    title?: string;
    content?: string;
    bgColor?: string;
    isModern?: boolean;
    hasLines?: boolean;
    isPinned?: boolean;
    isGlobal?: boolean;
}

interface TeamMemberDocument {
    appwriteMembershipId: string | null;
    name: string;
    userName: string;
    userEmail: string;
    email: string;
}

/**
 * Busca la nota cuyo título o contenido coincida (case-insensitive) con el string de búsqueda.
 * Devuelve la primera coincidencia.
 */
function findNote(notes: NoteDocument[], search: string): NoteDocument | undefined {
    const lower = search.toLowerCase();
    return notes.find(
        n =>
            n.title?.toLowerCase().includes(lower) ||
            n.content?.toLowerCase().includes(lower)
    );
}

/**
 * Obtiene la lista de notas del usuario.
 */
async function fetchNotes(baseUrl: string, cookie: string): Promise<NoteDocument[]> {
    const response = await fetch(`${baseUrl}/api/notes`, {
        headers: { 'Cookie': cookie },
    });
    if (!response.ok) return [];
    const json = await response.json() as { data?: { documents?: NoteDocument[] } };
    return json.data?.documents || [];
}

// ═════════════════════════════════════════════════════════════════════════════
// HANDLERS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Handler: create_note
 * --------------------
 * Crea una nota personal para el usuario.
 */
export async function handleCreateNote(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as CreateNoteArgs;

    try {
        const url = `${ctx.baseUrl}/api/notes`;
        const payload = {
            title: args.title || '',
            content: args.content,
            bgColor: args.bgColor || 'none',
        };

        console.log('[CREATE_NOTE] Request details:', {
            url,
            payload,
            hasCookie: !!ctx.cookie,
            cookieLength: ctx.cookie?.length || 0,
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': ctx.cookie || '',
            },
            body: JSON.stringify(payload),
        });

        console.log('[CREATE_NOTE] Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('[CREATE_NOTE] Error response:', error);
            return {
                success: false,
                message: `❌ No se pudo crear la nota: ${(error as { error?: string }).error || 'Error desconocido'}`,
                actionName: 'create_note',
            };
        }

        const responseData = await response.json();
        console.log('[CREATE_NOTE] Success response:', responseData);

        const message = `✅ ¡Nota creada exitosamente!\n\n` +
            (args.title ? `**${args.title}**\n` : '') +
            `${args.content}`;

        return {
            success: true,
            message,
            actionName: 'create_note',
        };
    } catch (error) {
        console.error('[CREATE_NOTE] Exception:', error);
        return {
            success: false,
            message: '❌ Error al crear la nota. Por favor, intenta de nuevo.',
            actionName: 'create_note',
        };
    }
}

/**
 * Handler: update_note
 * --------------------
 * Actualiza una nota existente (título, contenido, color, pin, líneas, gradiente).
 * Primero obtiene la lista de notas y la identifica por búsqueda de texto.
 */
export async function handleUpdateNote(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as UpdateNoteArgs;

    try {
        const notes = await fetchNotes(ctx.baseUrl, ctx.cookie || '');

        if (notes.length === 0) {
            return {
                success: false,
                message: '❌ No tienes notas guardadas para modificar.',
                actionName: 'update_note',
            };
        }

        const note = findNote(notes, args.noteSearch);
        if (!note) {
            return {
                success: false,
                message: `❌ No encontré ninguna nota que coincida con "${args.noteSearch}".`,
                actionName: 'update_note',
            };
        }

        const payload: Record<string, unknown> = {};
        if (args.title !== undefined) payload.title = args.title;
        if (args.content !== undefined) payload.content = args.content;
        if (args.bgColor !== undefined) payload.bgColor = args.bgColor;
        if (args.isModern !== undefined) payload.isModern = args.isModern;
        if (args.hasLines !== undefined) payload.hasLines = args.hasLines;
        if (args.isPinned !== undefined) {
            payload.isPinned = args.isPinned;
            payload.pinnedAt = args.isPinned ? new Date().toISOString() : null;
        }
        if (args.isGlobal !== undefined) {
            payload.isGlobal = args.isGlobal;
            payload.globalAt = args.isGlobal ? new Date().toISOString() : null;
        }

        console.log('[UPDATE_NOTE] Updating note:', { noteId: note.$id, payload });

        const response = await fetch(`${ctx.baseUrl}/api/notes/${note.$id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': ctx.cookie || '',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                message: `❌ No se pudo actualizar la nota: ${(error as { error?: string }).error || 'Error desconocido'}`,
                actionName: 'update_note',
            };
        }

        const changes: string[] = [];
        if (args.title !== undefined) changes.push('título');
        if (args.content !== undefined) changes.push('contenido');
        if (args.bgColor !== undefined) changes.push('color');
        if (args.isModern !== undefined) changes.push(args.isModern ? 'gradiente activado' : 'gradiente desactivado');
        if (args.hasLines !== undefined) changes.push(args.hasLines ? 'renglones activados' : 'renglones desactivados');
        if (args.isPinned !== undefined) changes.push(args.isPinned ? 'anclada en el home' : 'desanclada del home');
        if (args.isGlobal !== undefined) changes.push(args.isGlobal ? 'anclada globalmente' : 'desanclada globalmente');

        const noteTitle = note.title || note.content?.substring(0, 30) || 'Nota';
        return {
            success: true,
            message: `✅ Nota **"${noteTitle}"** actualizada: ${changes.join(', ')}.`,
            actionName: 'update_note',
        };
    } catch (error) {
        console.error('[UPDATE_NOTE] Exception:', error);
        return {
            success: false,
            message: '❌ Error al actualizar la nota. Por favor, intenta de nuevo.',
            actionName: 'update_note',
        };
    }
}

/**
 * Handler: delete_note
 * --------------------
 * Elimina una nota identificándola por fragmento de texto en título o contenido.
 */
export async function handleDeleteNote(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as DeleteNoteArgs;

    try {
        const notes = await fetchNotes(ctx.baseUrl, ctx.cookie || '');

        if (notes.length === 0) {
            return {
                success: false,
                message: '❌ No tienes notas guardadas para eliminar.',
                actionName: 'delete_note',
            };
        }

        const note = findNote(notes, args.noteSearch);
        if (!note) {
            return {
                success: false,
                message: `❌ No encontré ninguna nota que coincida con "${args.noteSearch}".`,
                actionName: 'delete_note',
            };
        }

        console.log('[DELETE_NOTE] Deleting note:', { noteId: note.$id, title: note.title });

        const response = await fetch(`${ctx.baseUrl}/api/notes/${note.$id}`, {
            method: 'DELETE',
            headers: { 'Cookie': ctx.cookie || '' },
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                message: `❌ No se pudo eliminar la nota: ${(error as { error?: string }).error || 'Error desconocido'}`,
                actionName: 'delete_note',
            };
        }

        const noteTitle = note.title || note.content?.substring(0, 30) || 'Nota';
        return {
            success: true,
            message: `✅ Nota **"${noteTitle}"** eliminada correctamente.`,
            actionName: 'delete_note',
        };
    } catch (error) {
        console.error('[DELETE_NOTE] Exception:', error);
        return {
            success: false,
            message: '❌ Error al eliminar la nota. Por favor, intenta de nuevo.',
            actionName: 'delete_note',
        };
    }
}

/**
 * Handler: send_message
 * ---------------------
 * Envía un mensaje a uno o más compañeros del equipo.
 * Resuelve los nombres a IDs de membresía llamando al endpoint de team.
 */
export async function handleSendMessage(ctx: ActionContext): Promise<ActionResult> {
    const args = ctx.args as unknown as SendMessageArgs;

    try {
        // Obtener lista de miembros del equipo
        const teamResponse = await fetch(`${ctx.baseUrl}/api/team`, {
            headers: { 'Cookie': ctx.cookie || '' },
        });

        if (!teamResponse.ok) {
            return {
                success: false,
                message: '❌ No se pudo obtener la lista del equipo.',
                actionName: 'send_message',
            };
        }

        const teamJson = await teamResponse.json() as { data?: TeamMemberDocument[] };
        const members: TeamMemberDocument[] = teamJson.data || [];

        // Filtrar el usuario actual (no puede enviarse mensajes a sí mismo)
        const otherMembers = members.filter(m => m.userEmail !== ctx.userEmail);

        if (otherMembers.length === 0) {
            return {
                success: false,
                message: '❌ No tienes compañeros en el equipo a quienes enviar mensajes.',
                actionName: 'send_message',
            };
        }

        // Resolver nombres a IDs de membresía
        const resolvedIds: string[] = [];
        const notFound: string[] = [];

        for (const searchName of args.toMemberNames) {
            const lower = searchName.toLowerCase();
            const matches = otherMembers.filter(
                m =>
                    m.name?.toLowerCase().includes(lower) ||
                    m.userName?.toLowerCase().includes(lower) ||
                    m.userEmail?.toLowerCase().includes(lower) ||
                    m.email?.toLowerCase().includes(lower)
            );

            if (matches.length === 1 && matches[0].appwriteMembershipId) {
                resolvedIds.push(matches[0].appwriteMembershipId);
            } else if (matches.length > 1) {
                // Ambigüedad: varios compañeros coinciden con ese nombre
                const names = matches.map(m => m.name || m.userName).join(', ');
                return {
                    success: false,
                    message: `Encontré varios compañeros que coinciden con "${searchName}": **${names}**. ¿A cuál te refieres? Por favor, dime el nombre completo.`,
                    actionName: 'send_message',
                };
            } else {
                notFound.push(searchName);
            }
        }

        if (resolvedIds.length === 0) {
            const available = otherMembers.map(m => m.name || m.userName).join(', ');
            return {
                success: false,
                message: `❌ No encontré ningún compañero que coincida con: ${notFound.join(', ')}.\n\nCompañeros disponibles: **${available}**.`,
                actionName: 'send_message',
            };
        }

        // Enviar el mensaje
        const fallbackSubject = args.content.trim().length > 60
            ? `${args.content.trim().slice(0, 57)}...`
            : args.content.trim();

        const response = await fetch(`${ctx.baseUrl}/api/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': ctx.cookie || '',
            },
            body: JSON.stringify({
                subject: args.subject?.trim() || fallbackSubject,
                content: args.content,
                toTeamMemberIds: resolvedIds,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return {
                success: false,
                message: `❌ No se pudo enviar el mensaje: ${(error as { error?: string }).error || 'Error desconocido'}`,
                actionName: 'send_message',
            };
        }

        const recipientNames = args.toMemberNames.join(', ');
        const skippedNote = notFound.length > 0 ? ` (no encontré: ${notFound.join(', ')})` : '';

        return {
            success: true,
            message: `✅ Mensaje enviado a **${recipientNames}**${skippedNote}: "${args.content}"`,
            actionName: 'send_message',
        };
    } catch (error) {
        console.error('[SEND_MESSAGE] Exception:', error);
        return {
            success: false,
            message: '❌ Error al enviar el mensaje. Por favor, intenta de nuevo.',
            actionName: 'send_message',
        };
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Mapa de handlers del módulo home.
 * La key debe coincidir con el nombre del tool.
 */
export const HOME_HANDLERS = {
    create_note: handleCreateNote,
    update_note: handleUpdateNote,
    delete_note: handleDeleteNote,
    send_message: handleSendMessage,
};
