import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@erp-avicola/db';
import { isNull, eq, and, desc } from 'drizzle-orm';

export async function getPreciosVigentes(db: NodePgDatabase<typeof schema>) {
  return await db.select({
    id: schema.preciosTalla.id,
    tallaId: schema.preciosTalla.tallaId,
    precioMaple: schema.preciosTalla.precioMaple,
    precioCaja: schema.preciosTalla.precioCaja,
    vigenteDesde: schema.preciosTalla.vigenteDesde,
    nombreTalla: schema.tallasHuevo.nombre,
  })
  .from(schema.preciosTalla)
  .leftJoin(schema.tallasHuevo, eq(schema.preciosTalla.tallaId, schema.tallasHuevo.id))
  .where(and(eq(schema.preciosTalla.activo, true), isNull(schema.preciosTalla.vigenteHasta)));
}

export async function actualizarPrecio(db: NodePgDatabase<typeof schema>, data: any, userId: string) {
  return await db.transaction(async (tx) => {
    const hoy = new Date().toISOString().split('T')[0];

    // Desactivar precio anterior vigente
    await tx.update(schema.preciosTalla)
      .set({
        vigenteHasta: hoy,
        activo: false
      })
      .where(and(
        eq(schema.preciosTalla.tallaId, data.tallaId),
        isNull(schema.preciosTalla.vigenteHasta)
      ));

    // Insertar nuevo precio de mercado
    const precioMapleNum = parseFloat(data.precioMaple);
    const precioCajaNum = data.precioCaja ? parseFloat(data.precioCaja) : precioMapleNum * 12;

    const [nuevo] = await tx.insert(schema.preciosTalla).values({
      tallaId: data.tallaId,
      precioMaple: precioMapleNum.toFixed(2),
      precioCaja: precioCajaNum.toFixed(2),
      vigenteDesde: hoy,
      activo: true,
    }).returning();

    return nuevo;
  });
}

export async function getHistorialPrecios(db: NodePgDatabase<typeof schema>) {
  return await db.select()
    .from(schema.preciosTalla)
    .orderBy(desc(schema.preciosTalla.createdAt))
    .limit(50);
}
