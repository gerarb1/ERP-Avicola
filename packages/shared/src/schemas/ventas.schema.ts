import { z } from 'zod';

export const createClienteSchema = z.object({
  nombre: z.string().min(2),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  tipo: z.enum(['MAYORISTA', 'MINORISTA'])
});

export const createNotaRemisionSchema = z.object({
  clienteId: z.string().uuid(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe ser YYYY-MM-DD'),
  tipoPago: z.enum(['CONTADO', 'CREDITO']),
  descuento: z.number().min(0).default(0),
  items: z.array(z.object({
    tallaId: z.string(),
    cantidadMaples: z.number().int().min(0),
    cantidadSueltos: z.number().int().min(0).default(0),
    precioUnitarioMaple: z.number().positive()
  })).min(1)
});

export const registroPagoSchema = z.object({
  notaId: z.string().uuid(),
  clienteId: z.string().uuid(),
  monto: z.number().positive(),
  metodoPago: z.string().optional(),
  notas: z.string().max(300).optional()
});

export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type CreateNotaRemisionInput = z.infer<typeof createNotaRemisionSchema>;
export type RegistroPagoInput = z.infer<typeof registroPagoSchema>;
