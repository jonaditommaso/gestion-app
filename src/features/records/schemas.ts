import { z as zod } from 'zod';

export const dataRecordSchema = zod.object({
  headers: zod.array(zod.string().trim().min(1, 'Header cannot be empty')), // Array de strings para headers
  rows: zod.array(zod.record(zod.any())), // Array de objetos con estructura libre
});

export const recordsTableSchema = zod.object({
  tableName: zod.string().min(1, 'Table name cannot be empty')
});