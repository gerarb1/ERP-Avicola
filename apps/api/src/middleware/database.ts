import { createMiddleware } from 'hono/factory';
import { Client } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@erp-avicola/db';
import type { AppEnv } from '../types';

export const databaseMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const client = new Client({
    connectionString: c.env.HYPERDRIVE.connectionString,
  });

  await client.connect();
  const db = drizzle(client, { schema });

  c.set('db', db);

  await next();

  c.executionCtx.waitUntil(client.end());
});
