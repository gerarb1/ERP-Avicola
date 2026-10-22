import { sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export async function withUserContext<T>(
  db: NodePgDatabase<typeof schema>,
  userId: string,
  role: string,
  fn: (tx: any) => Promise<T>
): Promise<T> {
  return await db.transaction(async (tx) => {
    await tx.execute(sql`
      SET LOCAL ROLE authenticated;
      SET LOCAL "request.jwt.claim.sub" = ${userId};
      SET LOCAL "request.jwt.claim.role" = ${role};
    `);
    return await fn(tx);
  });
}
