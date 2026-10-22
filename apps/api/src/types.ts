import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@erp-avicola/db';

export type Bindings = {
  HYPERDRIVE: { connectionString: string };
  APP_ENV: string;
  JWT_SECRET?: string;
};

export type Variables = {
  db: NodePgDatabase<typeof schema>;
  userId: string;
  userRole: string;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
