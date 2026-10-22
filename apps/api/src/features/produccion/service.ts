import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@erp-avicola/db';
import { eq, desc, and } from 'drizzle-orm';
import { AppError } from '../../middleware/error-handler';
import { calcularPorcentajePostura, calcularFCR, UNIDADES } from '@erp-avicola/shared';

export async function registrarProduccion(db: NodePgDatabase<typeof schema>, data: any, userId: string) {
  const [lote] = await db.select().from(schema.lotesAves).where(eq(schema.lotesAves.id, data.loteId));
  if (!lote) throw new AppError(404, 'Lote no encontrado');

  const maples = data.maplesRecolectados || 0;
  const sueltos = data.huevosSueltos || 0;
  const totalHuevos = (maples * UNIDADES.HUEVOS_POR_MAPLE) + sueltos;
  const pctPostura = calcularPorcentajePostura(totalHuevos, lote.avesActuales);
  const fcr = calcularFCR(data.kgAlimento, maples);

  const [inserted] = await db.insert(schema.produccionDiaria).values({
    loteId: data.loteId,
    fecha: data.fecha,
    maplesRecolectados: maples,
    huevosSueltos: sueltos,
    totalHuevos,
    kgAlimento: data.kgAlimento.toString(),
    pctPostura: pctPostura.toString(),
    fcr: fcr.toString(),
    registradoPor: userId,
  }).returning();

  return inserted;
}

export async function registrarMortalidad(db: NodePgDatabase<typeof schema>, data: any, userId: string) {
  return await db.transaction(async (tx) => {
    const [lote] = await tx.select().from(schema.lotesAves).where(eq(schema.lotesAves.id, data.loteId));
    if (!lote) throw new AppError(404, 'Lote no encontrado');
    if (lote.avesActuales < data.cantidad) throw new AppError(400, 'Mortalidad excede aves vivas actuales');

    const [inserted] = await tx.insert(schema.mortalidadDiaria).values({
      loteId: data.loteId,
      fecha: data.fecha,
      cantidad: data.cantidad,
      causa: data.causa,
      notas: data.notas,
      registradoPor: userId,
    }).returning();

    await tx.update(schema.lotesAves)
      .set({ avesActuales: lote.avesActuales - data.cantidad })
      .where(eq(schema.lotesAves.id, data.loteId));

    return inserted;
  });
}

export async function getHistorial(db: NodePgDatabase<typeof schema>, filters: { galponId?: string, desde?: string, hasta?: string }) {
  return await db.select()
    .from(schema.produccionDiaria)
    .orderBy(desc(schema.produccionDiaria.fecha))
    .limit(100);
}
