import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppEnv } from '../../types';
import { requireRole } from '../../middleware/rbac';
import * as service from './service';

const recepcionSchema = z.object({
  tallaId: z.string().uuid(),
  cantidadUnidades: z.number().int().min(1),
  referencia: z.string().optional()
});

export const inventarioRouter = new Hono<AppEnv>()
  .get('/stock', async (c) => {
    const db = c.var.db;
    const result = await service.getStock(db);
    return c.json({ success: true, data: result });
  })
  .post('/recepcion', requireRole('encargado_almacen'), zValidator('json', recepcionSchema), async (c) => {
    const db = c.var.db;
    const userId = c.var.userId;
    const data = c.req.valid('json');
    const result = await service.recibirProduccion(db, data, userId);
    return c.json({ success: true, data: result }, 201);
  })
  .post('/merma', requireRole('encargado_almacen'), zValidator('json', recepcionSchema), async (c) => {
    const db = c.var.db;
    const userId = c.var.userId;
    const data = c.req.valid('json');
    const result = await service.registrarMerma(db, data, userId);
    return c.json({ success: true, data: result }, 201);
  })
  .get('/movimientos', async (c) => {
    const db = c.var.db;
    const result = await service.getMovimientos(db, {});
    return c.json({ success: true, data: result });
  });
