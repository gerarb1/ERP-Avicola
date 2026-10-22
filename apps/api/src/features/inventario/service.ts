import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@erp-avicola/db';
import { eq, desc } from 'drizzle-orm';
import { AppError } from '../../middleware/error-handler';

export async function getStock(db: NodePgDatabase<typeof schema>) {
  return await db.select({
    id: schema.inventarioStock.id,
    tallaId: schema.inventarioStock.tallaId,
    maplesDisponibles: schema.inventarioStock.maplesDisponibles,
    huevosSueltos: schema.inventarioStock.huevosSueltos,
    updatedAt: schema.inventarioStock.updatedAt,
    nombreTalla: schema.tallasHuevo.nombre,
    pesoMinG: schema.tallasHuevo.pesoMinG,
    pesoMaxG: schema.tallasHuevo.pesoMaxG,
  })
  .from(schema.inventarioStock)
  .leftJoin(schema.tallasHuevo, eq(schema.inventarioStock.tallaId, schema.tallasHuevo.id));
}

export async function recibirProduccion(db: NodePgDatabase<typeof schema>, data: any, userId: string) {
  return await db.transaction(async (tx) => {
    let [stock] = await tx.select().from(schema.inventarioStock).where(eq(schema.inventarioStock.tallaId, data.tallaId));
    
    if (!stock) {
      [stock] = await tx.insert(schema.inventarioStock).values({
        tallaId: data.tallaId,
        maplesDisponibles: data.cantidadMaples || 0,
        huevosSueltos: data.cantidadSueltos || 0,
      }).returning();
    } else {
      [stock] = await tx.update(schema.inventarioStock)
        .set({
          maplesDisponibles: stock.maplesDisponibles + (data.cantidadMaples || 0),
          huevosSueltos: stock.huevosSueltos + (data.cantidadSueltos || 0),
          updatedAt: new Date()
        })
        .where(eq(schema.inventarioStock.tallaId, data.tallaId))
        .returning();
    }

    const [movimiento] = await tx.insert(schema.movimientosInventario).values({
      inventarioStockId: stock.id,
      tipo: 'ENTRADA',
      cantidadMaples: data.cantidadMaples || 0,
      cantidadSueltos: data.cantidadSueltos || 0,
      motivo: data.motivo || 'Recepción de producción clasificada',
      fecha: data.fecha || new Date().toISOString().split('T')[0],
      registradoPor: userId,
    }).returning();

    return movimiento;
  });
}

export async function registrarMerma(db: NodePgDatabase<typeof schema>, data: any, userId: string) {
  return await db.transaction(async (tx) => {
    const [stock] = await tx.select().from(schema.inventarioStock).where(eq(schema.inventarioStock.tallaId, data.tallaId));
    if (!stock || stock.maplesDisponibles < (data.cantidadMaples || 0)) {
      throw new AppError(400, 'Stock insuficiente para registrar merma');
    }

    await tx.update(schema.inventarioStock)
      .set({
        maplesDisponibles: stock.maplesDisponibles - (data.cantidadMaples || 0),
        huevosSueltos: Math.max(0, stock.huevosSueltos - (data.cantidadSueltos || 0)),
        updatedAt: new Date()
      })
      .where(eq(schema.inventarioStock.tallaId, data.tallaId));

    const [movimiento] = await tx.insert(schema.movimientosInventario).values({
      inventarioStockId: stock.id,
      tipo: 'MERMA',
      cantidadMaples: data.cantidadMaples || 0,
      cantidadSueltos: data.cantidadSueltos || 0,
      motivo: data.motivo || 'Merma / Rotura',
      fecha: data.fecha || new Date().toISOString().split('T')[0],
      registradoPor: userId,
    }).returning();

    return movimiento;
  });
}

export async function getMovimientos(db: NodePgDatabase<typeof schema>, filters: any) {
  return await db.select()
    .from(schema.movimientosInventario)
    .orderBy(desc(schema.movimientosInventario.createdAt))
    .limit(100);
}
