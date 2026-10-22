import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  numeric,
  text,
  date,

} from "drizzle-orm/pg-core";
import { usuarios } from "./usuarios";
import { lotesAves } from "./galpones";
export const credenciales = pgTable("credenciales", {
  usuarioId: uuid("usuario_id")
    .primaryKey()
    .references(() => usuarios.id),
  hash: text("hash").notNull(),
  salt: text("salt").notNull(),
});
export const sesiones = pgTable("sesiones", {
  hash: varchar("hash", { length: 64 }).primaryKey(),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id),
  vence: timestamp("vence", { withTimezone: true }).notNull(),
});
export const intentosLogin = pgTable("intentos_login", {
  email: varchar("email", { length: 255 }).primaryKey(),
  intentos: integer("intentos").notNull().default(0),
  desde: timestamp("desde", { withTimezone: true }).notNull().defaultNow(),
});
export const sucesosGalpon = pgTable("sucesos_galpon", {
  id: uuid("id").primaryKey().defaultRandom(),
  loteId: uuid("lote_id")
    .notNull()
    .references(() => lotesAves.id),
  fecha: date("fecha").notNull(),
  tipo: varchar("tipo", { length: 30 }).notNull(),
  descripcion: text("descripcion").notNull(),
  producto: varchar("producto", { length: 150 }),
  dosis: varchar("dosis", { length: 100 }),
  proximaFecha: date("proxima_fecha"),
  registradoPor: uuid("registrado_por")
    .notNull()
    .references(() => usuarios.id),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insumos = pgTable("insumos", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: varchar("nombre", { length: 150 }).notNull().unique(),
  tipo: varchar("tipo", { length: 30 }).notNull(),
  unidad: varchar("unidad", { length: 20 }).notNull(),
  stock: numeric("stock", { precision: 12, scale: 3 }).notNull().default("0"),
  kgBolsa: numeric("kg_bolsa", { precision: 8, scale: 3 })
    .notNull()
    .default("44"),
});
export const movimientosInsumos = pgTable("movimientos_insumos", {
  id: uuid("id").primaryKey().defaultRandom(),
  insumoId: uuid("insumo_id")
    .notNull()
    .references(() => insumos.id),
  loteId: uuid("lote_id").references(() => lotesAves.id),
  fecha: date("fecha").notNull(),
  tipo: varchar("tipo", { length: 15 }).notNull(),
  cantidad: numeric("cantidad", { precision: 12, scale: 3 }).notNull(),
  costoTotal: numeric("costo_total", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  motivo: text("motivo").notNull(),
  vencimiento: date("vencimiento"),
  registradoPor: uuid("registrado_por")
    .notNull()
    .references(() => usuarios.id),
  createdAt: timestamp("created_at").defaultNow(),
});
export const lecturasNotificaciones = pgTable("lecturas_notificaciones", {
  clave: varchar("clave", { length: 200 }).primaryKey(),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuarios.id),
  leidaEn: timestamp("leida_en").defaultNow(),
});
