/**
 * =============================================================================
 * BILLING TOOLS - Herramientas del Módulo de Facturación
 * =============================================================================
 */

// ═════════════════════════════════════════════════════════════════════════════
// TYPES
// ═════════════════════════════════════════════════════════════════════════════

export interface CreateBillingOperationArgs {
    type: 'income' | 'expense';
    import: number;
    category: string;
    date?: string;
    partyName?: string;
    invoiceNumber?: string;
    status?: 'PENDING' | 'PAID' | 'OVERDUE';
    dueDate?: string;
    paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'DIGITAL_WALLET' | 'OTHER';
    currency?: string;
    taxRate?: number;
    note?: string;
    isDraft?: boolean;
}

export interface QueryBillingOperationsArgs {
    type?: 'income' | 'expense';
    status?: 'PENDING' | 'PAID' | 'OVERDUE';
    partyName?: string;
    category?: string;
    upcomingDays?: number;
    source?: 'active' | 'archived' | 'drafts';
    search?: string;
    limit?: number;
}

export interface UpdateBillingOperationArgs {
    operationSearch: string;
    filterType?: 'income' | 'expense';
    import?: number;
    category?: string;
    date?: string;
    partyName?: string;
    invoiceNumber?: string;
    status?: 'PENDING' | 'PAID' | 'OVERDUE';
    dueDate?: string;
    clearDueDate?: boolean;
    paymentMethod?: 'CASH' | 'BANK_TRANSFER' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'DIGITAL_WALLET' | 'OTHER';
    currency?: string;
    taxRate?: number;
    note?: string;
    isArchived?: boolean;
    isDraft?: boolean;
}

export interface DeleteBillingOperationArgs {
    operationSearch: string;
    filterType?: 'income' | 'expense';
}

