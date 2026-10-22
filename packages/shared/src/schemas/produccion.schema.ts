import { z } from 'zod';

export const createProduccionDiariaSchema = z.object({
  loteId: z.string().uuid(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe ser YYYY-MM-DD'),
  maplesRecolectados: z.number().int().min(0),
  huevosSueltos: z.number().int().min(0).default(0),
  kgAlimento: z.number().positive()
});

export const createMortalidadSchema = z.object({
  loteId: z.string().uuid(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe ser YYYY-MM-DD'),
  cantidad: z.number().int().min(1),
  causa: z.string().max(200).optional(),
  notas: z.string().max(500).optional()
});

export type CreateProduccionDiariaInput = z.infer<typeof createProduccionDiariaSchema>;
export type CreateMortalidadInput = z.infer<typeof createMortalidadSchema>;
