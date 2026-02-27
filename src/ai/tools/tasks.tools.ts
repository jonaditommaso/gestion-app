/**
 * =============================================================================
 * TASKS TOOLS - Herramientas del Módulo de Tareas
 * =============================================================================
 */

// ═════════════════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════════════════

export interface CreateTaskArgs {
    name: string;
    workspaceName?: string;
    status?: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    priority?: number;
    dueDate?: string;
    description?: string;
}

export interface DeleteTaskArgs {
    taskSearch: string;
    workspaceName?: string;
}

export interface UpdateTaskArgs {
    taskSearch: string;
    workspaceName?: string;
    name?: string;
    description?: string;
    status?: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    priority?: number;
    increasePriority?: boolean;
    decreasePriority?: boolean;
    dueDate?: string;
    clearDueDate?: boolean;
    completedAt?: string;
    clearCompletedAt?: boolean;
    assignToSelf?: boolean;
    assignMemberName?: string;
    unassignMemberName?: string;
}

export interface AddTaskCommentArgs {
    taskSearch: string;
    workspaceName?: string;
    content: string;
}

export interface AddChecklistItemArgs {
    taskSearch: string;
    workspaceName?: string;
    items: { title: string; dueDate?: string }[];
    checklistTitle?: string;
}

export interface AssignTaskMemberArgs {
    taskSearch: string;
    workspaceName?: string;
    memberName: string;
    action: 'assign' | 'unassign';
}

export interface BulkMoveTasksArgs {
    workspaceName?: string;
    fromStatus: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    toStatus: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
}

export interface ArchiveTaskArgs {
    taskSearch: string;
    workspaceName?: string;
    action: 'archive' | 'unarchive';
}

export interface QueryTasksArgs {
    workspaceName?: string;
    status?: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
    completed?: boolean;
    assigneeName?: string;
    period?: 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR';
    dateField?: 'completedAt' | 'dueDate' | 'createdAt';
    includeArchived?: boolean;
    search?: string;
    limit?: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// TOOLS
// ═════════════════════════════════════════════════════════════════════════════

export const CREATE_TASK_TOOL = {
    type: "function" as const,
    function: {
        name: "create_task",
        description: "Usa esta función cuando el usuario pida crear una tarea, actividad, ticket o ítem en un workspace. Si el usuario no indica el workspace, el handler determinará cuál usar (si hay uno solo) o pedirá aclaración. No simules crearla — EJECUTA la función.",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Nombre o título de la tarea"
                },
                workspaceName: {
                    type: "string",
                    description: "Nombre o fragmento del workspace. Omitir si el usuario no lo especificó."
                },
                status: {
                    type: "string",
                    description: "Estado inicial. Por defecto 'TODO'.",
                    enum: ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]
                },
                priority: {
                    type: "number",
                    description: "Prioridad de 1 (muy baja) a 5 (muy alta). Por defecto 3 (media)."
                },
                dueDate: {
                    type: "string",
                    description: "Fecha límite ISO 8601 (ej: '2026-03-01'). Opcional."
                },
                description: {
                    type: "string",
                    description: "Descripción de la tarea. Opcional."
                }
            },
            required: ["name"]
        }
    }
};

export const DELETE_TASK_TOOL = {
    type: "function" as const,
    function: {
        name: "delete_task",
        description: "Usa esta función cuando el usuario pida eliminar o borrar una tarea. Identifica la tarea buscando por fragmento de nombre.",
        parameters: {
            type: "object",
            properties: {
                taskSearch: {
                    type: "string",
                    description: "Fragmento del nombre de la tarea a eliminar"
                },
                workspaceName: {
                    type: "string",
                    description: "Nombre o fragmento del workspace. Omitir si el usuario no lo especificó."
                }
            },
            required: ["taskSearch"]
        }
    }
};

