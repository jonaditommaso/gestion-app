import { z as zod } from 'zod';

// Creacion de tabla
export const recordsTableNameSchema = zod.object({
  tableName: zod.string().min(1, 'Table name cannot be empty')
});

// Actualizacion de headers
export const recordsTableSchema = zod.object({
  headers: zod.array(zod.string().trim().min(1, 'Header cannot be empty')), // Array de strings para headers
});

// Creacion de datos
export const recordSchema = zod.object({
  tableId: zod.string(),
  data: zod.array(zod.record(zod.any())), // Array de objetos con estructura libre
});

// Actualizacion de datos
export const recordUpdateSchema = zod.object({
  recordId: zod.string(),
  tableId: zod.string(),
  data: zod.array(zod.record(zod.any())), // Array de objetos con estructura libre
});


export const fileSchema = zod.object({
  file: zod.any()
})