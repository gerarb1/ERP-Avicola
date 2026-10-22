import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { TALLAS_HUEVO } from "@erp-avicola/shared";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log("Seeding database...");

  // 1. Tallas
  for (const talla of Object.values(TALLAS_HUEVO)) {
    await db
      .insert(schema.tallasHuevo)
      .values({
        id: talla.codigo,
        nombre: talla.nombre,
        pesoMinG: talla.pesoMinG,
        pesoMaxG: talla.pesoMaxG,
        ordenDisplay: talla.ordenDisplay,
      })
      .onConflictDoNothing();
  }
  console.log("✅ Tallas seeded");

  // Preserve capacities without activating flocks or inventing live bird counts/ages.
  for (const [nombre, capacidad] of [
    ["Galpón 1", 1500],
    ["Galpón 2", 2500],
  ] as const) {
    await db
      .insert(schema.galpones)
      .values({ nombre, capacidad, activo: false })
      .onConflictDoNothing();
  }
  // 4. Inventario Stock Inicial
  for (const talla of Object.values(TALLAS_HUEVO)) {
    await db
      .insert(schema.inventarioStock)
      .values({
        tallaId: talla.codigo,
        maplesDisponibles: 0,
        huevosSueltos: 0,
      })
      .onConflictDoNothing();
  }
  console.log("✅ Inventario Inicial seeded");

  console.log("🌱 Seeding completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
