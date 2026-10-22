import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppEnv } from '../../types';
import { requireRole } from '../../middleware/rbac';
import * as service from './service';

// Reusing some schema directly for simplicity, ideally import from @erp-avicola/shared
const createProduccionDiariaSchema = z.object({
  loteId: z.string().uuid(),
  fecha: z.string(),
  huevosSanos: z.number().int().min(0),
  huevosRotos: z.number().int().min(0),
  huevosSucios: z.number().int().min(0),
  alimentoConsumidoKg: z.number().min(0).optional(),
  aguaConsumidaL: z.number().min(0).optional(),
  observaciones: z.string().optional()
});

const createMortalidadSchema = z.object({
  loteId: z.string().uuid(),
  fecha: z.string(),
  cantidad: z.number().int().min(1),
  causaId: z.string().uuid().optional(),
  observaciones: z.string().optional()
});

export const produccionRouter = new Hono<AppEnv>()
  .post('/diaria', requireRole('encargado_galpon'), zValidator('json', createProduccionDiariaSchema), async (c) => {
    const db = c.var.db;
    const userId = c.var.userId;
    const data = c.req.valid('json');
    const result = await service.registrarProduccion(db, data, userId);
    return c.json({ success: true, data: result }, 201);
  })
  .post('/mortalidad', requireRole('encargado_galpon'), zValidator('json', createMortalidadSchema), async (c) => {
    const db = c.var.db;
    const userId = c.var.userId;
    const data = c.req.valid('json');
    const result = await service.registrarMortalidad(db, data, userId);
    return c.json({ success: true, data: result }, 201);
  })
  .get('/historial', async (c) => {
    const db = c.var.db;
    const galponId = c.req.query('galponId');
    const desde = c.req.query('desde');
    const hasta = c.req.query('hasta');
    const result = await service.getHistorial(db, { galponId, desde, hasta });
    return c.json({ success: true, data: result });
  });
