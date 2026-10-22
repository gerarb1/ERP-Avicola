import { Hono } from 'hono';
import type { AppEnv } from '../../types';
import * as service from './service';

export const biRouter = new Hono<AppEnv>()
  .get('/produccion/tendencia', async (c) => {
    const db = c.var.db;
    const galponId = c.req.query('galpon_id');
    const semanas = parseInt(c.req.query('semanas') || '12', 10);
    const result = await service.getTendenciaProduccion(db, { galponId, semanas });
    return c.json({ success: true, data: result });
  })
  .get('/ventas/por-talla', async (c) => {
    const db = c.var.db;
    const desde = c.req.query('desde');
    const hasta = c.req.query('hasta');
    const result = await service.getVentasPorTalla(db, { desde, hasta });
    return c.json({ success: true, data: result });
  })
  .get('/costos/por-periodo', async (c) => {
    const db = c.var.db;
    const desde = c.req.query('desde');
    const hasta = c.req.query('hasta');
    const result = await service.getCostosPorPeriodo(db, { desde, hasta });
    return c.json({ success: true, data: result });
  })
  .get('/inventario/rotacion', async (c) => {
    const db = c.var.db;
    const result = await service.getInventarioRotacion(db);
    return c.json({ success: true, data: result });
  })
  .get('/resumen-semanal', async (c) => {
    const db = c.var.db;
    const result = await service.getResumenSemanal(db);
    return c.json({ success: true, data: result });
  });
