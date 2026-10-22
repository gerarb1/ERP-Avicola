import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@erp-avicola/db';
import { eq, desc, sql } from 'drizzle-orm';
import { AppError } from '../../middleware/error-handler';

export async function getClientes(db: NodePgDatabase<typeof schema>) {
  return await db.select().from(schema.clientes).where(eq(schema.clientes.activo, true));
}

export async function createCliente(db: NodePgDatabase<typeof schema>, data: any) {
  const [cliente] = await db.insert(schema.clientes).values(data).returning();
  return cliente;
}

export async function getRemisiones(db: NodePgDatabase<typeof schema>) {
  return await db.select()
    .from(schema.notasRemision)
    .orderBy(desc(schema.notasRemision.createdAt))
    .limit(50);
}

export async function createRemision(db: NodePgDatabase<typeof schema>, data: any, userId: string) {
  return await db.transaction(async (tx) => {
    const items = data.items || data.detalles || [];
    if (items.length === 0) {
      throw new AppError(400, 'La nota de remisión debe contener al menos una talla');
    }

    // 1. Validar disponibilidad de stock y calcular total
    let subtotalTotal = 0;
    for (const it of items) {
      const [stock] = await tx.select().from(schema.inventarioStock).where(eq(schema.inventarioStock.tallaId, it.tallaId));
      if (!stock || stock.maplesDisponibles < it.cantidadMaples) {
        throw new AppError(400, `Stock insuficiente para la talla ${it.tallaId}. Disponible: ${stock?.maplesDisponibles || 0} maples`);
      }
      const lineaSubtotal = (it.cantidadMaples * parseFloat(it.precioUnitarioMaple || it.precioUnitario));
      subtotalTotal += lineaSubtotal;
    }

    const descuento = parseFloat(data.descuento || '0');
    const total = Math.max(0, subtotalTotal - descuento);

    // 2. Crear cabecera de Nota de Remisión
    const [nota] = await tx.insert(schema.notasRemision).values({
      clienteId: data.clienteId,
      fecha: data.fecha || new Date().toISOString().split('T')[0],
      tipoPago: data.tipoPago || 'CONTADO',
      subtotal: subtotalTotal.toFixed(2),
      descuento: descuento.toFixed(2),
      total: total.toFixed(2),
      estado: data.tipoPago === 'CONTADO' ? 'PAGADA' : 'PENDIENTE',
      registradoPor: userId,
    }).returning();

    // 3. Crear líneas de detalle y descontar stock
    for (const it of items) {
      const precioUnit = parseFloat(it.precioUnitarioMaple || it.precioUnitario);
      const subtotalLinea = (it.cantidadMaples * precioUnit);

      await tx.insert(schema.detalleRemision).values({
        notaId: nota.id,
        tallaId: it.tallaId,
        cantidadMaples: it.cantidadMaples,
        cantidadSueltos: it.cantidadSueltos || 0,
        precioUnitarioMaple: precioUnit.toFixed(2),
        subtotalLinea: subtotalLinea.toFixed(2),
      });

      // Descontar inventario físico
      const [stockActual] = await tx.select().from(schema.inventarioStock).where(eq(schema.inventarioStock.tallaId, it.tallaId));
      await tx.update(schema.inventarioStock)
        .set({
          maplesDisponibles: stockActual.maplesDisponibles - it.cantidadMaples,
          updatedAt: new Date()
        })
        .where(eq(schema.inventarioStock.tallaId, it.tallaId));

      // Registrar movimiento de almacén
      await tx.insert(schema.movimientosInventario).values({
        inventarioStockId: stockActual.id,
        tipo: 'SALIDA',
        cantidadMaples: it.cantidadMaples,
        cantidadSueltos: it.cantidadSueltos || 0,
        motivo: `Despacho Remisión #${nota.numeroNota}`,
        fecha: data.fecha || new Date().toISOString().split('T')[0],
        referenciaId: nota.id,
        referenciaTipo: 'NOTA_REMISION',
        registradoPor: userId,
      });
    }

    // 4. Si fue a CREDITO, incrementar saldo deudor del cliente
    if (data.tipoPago === 'CREDITO') {
      await tx.update(schema.clientes)
        .set({
          saldoPendiente: sql`${schema.clientes.saldoPendiente} + ${total.toFixed(2)}::numeric`,
          updatedAt: new Date()
        })
        .where(eq(schema.clientes.id, data.clienteId));
    } else {
      // 5. Si fue CONTADO, registrar automáticamente el ingreso en caja chica
      await tx.insert(schema.movimientosCaja).values({
        tipo: 'INGRESO',
        categoria: 'VENTAS' as any,
        monto: total.toFixed(2),
        descripcion: `Cobro Remisión #${nota.numeroNota} (Contado)`,
        fecha: data.fecha || new Date().toISOString().split('T')[0],
        registradoPor: userId,
      });
    }

    return nota;
  });
}
