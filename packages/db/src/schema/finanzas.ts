import { pgTable, uuid, varchar, numeric, date, timestamp, index, boolean, text } from 'drizzle-orm/pg-core';
import { tipoMovimientoEnum, categoriaEgresoEnum } from './enums';
import { usuarios } from './usuarios';

export const movimientosCaja = pgTable('movimientos_caja', {
  id: uuid('id').defaultRandom().primaryKey(),
  tipo: tipoMovimientoEnum('tipo').notNull(),
  categoria: categoriaEgresoEnum('categoria').notNull(),
  monto: numeric('monto', { precision: 12, scale: 2 }).notNull(),
  descripcion: varchar('descripcion', { length: 300 }),
  fecha: date('fecha').notNull(),
  registradoPor: uuid('registrado_por').references(() => usuarios.id),
  idempotencyKey: varchar('idempotency_key', { length: 36 }).unique(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('movimientos_caja_fecha_idx').on(table.fecha),
  index('movimientos_caja_categoria_idx').on(table.categoria)
]);

export const arqueosSemanales = pgTable('arqueos_semanales', {
  id: uuid('id').defaultRandom().primaryKey(),
  fechaInicio: date('fecha_inicio').notNull(),
  fechaFin: date('fecha_fin').notNull(),
  saldoAnterior: numeric('saldo_anterior', { precision: 12, scale: 2 }).notNull().default('0'),
  totalIngresos: numeric('total_ingresos', { precision: 12, scale: 2 }).notNull().default('0'),
  totalEgresos: numeric('total_egresos', { precision: 12, scale: 2 }).notNull().default('0'),
  saldoEsperado: numeric('saldo_esperado', { precision: 12, scale: 2 }).notNull().default('0'),
  saldoReal: numeric('saldo_real', { precision: 12, scale: 2 }).notNull().default('0'),
  diferencia: numeric('diferencia', { precision: 12, scale: 2 }).notNull().default('0'),
  conciliado: boolean('conciliado').default(false),
  notas: text('notas'),
  registradoPor: uuid('registrado_por').references(() => usuarios.id),
  createdAt: timestamp('created_at').defaultNow(),
});
