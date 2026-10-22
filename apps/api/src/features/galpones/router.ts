import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { AppEnv } from '../../types';
import * as service from './service';

export const galponesRouter = new Hono<AppEnv>()
  .get('/', async (c) => {
    const db = c.var.db;
    const result = await service.getGalpones(db);
    return c.json({ success: true, data: result });
  })
  .get('/:id', async (c) => {
    const db = c.var.db;
    const id = c.req.param('id');
    const result = await service.getGalponById(db, id);
    if (!result) return c.json({ success: false, error: 'Not found' }, 404);
    return c.json({ success: true, data: result });
  })
  .get('/:id/lotes', async (c) => {
    const db = c.var.db;
    const id = c.req.param('id');
    const result = await service.getLotesByGalpon(db, id);
    return c.json({ success: true, data: result });
  });
