import { createMiddleware } from "hono/factory";
import { and, eq, gt } from "drizzle-orm";
import { sesiones, usuarios } from "@erp-avicola/db";
import { digest } from "../password";
import type { AppEnv } from "../types";
export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const token = c.req.header("Authorization")?.replace(/^Bearer /, "");
  if (!token || !/^[a-f0-9]{64}$/.test(token))
    return c.json(
      { success: false, error: "Inicia sesión para continuar" },
      401,
    );
  const [user] = await c.var.db
    .select({ id: usuarios.id, rol: usuarios.rol })
    .from(sesiones)
    .innerJoin(usuarios, eq(sesiones.usuarioId, usuarios.id))
    .where(
      and(
        eq(sesiones.hash, await digest(token)),
        gt(sesiones.vence, new Date()),
        eq(usuarios.activo, true),
      ),
    );
  if (!user)
    return c.json({ success: false, error: "La sesión ha vencido" }, 401);
  c.set("userId", user.id);
  c.set("userRole", user.rol);
  await next();
});
