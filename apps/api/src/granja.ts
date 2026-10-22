import { Hono } from "hono";
import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import * as s from "@erp-avicola/db";
import type { AppEnv } from "./types";
import { AppError } from "./middleware/error-handler";
import { digest } from "./password";
import { fechaBolivia } from "@erp-avicola/shared";
export const granja = new Hono<AppEnv>();
const soloAdmin = async (
  c: import("hono").Context<AppEnv>,
  next: import("hono").Next,
) => {
  if (c.var.userRole !== "administrador")
    throw new AppError(403, "Solo administración configura la granja");
  await next();
};
granja.use("/granja", soloAdmin);
granja.use("/granja/*", soloAdmin);
granja.get("/granja", async (c) => {
  const [galpones, lotes] = await Promise.all([
    c.var.db.select().from(s.galpones).orderBy(s.galpones.nombre),
    c.var.db.select().from(s.lotesAves).orderBy(s.lotesAves.createdAt),
  ]);
  return c.json({ success: true, data: { galpones, lotes } });
});
granja.post("/granja/iniciar", async (c) => {
  const d = z
    .object({
      galponId: z.string().uuid(),
      aves: z.number().int().positive(),
      edadSemanas: z.number().int().min(1).max(200).optional(),
      sustituirLotes: z.boolean().default(false),
    })
    .parse(await c.req.json());
  const key = z.string().uuid().parse(c.req.header("X-Idempotency-Key"));
  const endpoint =
    c.var.userId + ":" + c.req.path + ":" + (await digest(JSON.stringify(d)));
  const data = await c.var.db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(728410)`);
    const [prior] = await tx
      .select()
      .from(s.idempotencyKeys)
      .where(eq(s.idempotencyKeys.key, key));
    if (prior) {
      if (prior.endpoint !== endpoint)
        throw new AppError(409, "La clave pertenece a otra operación");
      return prior.responseBody;
    }
    const [g] = await tx
      .select()
      .from(s.galpones)
      .where(eq(s.galpones.id, d.galponId));
    if (!g || d.aves > g.capacidad)
      throw new AppError(400, "Revisa el galpón y su capacidad");
    const activos = await tx
      .select()
      .from(s.lotesAves)
      .where(eq(s.lotesAves.activo, true));
    if (activos.length && !d.sustituirLotes)
      throw new AppError(
        409,
        "Ya hay lotes activos. Confirma archivar sus historiales antes de iniciar otro",
      );
    await tx
      .update(s.lotesAves)
      .set({ activo: false, updatedAt: new Date() })
      .where(eq(s.lotesAves.activo, true));
    await tx.update(s.galpones).set({ activo: false, updatedAt: new Date() });
    await tx
      .update(s.galpones)
      .set({ activo: true })
      .where(eq(s.galpones.id, g.id));
    const [l] = await tx
      .insert(s.lotesAves)
      .values({
        galponId: g.id,
        codigo:
          "REAL-" + fechaBolivia() + "-" + crypto.randomUUID().slice(0, 8),
        fechaIngreso: fechaBolivia(),
        edadSemanasIngreso: d.edadSemanas ?? 0,
        edadConfirmada: d.edadSemanas !== undefined,
        avesIniciales: d.aves,
        avesActuales: d.aves,
        activo: true,
      })
      .returning();
    await tx
      .insert(s.idempotencyKeys)
      .values({
        key,
        endpoint,
        method: "POST",
        statusCode: 200,
        responseBody: l,
        expiresAt: new Date(Date.now() + 30 * 86400000),
      });
    return l;
  });
  return c.json({ success: true, data });
});
granja.post("/granja/lotes/:id", async (c) => {
  const id = z.string().uuid().parse(c.req.param("id"));
  const d = z
    .object({
      edadSemanasIngreso: z.number().int().min(1).max(200).optional(),
      racionG: z.number().int().min(1).max(300).nullable().optional(),
    })
    .parse(await c.req.json());
  const data = await c.var.db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(728410)`);
    const [l] = await tx
      .select()
      .from(s.lotesAves)
      .where(and(eq(s.lotesAves.id, id), eq(s.lotesAves.activo, true)));
    if (!l) throw new AppError(404, "Lote activo no encontrado");
    const [updated] = await tx
      .update(s.lotesAves)
      .set({
        ...d,
        ...(d.edadSemanasIngreso !== undefined ? { edadConfirmada: true } : {}),
        updatedAt: new Date(),
      })
      .where(eq(s.lotesAves.id, id))
      .returning();
    return updated;
  });
  return c.json({ success: true, data });
});
