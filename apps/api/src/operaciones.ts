import { Hono, type Context } from "hono";
import { z } from "zod";
import { and, eq, desc, asc, gte, lte, sql } from "drizzle-orm";
import * as s from "@erp-avicola/db";
import {
  edadSemanas,
  referenciaHyLine,
  fechaBolivia,
  semanaAnteriorCompleta,
  centavos,
} from "@erp-avicola/shared";
import type { AppEnv } from "./types";
import { AppError } from "./middleware/error-handler";
import { authMiddleware } from "./middleware/auth";
import { digest, passwordHash, equalHash, hex } from "./password";
import { cuentas, recuperacion } from "./cuentas";
import { granja } from "./granja";

type C = Context<AppEnv>;
type DB = C["var"]["db"];
type Tx = Parameters<Parameters<DB["transaction"]>[0]>[0];
const fecha = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !Number.isNaN(Date.parse(v)) &&
      new Date(v + "T12:00:00Z").toISOString().slice(0, 10) === v,
    "Fecha inválida",
  );
const dia = fecha.refine(
  (v) => v <= fechaBolivia(),
  "No se admiten registros futuros",
);
const dinero = z.coerce
  .number()
  .finite()
  .nonnegative()
  .max(99999999)
  .refine(
    (v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.000001,
    "Usa hasta dos decimales",
  );
const positivo = dinero.refine((v) => v > 0, "El monto debe ser mayor a cero");
const texto = z.string().trim().min(1).max(300);
const cantidad = z.coerce.number().finite().positive().max(999999);
const talla = z.enum(["P", "CH", "M", "G", "XG", "XXG"]);
function rol(c: C, ...roles: string[]) {
  if (c.var.userRole !== "administrador" && !roles.includes(c.var.userRole))
    throw new AppError(403, "No tienes permiso para esta operación");
}
const ok = (c: C, data: unknown) => c.json({ success: true, data });
async function body<T extends z.ZodTypeAny>(
  c: C,
  schema: T,
): Promise<z.infer<T>> {
  return schema.parse(await c.req.json());
}
// Shared transaction lock serializes operational writes, including retries and cash closure.
async function write(c: C, data: unknown, run: (tx: Tx) => Promise<unknown>) {
  const key = z.string().uuid().parse(c.req.header("X-Idempotency-Key"));
  const endpoint =
    c.var.userId +
    ":" +
    c.req.path +
    ":" +
    (await digest(JSON.stringify(data)));
  return ok(
    c,
    await c.var.db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(728410)`);
      const [prior] = await tx
        .select()
        .from(s.idempotencyKeys)
        .where(eq(s.idempotencyKeys.key, key));
      if (prior) {
        if (prior.endpoint !== endpoint)
          throw new AppError(
            409,
            "La clave de reintento pertenece a otra operación",
          );
        return prior.responseBody;
      }
      const result = await run(tx);
      await tx.insert(s.idempotencyKeys).values({
        key,
        endpoint,
        method: c.req.method,
        statusCode: 200,
        responseBody: result,
        expiresAt: new Date(Date.now() + 30 * 86400000),
      });
      return result;
    }),
  );
}
async function lote(tx: Tx, id: string, fechaRegistro: string) {
  const [l] = await tx.select().from(s.lotesAves).where(eq(s.lotesAves.id, id));
  if (!l || !l.activo) throw new AppError(404, "Lote activo no encontrado");
  if (fechaRegistro < l.fechaIngreso)
    throw new AppError(400, "La fecha es anterior al ingreso del lote");
  return l;
}
async function avesEnFecha(
  tx: Tx,
  l: typeof s.lotesAves.$inferSelect,
  fechaRegistro: string,
) {
  const bajas = await tx
    .select()
    .from(s.mortalidadDiaria)
    .where(
      and(
        eq(s.mortalidadDiaria.loteId, l.id),
        sql`${s.mortalidadDiaria.fecha} > ${fechaRegistro}`,
      ),
    );
  return l.avesActuales + bajas.reduce((a, b) => a + b.cantidad, 0);
}
async function cajaAbierta(tx: Tx, f: string) {
  const [closed] = await tx
    .select()
    .from(s.arqueosSemanales)
    .where(gte(s.arqueosSemanales.fechaFin, f))
    .limit(1);
  if (closed)
    throw new AppError(
      409,
      "La caja de esa fecha ya tiene un arqueo. Registra una corrección en un período abierto",
    );
}
async function caja(
  tx: Tx,
  d: {
    fecha: string;
    tipo: "INGRESO" | "EGRESO";
    monto: number;
    descripcion: string;
    categoria?: any;
  },
  userId: string,
) {
  await cajaAbierta(tx, d.fecha);
  const [m] = await tx
    .insert(s.movimientosCaja)
    .values({
      ...d,
      monto: d.monto.toFixed(2),
      categoria: d.categoria ?? "VARIOS",
      registradoPor: userId,
    })
    .returning();
  return m;
}
async function stockCambio(
  tx: Tx,
  tallaId: string,
  unidades: number,
  datos: {
    fecha: string;
    tipo: "ENTRADA" | "SALIDA" | "MERMA" | "AJUSTE";
    motivo: string;
    referenciaId?: string;
    referenciaTipo?: string;
  },
  userId: string,
) {
  const [st] = await tx
    .select()
    .from(s.inventarioStock)
    .where(eq(s.inventarioStock.tallaId, tallaId));
  if (!st) throw new AppError(400, "Talla sin stock inicializado");
  const final = st.maplesDisponibles * 30 + st.huevosSueltos + unidades;
  if (final < 0)
    throw new AppError(400, `Stock insuficiente para talla ${tallaId}`);
  await tx
    .update(s.inventarioStock)
    .set({
      maplesDisponibles: Math.floor(final / 30),
      huevosSueltos: final % 30,
      updatedAt: new Date(),
    })
    .where(eq(s.inventarioStock.id, st.id));
  await tx.insert(s.movimientosInventario).values({
    ...datos,
    inventarioStockId: st.id,
    cantidadMaples: Math.floor(Math.abs(unidades) / 30),
    cantidadSueltos: Math.abs(unidades) % 30,
    registradoPor: userId,
  });
}

export const operaciones = new Hono<AppEnv>();
operaciones.post("/auth/login", async (c) => {
  const d = await body(
    c,
    z.object({
      email: z
        .string()
        .email()
        .max(255)
        .transform((v) => v.toLowerCase().trim()),
      password: z.string().min(1).max(200),
    }),
  );
  const result = await c.var.db.transaction(async (tx) => {
    // Serialize credential checks/session creation with password resets and revocation.
    await tx.execute(sql`select pg_advisory_xact_lock(728410)`);
    const [attempt] = await tx
      .select()
      .from(s.intentosLogin)
      .where(eq(s.intentosLogin.email, d.email));
    const recent = attempt && Date.now() - attempt.desde.getTime() < 15 * 60000;
    if (recent && attempt.intentos >= 10) return { limited: true } as const;
    const [u] = await tx
      .select({ user: s.usuarios, credential: s.credenciales })
      .from(s.usuarios)
      .innerJoin(s.credenciales, eq(s.credenciales.usuarioId, s.usuarios.id))
      .where(eq(s.usuarios.email, d.email));
    const hash = await passwordHash(
      d.password,
      u?.credential.salt ?? "nonexistent-user-salt",
    );
    if (!u || !u.user.activo || !equalHash(hash, u.credential.hash)) {
      await tx
        .insert(s.intentosLogin)
        .values({ email: d.email, intentos: 1, desde: new Date() })
        .onConflictDoUpdate({
          target: s.intentosLogin.email,
          set: {
            intentos: recent ? attempt!.intentos + 1 : 1,
            desde: recent ? attempt!.desde : new Date(),
          },
        });
      return { invalid: true } as const;
    }
    await tx.delete(s.intentosLogin).where(eq(s.intentosLogin.email, d.email));
    const token = hex(crypto.getRandomValues(new Uint8Array(32)).buffer);
    await tx.insert(s.sesiones).values({
      hash: await digest(token),
      usuarioId: u.user.id,
      vence: new Date(Date.now() + 8 * 3600000),
    });
    return {
      token,
      userId: u.user.id,
      userName: u.user.nombre,
      userRole: u.user.rol,
      cambiarPassword: u.credential.cambiarPassword,
    };
  });
  if ("limited" in result)
    return c.json(
      { success: false, error: "Demasiados intentos. Espera 15 minutos" },
      429,
    );
  if ("invalid" in result)
    return c.json(
      { success: false, error: "Correo o contraseña incorrectos" },
      401,
    );
  c.header("Cache-Control", "no-store");
  return ok(c, result);
});
operaciones.route("/auth", recuperacion);
operaciones.use("*", authMiddleware);
operaciones.route("/", cuentas);
operaciones.route("/", granja);
operaciones.post("/auth/logout", async (c) => {
  await c.var.db
    .delete(s.sesiones)
    .where(
      eq(
        s.sesiones.hash,
        await digest(c.req.header("Authorization")!.slice(7)),
      ),
    );
  return ok(c, {});
});
operaciones.get("/equipo", async (c) =>
  ok(
    c,
    await c.var.db
      .select({
        id: s.usuarios.id,
        nombre: s.usuarios.nombre,
        rol: s.usuarios.rol,
      })
      .from(s.usuarios),
  ),
);
operaciones.get("/auth/me", async (c) => {
  const [u] = await c.var.db
    .select({
      id: s.usuarios.id,
      nombre: s.usuarios.nombre,
      rol: s.usuarios.rol,
    })
    .from(s.usuarios)
    .where(eq(s.usuarios.id, c.var.userId));
  return ok(c, { ...u, cambiarPassword: c.var.cambiarPassword });
});
operaciones.get("/galpones", async (c) => {
  rol(c, "encargado_galpon", "encargado_almacen");
  const rows = await c.var.db
    .select({ lote: s.lotesAves, galpon: s.galpones.nombre })
    .from(s.lotesAves)
    .innerJoin(s.galpones, eq(s.lotesAves.galponId, s.galpones.id))
    .where(and(eq(s.lotesAves.activo, true), eq(s.galpones.activo, true)))
    .orderBy(asc(s.galpones.nombre));
  return ok(
    c,
    rows.map((r) => ({
      ...r.lote,
      galpon: r.galpon,
      edad: r.lote.edadConfirmada
        ? edadSemanas(
            r.lote.fechaIngreso,
            r.lote.edadSemanasIngreso,
            fechaBolivia(),
          )
        : null,
      referencia: r.lote.edadConfirmada
        ? referenciaHyLine(
            edadSemanas(
              r.lote.fechaIngreso,
              r.lote.edadSemanasIngreso,
              fechaBolivia(),
            ),
          )
        : null,
    })),
  );
});
operaciones.get("/produccion", async (c) => {
  rol(c, "encargado_galpon");
  return ok(
    c,
    await c.var.db
      .select()
      .from(s.produccionDiaria)
      .orderBy(desc(s.produccionDiaria.fecha)),
  );
});
operaciones.post("/produccion", async (c) => {
  rol(c, "encargado_galpon");
  const d = await body(
    c,
    z.object({
      loteId: z.string().uuid(),
      fecha: dia,
      huevosSanos: z.number().int().nonnegative(),
      huevosRotos: z.number().int().nonnegative(),
      kgAlimento: z.number().finite().nonnegative().max(999999).optional(),
      aguaL: z.number().finite().nonnegative().max(999999).optional(),
      insumoId: z.string().uuid().optional(),
      tipoAlimento: texto.optional(),
      observaciones: z.string().max(300).default(""),
    }),
  );
  return write(c, d, async (tx) => {
    const l = await lote(tx, d.loteId, d.fecha);
    const aves = await avesEnFecha(tx, l, d.fecha);
    const total = d.huevosSanos + d.huevosRotos;
    if (aves <= 0 || total > aves)
      throw new AppError(
        400,
        "Revisa el censo: no puede haber más huevos diarios que aves vivas",
      );
    const [duplicate] = await tx
      .select()
      .from(s.produccionDiaria)
      .where(
        and(
          eq(s.produccionDiaria.loteId, d.loteId),
          eq(s.produccionDiaria.fecha, d.fecha),
        ),
      );
    if (duplicate)
      throw new AppError(
        409,
        "Ya existe una recolección para este lote y fecha",
      );
    if (d.kgAlimento !== undefined && d.kgAlimento > 0) {
      if (!d.insumoId)
        throw new AppError(400, "Selecciona el alimento utilizado del almacén");
      await insumoCambio(
        tx,
        {
          insumoId: d.insumoId,
          loteId: d.loteId,
          fecha: d.fecha,
          tipo: "SALIDA",
          cantidad: d.kgAlimento,
          costoTotal: 0,
          motivo: "Consumo diario del galpón",
        },
        c.var.userId,
        "ALIMENTO",
      );
    }
    const referencia = l.edadConfirmada
      ? referenciaHyLine(
          edadSemanas(l.fechaIngreso, l.edadSemanasIngreso, d.fecha),
        )
      : null;
    const racion =
      l.racionG ??
      (referencia
        ? (referencia.alimentoMin + referencia.alimentoMax) / 2
        : null);
    const [p] = await tx
      .insert(s.produccionDiaria)
      .values({
        loteId: d.loteId,
        fecha: d.fecha,
        maplesRecolectados: Math.floor(d.huevosSanos / 30),
        huevosSueltos: d.huevosSanos % 30,
        totalHuevos: total,
        huevosRotos: d.huevosRotos,
        kgAlimento: d.kgAlimento?.toFixed(2) ?? null,
        kgPlanificado:
          racion !== null ? ((aves * racion) / 1000).toFixed(2) : null,
        aguaPlanificadaL: referencia
          ? ((aves * (referencia.aguaMin + referencia.aguaMax)) / 2000).toFixed(
              2,
            )
          : null,
        aguaL: d.aguaL?.toFixed(2) ?? null,
        avesVivas: aves,
        tipoAlimento: d.tipoAlimento ?? null,
        observaciones: d.observaciones,
        pctPostura: ((total / aves) * 100).toFixed(2),
        fcr:
          total && d.kgAlimento !== undefined
            ? (d.kgAlimento / (total / 30)).toFixed(4)
            : null,
        registradoPor: c.var.userId,
      })
      .returning();
    return p;
  });
});
operaciones.post("/mortalidad", async (c) => {
  rol(c, "encargado_galpon");
  const d = await body(
    c,
    z.object({
      loteId: z.string().uuid(),
      fecha: dia,
      cantidad: z.number().int().positive(),
      causa: texto,
    }),
  );
  return write(c, d, async (tx) => {
    const l = await lote(tx, d.loteId, d.fecha);
    if (d.cantidad > l.avesActuales)
      throw new AppError(400, "Las bajas exceden las aves vivas");
    const posteriores = await tx
      .select()
      .from(s.produccionDiaria)
      .where(
        and(
          eq(s.produccionDiaria.loteId, l.id),
          gte(s.produccionDiaria.fecha, d.fecha),
        ),
      );
    for (const p of posteriores) {
      if (p.avesVivas !== null) {
        const vivas = p.avesVivas - d.cantidad;
        if (vivas < p.totalHuevos)
          throw new AppError(
            409,
            "La baja contradice una recolección existente; revisa fecha y cantidad",
          );
        await tx
          .update(s.produccionDiaria)
          .set({
            avesVivas: vivas,
            pctPostura: vivas
              ? ((p.totalHuevos / vivas) * 100).toFixed(2)
              : null,
          })
          .where(eq(s.produccionDiaria.id, p.id));
      }
    }
    const [b] = await tx
      .insert(s.mortalidadDiaria)
      .values({ ...d, registradoPor: c.var.userId })
      .returning();
    await tx
      .update(s.lotesAves)
      .set({ avesActuales: l.avesActuales - d.cantidad, updatedAt: new Date() })
      .where(eq(s.lotesAves.id, l.id));
    return b;
  });
});
operaciones.get("/sucesos", async (c) => {
  rol(c, "encargado_galpon");
  const [eventos, bajas] = await Promise.all([
    c.var.db
      .select()
      .from(s.sucesosGalpon)
      .orderBy(desc(s.sucesosGalpon.fecha)),
    c.var.db
      .select()
      .from(s.mortalidadDiaria)
      .orderBy(desc(s.mortalidadDiaria.fecha)),
  ]);
  return ok(
    c,
    [
      ...eventos,
      ...bajas.map((b) => ({
        ...b,
        tipo: "BAJA",
        descripcion: `${b.cantidad} bajas. ${b.causa}`,
      })),
    ].sort((a, b) => b.fecha.localeCompare(a.fecha)),
  );
});
operaciones.post("/sucesos", async (c) => {
  rol(c, "encargado_galpon");
  const d = await body(
    c,
    z.object({
      loteId: z.string().uuid(),
      fecha: dia,
      tipo: z.enum([
        "VACUNA",
        "VITAMINA",
        "DESPIQUE",
        "ALIMENTO",
        "OBSERVACION",
      ]),
      descripcion: texto,
      producto: z.string().max(150).optional(),
      dosis: z.string().max(100).optional(),
      proximaFecha: fecha.optional(),
    }),
  );
  if (d.proximaFecha && d.proximaFecha < d.fecha)
    throw new AppError(400, "La próxima fecha debe ser posterior al suceso");
  return write(c, d, async (tx) => {
    await lote(tx, d.loteId, d.fecha);
    const [e] = await tx
      .insert(s.sucesosGalpon)
      .values({ ...d, registradoPor: c.var.userId })
      .returning();
    return e;
  });
});
operaciones.get("/inventario", async (c) => {
  rol(c, "encargado_almacen");
  const [stock, movimientos, produccion] = await Promise.all([
    c.var.db
      .select()
      .from(s.inventarioStock)
      .orderBy(asc(s.inventarioStock.tallaId)),
    c.var.db
      .select()
      .from(s.movimientosInventario)
      .orderBy(desc(s.movimientosInventario.createdAt)),
    c.var.db
      .select()
      .from(s.produccionDiaria)
      .orderBy(desc(s.produccionDiaria.fecha)),
  ]);
  return ok(c, {
    stock,
    movimientos,
    pendientes: produccion
      .map((p) => ({
        ...p,
        pendientes:
          p.totalHuevos -
          p.huevosRotos -
          movimientos
            .filter((m) => m.referenciaId === p.id && m.tipo === "ENTRADA")
            .reduce((a, m) => a + m.cantidadMaples * 30 + m.cantidadSueltos, 0),
      }))
      .filter((p) => p.pendientes > 0),
  });
});
operaciones.post("/inventario/clasificar", async (c) => {
  rol(c, "encargado_almacen");
  const d = await body(
    c,
    z
      .object({
        produccionId: z.string().uuid(),
        fecha: dia,
        tallaId: talla,
        unidades: z.number().int().positive().optional(),
        cajas: z.number().int().nonnegative().max(100000).default(0),
        maples: z.number().int().min(0).max(11).default(0),
        sueltos: z.number().int().min(0).max(29).default(0),
      })
      .refine(
        (d) =>
          d.unidades === undefined ||
          (d.cajas === 0 && d.maples === 0 && d.sueltos === 0),
        "Usa unidades o cajas/maples/sueltos, no ambos",
      )
      .transform((d) => ({
        ...d,
        unidades: d.unidades ?? d.cajas * 360 + d.maples * 30 + d.sueltos,
      }))
      .refine((d) => d.unidades > 0, "Indica al menos una caja, maple o huevo"),
  );
  return write(c, d, async (tx) => {
    const [p] = await tx
      .select()
      .from(s.produccionDiaria)
      .where(eq(s.produccionDiaria.id, d.produccionId));
    if (!p || d.fecha < p.fecha)
      throw new AppError(400, "Recolección o fecha inválida");
    const anteriores = await tx
      .select()
      .from(s.movimientosInventario)
      .where(
        and(
          eq(s.movimientosInventario.referenciaId, p.id),
          eq(s.movimientosInventario.tipo, "ENTRADA"),
        ),
      );
    const disponible =
      p.totalHuevos -
      p.huevosRotos -
      anteriores.reduce(
        (a, m) => a + m.cantidadMaples * 30 + m.cantidadSueltos,
        0,
      );
    if (d.unidades > disponible)
      throw new AppError(
        400,
        "La clasificación excede los huevos sanos pendientes",
      );
    await stockCambio(
      tx,
      d.tallaId,
      d.unidades,
      {
        fecha: d.fecha,
        tipo: "ENTRADA",
        motivo: "Clasificación de recolección",
        referenciaId: p.id,
        referenciaTipo: "PRODUCCION",
      },
      c.var.userId,
    );
    return { clasificados: d.unidades };
  });
});
// A real warehouse may already contain eggs when recording begins.
operaciones.post("/inventario/inicial", async (c) => {
  rol(c);
  const d = await body(
    c,
    z.object({
      fecha: dia,
      tallaId: talla,
      cajas: z.number().int().min(0).max(100000),
      maples: z.number().int().min(0).max(11),
      sueltos: z.number().int().min(0).max(29),
    }),
  );
  return write(c, d, async (tx) => {
    const [st] = await tx
      .select()
      .from(s.inventarioStock)
      .where(eq(s.inventarioStock.tallaId, d.tallaId));
    if (!st)
      throw new AppError(400, "Inicializa primero el catálogo de tallas");
    const [prior] = await tx
      .select()
      .from(s.movimientosInventario)
      .where(eq(s.movimientosInventario.inventarioStockId, st.id))
      .limit(1);
    if (prior)
      throw new AppError(
        409,
        "Esta talla ya tiene movimientos. No se puede reemplazar su stock inicial",
      );
    const fisico = d.cajas * 360 + d.maples * 30 + d.sueltos;
    await stockCambio(
      tx,
      d.tallaId,
      fisico - st.maplesDisponibles * 30 - st.huevosSueltos,
      {
        fecha: d.fecha,
        tipo: "AJUSTE",
        motivo: `Stock inicial contado: ${fisico} huevos. Sin recolección histórica inventada.`,
      },
      c.var.userId,
    );
    return { tallaId: d.tallaId, inicial: fisico };
  });
});
operaciones.post("/inventario/merma", async (c) => {
  rol(c, "encargado_almacen");
  const d = await body(
    c,
    z.object({
      fecha: dia,
      tallaId: talla,
      unidades: z.number().int().positive(),
      motivo: texto,
    }),
  );
  return write(c, d, async (tx) => {
    await stockCambio(
      tx,
      d.tallaId,
      -d.unidades,
      { fecha: d.fecha, tipo: "MERMA", motivo: d.motivo },
      c.var.userId,
    );
    return { merma: d.unidades };
  });
});
async function insumoCambio(
  tx: Tx,
  d: {
    insumoId: string;
    loteId?: string;
    fecha: string;
    tipo: string;
    cantidad: number;
    costoTotal: number;
    motivo: string;
    vencimiento?: string;
  },
  uid: string,
  requiredTipo?: string,
) {
  const [i] = await tx
    .select()
    .from(s.insumos)
    .where(eq(s.insumos.id, d.insumoId));
  if (!i || (requiredTipo && i.tipo !== requiredTipo))
    throw new AppError(400, "Insumo inválido");
  const final =
    Number(i.stock) + (d.tipo === "ENTRADA" ? d.cantidad : -d.cantidad);
  if (final < -0.00001)
    throw new AppError(400, `Stock insuficiente de ${i.nombre}`);
  await tx
    .update(s.insumos)
    .set({ stock: Math.max(0, final).toFixed(3) })
    .where(eq(s.insumos.id, i.id));
  const [m] = await tx
    .insert(s.movimientosInsumos)
    .values({
      ...d,
      cantidad: d.cantidad.toFixed(3),
      costoTotal: d.costoTotal.toFixed(2),
      registradoPor: uid,
    })
    .returning();
  return m;
}
operaciones.get("/insumos", async (c) => {
  rol(c, "encargado_almacen", "encargado_galpon");
  const [insumos, movimientos] = await Promise.all([
    c.var.db.select().from(s.insumos).orderBy(asc(s.insumos.nombre)),
    c.var.db
      .select()
      .from(s.movimientosInsumos)
      .orderBy(desc(s.movimientosInsumos.createdAt)),
  ]);
  return ok(c, { insumos, movimientos });
});
operaciones.post("/insumos", async (c) => {
  rol(c, "encargado_almacen");
  const d = await body(
    c,
    z.object({
      nombre: z.string().trim().min(1).max(150),
      tipo: z.enum(["ALIMENTO", "VITAMINA", "VACUNA", "CAMA", "OTRO"]),
      unidad: z.enum(["kg", "litro", "unidad", "dosis"]),
      kgBolsa: z.coerce.number().positive().max(1000).default(44),
    }),
  );
  if (d.tipo === "ALIMENTO" && d.unidad !== "kg")
    throw new AppError(400, "Los alimentos se controlan en kg");
  return write(c, d, async (tx) => {
    const [dup] = await tx
      .select()
      .from(s.insumos)
      .where(eq(s.insumos.nombre, d.nombre));
    if (dup) throw new AppError(409, "Ya existe un insumo con ese nombre");
    const [i] = await tx
      .insert(s.insumos)
      .values({ ...d, kgBolsa: String(d.kgBolsa) })
      .returning();
    return i;
  });
});
operaciones.post("/insumos/movimientos", async (c) => {
  rol(c, "encargado_almacen");
  const d = await body(
    c,
    z.object({
      insumoId: z.string().uuid(),
      fecha: dia,
      tipo: z.enum(["ENTRADA", "SALIDA", "MERMA"]),
      cantidad,
      costoTotal: dinero.default(0),
      motivo: texto,
      vencimiento: fecha.optional(),
      pagarCaja: z.boolean().default(false),
    }),
  );
  if (d.pagarCaja && d.tipo !== "ENTRADA")
    throw new AppError(400, "Solo se pagan compras");
  return write(c, d, async (tx) => {
    const m = await insumoCambio(tx, d, c.var.userId);
    if (d.pagarCaja && d.costoTotal > 0)
      await caja(
        tx,
        {
          fecha: d.fecha,
          tipo: "EGRESO",
          monto: d.costoTotal,
          descripcion: "Compra de insumo: " + d.motivo,
        },
        c.var.userId,
      );
    return m;
  });
});
operaciones.get("/ventas", async (c) => {
  rol(c, "encargado_almacen");
  const [clientes, notas, detalles, pagos] = await Promise.all([
    c.var.db.select().from(s.clientes).orderBy(asc(s.clientes.nombre)),
    c.var.db
      .select()
      .from(s.notasRemision)
      .orderBy(desc(s.notasRemision.numeroNota)),
    c.var.db.select().from(s.detalleRemision),
    c.var.db.select().from(s.pagos).orderBy(desc(s.pagos.createdAt)),
  ]);
  return ok(c, {
    clientes,
    notas: notas.map((n) => ({
      ...n,
      cliente: clientes.find((x) => x.id === n.clienteId)?.nombre,
      pagado:
        pagos
          .filter((p) => p.notaId === n.id)
          .reduce((a, p) => a + centavos(p.monto), 0) / 100,
    })),
    detalles,
    pagos,
  });
});
operaciones.post("/clientes", async (c) => {
  rol(c, "encargado_almacen");
  const d = await body(
    c,
    z.object({
      nombre: z.string().trim().min(1).max(150),
      telefono: z.string().max(30).default(""),
      direccion: z.string().max(300).default(""),
    }),
  );
  return write(c, d, async (tx) => {
    const [r] = await tx.insert(s.clientes).values(d).returning();
    return r;
  });
});
operaciones.post("/ventas", async (c) => {
  rol(c, "encargado_almacen");
  const d = await body(
    c,
    z.object({
      clienteId: z.string().uuid(),
      fecha: dia,
      destino: z.string().trim().min(1).max(250),
      pagado: dinero,
      items: z
        .array(
          z.object({
            tallaId: talla,
            cajas: z.number().int().nonnegative(),
            maples: z.number().int().nonnegative(),
            sueltos: z.number().int().min(0).max(29),
            precioMaple: positivo,
          }),
        )
        .min(1)
        .max(30),
    }),
  );
  return write(c, d, async (tx) => {
    const [cliente] = await tx
      .select()
      .from(s.clientes)
      .where(and(eq(s.clientes.id, d.clienteId), eq(s.clientes.activo, true)));
    if (!cliente) throw new AppError(400, "Cliente inválido");
    const lines = d.items.map((i) => {
      const unidades = (i.cajas * 12 + i.maples) * 30 + i.sueltos;
      if (!unidades)
        throw new AppError(400, "Cada línea requiere al menos un huevo");
      return {
        ...i,
        unidades,
        subtotal: Math.round((unidades * centavos(i.precioMaple)) / 30),
      };
    });
    const total = lines.reduce((a, i) => a + i.subtotal, 0),
      abonado = centavos(d.pagado);
    if (abonado > total) throw new AppError(400, "El pago supera el total");
    const [nota] = await tx
      .insert(s.notasRemision)
      .values({
        clienteId: d.clienteId,
        fecha: d.fecha,
        destino: d.destino,
        tipoPago: abonado === total ? "CONTADO" : "CREDITO",
        subtotal: (total / 100).toFixed(2),
        total: (total / 100).toFixed(2),
        estado:
          abonado === total ? "PAGADA" : abonado ? "PARCIAL" : "PENDIENTE",
        registradoPor: c.var.userId,
      })
      .returning();
    for (const i of lines) {
      await stockCambio(
        tx,
        i.tallaId,
        -i.unidades,
        {
          fecha: d.fecha,
          tipo: "SALIDA",
          motivo: `Despacho remisión ${nota.numeroNota} a ${d.destino}`,
          referenciaId: nota.id,
          referenciaTipo: "NOTA_REMISION",
        },
        c.var.userId,
      );
      await tx.insert(s.detalleRemision).values({
        notaId: nota.id,
        tallaId: i.tallaId,
        cantidadMaples: Math.floor(i.unidades / 30),
        cantidadSueltos: i.unidades % 30,
        precioUnitarioMaple: i.precioMaple.toFixed(2),
        subtotalLinea: (i.subtotal / 100).toFixed(2),
      });
    }
    await tx
      .update(s.clientes)
      .set({
        saldoPendiente: sql`${s.clientes.saldoPendiente} + ${((total - abonado) / 100).toFixed(2)}::numeric`,
      })
      .where(eq(s.clientes.id, d.clienteId));
    if (abonado > 0) {
      await tx.insert(s.pagos).values({
        notaId: nota.id,
        clienteId: d.clienteId,
        monto: d.pagado.toFixed(2),
        fecha: d.fecha,
        metodoPago: "EFECTIVO",
        registradoPor: c.var.userId,
      });
      await caja(
        tx,
        {
          fecha: d.fecha,
          tipo: "INGRESO",
          monto: d.pagado,
          descripcion: `Cobro remisión ${nota.numeroNota} — ${cliente.nombre}`,
        },
        c.var.userId,
      );
    }
    return nota;
  });
});
operaciones.post("/pagos", async (c) => {
  rol(c, "encargado_almacen");
  const d = await body(
    c,
    z.object({
      notaId: z.string().uuid(),
      monto: positivo,
      fecha: dia,
      notas: z.string().max(300).default(""),
    }),
  );
  return write(c, d, async (tx) => {
    const [n] = await tx
      .select()
      .from(s.notasRemision)
      .where(eq(s.notasRemision.id, d.notaId));
    if (!n || n.estado === "ANULADA")
      throw new AppError(404, "Nota no encontrada");
    if (d.fecha < n.fecha)
      throw new AppError(400, "El pago es anterior a la venta");
    const pagos = await tx
      .select()
      .from(s.pagos)
      .where(eq(s.pagos.notaId, n.id));
    const abonado = pagos.reduce((a, p) => a + centavos(p.monto), 0),
      nuevo = abonado + centavos(d.monto);
    if (nuevo > centavos(n.total))
      throw new AppError(400, "El pago excede el saldo pendiente");
    const [p] = await tx
      .insert(s.pagos)
      .values({
        ...d,
        monto: d.monto.toFixed(2),
        clienteId: n.clienteId,
        registradoPor: c.var.userId,
      })
      .returning();
    await tx
      .update(s.notasRemision)
      .set({ estado: nuevo === centavos(n.total) ? "PAGADA" : "PARCIAL" })
      .where(eq(s.notasRemision.id, n.id));
    await tx
      .update(s.clientes)
      .set({
        saldoPendiente: sql`${s.clientes.saldoPendiente} - ${d.monto.toFixed(2)}::numeric`,
      })
      .where(eq(s.clientes.id, n.clienteId));
    await caja(
      tx,
      {
        fecha: d.fecha,
        tipo: "INGRESO",
        monto: d.monto,
        descripcion: `Abono remisión ${n.numeroNota}. ${d.notas}`.slice(0, 300),
      },
      c.var.userId,
    );
    return p;
  });
});
operaciones.get("/caja", async (c) => {
  const admin = c.var.userRole === "administrador";
  const movimientos = await c.var.db
    .select()
    .from(s.movimientosCaja)
    .where(
      admin ? undefined : eq(s.movimientosCaja.registradoPor, c.var.userId),
    )
    .orderBy(desc(s.movimientosCaja.fecha), desc(s.movimientosCaja.createdAt));
  const arqueos = admin
    ? await c.var.db
        .select()
        .from(s.arqueosSemanales)
        .orderBy(desc(s.arqueosSemanales.fechaFin))
    : [];
  return ok(c, {
    movimientos,
    arqueos,
    saldo: admin
      ? movimientos.reduce(
          (a, m) => a + (m.tipo === "INGRESO" ? 1 : -1) * centavos(m.monto),
          0,
        ) / 100
      : null,
  });
});
operaciones.post("/caja", async (c) => {
  const d = await body(
    c,
    z.object({
      fecha: dia,
      tipo: z.enum(["INGRESO", "EGRESO"]),
      monto: positivo,
      descripcion: texto,
      categoria: z
        .enum([
          "ALIMENTO",
          "INSUMOS_VITAMINAS",
          "MAPLES_VACIOS",
          "TRANSPORTE_FLETE",
          "VETERINARIA",
          "VARIOS",
        ])
        .default("VARIOS"),
    }),
  );
  if (d.tipo === "INGRESO") rol(c);
  return write(c, d, (tx) => caja(tx, d, c.var.userId));
});
operaciones.post("/arqueos", async (c) => {
  rol(c);
  const d = await body(
    c,
    z.object({
      fechaInicio: dia,
      fechaFin: dia,
      saldoReal: dinero,
      notas: z.string().max(1000).default(""),
    }),
  );
  const start = new Date(d.fechaInicio + "T12:00:00Z"),
    end = new Date(d.fechaFin + "T12:00:00Z");
  if (
    start.getUTCDay() !== 1 ||
    end.getUTCDay() !== 0 ||
    end.getTime() - start.getTime() !== 6 * 86400000 ||
    d.fechaFin >= fechaBolivia()
  )
    throw new AppError(
      400,
      "Selecciona una semana completa de lunes a domingo ya finalizada",
    );
  return write(c, d, async (tx) => {
    const [prev] = await tx
      .select()
      .from(s.arqueosSemanales)
      .where(gte(s.arqueosSemanales.fechaFin, d.fechaInicio))
      .limit(1);
    if (prev)
      throw new AppError(
        409,
        "Este período ya está cerrado o precede a un arqueo existente",
      );
    const movimientos = await tx
      .select()
      .from(s.movimientosCaja)
      .where(lte(s.movimientosCaja.fecha, d.fechaFin));
    let apertura = 0,
      ing = 0,
      egr = 0;
    for (const m of movimientos) {
      const v = centavos(m.monto);
      if (m.fecha < d.fechaInicio) apertura += m.tipo === "INGRESO" ? v : -v;
      else if (m.tipo === "INGRESO") ing += v;
      else egr += v;
    }
    const esperado = apertura + ing - egr,
      diferencia = centavos(d.saldoReal) - esperado;
    if (diferencia !== 0 && !d.notas.trim())
      throw new AppError(400, "Explica la diferencia para dejar constancia");
    const [r] = await tx
      .insert(s.arqueosSemanales)
      .values({
        ...d,
        saldoReal: d.saldoReal.toFixed(2),
        saldoAnterior: (apertura / 100).toFixed(2),
        totalIngresos: (ing / 100).toFixed(2),
        totalEgresos: (egr / 100).toFixed(2),
        saldoEsperado: (esperado / 100).toFixed(2),
        diferencia: (diferencia / 100).toFixed(2),
        conciliado: diferencia === 0,
        registradoPor: c.var.userId,
      })
      .returning();
    return r;
  });
});

export async function analisis(db: DB) {
  const hoy = fechaBolivia();
  const ultima = semanaAnteriorCompleta(hoy);
  const anterior = semanaAnteriorCompleta(ultima.desde);
  const [lotes, produccion, bajas, insumos] = await Promise.all([
    db
      .select({ lote: s.lotesAves, galpon: s.galpones.nombre })
      .from(s.lotesAves)
      .innerJoin(s.galpones, eq(s.lotesAves.galponId, s.galpones.id))
      .where(and(eq(s.lotesAves.activo, true), eq(s.galpones.activo, true))),
    db.select().from(s.produccionDiaria).orderBy(asc(s.produccionDiaria.fecha)),
    db.select().from(s.mortalidadDiaria),
    db.select().from(s.insumos),
  ]);
  function resumen(id: string, desde: string, hasta: string) {
    const rows = produccion.filter(
      (p) =>
        p.loteId === id &&
        p.fecha >= desde &&
        p.fecha <= hasta &&
        p.avesVivas !== null,
    );
    const aveDias = rows.reduce((a, p) => a + p.avesVivas!, 0),
      huevos = rows.reduce((a, p) => a + p.totalHuevos, 0),
      kg = rows.reduce((a, p) => a + Number(p.kgAlimento), 0),
      agua = rows.reduce((a, p) => a + Number(p.aguaL ?? 0), 0);
    return {
      dias: rows.length,
      aveDias,
      huevos,
      kg,
      agua,
      postura: aveDias ? (huevos / aveDias) * 100 : null,
      alimento:
        aveDias && rows.every((p) => p.kgAlimento !== null)
          ? (kg * 1000) / aveDias
          : null,
      alimentoEstimado:
        aveDias && rows.every((p) => p.kgPlanificado !== null)
          ? (rows.reduce((a, p) => a + Number(p.kgPlanificado), 0) * 1000) /
            aveDias
          : null,
      aguaPorAve: rows.some((p) => p.aguaL === null)
        ? null
        : aveDias
          ? (agua * 1000) / aveDias
          : null,
    };
  }
  const lotesData = lotes.map(({ lote: l, galpon }) => {
    const edad = l.edadConfirmada
        ? edadSemanas(l.fechaIngreso, l.edadSemanasIngreso, hoy)
        : null,
      ref = edad !== null ? referenciaHyLine(edad) : null;
    const actual = resumen(l.id, ultima.desde, ultima.hasta),
      previo = resumen(l.id, anterior.desde, anterior.hasta);
    const serie = produccion
      .filter((p) => p.loteId === l.id)
      .map((p) => {
        const r = l.edadConfirmada
          ? referenciaHyLine(
              edadSemanas(l.fechaIngreso, l.edadSemanasIngreso, p.fecha),
            )
          : null;
        return {
          fecha: p.fecha,
          postura: p.avesVivas ? (p.totalHuevos / p.avesVivas) * 100 : null,
          min: r?.posturaMin ?? null,
          max: r?.posturaMax ?? null,
          alimento:
            p.avesVivas && p.kgAlimento !== null
              ? (Number(p.kgAlimento) * 1000) / p.avesVivas
              : null,
          agua:
            p.avesVivas && p.aguaL !== null
              ? (Number(p.aguaL) * 1000) / p.avesVivas
              : null,
        };
      });
    return {
      ...l,
      galpon,
      edad,
      referencia: ref,
      actual,
      previo,
      serie,
      mortalidad: l.avesIniciales
        ? ((l.avesIniciales - l.avesActuales) / l.avesIniciales) * 100
        : 0,
      bajasSemana: bajas
        .filter(
          (b) =>
            b.loteId === l.id &&
            b.fecha >= ultima.desde &&
            b.fecha <= ultima.hasta,
        )
        .reduce((a, b) => a + b.cantidad, 0),
    };
  });
  const consumoMin = lotesData.reduce(
      (a, l) =>
        a +
        (l.referencia ? (l.avesActuales * l.referencia.alimentoMin) / 1000 : 0),
      0,
    ),
    consumoMax = lotesData.reduce(
      (a, l) =>
        a +
        (l.referencia ? (l.avesActuales * l.referencia.alimentoMax) / 1000 : 0),
      0,
    );
  const referenciasCompletas = lotesData.every(
    (l) => l.avesActuales === 0 || l.referencia !== null,
  );
  const alimentoKg = insumos
    .filter((i) => i.tipo === "ALIMENTO")
    .reduce((a, i) => a + Number(i.stock), 0);
  return {
    hoy,
    semana: ultima,
    semanaPrevia: anterior,
    lotes: lotesData,
    alimentoKg,
    consumoMin,
    consumoMax,
    coberturaMin:
      referenciasCompletas && consumoMax ? alimentoKg / consumoMax : null,
    coberturaMax:
      referenciasCompletas && consumoMin ? alimentoKg / consumoMin : null,
    fuente: "Hy-Line Brown · diciembre 2025 · pp. 4–6; nutrición pp. 13–18",
  };
}
operaciones.get("/analisis", async (c) => {
  rol(c);
  return ok(c, await analisis(c.var.db));
});
operaciones.get("/notificaciones", async (c) => {
  const datos = await analisis(c.var.db);
  const leidas = await c.var.db
    .select()
    .from(s.lecturasNotificaciones)
    .where(eq(s.lecturasNotificaciones.usuarioId, c.var.userId));
  const items = datos.lotes.map((l) => {
    const completa = l.actual.dias === 7 && l.previo.dias === 7;
    const cambio =
      completa && l.actual.postura !== null && l.previo.postura !== null
        ? l.actual.postura - l.previo.postura
        : null;
    const consumo =
      completa && l.actual.alimento !== null && l.previo.alimento !== null
        ? l.actual.alimento - l.previo.alimento
        : null;
    return {
      id: `semanal:${datos.semana.desde}:${l.id}`,
      titulo: `${l.galpon} · ${datos.semana.desde} al ${datos.semana.hasta}`,
      texto: completa
        ? `Postura ${l.actual.postura!.toFixed(1)}% (${cambio!.toFixed(1)} puntos frente a la semana anterior). Alimento ${l.actual.alimento !== null ? l.actual.alimento.toFixed(1) + " g/ave/día medidos" + (consumo !== null ? " (" + consumo.toFixed(1) + " g de variación)" : "") : l.actual.alimentoEstimado !== null ? l.actual.alimentoEstimado.toFixed(1) + " g/ave/día estimados por ración; sin medición" : "sin medición ni ración confirmada"}. Agua: ${l.actual.aguaPorAve === null ? "sin medición completa" : l.actual.aguaPorAve.toFixed(1) + " ml/ave/día"}. Bajas: ${l.bajasSemana}.`
        : `Resumen incompleto: ${l.actual.dias}/7 días esta semana y ${l.previo.dias}/7 la anterior. No se estima variación. Bajas registradas: ${l.bajasSemana}.`,
    };
  });
  if (datos.coberturaMin !== null && datos.coberturaMin < 7)
    items.push({
      id: `alimento:${datos.semana.desde}`,
      titulo: "Revisar alimento en almacén",
      texto: `Cobertura estimada de ${datos.coberturaMin.toFixed(1)} a ${datos.coberturaMax!.toFixed(1)} días para toda la granja; revisar disponibilidad por tipo de alimento.`,
    });
  if (c.var.userRole !== "encargado_almacen") {
    const sucesos = await c.var.db
      .select()
      .from(s.sucesosGalpon)
      .where(lte(s.sucesosGalpon.proximaFecha, datos.hoy));
    for (const e of sucesos)
      items.push({
        id: `suceso:${e.id}`,
        titulo: "Seguimiento de galpón pendiente",
        texto: `${e.tipo}: ${e.producto || e.descripcion}. Fecha programada ${e.proximaFecha}. Revisa la bitácora.`,
      });
  }
  return ok(
    c,
    items.map((i) => ({
      ...i,
      leida: leidas.some((l) => l.clave === c.var.userId + ":" + i.id),
    })),
  );
});
operaciones.post("/notificaciones/leer", async (c) => {
  const d = await body(c, z.object({ id: z.string().max(120) }));
  await c.var.db
    .insert(s.lecturasNotificaciones)
    .values({ clave: c.var.userId + ":" + d.id, usuarioId: c.var.userId })
    .onConflictDoNothing();
  return ok(c, {});
});
