import { createMiddleware } from "hono/factory";
import { and, eq, gt } from "drizzle-orm";
import { sesiones, usuarios, credenciales } from "@erp-avicola/db";
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
    .select({
      id: usuarios.id,
      rol: usuarios.rol,
      cambiarPassword: credenciales.cambiarPassword,
    })
    .from(sesiones)
    .innerJoin(usuarios, eq(sesiones.usuarioId, usuarios.id))
    .innerJoin(credenciales, eq(credenciales.usuarioId, usuarios.id))
    .where(
      and(
        eq(sesiones.hash, await digest(token)),
        gt(sesiones.vence, new Date()),
        eq(usuarios.activo, true),
      ),
    );
  if (!user)
    return c.json({ success: false, error: "La sesión ha vencido" }, 401);
  c.set("cambiarPassword", user.cambiarPassword);
  if (
    user.cambiarPassword &&
    !["/api/auth/me", "/api/auth/password", "/api/auth/logout"].includes(
      c.req.path,
    )
  ) {
    return c.json(
      {
        success: false,
        error: "Debes cambiar tu contraseña temporal desde Mi cuenta",
        cambiarPassword: true,
      },
      403,
    );
  }
  c.set("userId", user.id);
  c.set("userRole", user.rol);
  await next();
});
