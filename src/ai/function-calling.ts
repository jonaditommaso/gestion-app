/**
 * =============================================================================
 * FUNCTION CALLING - Servicio Centralizado
 * =============================================================================
 *
 * Este módulo centraliza la lógica de function calling para que:
 * 1. Sea reutilizable con cualquier proveedor (Groq, Cerebras, OpenAI, etc.)
 * 2. Esté separado del chat conversacional
 * 3. Use una implementación compartida que cualquier servicio puede usar
 *
 * IMPORTANTE: La función chatWithTools está aquí para evitar duplicar
 * código en cada servicio de IA. Usa el SDK de Groq internamente porque
 * es el que mejor soporte tiene para tools, pero esto es transparente
 * para quien lo usa.
 */

import { Groq } from 'groq-sdk';
import { ChatMessage, ChatWithToolsResult } from './types';
import { ALL_TOOLS } from './tools/index';
import { GROQ_MODEL } from './config';
import type { ChatCompletionTool } from 'groq-sdk/resources/chat/completions';

// Cliente de Groq para function calling (lazy initialization)
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
    if (!groqClient) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error('GROQ_API_KEY is required for function calling');
        }
        groqClient = new Groq({ apiKey });
    }
    return groqClient;
}

/**
 * Palabras clave que indican que el mensaje del usuario es una solicitud de acción.
 * Se usan para detectar cuando el modelo evadió llamar a una función y reintentar.
 */
const ACTION_KEYWORDS = [
    'crea', 'crear', 'agrega', 'agreg', 'nueva', 'nuevo',
    'actualiza', 'actualiz', 'modifica', 'cambia', 'cambi',
    'sube', 'baja', 'súbele', 'bájale', 'asigna', 'asígna', 'asígname',
    'elimina', 'borra', 'borrar', 'eliminar',
    'envía', 'envía', 'manda', 'mandame',
    'ponla', 'ponle', 'pásala', 'pasala', 'dale', 'marcala',
    'tarea', 'nota', 'mensaje', 'checklist', 'comentario',
    'in progress', 'completada', 'prioridad', 'mueve', 'mover', 'move', 'bulk',
    'dame', 'listar', 'lista', 'mostrame', 'muéstrame', 'filtra', 'consulta',
    'factura', 'facturas', 'ingreso', 'ingresos', 'gasto', 'gastos',
    'cobro', 'cobros', 'pago', 'pagos', 'vencida', 'vencidas', 'vencido', 'vencidos',
    'pendiente', 'pendientes', 'categoria', 'categoría', 'categorias', 'categorías',
    'billing', 'operacion', 'operación', 'registra', 'registrar',
];

/**
 * Ejecuta chat con soporte para function calling.
 *
 * Esta función está centralizada aquí para:
 * - Evitar duplicar código en cada servicio de IA
 * - Poder cambiar el proveedor de function calling sin tocar otros archivos
 * - Mantener separada la lógica de "entender acciones" del "chat conversacional"
 *
 * @param messages - Mensajes de la conversación
 * @returns Resultado con tipo 'tool_call' o 'text'
 */
