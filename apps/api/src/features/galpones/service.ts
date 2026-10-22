import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@erp-avicola/db';
import { eq } from 'drizzle-orm';

export async function getGalpones(db: NodePgDatabase<typeof schema>) {
  const galpones = await db.select().from(schema.galpones).where(eq(schema.galpones.activo, true));
  const lotes = await db.select().from(schema.lotesAves).where(eq(schema.lotesAves.activo, true));
  
  return galpones.map(g => ({
    ...g,
    lotes: lotes.filter(l => l.galponId === g.id)
  }));
}

export async function getGalponById(db: NodePgDatabase<typeof schema>, id: string) {
  const [galpon] = await db.select().from(schema.galpones).where(eq(schema.galpones.id, id));
  if (!galpon) return null;

  const lotes = await db.select().from(schema.lotesAves).where(eq(schema.lotesAves.galponId, id));
  return { ...galpon, lotes };
}

export async function getLotesByGalpon(db: NodePgDatabase<typeof schema>, galponId: string) {
  return await db.select().from(schema.lotesAves).where(eq(schema.lotesAves.galponId, galponId));
}
