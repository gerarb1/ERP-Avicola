import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppEnv } from '../../types';
import { requireRole } from '../../middleware/rbac';
import * as service from './service';

const movimientoSchema = z.object({
  tipo: z.enum(['INGRESO', 'EGRESO']),
  categoriaId: z.string().uuid().optional(),
  monto: z.string(),
  fecha: z.string(),
  descripcion: z.string()
});

const arqueoSchema = z.object({
  fechaInicio: z.string(),
  fechaFin: z.string(),
  saldoReal: z.string(),
  observaciones: z.string().optional()
});

export const finanzasRouter = new Hono<AppEnv>()
  .post('/movimiento', requireRole('administrador'), zValidator('json', movimientoSchema), async (c) => {
    const db = c.var.db;
    const userId = c.var.userId;
    const data = c.req.valid('json');
    const result = await service.createMovimiento(db, data, userId);
    return c.json({ success: true, data: result }, 201);
  })
  .get('/movimientos', async (c) => {
    const db = c.var.db;
    const result = await service.getMovimientos(db);
    return c.json({ success: true, data: result });
  })
  .post('/arqueo', requireRole('administrador'), zValidator('json', arqueoSchema), async (c) => {
    const db = c.var.db;
    const userId = c.var.userId;
    const data = c.req.valid('json');
    const result = await service.createArqueo(db, data, userId);
    return c.json({ success: true, data: result }, 201);
  })
  .get('/arqueos', async (c) => {
    const db = c.var.db;
    const result = await service.getArqueos(db);
    return c.json({ success: true, data: result });
  });
