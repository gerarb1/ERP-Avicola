import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppEnv } from '../../types';
import * as service from './service';

const createClienteSchema = z.object({
  nombre: z.string().min(1),
  tipoDocumento: z.string(),
  numeroDocumento: z.string(),
  telefono: z.string().optional(),
  direccion: z.string().optional()
});

const createRemisionSchema = z.object({
  clienteId: z.string().uuid(),
  condicionPago: z.enum(['CONTADO', 'CREDITO']),
  detalles: z.array(z.object({
    tallaId: z.string().uuid(),
    cantidadUnidades: z.number().int().min(1),
    precioUnitario: z.string()
  })).min(1)
});

export const ventasRouter = new Hono<AppEnv>()
  .get('/clientes', async (c) => {
    const db = c.var.db;
    const result = await service.getClientes(db);
    return c.json({ success: true, data: result });
  })
  .post('/clientes', zValidator('json', createClienteSchema), async (c) => {
    const db = c.var.db;
    const data = c.req.valid('json');
    const result = await service.createCliente(db, data);
    return c.json({ success: true, data: result }, 201);
  })
  .get('/remisiones', async (c) => {
    const db = c.var.db;
    const result = await service.getRemisiones(db);
    return c.json({ success: true, data: result });
  })
  .post('/remisiones', zValidator('json', createRemisionSchema), async (c) => {
    const db = c.var.db;
    const userId = c.var.userId;
    const data = c.req.valid('json');
    const result = await service.createRemision(db, data, userId);
    return c.json({ success: true, data: result }, 201);
  });
