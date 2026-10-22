import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppEnv } from '../../types';
import * as service from './service';

const updatePrecioSchema = z.object({
  tallaHuevoId: z.string().uuid(),
  precioVentaUnidad: z.string(),
  precioVentaMaple: z.string()
});

export const preciosRouter = new Hono<AppEnv>()
  .get('/vigentes', async (c) => {
    const db = c.var.db;
    const result = await service.getPreciosVigentes(db);
    return c.json({ success: true, data: result });
  })
  .post('/', zValidator('json', updatePrecioSchema), async (c) => {
    const db = c.var.db;
    const userId = c.var.userId;
    const data = c.req.valid('json');
    const result = await service.actualizarPrecio(db, data, userId);
    return c.json({ success: true, data: result }, 201);
  })
  .get('/historial', async (c) => {
    const db = c.var.db;
    const result = await service.getHistorialPrecios(db);
    return c.json({ success: true, data: result });
  });
