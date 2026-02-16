import { z as zod } from 'zod';

export const userNameSchema = zod.object({
  userName: zod.string().min(1, 'User name cannot be empty')
});

export const mfaCodeSchema = zod.object({
  mfaCode: zod.string().min(1, 'Codigo requerido')
});

export const changePasswordSchema = zod.object({
  currentPassword: zod.string().min(1, 'Current password is required'),
  newPassword: zod.string().min(8, 'New password must be at least 8 characters'),
  repeatPassword: zod.string().min(1, 'Repeat password is required')
}).refine((data) => data.newPassword === data.repeatPassword, {
  message: 'Passwords do not match',
  path: ['repeatPassword']
});

export const profilePhotoSchema = zod.object({
  // image: zod.union([
  //   zod.instanceof(File),
  //   zod.string().transform((value) => value === '' ? undefined : value)
  // ])
  // .optional()
  image: zod.any() // backend validation (size and type)
})

export const uploadImageSchema = zod.object({
  image: zod.string().min(1, 'Image is required')
})