/**
 * =============================================================================
 * DEALS TOOLS - Herramientas del Módulo de Ventas (Pipeline)
 * =============================================================================
 */

// ═════════════════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════════════════

export interface CreateDealArgs {
    title: string;
    company: string;
    amount: number;
    currency: 'USD' | 'EUR' | 'ARS' | 'GBP' | 'BRL' | 'UYU' | 'MXN';
    status?: 'LEADS' | 'QUALIFICATION' | 'NEGOTIATION' | 'CLOSED';
    priority?: number;
    description?: string;
    companyResponsabileName?: string;
    companyResponsabileEmail?: string;
    companyResponsabilePhoneNumber?: string;
    expectedCloseDate?: string;
    nextStep?: string;
    outcome?: 'PENDING' | 'WON' | 'LOST';
}

export interface UpdateDealArgs {
    dealSearch: string;
    title?: string;
    company?: string;
    amount?: number;
    currency?: 'USD' | 'EUR' | 'ARS' | 'GBP' | 'BRL' | 'UYU' | 'MXN';
    status?: 'LEADS' | 'QUALIFICATION' | 'NEGOTIATION' | 'CLOSED';
    priority?: number;
    increasePriority?: boolean;
    decreasePriority?: boolean;
    description?: string;
    outcome?: 'PENDING' | 'WON' | 'LOST';
    expectedCloseDate?: string;
    clearExpectedCloseDate?: boolean;
    nextStep?: string;
}

export interface DeleteDealArgs {
    dealSearch: string;
}

export interface QueryDealsArgs {
    status?: 'LEADS' | 'QUALIFICATION' | 'NEGOTIATION' | 'CLOSED';
    outcome?: 'PENDING' | 'WON' | 'LOST';
    assigneeName?: string;
    search?: string;
    period?: 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR';
    minAmount?: number;
    maxAmount?: number;
    currency?: string;
    limit?: number;
    includeSummary?: boolean;
}

export interface AddDealCommentArgs {
    dealSearch: string;
    content: string;
    markStepCompleted?: boolean;
}

export interface ManageDealAssigneesArgs {
    dealSearch: string;
    action: 'assign' | 'unassign' | 'list';
    sellerName?: string;
}

export interface BulkUpdateDealsArgs {
    fromStatus?: 'LEADS' | 'QUALIFICATION' | 'NEGOTIATION' | 'CLOSED';
    fromOutcome?: 'PENDING' | 'WON' | 'LOST';
    toStatus?: 'LEADS' | 'QUALIFICATION' | 'NEGOTIATION' | 'CLOSED';
    toOutcome?: 'PENDING' | 'WON' | 'LOST';
    search?: string;
}

export interface QueryDealGoalsArgs {
    boardName?: string;
    limit?: number;
}

// ═════════════════════════════════════════════════════════════════════════════
// TOOLS
// ═════════════════════════════════════════════════════════════════════════════

export const CREATE_DEAL_TOOL = {
    type: "function" as const,
    function: {
        name: "create_deal",
        description: "Usa esta función cuando el usuario pida crear un deal, oportunidad, negocio, prospecto o venta en el pipeline. EJECUTA la función — no simules el resultado.",
        parameters: {
            type: "object",
            properties: {
                title: {
                    type: "string",
                    description: "Nombre o título del deal (ej: 'Renovación contrato Acme')."
                },
                company: {
                    type: "string",
                    description: "Empresa o cliente asociado al deal."
                },
                amount: {
                    type: "number",
                    description: "Valor o monto del deal (siempre positivo)."
                },
                currency: {
                    type: "string",
                    description: "Moneda del deal.",
                    enum: ["USD", "EUR", "ARS", "GBP", "BRL", "UYU", "MXN"]
                },
                status: {
                    type: "string",
                    description: "Etapa del pipeline. 'LEADS'=Leads, 'QUALIFICATION'=Calificación, 'NEGOTIATION'=Negociación, 'CLOSED'=Cerrado. Por defecto 'LEADS'.",
                    enum: ["LEADS", "QUALIFICATION", "NEGOTIATION", "CLOSED"]
                },
                priority: {
                    type: "number",
                    description: "Prioridad: 1=Baja, 2=Media (por defecto), 3=Alta.",
                    enum: [1, 2, 3]
                },
                description: {
                    type: "string",
                    description: "Descripción del deal. Opcional."
                },
                companyResponsabileName: {
                    type: "string",
                    description: "Nombre del contacto responsable en la empresa cliente. Opcional."
                },
                companyResponsabileEmail: {
                    type: "string",
                    description: "Email del contacto responsable. Opcional."
                },
                companyResponsabilePhoneNumber: {
                    type: "string",
                    description: "Teléfono del contacto responsable. Opcional."
                },
                expectedCloseDate: {
                    type: "string",
                    description: "Fecha estimada de cierre en formato ISO 8601 (ej: '2026-04-30'). Opcional."
                },
                nextStep: {
                    type: "string",
                    description: "Próximo paso o acción a tomar. Opcional."
                },
                outcome: {
                    type: "string",
                    description: "Resultado: 'PENDING'=Pendiente (por defecto), 'WON'=Ganado, 'LOST'=Perdido.",
                    enum: ["PENDING", "WON", "LOST"]
                }
            },
            required: ["title", "company", "amount", "currency"]
        }
    }
};

