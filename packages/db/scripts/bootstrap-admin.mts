/** Create the first real administrator. No default email or password and no overwrite. */
import { Pool } from "pg";
import { randomBytes, randomUUID, pbkdf2Sync, createHash } from "node:crypto";
import { writeFileSync, existsSync } from "node:fs";
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase(),
  nombre = process.env.ADMIN_NOMBRE?.trim(),
  file = process.env.ADMIN_CREDENTIALS_FILE;
if (
  !process.env.DATABASE_URL ||
  !email ||
  !/^\S+@\S+\.\S+$/.test(email) ||
  !nombre ||
  !file ||
  existsSync(file)
)
  throw new Error(
    "Indica ADMIN_EMAIL, ADMIN_NOMBRE y un ADMIN_CREDENTIALS_FILE privado nuevo fuera del repositorio",
  );
const db = new Pool({ connectionString: process.env.DATABASE_URL });
const tx = await db.connect();
try {
  await tx.query("BEGIN");
  await tx.query("select pg_advisory_xact_lock(728410)");
  const { rowCount } = await tx.query(
    "select id from usuarios where rol='administrador' and activo=true",
  );
  if (rowCount)
    throw new Error(
      "Ya hay un administrador activo. Crea cuentas desde la aplicación; no se reemplaza ningún usuario",
    );
  const password = randomBytes(20).toString("base64url"),
    salt = randomBytes(24).toString("hex"),
    codigo = randomBytes(20).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 32, "sha256").toString("hex"),
    recovery = createHash("sha256").update(codigo).digest("hex"),
    id = randomUUID();
  await tx.query(
    "insert into usuarios(id,auth_id,email,nombre,rol) values($1,$2,$3,$4,$5)",
    [id, randomUUID(), email, nombre, "administrador"],
  );
  await tx.query(
    "insert into credenciales(usuario_id,hash,salt,cambiar_password,recuperacion_hash) values($1,$2,$3,true,$4)",
    [id, hash, salt, recovery],
  );
  writeFileSync(
    file,
    `Correo: ${email}\nContraseña temporal: ${password}\nCódigo de recuperación de un solo uso: ${codigo}\n`,
    { mode: 0o600, flag: "wx" },
  );
  await tx.query("COMMIT");
  console.log(
    "Primer administrador creado. Credenciales en el archivo privado indicado. Cambia la contraseña al ingresar.",
  );
} catch (e) {
  await tx.query("ROLLBACK");
  throw e;
} finally {
  tx.release();
  await db.end();
}
