import { z as zod } from 'zod'

const billingOperationBaseSchema = zod.object({
    type: zod.enum(['income', 'expense'], { required_error: 'Required' }),
    date: zod.coerce.date(),
    account: zod.string().trim().optional(),
    invoiceNumber: zod.string().trim().min(1).max(40).optional(),
    partyName: zod.string().trim().min(1).max(120).optional(),
    status: zod.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
    dueDate: zod.coerce.date().optional(),
    paymentMethod: zod.enum(['CASH', 'BANK_TRANSFER', 'DEBIT_CARD', 'CREDIT_CARD', 'DIGITAL_WALLET', 'OTHER']).optional(),
    currency: zod.string().trim().toUpperCase().regex(/^[A-Z]{3}$/).optional(),
    taxRate: zod.number().min(0).max(100).optional(),
    taxAmount: zod.number().min(0).optional(),
    isRecurring: zod.boolean().optional(),
    recurrenceRule: zod.enum(['WEEKLY', 'MONTHLY']).optional(),
    nextOccurrenceDate: zod.coerce.date().optional(),
    archived: zod.boolean().optional(),
    import: zod.number({ required_error: "Import is required" }).positive(),
    note: zod.string().optional(),
    category: zod.string().min(1, 'Category is required'),
})

export const billingOperationSchema = billingOperationBaseSchema.superRefine((values, ctx) => {
    if (values.dueDate && values.dueDate < values.date) {
        ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: 'Due date must be after operation date',
            path: ['dueDate'],
        });
    }

    if (values.taxAmount !== undefined && values.taxAmount > values.import) {
        ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: 'Tax amount cannot be greater than amount',
            path: ['taxAmount'],
        });
    }

    if (values.isRecurring && !values.recurrenceRule) {
        ctx.addIssue({
            code: zod.ZodIssueCode.custom,
            message: 'Recurrence rule is required',
            path: ['recurrenceRule'],
        });
    }
})

export const billingCategoriesSchema = zod.object({
    incomeCategories: zod.array(zod.string().trim().min(1, 'Category is required')),
    expenseCategories: zod.array(zod.string().trim().min(1, 'Category is required')),
}).superRefine((values, ctx) => {
    const validateDuplicates = (categories: string[], path: 'incomeCategories' | 'expenseCategories') => {
        const seen = new Set<string>();

        categories.forEach((category, index) => {
            const normalizedCategory = category.trim().toLowerCase();

            if (seen.has(normalizedCategory)) {
                ctx.addIssue({
                    code: zod.ZodIssueCode.custom,
                    message: 'Duplicate category',
                    path: [path, index],
                });
            }

            seen.add(normalizedCategory);
        });
    };

    validateDuplicates(values.incomeCategories, 'incomeCategories');
    validateDuplicates(values.expenseCategories, 'expenseCategories');
})

export const billingOperationUpdateSchema = billingOperationBaseSchema.partial();