import { pgTable, uuid, varchar, boolean, timestamp, numeric, text, serial, date, index, integer } from 'drizzle-orm/pg-core';
import { tipoClienteEnum, tipoPagoEnum, estadoNotaEnum } from './enums';
import { tallasHuevo } from './inventario';
import { usuarios } from './usuarios';

export const clientes = pgTable('clientes', {
  id: uuid('id').defaultRandom().primaryKey(),
  nombre: varchar('nombre', { length: 150 }).notNull(),
  telefono: varchar('telefono', { length: 30 }),
  direccion: text('direccion'),
  tipo: tipoClienteEnum('tipo').notNull().default('MINORISTA'),
  saldoPendiente: numeric('saldo_pendiente', { precision: 12, scale: 2 }).notNull().default('0'),
  notas: text('notas'),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const preciosTalla = pgTable('precios_talla', {
  id: uuid('id').defaultRandom().primaryKey(),
  tallaId: varchar('talla_id', { length: 10 }).references(() => tallasHuevo.id).notNull(),
  precioMaple: numeric('precio_maple', { precision: 10, scale: 2 }).notNull(),
  precioCaja: numeric('precio_caja', { precision: 10, scale: 2 }),
  vigenteDesde: date('vigente_desde').notNull().defaultNow(),
  vigenteHasta: date('vigente_hasta'),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('precios_talla_talla_activo_idx').on(table.tallaId, table.activo)
]);

export const notasRemision = pgTable('notas_remision', {
  id: uuid('id').defaultRandom().primaryKey(),
  numeroNota: serial('numero_nota').unique().notNull(),
  clienteId: uuid('cliente_id').references(() => clientes.id).notNull(),
  fecha: date('fecha').notNull(),
  destino: varchar('destino', { length: 250 }),
  tipoPago: tipoPagoEnum('tipo_pago').notNull(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
  descuento: numeric('descuento', { precision: 12, scale: 2 }).notNull().default('0'),
  total: numeric('total', { precision: 12, scale: 2 }).notNull().default('0'),
  estado: estadoNotaEnum('estado').notNull().default('PENDIENTE'),
  registradoPor: uuid('registrado_por').references(() => usuarios.id),
  idempotencyKey: varchar('idempotency_key', { length: 36 }).unique(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  index('notas_remision_fecha_idx').on(table.fecha),
  index('notas_remision_cliente_idx').on(table.clienteId)
]);

export const detalleRemision = pgTable('detalle_remision', {
  id: uuid('id').defaultRandom().primaryKey(),
  notaId: uuid('nota_id').references(() => notasRemision.id, { onDelete: 'cascade' }).notNull(),
  tallaId: varchar('talla_id', { length: 10 }).references(() => tallasHuevo.id).notNull(),
  cantidadMaples: integer('cantidad_maples').notNull().default(0),
  cantidadSueltos: integer('cantidad_sueltos').notNull().default(0),
  precioUnitarioMaple: numeric('precio_unitario_maple', { precision: 10, scale: 2 }).notNull(),
  subtotalLinea: numeric('subtotal_linea', { precision: 12, scale: 2 }).notNull(),
});

export const pagos = pgTable('pagos', {
  id: uuid('id').defaultRandom().primaryKey(),
  notaId: uuid('nota_id').references(() => notasRemision.id).notNull(),
  clienteId: uuid('cliente_id').references(() => clientes.id).notNull(),
  monto: numeric('monto', { precision: 12, scale: 2 }).notNull(),
  fecha: date('fecha').notNull().defaultNow(),
  metodoPago: varchar('metodo_pago', { length: 50 }).default('EFECTIVO'),
  notas: text('notas'),
  registradoPor: uuid('registrado_por').references(() => usuarios.id),
  idempotencyKey: varchar('idempotency_key', { length: 36 }).unique(),
  createdAt: timestamp('created_at').defaultNow(),
});
