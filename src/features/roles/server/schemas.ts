import { z as zod } from 'zod';

// Creacion de rol con permisos en la bbdd
export const rolePermissionsSchema = zod.object({
    role: zod.string(),
    permissions: zod.array(zod.string()),
});

// Actualizacion de rol con permisos en la bbdd
export const rolePermissionsUpdateSchema = zod.object({
    permissions: zod.array(zod.string()),
});