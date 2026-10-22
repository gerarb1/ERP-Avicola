import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { TALLAS_HUEVO } from '@erp-avicola/shared';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const db = drizzle(pool, { schema });

async function seed() {
  console.log('Seeding database...');
  
  // 1. Tallas
  for (const talla of Object.values(TALLAS_HUEVO)) {
    await db.insert(schema.tallasHuevo).values({
      id: talla.codigo,
      nombre: talla.nombre,
      pesoMinG: talla.pesoMinG,
      pesoMaxG: talla.pesoMaxG,
      ordenDisplay: talla.ordenDisplay
    }).onConflictDoNothing();
  }
  console.log('✅ Tallas seeded');

  // 2. Galpones
  const [g1] = await db.insert(schema.galpones).values({
    nombre: 'Galpón 1',
    capacidad: 1500
  }).returning().onConflictDoNothing();

  const [g2] = await db.insert(schema.galpones).values({
    nombre: 'Galpón 2',
    capacidad: 2500
  }).returning().onConflictDoNothing();
  console.log('✅ Galpones seeded');

  // 3. Lotes
  if (g1) {
    await db.insert(schema.lotesAves).values({
      galponId: g1.id,
      codigo: 'LOTE-2026-G1',
      raza: 'Hy-Line Brown',
      avesIniciales: 1500,
      avesActuales: 1500,
      fechaIngreso: '2026-01-01',
      edadSemanasIngreso: 16
    }).onConflictDoNothing();
  }

  if (g2) {
    await db.insert(schema.lotesAves).values({
      galponId: g2.id,
      codigo: 'LOTE-2026-G2',
      raza: 'Hy-Line Brown',
      avesIniciales: 2500,
      avesActuales: 2500,
      fechaIngreso: '2026-02-01',
      edadSemanasIngreso: 16
    }).onConflictDoNothing();
  }
  console.log('✅ Lotes seeded');

  // 4. Inventario Stock Inicial
  for (const talla of Object.values(TALLAS_HUEVO)) {
    await db.insert(schema.inventarioStock).values({
      tallaId: talla.codigo,
      maplesDisponibles: 0,
      huevosSueltos: 0
    }).onConflictDoNothing();
  }
  console.log('✅ Inventario Inicial seeded');

  // 5. Precios Iniciales (Placeholder)
  for (const talla of Object.values(TALLAS_HUEVO)) {
    await db.insert(schema.preciosTalla).values({
      tallaId: talla.codigo,
      precioMaple: '30.00',
      precioCaja: '360.00'
    }).onConflictDoNothing();
  }
  console.log('✅ Precios Iniciales seeded');

  console.log('🌱 Seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