export const UPDATE_DEAL_TOOL = {
    type: "function" as const,
    function: {
        name: "update_deal",
        description: "Usa esta función para modificar, editar, mover de etapa, marcar como ganado/perdido, cambiar prioridad, actualizar next step u otros campos de un deal existente. Identifica el deal por título o empresa.",
        parameters: {
            type: "object",
            properties: {
                dealSearch: {
                    type: "string",
                    description: "Fragmento del título o nombre de empresa para identificar el deal."
                },
                title: { type: "string", description: "Nuevo título del deal." },
                company: { type: "string", description: "Nueva empresa." },
                amount: { type: "number", description: "Nuevo monto." },
                currency: {
                    type: "string",
                    description: "Nueva moneda.",
                    enum: ["USD", "EUR", "ARS", "GBP", "BRL", "UYU", "MXN"]
                },
                status: {
                    type: "string",
                    description: "Nueva etapa del pipeline. 'LEADS', 'QUALIFICATION', 'NEGOTIATION', 'CLOSED'.",
                    enum: ["LEADS", "QUALIFICATION", "NEGOTIATION", "CLOSED"]
                },
                priority: {
                    type: "number",
                    description: "Prioridad absoluta: 1=Baja, 2=Media, 3=Alta. Solo usar cuando el usuario especifica el nivel directamente.",
                    enum: [1, 2, 3]
                },
                increasePriority: {
                    type: "boolean",
                    description: "true para subir la prioridad un nivel (ej: de Media a Alta). Usar para peticiones relativas como 'sube la prioridad', 'hazlo más importante'."
                },
                decreasePriority: {
                    type: "boolean",
                    description: "true para bajar la prioridad un nivel (ej: de Alta a Media). Usar para peticiones relativas como 'baja la prioridad'."
                },
                description: { type: "string", description: "Nueva descripción." },
                outcome: {
                    type: "string",
                    description: "Nuevo resultado. 'WON'=Ganado, 'LOST'=Perdido, 'PENDING'=Pendiente.",
                    enum: ["PENDING", "WON", "LOST"]
                },
                expectedCloseDate: {
                    type: "string",
                    description: "Nueva fecha estimada de cierre ISO 8601."
                },
                clearExpectedCloseDate: {
                    type: "boolean",
                    description: "true para eliminar la fecha estimada de cierre."
                },
                nextStep: {
                    type: "string",
                    description: "Nuevo próximo paso."
                }
            },
            required: ["dealSearch"]
        }
    }
};

export const DELETE_DEAL_TOOL = {
    type: "function" as const,
    function: {
        name: "delete_deal",
        description: "Usa esta función cuando el usuario pida eliminar o borrar un deal. Identifica el deal por título o empresa.",
        parameters: {
            type: "object",
            properties: {
                dealSearch: {
                    type: "string",
                    description: "Fragmento del título o empresa del deal a eliminar."
                }
            },
            required: ["dealSearch"]
        }
    }
};

export const QUERY_DEALS_TOOL = {
    type: "function" as const,
    function: {
        name: "query_deals",
        description: "Usa esta función para LISTAR, CONSULTAR, FILTRAR o RESUMIR deals del pipeline CRM. En esta plataforma 'deals' siempre son oportunidades de venta del CRM — no son ofertas de tiendas. Frases que SIEMPRE deben llamar a esta función: 'listame los deals', 'qué deals tengo', 'dame los deals', 'cuántos deals hay', 'deals ganados', 'mis oportunidades de venta', 'ventas en el pipeline'. NO respondas de memoria ni preguntes por contexto — EJECUTA la función siempre que el usuario mencione deals, oportunidades o ventas.",
        parameters: {
            type: "object",
            properties: {
                status: {
                    type: "string",
                    description: "Filtrar por etapa del pipeline.",
                    enum: ["LEADS", "QUALIFICATION", "NEGOTIATION", "CLOSED"]
                },
                outcome: {
                    type: "string",
                    description: "Filtrar por resultado: 'PENDING'=pendientes, 'WON'=ganados, 'LOST'=perdidos.",
                    enum: ["PENDING", "WON", "LOST"]
                },
                assigneeName: {
                    type: "string",
                    description: "Filtrar deals asignados a este vendedor (fragmento de nombre o email)."
                },
                search: {
                    type: "string",
                    description: "Buscar texto libre en título o empresa."
                },
                period: {
                    type: "string",
                    description: "Filtrar por período de creación del deal.",
                    enum: ["THIS_WEEK", "THIS_MONTH", "LAST_MONTH", "THIS_YEAR"]
                },
                minAmount: {
                    type: "number",
                    description: "Importe mínimo del deal."
                },
                maxAmount: {
                    type: "number",
                    description: "Importe máximo del deal."
                },
                currency: {
                    type: "string",
                    description: "Filtrar por moneda (ej: 'USD', 'EUR')."
                },
                limit: {
                    type: "number",
                    description: "Máximo de resultados a mostrar (1-100). Por defecto 20."
                },
                includeSummary: {
                    type: "boolean",
                    description: "true para incluir resumen agregado (totales, tasa de conversión, monto por moneda). Útil para 'dame un resumen de los deals del último mes'."
                }
            }
        }
    }
};

