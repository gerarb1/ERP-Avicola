import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@erp-avicola/db';
import { sql, and, gte, lte, desc } from 'drizzle-orm';
import { AppError } from '../../middleware/error-handler';

export async function createMovimiento(db: NodePgDatabase<typeof schema>, data: any, userId: string) {
  const [mov] = await db.insert(schema.movimientosCaja).values({
    tipo: data.tipo,
    categoria: data.categoria,
    monto: parseFloat(data.monto).toFixed(2),
    descripcion: data.descripcion,
    fecha: data.fecha || new Date().toISOString().split('T')[0],
    registradoPor: userId,
  }).returning();
  return mov;
}

export async function getMovimientos(db: NodePgDatabase<typeof schema>) {
  return await db.select()
    .from(schema.movimientosCaja)
    .orderBy(desc(schema.movimientosCaja.createdAt))
    .limit(100);
}

export async function createArqueo(db: NodePgDatabase<typeof schema>, data: any, userId: string) {
  return await db.transaction(async (tx) => {
    // 1. Calcular ingresos y egresos en el rango de fechas
    const movimientos = await tx.select()
      .from(schema.movimientosCaja)
      .where(and(
        gte(schema.movimientosCaja.fecha, data.fechaInicio),
        lte(schema.movimientosCaja.fecha, data.fechaFin)
      ));

    let totalIngresos = 0;
    let totalEgresos = 0;
    for (const m of movimientos) {
      if (m.tipo === 'INGRESO') totalIngresos += parseFloat(m.monto);
      if (m.tipo === 'EGRESO') totalEgresos += parseFloat(m.monto);
    }

    const saldoAnteriorNum = parseFloat(data.saldoAnterior || '0');
    const saldoEsperado = saldoAnteriorNum + totalIngresos - totalEgresos;
    const saldoRealNum = parseFloat(data.saldoReal);
    const diferencia = saldoRealNum - saldoEsperado;

    const [arqueo] = await tx.insert(schema.arqueosSemanales).values({
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      saldoAnterior: saldoAnteriorNum.toFixed(2),
      totalIngresos: totalIngresos.toFixed(2),
      totalEgresos: totalEgresos.toFixed(2),
      saldoEsperado: saldoEsperado.toFixed(2),
      saldoReal: saldoRealNum.toFixed(2),
      diferencia: diferencia.toFixed(2),
      conciliado: diferencia === 0,
      notas: data.notas || (diferencia === 0 ? 'Arqueo dominical cuadrado' : `Diferencia de $${diferencia.toFixed(2)}`),
      registradoPor: userId,
    }).returning();

    return arqueo;
  });
}

export async function getArqueos(db: NodePgDatabase<typeof schema>) {
  return await db.select()
    .from(schema.arqueosSemanales)
    .orderBy(desc(schema.arqueosSemanales.createdAt));
}
