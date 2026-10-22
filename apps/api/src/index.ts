import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { AppEnv } from './types';
import { databaseMiddleware } from './middleware/database';
import { authMiddleware } from './middleware/auth';
import { idempotencyMiddleware } from './middleware/idempotency';
import { errorHandler } from './middleware/error-handler';

// Feature routers
import { galponesRouter } from './features/galpones/router';
import { produccionRouter } from './features/produccion/router';
import { inventarioRouter } from './features/inventario/router';
import { ventasRouter } from './features/ventas/router';
import { preciosRouter } from './features/precios/router';
import { finanzasRouter } from './features/finanzas/router';
import { biRouter } from './features/bi/router';

const app = new Hono<AppEnv>()
  .use('*', logger())
  .use('*', cors())
  .onError(errorHandler)
  .use('/api/*', databaseMiddleware)
  .use('/api/*', authMiddleware)
  .use('/api/*', idempotencyMiddleware);

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Mount feature routers
const routes = app
  .route('/api/galpones', galponesRouter)
  .route('/api/produccion', produccionRouter)
  .route('/api/inventario', inventarioRouter)
  .route('/api/ventas', ventasRouter)
  .route('/api/precios', preciosRouter)
  .route('/api/finanzas', finanzasRouter)
  .route('/api/bi', biRouter);

export type ApiRoutes = typeof routes;
export default app;