export const UPDATE_TASK_TOOL = {
    type: "function" as const,
    function: {
        name: "update_task",
        description: "Usa esta función cuando el usuario pida modificar, editar, cambiar, completar, o actualizar cualquier campo de una tarea existente (nombre, descripción, estado, prioridad, fecha límite, marcar como completada, asignar o desasignar miembros). Si en el mismo mensaje el usuario también pide asignarse la tarea o asignarla a alguien, inclúyelo aquí en lugar de llamar a assign_task_member por separado.",
        parameters: {
            type: "object",
            properties: {
                taskSearch: {
                    type: "string",
                    description: "Fragmento del nombre de la tarea a modificar"
                },
                workspaceName: {
                    type: "string",
                    description: "Nombre o fragmento del workspace. Omitir si el usuario no lo especificó."
                },
                name: {
                    type: "string",
                    description: "Nuevo nombre para la tarea. Opcional."
                },
                description: {
                    type: "string",
                    description: "Nueva descripción. Opcional."
                },
                status: {
                    type: "string",
                    description: "Nuevo estado.",
                    enum: ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]
                },
                priority: {
                    type: "number",
                    description: "Prioridad absoluta de 1 (muy baja) a 5 (muy alta). Usar solo si el usuario especificó un nivel concreto (ej: 'prioridad muy alta', 'prioridad baja'). NO usar si el usuario dijo 'súbele' o 'bájale' — usar increasePriority o decreasePriority."
                },
                increasePriority: {
                    type: "boolean",
                    description: "true cuando el usuario pide subir, aumentar o incrementar la prioridad sin especificar un valor exacto. Subir prioridad significa mover el valor numérico hacia 5."
                },
                decreasePriority: {
                    type: "boolean",
                    description: "true cuando el usuario pide bajar o reducir la prioridad sin especificar un valor exacto. Bajar prioridad significa mover el valor numérico hacia 1."
                },
                dueDate: {
                    type: "string",
                    description: "Nueva fecha límite en formato ISO 8601."
                },
                clearDueDate: {
                    type: "boolean",
                    description: "true para quitar la fecha límite."
                },
                completedAt: {
                    type: "string",
                    description: "Fecha de completado ISO 8601. Usar la fecha actual si el usuario dice 'marcar como completada'."
                },
                clearCompletedAt: {
                    type: "boolean",
                    description: "true para desmarcar como completada."
                },
                assignToSelf: {
                    type: "boolean",
                    description: "true cuando el usuario pide asignarse la tarea a sí mismo (ej: 'asígnamela', 'asígnala a mí', 'asígnalo a mí mismo', 'que me la asignes a mí')."
                },
                assignMemberName: {
                    type: "string",
                    description: "Nombre, apellido o email del miembro a asignar a la tarea (si no es el propio usuario). Usar en lugar de assignToSelf cuando se asigna a otra persona."
                },
                unassignMemberName: {
                    type: "string",
                    description: "Nombre, apellido o email del miembro a desasignar de la tarea."
                }
            },
            required: ["taskSearch"]
        }
    }
};

export const ADD_TASK_COMMENT_TOOL = {
    type: "function" as const,
    function: {
        name: "add_task_comment",
        description: "Usa esta función cuando el usuario pida agregar, escribir o publicar un comentario en una tarea.",
        parameters: {
            type: "object",
            properties: {
                taskSearch: {
                    type: "string",
                    description: "Fragmento del nombre de la tarea donde agregar el comentario"
                },
                workspaceName: {
                    type: "string",
                    description: "Nombre o fragmento del workspace. Omitir si el usuario no lo especificó."
                },
                content: {
                    type: "string",
                    description: "Contenido del comentario"
                }
            },
            required: ["taskSearch", "content"]
        }
    }
};

export const ADD_CHECKLIST_ITEM_TOOL = {
    type: "function" as const,
    function: {
        name: "add_checklist_item",
        description: "Usa esta función cuando el usuario pida agregar ítems, subtareas o una checklist a una tarea existente.",
        parameters: {
            type: "object",
            properties: {
                taskSearch: {
                    type: "string",
                    description: "Fragmento del nombre de la tarea donde agregar los ítems"
                },
                workspaceName: {
                    type: "string",
                    description: "Nombre o fragmento del workspace. Omitir si el usuario no lo especificó."
                },
                items: {
                    type: "array",
                    description: "Lista de ítems a agregar",
                    items: {
                        type: "object",
                        properties: {
                            title: { type: "string", description: "Título del ítem" },
                            dueDate: { type: "string", description: "Fecha límite ISO 8601. Opcional." }
                        },
                        required: ["title"]
                    }
                },
                checklistTitle: {
                    type: "string",
                    description: "Título de la sección de checklist (solo para el primer ítem si la tarea aún no tiene checklist). Opcional."
                }
            },
            required: ["taskSearch", "items"]
        }
    }
};

