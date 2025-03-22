import { z as zod } from 'zod'

export const billingOperationSchema = zod.object({
    type: zod.enum(['income', 'expense'], {required_error: 'Required'}),
    date: zod.coerce.date(),
    account: zod.string(),
    import: zod.number({ required_error: "Import is required"}).positive(),
    note: zod.string().optional(),
    category: zod.string().min(1) || zod.object({
        subcategory: zod.string().min(1)
    }),
    // agregar metodo de pago (tarjeta de cred/deb, transferencia, etc), invoice (osea id de la factura, como INV006) y estado (pagado, pendiente, etc)
})

export const billingCategoriesSchema = zod.object({
    incomeCategories: zod.array(zod.string().min(1, 'Category is required')),
    expenseCategories: zod.array(zod.string().min(1, 'Category is required')),
})