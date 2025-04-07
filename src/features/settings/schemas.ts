import { z as zod } from 'zod';

export const userNameSchema = zod.object({
  userName: zod.string().min(1, 'User name cannot be empty')
});

export const mfaCodeSchema = zod.object({
  mfaCode: zod.string().min(1, 'Codigo requerido')
});