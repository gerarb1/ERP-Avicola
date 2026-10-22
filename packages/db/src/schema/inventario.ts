import { pgTable, uuid, varchar, integer, boolean, timestamp, date, index } from 'drizzle-orm/pg-core';
import { usuarios } from './usuarios';
import { tipoMovimientoInventarioEnum } from './enums';

export const tallasHuevo = pgTable('tallas_huevo', {
  id: varchar('id', { length: 10 }).primaryKey(),
  nombre: varchar('nombre', { length: 50 }).notNull(),
  pesoMinG: integer('peso_min_g').notNull(),
  pesoMaxG: integer('peso_max_g').notNull(),
  ordenDisplay: integer('orden_display').notNull().default(0),
  activo: boolean('activo').default(true),
});

export const inventarioStock = pgTable('inventario_stock', {
  id: uuid('id').defaultRandom().primaryKey(),
  tallaId: varchar('talla_id', { length: 10 }).references(() => tallasHuevo.id).notNull().unique(),
  maplesDisponibles: integer('maples_disponibles').notNull().default(0),
  huevosSueltos: integer('huevos_sueltos').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const movimientosInventario = pgTable('movimientos_inventario', {
  id: uuid('id').defaultRandom().primaryKey(),
  inventarioStockId: uuid('inventario_stock_id').references(() => inventarioStock.id).notNull(),
  tipo: tipoMovimientoInventarioEnum('tipo').notNull(),
  cantidadMaples: integer('cantidad_maples').notNull().default(0),
  cantidadSueltos: integer('cantidad_sueltos').notNull().default(0),
  motivo: varchar('motivo', { length: 300 }),
  referenciaId: uuid('referencia_id'),
  referenciaTipo: varchar('referencia_tipo', { length: 50 }),
  fecha: date('fecha').notNull(),
  registradoPor: uuid('registrado_por').references(() => usuarios.id),
  idempotencyKey: varchar('idempotency_key', { length: 36 }).unique(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('movimientos_inv_stock_idx').on(table.inventarioStockId),
  index('movimientos_inv_fecha_idx').on(table.fecha),
  index('movimientos_inv_tipo_idx').on(table.tipo)
]);
