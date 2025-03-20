import { z as zod } from 'zod'

export const billingOperationSchema = zod.object({
    type: zod.string(),
    date: zod.coerce.date(),
    account: zod.string(),
    import: zod.string(),
    note: zod.string().optional(),
    category: zod.string() || zod.object({
        subcategory: zod.string()
    }),
    // agregar metodo de pago (tarjeta de cred/deb, transferencia, etc), invoice (osea id de la factura, como INV006) y estado (pagado, pendiente, etc)
})