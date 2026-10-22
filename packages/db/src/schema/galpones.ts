import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  index,
} from "drizzle-orm/pg-core";

export const galpones = pgTable("galpones", {
  id: uuid("id").defaultRandom().primaryKey(),
  nombre: varchar("nombre", { length: 100 }).notNull().unique(),
  capacidad: integer("capacidad").notNull(),
  activo: boolean("activo").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lotesAves = pgTable(
  "lotes_aves",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    galponId: uuid("galpon_id")
      .references(() => galpones.id)
      .notNull(),
    codigo: varchar("codigo", { length: 50 }).unique().notNull(),
    raza: varchar("raza", { length: 100 }).notNull().default("Hy-Line Brown"),
    avesIniciales: integer("aves_iniciales").notNull(),
    avesActuales: integer("aves_actuales").notNull(),
    fechaIngreso: date("fecha_ingreso").notNull(),
    edadSemanasIngreso: integer("edad_semanas_ingreso").notNull().default(0),
    edadConfirmada: boolean("edad_confirmada").notNull().default(false),
    racionG: integer("racion_g"),
    activo: boolean("activo").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("lotes_aves_galpon_id_idx").on(table.galponId)],
);