export const ADD_DEAL_COMMENT_TOOL = {
    type: "function" as const,
    function: {
        name: "add_deal_comment",
        description: "Usa esta función cuando el usuario pida agregar un comentario, nota, actividad o registrar un paso completado en un deal.",
        parameters: {
            type: "object",
            properties: {
                dealSearch: {
                    type: "string",
                    description: "Fragmento del título o empresa del deal."
                },
                content: {
                    type: "string",
                    description: "Contenido del comentario o actividad."
                },
                markStepCompleted: {
                    type: "boolean",
                    description: "true si el usuario indica que es un paso completado (ej: 'marca este paso como completado', 'registra que completé esta tarea'). Afecta el tipo de actividad guardada."
                }
            },
            required: ["dealSearch", "content"]
        }
    }
};

export const MANAGE_DEAL_ASSIGNEES_TOOL = {
    type: "function" as const,
    function: {
        name: "manage_deal_assignees",
        description: "Usa esta función para asignar, desasignar o listar los vendedores asignados a un deal. Ejemplos: 'asigna a María al deal de Acme', 'quita a Juan del deal Renovación', 'quiénes están asignados al deal X'.",
        parameters: {
            type: "object",
            properties: {
                dealSearch: {
                    type: "string",
                    description: "Fragmento del título o empresa del deal."
                },
                action: {
                    type: "string",
                    description: "'assign' para asignar un vendedor, 'unassign' para quitarlo, 'list' para ver los asignados actuales.",
                    enum: ["assign", "unassign", "list"]
                },
                sellerName: {
                    type: "string",
                    description: "Nombre o email del vendedor. Requerido para assign/unassign. Pasar exactamente como lo escribió el usuario."
                }
            },
            required: ["dealSearch", "action"]
        }
    }
};

export const BULK_UPDATE_DEALS_TOOL = {
    type: "function" as const,
    function: {
        name: "bulk_update_deals",
        description: "Usa esta función cuando el usuario pida actualizar MÚLTIPLES deals a la vez. Ejemplos: 'marca como ganado todos los deals cerrados y pendientes', 'mueve todos los leads a calificación', 'marca como perdidos todos los deals en negociación'. Si solo afecta a UN deal, usa update_deal en su lugar.",
        parameters: {
            type: "object",
            properties: {
                fromStatus: {
                    type: "string",
                    description: "Filtrar deals en esta etapa del pipeline.",
                    enum: ["LEADS", "QUALIFICATION", "NEGOTIATION", "CLOSED"]
                },
                fromOutcome: {
                    type: "string",
                    description: "Filtrar deals con este resultado actual.",
                    enum: ["PENDING", "WON", "LOST"]
                },
                toStatus: {
                    type: "string",
                    description: "Nueva etapa para los deals filtrados.",
                    enum: ["LEADS", "QUALIFICATION", "NEGOTIATION", "CLOSED"]
                },
                toOutcome: {
                    type: "string",
                    description: "Nuevo resultado para los deals filtrados: 'WON'=Ganado, 'LOST'=Perdido, 'PENDING'=Pendiente.",
                    enum: ["PENDING", "WON", "LOST"]
                },
                search: {
                    type: "string",
                    description: "Restringir solo a deals cuyo título o empresa contenga este texto."
                }
            }
        }
    }
};

export const QUERY_DEAL_GOALS_TOOL = {
    type: "function" as const,
    function: {
        name: "query_deal_goals",
        description: "Usa esta función cuando el usuario pida ver el historial de metas de ventas, objetivos del pipeline, o el progreso hacia las metas establecidas. Ejemplos: 'muéstrame las metas de ventas', 'historial de objetivos', 'cumplimos la meta de este trimestre?'.",
        parameters: {
            type: "object",
            properties: {
                boardName: {
                    type: "string",
                    description: "Nombre o fragmento del nombre del pipeline/board. Omitir para ver todos los boards."
                },
                limit: {
                    type: "number",
                    description: "Máximo de metas a mostrar por board (1-50). Por defecto 10."
                }
            }
        }
    }
};

export const DEALS_TOOLS = [
    CREATE_DEAL_TOOL,
    UPDATE_DEAL_TOOL,
    DELETE_DEAL_TOOL,
    QUERY_DEALS_TOOL,
    ADD_DEAL_COMMENT_TOOL,
    MANAGE_DEAL_ASSIGNEES_TOOL,
    BULK_UPDATE_DEALS_TOOL,
    QUERY_DEAL_GOALS_TOOL,
];