export interface ManageBillingCategoriesArgs {
    action: 'list' | 'add' | 'rename' | 'remove';
    categoryType?: 'income' | 'expense';
    categoryName?: string;
    oldCategoryName?: string;
    newCategoryName?: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// TOOLS
// ═════════════════════════════════════════════════════════════════════════════

export const CREATE_BILLING_OPERATION_TOOL = {
    type: "function" as const,
    function: {
        name: "create_billing_operation",
        description: "Usa esta función cuando el usuario pida registrar, agregar o crear una factura, operación, ingreso, gasto o cobro. EJECUTA la función — no simules el resultado.",
        parameters: {
            type: "object",
            properties: {
                type: {
                    type: "string",
                    description: "'income' para ingresos, cobros, ventas o entradas de dinero. 'expense' para gastos, pagos, compras o salidas de dinero.",
                    enum: ["income", "expense"]
                },
                import: {
                    type: "number",
                    description: "Importe o monto de la operación (siempre positivo)."
                },
                category: {
                    type: "string",
                    description: "Categoría de la operación. Si el usuario no la especifica, infiere la más adecuada según el contexto (ej: 'Servicios', 'Salarios', 'Marketing')."
                },
                date: {
                    type: "string",
                    description: "Fecha de la operación en formato ISO 8601 (ej: '2026-03-08'). Si el usuario no la especifica, usa la fecha de hoy."
                },
                partyName: {
                    type: "string",
                    description: "Nombre del cliente, proveedor o contraparte. Opcional."
                },
                invoiceNumber: {
                    type: "string",
                    description: "Número de factura o referencia. Opcional."
                },
                status: {
                    type: "string",
                    description: "Estado del pago. 'PENDING' = pendiente, 'PAID' = pagado, 'OVERDUE' = vencido. Por defecto 'PENDING'.",
                    enum: ["PENDING", "PAID", "OVERDUE"]
                },
                dueDate: {
                    type: "string",
                    description: "Fecha de vencimiento en formato ISO 8601. Opcional."
                },
                paymentMethod: {
                    type: "string",
                    description: "Método de pago.",
                    enum: ["CASH", "BANK_TRANSFER", "DEBIT_CARD", "CREDIT_CARD", "DIGITAL_WALLET", "OTHER"]
                },
                currency: {
                    type: "string",
                    description: "Código de moneda de 3 letras (ej: 'EUR', 'USD'). Por defecto 'EUR'."
                },
                taxRate: {
                    type: "number",
                    description: "Porcentaje de impuesto (0-100). Opcional."
                },
                note: {
                    type: "string",
                    description: "Nota o descripción adicional. Opcional."
                },
                isDraft: {
                    type: "boolean",
                    description: "true si la operación es un borrador. Opcional."
                }
            },
            required: ["type", "import", "category"]
        }
    }
};

export const QUERY_BILLING_OPERATIONS_TOOL = {
    type: "function" as const,
    function: {
        name: "query_billing_operations",
        description: "Usa esta función para listar, consultar o filtrar facturas u operaciones de facturación. Ejemplos: 'dame todos los gastos vencidos', 'facturas de Juan de este mes', 'ingresos pendientes', 'facturas que vencen en los próximos 30 días', 'gastos de la categoría Marketing'. NO respondas de memoria — EJECUTA la función.",
        parameters: {
            type: "object",
            properties: {
                type: {
                    type: "string",
                    description: "Filtrar por tipo: 'income' solo ingresos, 'expense' solo gastos. Omitir para ambos.",
                    enum: ["income", "expense"]
                },
                status: {
                    type: "string",
                    description: "Filtrar por estado de pago: 'PENDING' = pendientes, 'PAID' = pagadas, 'OVERDUE' = vencidas.",
                    enum: ["PENDING", "PAID", "OVERDUE"]
                },
                partyName: {
                    type: "string",
                    description: "Fragmento del nombre del cliente/proveedor para filtrar (ej: 'Juan', 'Acme'). Búsqueda parcial insensible a mayúsculas."
                },
                category: {
                    type: "string",
                    description: "Fragmento del nombre de categoría para filtrar (ej: 'Marketing', 'Salario')."
                },
                upcomingDays: {
                    type: "number",
                    description: "Mostrar facturas cuyo vencimiento (dueDate) cae dentro de los próximos N días desde hoy. Muy útil para '¿qué vence esta semana?' (7), 'próximos 30 días' (30), etc."
                },
                source: {
                    type: "string",
                    description: "Qué conjunto de operaciones consultar. 'active' = activas (por defecto), 'archived' = SOLO archivadas, 'drafts' = SOLO borradores. Usar 'archived' cuando el usuario diga 'archivadas', 'archived', etc. Usar 'drafts' para 'borradores'.",
                    enum: ["active", "archived", "drafts"]
                },
                search: {
                    type: "string",
                    description: "Texto libre para buscar en partyName, categoría, número de factura o nota."
                },
                limit: {
                    type: "number",
                    description: "Máximo de resultados a mostrar (1-100). Por defecto 20."
                }
            }
        }
    }
};

export const UPDATE_BILLING_OPERATION_TOOL = {
    type: "function" as const,
    function: {
        name: "update_billing_operation",
        description: "Usa esta función cuando el usuario pida modificar, editar, actualizar o cambiar una factura u operación de facturación existente (importe, estado, fecha, cliente, categoría, etc.). Identifica la operación por nombre del cliente, número de factura o descripción.",
        parameters: {
            type: "object",
            properties: {
                operationSearch: {
                    type: "string",
                    description: "Fragmento del nombre del cliente (partyName), número de factura (invoiceNumber) o nota, para identificar la operación a modificar."
                },
                filterType: {
                    type: "string",
                    description: "Opcional: 'income' o 'expense' para acotar la búsqueda si hay ambigüedad.",
                    enum: ["income", "expense"]
                },
                import: {
                    type: "number",
                    description: "Nuevo importe."
                },
                category: {
                    type: "string",
                    description: "Nueva categoría."
                },
                date: {
                    type: "string",
                    description: "Nueva fecha de operación ISO 8601."
                },
                partyName: {
                    type: "string",
                    description: "Nuevo nombre de cliente/proveedor."
                },
                invoiceNumber: {
                    type: "string",
                    description: "Nuevo número de factura."
                },
                status: {
                    type: "string",
                    description: "Nuevo estado: 'PENDING', 'PAID' o 'OVERDUE'.",
                    enum: ["PENDING", "PAID", "OVERDUE"]
                },
                dueDate: {
                    type: "string",
                    description: "Nueva fecha de vencimiento ISO 8601."
                },
                clearDueDate: {
                    type: "boolean",
                    description: "true para eliminar la fecha de vencimiento."
                },
                paymentMethod: {
                    type: "string",
                    description: "Nuevo método de pago.",
                    enum: ["CASH", "BANK_TRANSFER", "DEBIT_CARD", "CREDIT_CARD", "DIGITAL_WALLET", "OTHER"]
                },
                currency: {
                    type: "string",
                    description: "Nuevo código de moneda (3 letras)."
                },
                taxRate: {
                    type: "number",
                    description: "Nuevo porcentaje de impuesto."
                },
                note: {
                    type: "string",
                    description: "Nueva nota."
                },
                isArchived: {
                    type: "boolean",
                    description: "true para archivar, false para desarchivar."
                },
                isDraft: {
                    type: "boolean",
                    description: "true para cambiar a borrador."
                }
            },
            required: ["operationSearch"]
        }
    }
};

export const DELETE_BILLING_OPERATION_TOOL = {
    type: "function" as const,
    function: {
        name: "delete_billing_operation",
        description: "Usa esta función cuando el usuario pida eliminar o borrar una factura u operación de facturación. Identifica la operación por nombre del cliente, número de factura o nota.",
        parameters: {
            type: "object",
            properties: {
                operationSearch: {
                    type: "string",
                    description: "Fragmento del nombre del cliente (partyName), número de factura (invoiceNumber) o nota para identificar la operación a eliminar."
                },
                filterType: {
                    type: "string",
                    description: "Opcional: 'income' o 'expense' para acotar la búsqueda.",
                    enum: ["income", "expense"]
                }
            },
            required: ["operationSearch"]
        }
    }
};

export const MANAGE_BILLING_CATEGORIES_TOOL = {
    type: "function" as const,
    function: {
        name: "manage_billing_categories",
        description: "Usa esta función para listar, agregar, renombrar o eliminar categorías de facturación (ingresos y gastos). Ejemplos: 'dame las categorías', 'agrega la categoría Consultoría a ingresos', 'renombra Marketing a Publicidad', 'elimina la categoría de gasto Varios'.",
        parameters: {
            type: "object",
            properties: {
                action: {
                    type: "string",
                    description: "'list' para ver todas las categorías, 'add' para agregar una, 'rename' para renombrar una, 'remove' para eliminar una.",
                    enum: ["list", "add", "rename", "remove"]
                },
                categoryType: {
                    type: "string",
                    description: "Requerido para add/rename/remove: 'income' o 'expense' para indicar a qué tipo pertenece la categoría.",
                    enum: ["income", "expense"]
                },
                categoryName: {
                    type: "string",
                    description: "Para 'add': nombre de la nueva categoría. Para 'remove': nombre de la categoría a eliminar."
                },
                oldCategoryName: {
                    type: "string",
                    description: "Para 'rename': nombre actual de la categoría."
                },
                newCategoryName: {
                    type: "string",
                    description: "Para 'rename': nuevo nombre para la categoría."
                }
            },
            required: ["action"]
        }
    }
};

export const BILLING_TOOLS = [
    CREATE_BILLING_OPERATION_TOOL,
    QUERY_BILLING_OPERATIONS_TOOL,
    UPDATE_BILLING_OPERATION_TOOL,
    DELETE_BILLING_OPERATION_TOOL,
    MANAGE_BILLING_CATEGORIES_TOOL,
];
