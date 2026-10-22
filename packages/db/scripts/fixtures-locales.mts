import { Pool } from "pg";
const url = new URL(process.env.DATABASE_URL!);
if (
  !["127.0.0.1", "localhost"].includes(url.hostname) ||
  !url.pathname.startsWith("/erp_test_")
)
  throw new Error("Solo se admiten bases locales erp_test_*");
const db = new Pool({ connectionString: url.toString() });
for (const [nombre, codigo, aves, fecha] of [
  ["Galpón 1", "LOTE-TEST-1", 1500, "2026-01-01"],
  ["Galpón 2", "LOTE-TEST-2", 2500, "2026-02-01"],
]) {
  const {
    rows: [g],
  } = await db.query(
    "update galpones set activo=true where nombre=$1 returning id",
    [nombre],
  );
  await db.query(
    "insert into lotes_aves(galpon_id,codigo,aves_iniciales,aves_actuales,fecha_ingreso,edad_semanas_ingreso,edad_confirmada) values($1,$2,$3,$3,$4,16,true)",
    [g.id, codigo, aves, fecha],
  );
}
await db.end();
