/** Only creates missing demo accounts; never resets existing passwords. */
import { Pool } from "pg";
import { pbkdf2Sync, randomBytes, randomUUID } from "node:crypto";
import { writeFileSync, existsSync } from "node:fs";
const url = process.env.DATABASE_URL;
if (!url) throw new Error("Falta DATABASE_URL");
const file = process.env.DEMO_CREDENTIALS_FILE;
if (!file || existsSync(file))
  throw new Error(
    "Indica DEMO_CREDENTIALS_FILE con una ruta nueva fuera del repositorio",
  );
const pool = new Pool({ connectionString: url });
const client = await pool.connect();
const results: string[] = [];
try {
  await client.query("BEGIN");
  await client.query("select pg_advisory_xact_lock(728410)");
  for (const [email, nombre, rol] of [
    ["admin@altalaestancia.com", "Administración de prueba", "administrador"],
    ["galpon@altalaestancia.com", "Galpón de prueba", "encargado_galpon"],
    ["almacen@altalaestancia.com", "Almacén de prueba", "encargado_almacen"],
  ]) {
    const existing = await client.query(
      "select id from usuarios where email=$1",
      [email],
    );
    if (existing.rowCount) {
      results.push(`${email}: ya existe; no se modifica`);
      continue;
    }
    const password = randomBytes(18).toString("base64url"),
      salt = randomBytes(24).toString("hex");
    const hash = pbkdf2Sync(password, salt, 100000, 32, "sha256").toString(
      "hex",
    );
    const id = randomUUID();
    await client.query(
      "insert into usuarios(id,auth_id,nombre,email,rol) values($1,$2,$3,$4,$5)",
      [id, randomUUID(), nombre, email, rol],
    );
    await client.query(
      "insert into credenciales(usuario_id,hash,salt) values($1,$2,$3)",
      [id, hash, salt],
    );
    results.push(`${email}\t${password}\t${rol}`);
  }
  // Exclusive creation prevents accidental replacement and keeps credentials out of logs.
  writeFileSync(file, results.join("\n") + "\n", { mode: 0o600, flag: "wx" });
  await client.query("COMMIT");
  console.log(
    "Cuentas creadas. Credenciales guardadas en el archivo privado indicado.",
  );
} catch (e) {
  await client.query("ROLLBACK");
  throw e;
} finally {
  client.release();
  await pool.end();
}