export const ASSIGN_TASK_MEMBER_TOOL = {
    type: "function" as const,
    function: {
        name: "assign_task_member",
        description: "Usa esta función SOLO cuando el usuario únicamente pida asignar o desasignar a alguien de una tarea sin hacer otros cambios. Si el usuario pide múltiples cambios en la misma tarea, usar update_task con assignToSelf o assignMemberName. Para asignarse a sí mismo, pasar memberName como 'yo'.",
        parameters: {
            type: "object",
            properties: {
                taskSearch: {
                    type: "string",
                    description: "Fragmento del nombre de la tarea"
                },
                workspaceName: {
                    type: "string",
                    description: "Nombre o fragmento del workspace. Omitir si el usuario no lo especificó."
                },
                memberName: {
                    type: "string",
                    description: "Nombre, apellido o email del miembro a asignar/desasignar. Usar 'yo' si el usuario quiere asignarse/desasignarse a sí mismo."
                },
                action: {
                    type: "string",
                    description: "'assign' para asignar, 'unassign' para desasignar",
                    enum: ["assign", "unassign"]
                }
            },
            required: ["taskSearch", "memberName", "action"]
        }
    }
};

export const BULK_MOVE_TASKS_TOOL = {
    type: "function" as const,
    function: {
        name: "bulk_move_tasks",
        description: "Usa esta función cuando el usuario pida mover varias o todas las tareas de un estado a otro (por ejemplo: 'mueve todas las tareas de IN_PROGRESS a IN_REVIEW').",
        parameters: {
            type: "object",
            properties: {
                workspaceName: {
                    type: "string",
                    description: "Nombre o fragmento del workspace. Omitir si el usuario no lo especificó."
                },
                fromStatus: {
                    type: "string",
                    description: "Estado origen de las tareas a mover.",
                    enum: ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]
                },
                toStatus: {
                    type: "string",
                    description: "Estado destino al que se moverán las tareas.",
                    enum: ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]
                }
            },
            required: ["fromStatus", "toStatus"]
        }
    }
};

export const ARCHIVE_TASK_TOOL = {
    type: "function" as const,
    function: {
        name: "archive_task",
        description: "Usa esta función cuando el usuario pida archivar o desarchivar una tarea específica.",
        parameters: {
            type: "object",
            properties: {
                taskSearch: {
                    type: "string",
                    description: "Fragmento del nombre de la tarea"
                },
                workspaceName: {
                    type: "string",
                    description: "Nombre o fragmento del workspace. Omitir si el usuario no lo especificó."
                },
                action: {
                    type: "string",
                    description: "'archive' para archivar o 'unarchive' para desarchivar",
                    enum: ["archive", "unarchive"]
                }
            },
            required: ["taskSearch", "action"]
        }
    }
};

export const QUERY_TASKS_TOOL = {
    type: "function" as const,
    function: {
        name: "query_tasks",
        description: "Usa esta función para listar o consultar tareas con filtros (estado, completadas, asignado, período, búsqueda). Ejemplo: 'dame todas las tareas completadas de Jona de este mes'.",
        parameters: {
            type: "object",
            properties: {
                workspaceName: {
                    type: "string",
                    description: "Nombre o fragmento del workspace. Omitir si el usuario no lo especificó."
                },
                status: {
                    type: "string",
                    description: "Filtrar por estado.",
                    enum: ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]
                },
                completed: {
                    type: "boolean",
                    description: "true para solo completadas, false para solo incompletas."
                },
                assigneeName: {
                    type: "string",
                    description: "Nombre, apellido o email del asignado (ej: 'Jona')."
                },
                period: {
                    type: "string",
                    description: "Período relativo para filtrar fechas.",
                    enum: ["THIS_WEEK", "THIS_MONTH", "LAST_MONTH", "THIS_YEAR"]
                },
                dateField: {
                    type: "string",
                    description: "Campo de fecha sobre el cual aplicar period. Si se omite, usa completedAt cuando completed=true y dueDate en otros casos.",
                    enum: ["completedAt", "dueDate", "createdAt"]
                },
                includeArchived: {
                    type: "boolean",
                    description: "true para incluir tareas archivadas. Por defecto false."
                },
                search: {
                    type: "string",
                    description: "Texto para buscar en nombre o descripción."
                },
                limit: {
                    type: "number",
                    description: "Cantidad máxima de resultados a mostrar (1-100). Por defecto 20."
                }
            }
        }
    }
};

export const TASKS_TOOLS = [
    CREATE_TASK_TOOL,
    DELETE_TASK_TOOL,
    UPDATE_TASK_TOOL,
    ADD_TASK_COMMENT_TOOL,
    ADD_CHECKLIST_ITEM_TOOL,
    ASSIGN_TASK_MEMBER_TOOL,
    BULK_MOVE_TASKS_TOOL,
    ARCHIVE_TASK_TOOL,
    QUERY_TASKS_TOOL,
];
