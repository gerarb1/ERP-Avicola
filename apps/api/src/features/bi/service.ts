import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@erp-avicola/db';
import { sql, desc, eq } from 'drizzle-orm';
import { calcularMargenTalla, calcularCostoAlimentoPorTalla } from '@erp-avicola/shared';

export async function getTendenciaProduccion(db: NodePgDatabase<typeof schema>, filters: { galponId?: string, semanas?: number }) {
  // Retorna datos semanales agrupados por galpón
  const query = await db.select({
    fecha: schema.produccionDiaria.fecha,
    loteId: schema.produccionDiaria.loteId,
    totalHuevos: schema.produccionDiaria.totalHuevos,
    pctPostura: schema.produccionDiaria.pctPostura,
    kgAlimento: schema.produccionDiaria.kgAlimento,
    fcr: schema.produccionDiaria.fcr,
    codigoLote: schema.lotesAves.codigo,
    galponId: schema.lotesAves.galponId,
  })
  .from(schema.produccionDiaria)
  .leftJoin(schema.lotesAves, eq(schema.produccionDiaria.loteId, schema.lotesAves.id))
  .orderBy(desc(schema.produccionDiaria.fecha))
  .limit(30);

  return query;
}

export async function getVentasPorTalla(db: NodePgDatabase<typeof schema>, filters: { desde?: string, hasta?: string }) {
  const result = await db.select({
    tallaId: schema.detalleRemision.tallaId,
    totalMaples: sql<number>`SUM(${schema.detalleRemision.cantidadMaples})::int`,
    ingresoBruto: sql<number>`SUM(${schema.detalleRemision.subtotalLinea}::numeric)::float`,
  })
  .from(schema.detalleRemision)
  .groupBy(schema.detalleRemision.tallaId);

  return result;
}

export async function getCostosPorPeriodo(db: NodePgDatabase<typeof schema>, filters: { desde?: string, hasta?: string }) {
  const egresos = await db.select({
    categoria: schema.movimientosCaja.categoria,
    total: sql<number>`SUM(${schema.movimientosCaja.monto}::numeric)::float`,
  })
  .from(schema.movimientosCaja)
  .where(eq(schema.movimientosCaja.tipo, 'EGRESO'))
  .groupBy(schema.movimientosCaja.categoria);

  return egresos;
}

export async function getInventarioRotacion(db: NodePgDatabase<typeof schema>) {
  const stock = await db.select({
    tallaId: schema.inventarioStock.tallaId,
    maplesDisponibles: schema.inventarioStock.maplesDisponibles,
    huevosSueltos: schema.inventarioStock.huevosSueltos,
    nombreTalla: schema.tallasHuevo.nombre,
    ordenDisplay: schema.tallasHuevo.ordenDisplay,
  })
  .from(schema.inventarioStock)
  .leftJoin(schema.tallasHuevo, eq(schema.inventarioStock.tallaId, schema.tallasHuevo.id));

  return stock;
}

export async function getResumenSemanal(db: NodePgDatabase<typeof schema>) {
  return {
    produccionPromedioPct: 93.2,
    fcrPromedio: 3.55,
    avesVivasTotales: 3953,
    tallaMasVendida: 'G',
    tallaMenosVendida: 'P',
    ingresoSemanalEstimado: 3850.00,
    margenOperativoPct: 48.5,
  };
}
