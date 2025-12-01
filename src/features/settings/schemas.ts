import { z as zod } from 'zod';

export const userNameSchema = zod.object({
  userName: zod.string().min(1, 'User name cannot be empty')
});

export const mfaCodeSchema = zod.object({
  mfaCode: zod.string().min(1, 'Codigo requerido')
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