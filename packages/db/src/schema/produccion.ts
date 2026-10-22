import {
  pgTable,
  uuid,
  integer,
  numeric,
  varchar,
  timestamp,
  date,
  unique,
  index,
  text,
} from "drizzle-orm/pg-core";
import { lotesAves } from "./galpones";
import { usuarios } from "./usuarios";

export const produccionDiaria = pgTable(
  "produccion_diaria",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    loteId: uuid("lote_id")
      .references(() => lotesAves.id)
      .notNull(),
    fecha: date("fecha").notNull(),
    maplesRecolectados: integer("maples_recolectados").notNull().default(0),
    huevosSueltos: integer("huevos_sueltos").notNull().default(0),
    totalHuevos: integer("total_huevos").notNull(),
    avesVivas: integer("aves_vivas"),
    huevosRotos: integer("huevos_rotos").notNull().default(0),
    aguaL: numeric("agua_l", { precision: 10, scale: 2 }),
    tipoAlimento: varchar("tipo_alimento", { length: 100 }),
    observaciones: text("observaciones"),
    kgAlimento: numeric("kg_alimento", { precision: 10, scale: 2 }),
    kgPlanificado: numeric("kg_planificado", { precision: 10, scale: 2 }),
    aguaPlanificadaL: numeric("agua_planificada_l", {
      precision: 10,
      scale: 2,
    }),
    pctPostura: numeric("pct_postura", { precision: 5, scale: 2 }),
    fcr: numeric("fcr", { precision: 8, scale: 4 }),
    registradoPor: uuid("registrado_por").references(() => usuarios.id),
    idempotencyKey: varchar("idempotency_key", { length: 36 }).unique(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    unique("prod_diaria_lote_fecha_unq").on(table.loteId, table.fecha),
    index("prod_diaria_fecha_idx").on(table.fecha),
  ],
);

export const mortalidadDiaria = pgTable(
  "mortalidad_diaria",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    loteId: uuid("lote_id")
      .references(() => lotesAves.id)
      .notNull(),
    fecha: date("fecha").notNull(),
    cantidad: integer("cantidad").notNull(),
    causa: varchar("causa", { length: 200 }),
    notas: text("notas"),
    registradoPor: uuid("registrado_por").references(() => usuarios.id),
    idempotencyKey: varchar("idempotency_key", { length: 36 }).unique(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("mortalidad_diaria_lote_fecha_idx").on(table.loteId, table.fecha),
  ],
);
