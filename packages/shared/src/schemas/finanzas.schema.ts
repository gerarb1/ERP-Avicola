import { z } from 'zod';
import { CATEGORIAS_EGRESO } from '../constants/categorias-egreso';

const categorias = Object.values(CATEGORIAS_EGRESO) as [string, ...string[]];

export const createMovimientoCajaSchema = z.object({
  tipo: z.enum(['INGRESO', 'EGRESO']),
  categoria: z.enum(categorias),
  monto: z.number().positive(),
  descripcion: z.string().max(300),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe ser YYYY-MM-DD')
});

export const createArqueoSchema = z.object({
  fechaInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe ser YYYY-MM-DD'),
  fechaFin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe ser YYYY-MM-DD'),
  saldoAnterior: z.number(),
  saldoReal: z.number(),
  notas: z.string().max(500).optional()
});

export type CreateMovimientoCajaInput = z.infer<typeof createMovimientoCajaSchema>;
export type CreateArqueoInput = z.infer<typeof createArqueoSchema>;
