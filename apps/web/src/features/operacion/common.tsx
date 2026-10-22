import { useState, useRef, type ReactNode, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/features/auth/auth-store";
import { fechaBolivia, moneda } from "@erp-avicola/shared";
export { fechaBolivia, moneda };
export type Row = Record<string, any>;
export function useData<T = Row[]>(path: string, enabled = true) {
  const id = useAuthStore((s) => s.userId);
  return useQuery({
    queryKey: [id, path],
    enabled,
    refetchInterval: path === "/notificaciones" ? 60000 : false,
    queryFn: async () => (await apiClient<{ data: T }>(path)).data,
  });
}
export function State({
  query,
  children,
}: {
  query: { isPending: boolean; error: Error | null };
  children: ReactNode;
}) {
  if (query.isPending)
    return (
      <p role="status" className="p-6 text-slate-500">
        Cargando registros…
      </p>
    );
  if (query.error)
    return (
      <p role="alert" className="p-4 bg-red-50 text-red-800 rounded-xl">
        {query.error.message}{" "}
        <button className="underline" onClick={() => location.reload()}>
          Reintentar
        </button>
      </p>
    );
  return <>{children}</>;
}
export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
export function Page({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}
export function Stats({ items }: { items: [string, ReactNode][] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="bg-white border border-slate-200 p-4 rounded-xl"
        >
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-bold text-emerald-900 mt-1">
            {value ?? "Sin datos"}
          </p>
        </div>
      ))}
    </div>
  );
}
export type Field = {
  name: string;
  label: string;
  type?: string;
  options?: [string, string][];
  value?: string | number;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number;
  help?: string;
  emptyMessage?: string;
};
export function useOperationalPost() {
  const pending = useRef<{ path: string; body: string; key: string } | null>(
    null,
  );
  return async (path: string, data: Row) => {
    const body = JSON.stringify(data);
    if (
      !pending.current ||
      pending.current.path !== path ||
      pending.current.body !== body
    ) {
      pending.current = { path, body, key: crypto.randomUUID() };
    }
    const result = await apiClient(path, {
      method: "POST",
      body,
      headers: { "X-Idempotency-Key": pending.current.key },
    });
    pending.current = null;
    return result;
  };
}
export function ActionForm({
  title,
  path,
  fields,
  transform,
  after,
  children,
}: {
  title: string;
  path: string;
  fields: Field[];
  transform?: (data: Row) => Row;
  after?: () => void;
  children?: ReactNode;
}) {
  const missing = fields.filter(
    (f) => f.options && !f.options.length && f.required !== false,
  );
  const cache = useQueryClient();
  const post = useOperationalPost();
  const [pending, setPending] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const data: Row = {};
    for (const f of fields) {
      const value = fd.get(f.name);
      if (value === "" && f.required === false) continue;
      data[f.name] =
        f.type === "number"
          ? Number(value)
          : f.type === "checkbox"
            ? value === "on"
            : value;
    }
    setPending(true);
    setMessage("");
    setError("");
    try {
      await post(path, transform ? transform(data) : data);
      await cache.invalidateQueries();
      setMessage("Registro guardado.");
      after?.();
      form.reset();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  return (
    <Panel title={title}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {fields.map((f) => (
            <label className="text-sm text-slate-700 block" key={f.name}>
              <span className="block font-medium mb-1">{f.label}</span>
              {f.options ? (
                <select
                  name={f.name}
                  required={f.required !== false}
                  key={f.options.map((o) => o[0]).join(",")}
                  disabled={!f.options.length || pending}
                  defaultValue={
                    f.value ?? (f.options.length === 1 ? f.options[0][0] : "")
                  }
                  className="op-input"
                >
                  <option value="">
                    {f.options.length
                      ? "Seleccionar…"
                      : (f.emptyMessage ?? "No hay opciones disponibles")}
                  </option>
                  {f.options.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={f.type === "checkbox" ? "h-5 w-5" : "op-input"}
                  name={f.name}
                  type={f.type ?? "text"}
                  required={
                    f.type === "checkbox" ? false : f.required !== false
                  }
                  defaultValue={f.type === "checkbox" ? undefined : f.value}
                  min={f.min ?? (f.type === "number" ? 0 : undefined)}
                  max={
                    f.max ?? (f.type === "date" ? fechaBolivia() : undefined)
                  }
                  step={f.step ?? (f.type === "number" ? 1 : undefined)}
                  maxLength={f.type === "text" || !f.type ? 300 : undefined}
                />
              )}
              {f.help && (
                <span className="text-xs text-slate-500">{f.help}</span>
              )}
            </label>
          ))}
        </div>
        {children}
        {missing.map((f) => (
          <p key={f.name} role="status" className="text-sm text-amber-800">
            {f.emptyMessage ??
              `No hay registros disponibles para ${f.label.toLowerCase()}. Completa primero el registro previo.`}
          </p>
        ))}
        {error && (
          <p role="alert" className="text-red-700 text-sm">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-emerald-800 text-sm">
            {message}
          </p>
        )}
        <button
          disabled={pending || !navigator.onLine || missing.length > 0}
          className="op-button"
        >
          {pending ? "Guardando…" : "Guardar registro"}
        </button>
      </form>
    </Panel>
  );
}
export function Table({
  rows,
  columns,
}: {
  rows: Row[];
  columns: [string, string | ((row: Row) => ReactNode)][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr>
            {columns.map(([label]) => (
              <th
                key={label}
                className="py-2 px-3 text-xs text-slate-500 border-b whitespace-nowrap"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((r, i) => (
              <tr key={r.id ?? i} className="border-b border-slate-100">
                {columns.map(([label, col]) => (
                  <td key={label} className="px-3 py-3 align-top">
                    {typeof col === "function" ? col(r) : String(r[col] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="p-6 text-slate-500">
                No hay registros en este período.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
export const dateField: Field = {
  name: "fecha",
  label: "Fecha",
  type: "date",
  value: fechaBolivia(),
};
export const tallas: [string, string][] = [
  "P",
  "CH",
  "M",
  "G",
  "XG",
  "XXG",
].map((t) => [t, t]);
export const num = (n: number | null | undefined, digits = 1) =>
  n === null || n === undefined ? "Sin datos" : Number(n).toFixed(digits);
export function csv(filename: string, rows: (string | number)[][]) {
  const text =
    "\uFEFF" +
    rows
      .map((r) =>
        r
          .map(
            (v) =>
              '"' +
              String(v)
                .replace(/"/g, '""')
                .replace(/^[=+@-]/, "'") +
              '"',
          )
          .join(";"),
      )
      .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
