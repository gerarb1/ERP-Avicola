import { z } from 'zod';

export const actualizarPrecioSchema = z.object({
  tallaId: z.string(),
  precioMaple: z.number().positive(),
  precioCaja: z.number().positive().optional()
});

export type ActualizarPrecioInput = z.infer<typeof actualizarPrecioSchema>;
