import { Hono, type Context } from "hono";
import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import * as s from "@erp-avicola/db";
import type { AppEnv } from "./types";
import { AppError } from "./middleware/error-handler";
import { digest, passwordHash, equalHash, hex } from "./password";
type C = Context<AppEnv>;
type Tx = Parameters<Parameters<C["var"]["db"]["transaction"]>[0]>[0];
const clave = z
  .string()
  .min(12, "Usa al menos 12 caracteres")
  .max(128)
  .refine((s) => s.trim().length >= 12, "No uses solo espacios");
const correo = z.string().trim().toLowerCase().email().max(254);
const aleatorio = () => hex(crypto.getRandomValues(new Uint8Array(20)).buffer);
export const nuevoCodigo = () => aleatorio().match(/.{4}/g)!.join("-");
const normalizar = (s: string) => s.replace(/[-\s]/g, "").toLowerCase();
const ok = (c: C, data: unknown) => c.json({ success: true, data });
async function credencial(password: string) {
  const salt = aleatorio();
  return { salt, hash: await passwordHash(password, salt) };
}
async function sensible(c: C, run: (tx: Tx) => Promise<unknown>) {
  // Never cache passwords or backup codes in idempotency response tables.
  c.header("Cache-Control", "no-store");
  return ok(
    c,
    await c.var.db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(728410)`);
      return run(tx);
    }),
  );
}
function admin(c: C) {
  if (c.var.userRole !== "administrador")
    throw new AppError(403, "Solo administración puede gestionar cuentas");
}
export const recuperacion = new Hono<AppEnv>();
recuperacion.post("/recuperar", async (c) => {
  const d = z
    .object({
      email: correo,
      codigo: z.string().min(1).max(100),
      password: clave,
    })
    .parse(await c.req.json());
  const key = "recuperar:" + (await digest(d.email));
  const result = await c.var.db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(728410)`);
    const [a] = await tx
      .select()
      .from(s.intentosLogin)
      .where(eq(s.intentosLogin.email, key));
    const reciente = a && Date.now() - a.desde.getTime() < 15 * 60000;
    if (reciente && a.intentos >= 10) return { limited: true };
    const [u] = await tx
      .select({ usuario: s.usuarios, credencial: s.credenciales })
      .from(s.usuarios)
      .innerJoin(s.credenciales, eq(s.credenciales.usuarioId, s.usuarios.id))
      .where(eq(s.usuarios.email, d.email));
    if (
      !u ||
      !u.usuario.activo ||
      !u.credencial.recuperacionHash ||
      !equalHash(
        u.credencial.recuperacionHash,
        await digest(normalizar(d.codigo)),
      )
    ) {
      await tx
        .insert(s.intentosLogin)
        .values({ email: key, intentos: 1, desde: new Date() })
        .onConflictDoUpdate({
          target: s.intentosLogin.email,
          set: {
            intentos: reciente ? a!.intentos + 1 : 1,
            desde: reciente ? a!.desde : new Date(),
          },
        });
      return { invalid: true };
    }
    await tx
      .update(s.credenciales)
      .set({
        ...(await credencial(d.password)),
        cambiarPassword: false,
        recuperacionHash: null,
      })
      .where(eq(s.credenciales.usuarioId, u.usuario.id));
    await tx.delete(s.sesiones).where(eq(s.sesiones.usuarioId, u.usuario.id));
    await tx
      .delete(s.intentosLogin)
      .where(sql`${s.intentosLogin.email} in (${key},${d.email})`);
    return { restablecida: true };
  });
  if ("limited" in result)
    return c.json(
      { success: false, error: "Demasiados intentos. Espera 15 minutos" },
      429,
    );
  if ("invalid" in result)
    return c.json(
      {
        success: false,
        error: "El correo o código de recuperación no es válido",
      },
      401,
    );
  return ok(c, result);
});
export const cuentas = new Hono<AppEnv>();
cuentas.get("/cuentas", async (c) => {
  admin(c);
  return ok(
    c,
    await c.var.db
      .select({
        id: s.usuarios.id,
        nombre: s.usuarios.nombre,
        email: s.usuarios.email,
        rol: s.usuarios.rol,
        activo: s.usuarios.activo,
        cambiarPassword: s.credenciales.cambiarPassword,
      })
      .from(s.usuarios)
      .leftJoin(s.credenciales, eq(s.credenciales.usuarioId, s.usuarios.id))
      .orderBy(s.usuarios.nombre),
  );
});
cuentas.post("/cuentas", async (c) => {
  admin(c);
  const d = z
    .object({
      nombre: z.string().trim().min(1).max(150),
      email: correo,
      rol: z.enum(["administrador", "encargado_galpon", "encargado_almacen"]),
    })
    .parse(await c.req.json());
  return sensible(c, async (tx) => {
    const [existe] = await tx
      .select()
      .from(s.usuarios)
      .where(eq(s.usuarios.email, d.email));
    if (existe) throw new AppError(409, "Ya existe una cuenta con ese correo");
    const password = aleatorio();
    const [u] = await tx
      .insert(s.usuarios)
      .values({ ...d, authId: crypto.randomUUID() })
      .returning();
    await tx
      .insert(s.credenciales)
      .values({
        usuarioId: u.id,
        ...(await credencial(password)),
        cambiarPassword: true,
      });
    return { id: u.id, email: u.email, password, temporal: true };
  });
});
cuentas.post("/cuentas/:id/restablecer", async (c) => {
  admin(c);
  const id = z.string().uuid().parse(c.req.param("id"));
  if (id === c.var.userId)
    throw new AppError(400, "Cambia tu contraseña desde Mi cuenta");
  return sensible(c, async (tx) => {
    const [u] = await tx.select().from(s.usuarios).where(eq(s.usuarios.id, id));
    if (!u || !u.activo) throw new AppError(404, "Cuenta activa no encontrada");
    const password = aleatorio(),
      data = {
        ...(await credencial(password)),
        cambiarPassword: true,
        recuperacionHash: null,
      };
    await tx
      .insert(s.credenciales)
      .values({ usuarioId: id, ...data })
      .onConflictDoUpdate({ target: s.credenciales.usuarioId, set: data });
    await tx.delete(s.sesiones).where(eq(s.sesiones.usuarioId, id));
    await tx.delete(s.intentosLogin).where(eq(s.intentosLogin.email, u.email));
    return { email: u.email, password, temporal: true };
  });
});
cuentas.post("/cuentas/:id/estado", async (c) => {
  admin(c);
  const id = z.string().uuid().parse(c.req.param("id")),
    d = z.object({ activo: z.boolean() }).parse(await c.req.json());
  if (id === c.var.userId)
    throw new AppError(400, "No puedes desactivar tu propia cuenta");
  return sensible(c, async (tx) => {
    const [u] = await tx.select().from(s.usuarios).where(eq(s.usuarios.id, id));
    if (!u) throw new AppError(404, "Cuenta no encontrada");
    if (!d.activo && u.rol === "administrador") {
      const admins = await tx
        .select()
        .from(s.usuarios)
        .where(
          and(eq(s.usuarios.rol, "administrador"), eq(s.usuarios.activo, true)),
        );
      if (admins.length <= 1)
        throw new AppError(400, "Debe quedar al menos un administrador activo");
    }
    await tx
      .update(s.usuarios)
      .set({ activo: d.activo, updatedAt: new Date() })
      .where(eq(s.usuarios.id, id));
    await tx.delete(s.sesiones).where(eq(s.sesiones.usuarioId, id));
    return { activo: d.activo };
  });
});
cuentas.post("/auth/password", async (c) => {
  const d = z
    .object({ actual: z.string().min(1).max(200), password: clave })
    .parse(await c.req.json());
  return sensible(c, async (tx) => {
    const [old] = await tx
      .select()
      .from(s.credenciales)
      .where(eq(s.credenciales.usuarioId, c.var.userId));
    if (!old || !equalHash(await passwordHash(d.actual, old.salt), old.hash))
      throw new AppError(400, "La contraseña actual no coincide");
    if (equalHash(await passwordHash(d.password, old.salt), old.hash))
      throw new AppError(
        400,
        "Elige una contraseña diferente de la temporal o anterior",
      );
    const codigo = nuevoCodigo();
    await tx
      .update(s.credenciales)
      .set({
        ...(await credencial(d.password)),
        cambiarPassword: false,
        recuperacionHash: await digest(normalizar(codigo)),
      })
      .where(eq(s.credenciales.usuarioId, c.var.userId));
    // Revoke every session, including this one. The user signs in again with the new password.
    await tx.delete(s.sesiones).where(eq(s.sesiones.usuarioId, c.var.userId));
    return { codigo, volverAIngresar: true };
  });
});
cuentas.post("/auth/codigo-respaldo", async (c) => {
  const d = z
    .object({ password: z.string().min(1).max(200) })
    .parse(await c.req.json());
  return sensible(c, async (tx) => {
    const [old] = await tx
      .select()
      .from(s.credenciales)
      .where(eq(s.credenciales.usuarioId, c.var.userId));
    if (!old || !equalHash(await passwordHash(d.password, old.salt), old.hash))
      throw new AppError(400, "La contraseña actual no coincide");
    const codigo = nuevoCodigo();
    await tx
      .update(s.credenciales)
      .set({ recuperacionHash: await digest(normalizar(codigo)) })
      .where(eq(s.credenciales.usuarioId, c.var.userId));
    return { codigo };
  });
});