export async function chatWithTools(messages: ChatMessage[]): Promise<ChatWithToolsResult> {
    const groq = getGroqClient();

    console.log('[FUNCTION_CALLING] Request:', {
        messageCount: messages.length,
        lastMessage: messages[messages.length - 1],
        toolsCount: ALL_TOOLS.length,
        tools: ALL_TOOLS.map(t => t.function.name),
    });

    // Agregar un mensaje de sistema que fuerce el uso de herramientas
    const messagesWithSystem: ChatMessage[] = [
        {
            role: 'system',
            content: `Eres un asistente que SIEMPRE debe usar las funciones disponibles cuando el usuario lo solicite. NUNCA simules o finjas ejecutar una acción - DEBES llamar a la función correspondiente.

            Reglas por función:
            - create_note: si el usuario pide crear, guardar o agregar una nota o recordatorio.
            - update_note: si el usuario pide modificar, editar, pinear/anclar, despinear, cambiar color, agregar renglones/líneas, activar gradiente, hacer global una nota ya anclada, quitar globalización o cualquier cambio sobre una nota existente.
            - delete_note: si el usuario pide eliminar, borrar o quitar una nota existente.
            - send_message: si el usuario pide enviar un mensaje a un compañero del equipo. SIEMPRE llama a esta función con el nombre tal como lo escribió el usuario, aunque sea un apodo, nombre parcial o en minúsculas. NUNCA preguntes si el nombre es válido antes de llamar a la función — el backend se encarga de resolver el nombre.
            - create_task: si el usuario pide crear una tarea, actividad, ticket o ítem en un workspace. Pasa el workspaceName solo si el usuario lo especificó explícitamente; de lo contrario omítelo. NUNCA preguntes sobre el workspace antes de llamar a la función — el backend decide.
            - delete_task: si el usuario pide eliminar o borrar una tarea. Usa el nombre o fragmento de nombre de la tarea como taskSearch.
            - update_task: si el usuario pide modificar, renombrar, cambiar estado, prioridad, descripción, fecha límite, marcar como completada, asignar o desasignar miembros de una tarea. Reglas críticas:
              * Para prioridad RELATIVA ("súbele la prioridad", "hazla más importante", "aumenta la prioridad") → usar increasePriority: true. Para bajarla → decreasePriority: true. NUNCA adivines un número absoluto cuando el usuario usa términos relativos.
              * Para prioridad ABSOLUTA ("prioridad muy alta", "prioridad alta", "prioridad media", "prioridad baja") → usar priority: 1..5 (1=Muy baja, 2=Baja, 3=Media, 4=Alta, 5=Muy alta).
              * Cuando el usuario dice "asígname la tarea", "asígnalo a mí mismo", "que me la asignes" → usar assignToSelf: true dentro del mismo update_task. NO llames assign_task_member por separado.
              * Cuando el usuario pide asignar la tarea a otra persona → usar assignMemberName con el nombre tal como lo escribió.
              * Si el usuario pide múltiples cambios en la misma tarea (estado + prioridad + asignación, etc.) → incorpóralos TODOS en una sola llamada a update_task.
              * Incluir solo los campos mencionados explícitamente por el usuario.
              * Para marcar como completada → completedAt con la fecha actual ISO. Para desmarcar → clearCompletedAt: true. Para quitar fecha límite → clearDueDate: true.
            - add_task_comment: si el usuario pide agregar un comentario a una tarea.
            - add_checklist_item: si el usuario pide agregar ítems, subtareas o una checklist a una tarea. El campo items debe ser un array de objetos con title.
            - assign_task_member: usar SOLO cuando la acción sea únicamente asignar/desasignar sin otros cambios. Para auto-asignación pasar memberName: "yo". SIEMPRE pasar el nombre exactamente como lo escribió el usuario — el backend resuelve el nombre.
            - bulk_move_tasks: si el usuario pide mover varias o todas las tareas de un estado a otro (ej: "mueve todas las tareas de in progress a in review"). Usa fromStatus y toStatus.
            - archive_task: si el usuario pide archivar o desarchivar una tarea. Usa action 'archive' o 'unarchive'.
            - query_tasks: si el usuario pide LISTAR, CONSULTAR o FILTRAR tareas (ej: "dame todas las tareas completadas de Jona de este mes"). Cuando el usuario pida datos de tareas, NO respondas de memoria: llama esta función.

            Reglas para facturación (billing):
            - create_billing_operation: si el usuario pide registrar, crear o agregar una factura, ingreso, gasto, cobro o pago. Infiere 'income' o 'expense' del contexto. Si no dice la fecha, usa hoy. NUNCA simules la creación — EJECUTA la función.
            - query_billing_operations: si el usuario pide VER, LISTAR, CONSULTAR o FILTRAR facturas u operaciones de facturación. Ejemplos de cuándo llamarla:
              * "dame los gastos vencidos" → status: 'OVERDUE', type: 'expense'
              * "facturas vencidas" → status: 'OVERDUE'
              * "ingresos pendientes" → type: 'income', status: 'PENDING'
              * "facturas del cliente Juan" → partyName: 'Juan'
              * "gastos de Marketing" → type: 'expense', category: 'Marketing'
              * "qué vence en los próximos 30 días" → upcomingDays: 30
              * "qué vence esta semana" → upcomingDays: 7
              * "listar todas las facturas" → sin filtros adicionales (source por defecto es 'active')
              * "dame las archivadas" / "operaciones archivadas" → source: 'archived'
              * "dame los borradores" / "operaciones en borrador" → source: 'drafts'
              IMPORTANTE: el parámetro source determina QUÉ conjunto cargar: 'active' (activas, por defecto), 'archived' (SOLO archivadas), 'drafts' (SOLO borradores). NUNCA omitas source si el usuario pidió archivadas o borradores.
              NO respondas de memoria — SIEMPRE llama esta función.
            - update_billing_operation: si el usuario pide modificar, editar, cambiar o actualizar una factura u operación. Usa operationSearch con el nombre del cliente o número de factura que mencione el usuario. Reglas especiales:
              * "marcar como pagada" / "marcar pagada" / "pagar" → status: 'PAID'
              * "marcar como pendiente" → status: 'PENDING'
              * "marcar como vencida" → status: 'OVERDUE'
              * "archivar" / "archívala" / "archivar la factura de X" → isArchived: true
              * "desarchivar" / "desarchívala" → isArchived: false
              * Si el usuario dice "marca como pagada la factura de [cliente]" → operationSearch: '[cliente]', status: 'PAID'
              Para estas acciones NO uses ninguna otra herramienta — update_billing_operation es suficiente.
            - delete_billing_operation: si el usuario pide eliminar o borrar una factura u operación. Usa el nombre del cliente o número de factura como operationSearch.
            - manage_billing_categories: si el usuario pide VER, LISTAR, AGREGAR, RENOMBRAR o ELIMINAR categorías de facturación.
              * "qué categorías hay" / "lista las categorías" → action: 'list'
              * "agrega la categoría Consultoría a ingresos" → action: 'add', categoryType: 'income', categoryName: 'Consultoría'
              * "renombra Marketing a Publicidad en gastos" → action: 'rename', categoryType: 'expense', oldCategoryName: 'Marketing', newCategoryName: 'Publicidad'
              * "elimina la categoría Varios de gastos" → action: 'remove', categoryType: 'expense', categoryName: 'Varios'

            NO respondas con texto simulando que lo hiciste. EJECUTA la función correspondiente.`
        },
        ...messages
    ];

    const response = await groq.chat.completions.create({
        messages: messagesWithSystem,
        model: GROQ_MODEL,
        temperature: 0.2,
        max_completion_tokens: 4096,
        tools: ALL_TOOLS as ChatCompletionTool[],
        tool_choice: "auto",
    });

    const choice = response.choices[0];

    console.log('[FUNCTION_CALLING] Response:', {
        finishReason: choice.finish_reason,
        hasToolCalls: !!choice.message.tool_calls,
        toolCallsCount: choice.message.tool_calls?.length || 0,
        messageContent: choice.message.content?.substring(0, 200),
    });

    // Si el modelo respondió con texto en lugar de llamar una función,
    // detectar si claramente debería haber llamado una función y reintentar.
    if (choice.finish_reason !== 'tool_calls' || !choice.message.tool_calls) {
        const lastUserMsg = messages.filter(m => m.role === 'user').pop();
        const looksLikeAction = lastUserMsg && ACTION_KEYWORDS.some(kw =>
            lastUserMsg.content.toLowerCase().includes(kw)
        );

        if (looksLikeAction) {
            console.log('[FUNCTION_CALLING] Model returned text for an action request — retrying with tool_choice: required');

            const retryMessages: ChatMessage[] = [
                ...messagesWithSystem,
                {
                    role: 'user',
                    content: 'IMPORTANTE: Debes llamar a la función correspondiente ahora. No respondas con texto. Ejecuta la acción solicitada.'
                }
            ];

            const retryResponse = await groq.chat.completions.create({
                messages: retryMessages,
                model: GROQ_MODEL,
                temperature: 0.1,
                max_completion_tokens: 4096,
                tools: ALL_TOOLS as ChatCompletionTool[],
                tool_choice: "required",
            });

            const retryChoice = retryResponse.choices[0];
            console.log('[FUNCTION_CALLING] Retry response:', {
                finishReason: retryChoice.finish_reason,
                hasToolCalls: !!retryChoice.message.tool_calls,
                toolCallsCount: retryChoice.message.tool_calls?.length || 0,
            });

            if (retryChoice.message.tool_calls && retryChoice.message.tool_calls.length > 0) {
                const toolCalls = retryChoice.message.tool_calls.map(tc => ({
                    id: tc.id,
                    name: tc.function.name,
                    arguments: JSON.parse(tc.function.arguments)
                }));
                console.log('[FUNCTION_CALLING] Retry tool calls detected:', toolCalls);
                return { type: 'tool_call', toolCalls };
            }
        }
    }

    // ¿La IA decidió llamar a una función?
    if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
        const toolCalls = choice.message.tool_calls.map(tc => ({
            id: tc.id,
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments)
        }));

        console.log('[FUNCTION_CALLING] Tool calls detected:', toolCalls);

        return {
            type: 'tool_call',
            toolCalls
        };
    }

    // Respuesta de texto normal
    console.log('[FUNCTION_CALLING] Text response (no tool call)');
    return {
        type: 'text',
        content: choice.message.content || ''
    };
}
