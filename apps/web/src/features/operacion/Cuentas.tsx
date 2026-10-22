import { useState, useEffect, type FormEvent } from "react";
import { create } from "zustand";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/features/auth/auth-store";
import { Page, Panel, State, Table, useData, type Row } from "./common";
const useCodigo = create<{
  codigo: string | null;
  set: (s: string | null) => void;
}>((set) => ({ codigo: null, set: (codigo) => set({ codigo }) }));
export function CodigoRespaldo() {
  const { codigo, set } = useCodigo();
  const nav = useNavigate();
  const cache = useQueryClient();
  useEffect(() => {
    useAuthStore.getState().logout();
    cache.clear();
  }, [cache]);
  return (
    <main className="max-w-lg mx-auto p-6 space-y-5">
      <h1 className="text-2xl font-bold">Contraseña actualizada</h1>
      {codigo ? (
        <>
          <p>
            Guarda este código fuera de la aplicación. Permite recuperar tu
            cuenta una sola vez. Se muestra únicamente ahora; el anterior dejó
            de funcionar.
          </p>
          <code className="block break-all bg-amber-50 border p-4 rounded-xl select-all">
            {codigo}
          </code>
          <button
            className="op-button"
            onClick={() => {
              set(null);
              nav("/login");
            }}
          >
            Guardé mi código. Iniciar sesión
          </button>
        </>
      ) : (
        <Link to="/login" className="underline">
          Iniciar sesión con tu nueva contraseña
        </Link>
      )}
    </main>
  );
}
function AltaCuenta({ created }: { created: (r: Row) => void }) {
  const cache = useQueryClient(),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget,
      fd = new FormData(f);
    setPending(true);
    setError("");
    try {
      const r = await apiClient<{ data: Row }>("/cuentas", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(fd)),
      });
      created(r.data);
      f.reset();
      await cache.invalidateQueries();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  return (
    <Panel title="Crear cuenta">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <label>
            Nombre
            <input
              name="nombre"
              className="op-input"
              maxLength={150}
              required
            />
          </label>
          <label>
            Correo
            <input
              name="email"
              className="op-input"
              type="email"
              maxLength={254}
              required
            />
          </label>
          <label>
            Perfil
            <select name="rol" className="op-input" required>
              <option value="encargado_galpon">Encargado de galpón</option>
              <option value="encargado_almacen">Encargado de almacén</option>
              <option value="administrador">Administrador</option>
            </select>
          </label>
        </div>
        <p className="text-sm text-slate-500">
          Se generará una contraseña temporal. La persona debe cambiarla al
          ingresar y guardar su código de recuperación.
        </p>
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
        <button disabled={pending} className="op-button">
          Crear cuenta
        </button>
      </form>
    </Panel>
  );
}
export function Cuentas() {
  const q = useData("/cuentas"),
    cache = useQueryClient();
  const [cred, setCred] = useState<Row | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const id = useAuthStore((s) => s.userId);
  async function gestionar(user: Row, reset: boolean) {
    setBusy(true);
    setError("");
    setCred(null);
    try {
      const result = await apiClient<{ data: Row }>(
        `/cuentas/${user.id}/${reset ? "restablecer" : "estado"}`,
        {
          method: "POST",
          body: JSON.stringify(reset ? {} : { activo: !user.activo }),
        },
      );
      if (reset) setCred(result.data);
      await cache.invalidateQueries();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Page
      title="Cuentas y acceso"
      description="Crea usuarios reales y administra su acceso por perfil. No se puede elegir un rol al iniciar sesión."
    >
      <AltaCuenta created={setCred} />
      {cred && (
        <Panel title="Entrega esta contraseña temporal de forma privada">
          <p>
            Correo: <strong>{cred.email}</strong>
          </p>
          <code className="block break-all bg-amber-50 p-3 select-all">
            {cred.password}
          </code>
          <p className="text-sm text-slate-500">
            Se muestra una vez. No se enviaron correos. Al restablecer se
            cerraron las sesiones y se anuló el código anterior.
          </p>
          <button className="underline" onClick={() => setCred(null)}>
            Ya la guardé, ocultar
          </button>
        </Panel>
      )}
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      <State query={q}>
        <Panel title="Usuarios registrados">
          <Table
            rows={q.data ?? []}
            columns={[
              ["Nombre", "nombre"],
              ["Correo", "email"],
              ["Perfil", "rol"],
              ["Estado", (r) => (r.activo ? "Activa" : "Desactivada")],
              [
                "Acciones",
                (r) =>
                  r.id === id ? (
                    "Mi cuenta"
                  ) : (
                    <div className="flex gap-3">
                      <button
                        disabled={busy || !r.activo}
                        className="text-emerald-800 underline"
                        onClick={() => gestionar(r, true)}
                      >
                        Nueva contraseña temporal
                      </button>
                      <button
                        disabled={busy}
                        className="underline"
                        onClick={() => gestionar(r, false)}
                      >
                        {r.activo ? "Desactivar" : "Reactivar"}
                      </button>
                    </div>
                  ),
              ],
            ]}
          />
        </Panel>
      </State>
    </Page>
  );
}
export function MiCuenta() {
  const q = useData<Row>("/auth/me"),
    nav = useNavigate(),
    cache = useQueryClient();
  const [error, setError] = useState(""),
    [pending, setPending] = useState(false),
    [codigo, setCodigo] = useState("");
  async function cambiar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("password") !== f.get("repetir")) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }
    setPending(true);
    setError("");
    try {
      const r = await apiClient<{ data: { codigo: string } }>(
        "/auth/password",
        {
          method: "POST",
          body: JSON.stringify({
            actual: f.get("actual"),
            password: f.get("password"),
          }),
        },
      );
      useCodigo.getState().set(r.data.codigo);
      nav("/codigo-respaldo");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  async function respaldo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const r = await apiClient<{ data: { codigo: string } }>(
        "/auth/codigo-respaldo",
        {
          method: "POST",
          body: JSON.stringify({
            password: new FormData(e.currentTarget).get("password"),
          }),
        },
      );
      setCodigo(r.data.codigo);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  return (
    <Page
      title="Mi cuenta"
      description="Contraseña personal y recuperación mediante código de respaldo."
    >
      <State query={q}>
        {q.data?.cambiarPassword && (
          <p role="status" className="p-4 bg-amber-50 rounded-xl">
            Tu contraseña es temporal. Cámbiala antes de registrar operaciones.
          </p>
        )}
        <Panel title="Cambiar contraseña">
          <form onSubmit={cambiar} className="space-y-4">
            <label className="block">
              Contraseña actual / temporal
              <input
                type="password"
                autoComplete="current-password"
                name="actual"
                className="op-input"
                required
              />
            </label>
            <label className="block">
              Nueva contraseña
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                className="op-input"
                required
              />
            </label>
            <label className="block">
              Repetir nueva contraseña
              <input
                type="password"
                name="repetir"
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                className="op-input"
                required
              />
            </label>
            <p className="text-sm text-slate-500">
              Usa al menos 12 caracteres. Se cerrarán todas tus sesiones y
              recibirás un nuevo código de recuperación para guardar.
            </p>
            <button className="op-button" disabled={pending}>
              Guardar nueva contraseña
            </button>
          </form>
        </Panel>
        {!q.data?.cambiarPassword && (
          <Panel title="Renovar código de recuperación">
            <form onSubmit={respaldo} className="space-y-3">
              <label>
                Confirma tu contraseña
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  className="op-input"
                  required
                />
              </label>
              <button disabled={pending} className="op-button">
                Generar nuevo código
              </button>
            </form>
            {codigo && (
              <div>
                <code className="block break-all bg-amber-50 p-3 mt-3 select-all">
                  {codigo}
                </code>
                <p className="text-sm">
                  Guárdalo fuera de la aplicación. El anterior dejó de
                  funcionar.
                </p>
              </div>
            )}
          </Panel>
        )}
      </State>
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
    </Page>
  );
}
export function RecuperarCuenta() {
  const [error, setError] = useState(""),
    [done, setDone] = useState(false),
    [pending, setPending] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("password") !== f.get("repetir")) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setPending(true);
    setError("");
    try {
      await apiClient("/auth/recuperar", {
        method: "POST",
        body: JSON.stringify({
          email: f.get("email"),
          codigo: f.get("codigo"),
          password: f.get("password"),
        }),
      });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  return (
    <main className="max-w-lg mx-auto p-6 space-y-5">
      <h1 className="text-2xl font-bold">Recuperar cuenta</h1>
      <p className="text-sm text-slate-600">
        Usa tu código de respaldo de un solo uso. Si no lo tienes, solicita una
        contraseña temporal a administración. El administrador debe conservar su
        propio código.
      </p>
      {done ? (
        <p role="status">
          Contraseña restablecida. Inicia sesión y genera un nuevo código desde
          Mi cuenta.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {[
            ["email", "Correo", "email"],
            ["codigo", "Código de recuperación", "text"],
            ["password", "Nueva contraseña", "password"],
            ["repetir", "Repetir contraseña", "password"],
          ].map(([name, label, type]) => (
            <label key={name} className="block">
              {label}
              <input
                name={name}
                type={type}
                className="op-input"
                required
                minLength={type === "password" ? 12 : undefined}
                maxLength={type === "password" ? 128 : 254}
                autoComplete={type === "password" ? "new-password" : "off"}
              />
            </label>
          ))}
          {error && (
            <p role="alert" className="text-red-700">
              {error}
            </p>
          )}
          <button disabled={pending} className="op-button">
            Restablecer contraseña
          </button>
        </form>
      )}
      <Link to="/login" className="block underline text-emerald-800">
        Volver al inicio de sesión
      </Link>
    </main>
  );
}
