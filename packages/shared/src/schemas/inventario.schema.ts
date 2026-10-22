import { z } from 'zod';

export const recepcionInventarioSchema = z.object({
  tallaId: z.string(),
  cantidadMaples: z.number().int().min(0),
  cantidadSueltos: z.number().int().min(0).default(0),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe ser YYYY-MM-DD')
});

export const registroMermaSchema = z.object({
  tallaId: z.string(),
  cantidadMaples: z.number().int().min(0),
  cantidadSueltos: z.number().int().min(0),
  motivo: z.string().max(300)
});

export type RecepcionInventarioInput = z.infer<typeof recepcionInventarioSchema>;
export type RegistroMermaInput = z.infer<typeof registroMermaSchema>;
