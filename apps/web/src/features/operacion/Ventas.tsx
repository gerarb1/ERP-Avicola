import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Page,
  Panel,
  State,
  Table,
  ActionForm,
  useData,
  useOperationalPost,
  dateField,
  tallas,
  moneda,
  fechaBolivia,
  type Row,
} from "./common";
export function Ventas() {
  const q = useData<Row>("/ventas");
  const cache = useQueryClient();
  const post = useOperationalPost();
  const [lines, setLines] = useState([
    { tallaId: "M", cajas: 0, maples: 1, sueltos: 0, precioMaple: 30 },
  ]);
  const [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [pending, setPending] = useState(false),
    [selected, setSelected] = useState("");
  const total = lines.reduce(
    (a, l) =>
      a +
      Math.round(
        (((l.cajas * 12 + l.maples) * 30 + l.sueltos) *
          Math.round(l.precioMaple * 100)) /
          30,
      ) /
        100,
    0,
  );
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget,
      fd = new FormData(f);
    setError("");
    setSuccess("");
    setPending(true);
    try {
      await post("/ventas", {
        clienteId: fd.get("clienteId"),
        fecha: fd.get("fecha"),
        destino: fd.get("destino"),
        pagado: Number(fd.get("pagado")),
        items: lines,
      });
      await cache.invalidateQueries();
      setSuccess("Remisión guardada y stock descontado.");
      f.reset();
      setLines([
        { tallaId: "M", cajas: 0, maples: 1, sueltos: 0, precioMaple: 30 },
      ]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(false);
    }
  }
  const notas: Row[] = q.data?.notas ?? [],
    clientes: Row[] = q.data?.clientes ?? [],
    details: Row[] = q.data?.detalles ?? [],
    pagos: Row[] = q.data?.pagos ?? [];
  return (
    <Page
      title="Notas de remisión"
      description="Constancia de entrega y cobros en bolivianos. Documento interno sin factura ni funciones contables."
    >
      <State query={q}>
        <ActionForm
          title="Registrar cliente / punto de venta"
          path="/clientes"
          fields={[
            { name: "nombre", label: "Nombre del cliente o punto de venta" },
            { name: "telefono", label: "Teléfono", required: false },
            { name: "direccion", label: "Dirección", required: false },
          ]}
        />
        <Panel title="Nueva remisión">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <label>
                Cliente
                <select name="clienteId" required className="op-input">
                  <option value="">Seleccionar…</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Fecha
                <input
                  name="fecha"
                  type="date"
                  className="op-input"
                  defaultValue={fechaBolivia()}
                  max={fechaBolivia()}
                  required
                />
              </label>
              <label>
                Destino de entrega
                <input
                  name="destino"
                  className="op-input"
                  maxLength={250}
                  required
                  placeholder="Mercado, tienda o dirección"
                />
              </label>
              <label>
                Pago recibido hoy (Bs)
                <input
                  name="pagado"
                  type="number"
                  min="0"
                  max={total}
                  step="0.01"
                  defaultValue={0}
                  className="op-input"
                  required
                />
              </label>
            </div>
            <p className="text-sm text-slate-500">
              Precio por maple de 30 huevos. Las cajas contienen 12 maples y los
              sueltos se cobran proporcionalmente. Si no pagó, registra 0;
              puedes agregar abonos después.
            </p>
            {lines.map((line, index) => (
              <div
                key={index}
                className="grid grid-cols-2 md:grid-cols-6 gap-2 border rounded-xl p-3"
              >
                <label className="text-xs">
                  Talla
                  <select
                    aria-label={`Talla línea ${index + 1}`}
                    className="op-input"
                    value={line.tallaId}
                    onChange={(e) =>
                      setLines(
                        lines.map((l, i) =>
                          i === index ? { ...l, tallaId: e.target.value } : l,
                        ),
                      )
                    }
                  >
                    {tallas.map(([v]) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                {(
                  [
                    ["cajas", "Cajas"],
                    ["maples", "Maples sueltos"],
                    ["sueltos", "Huevos sueltos"],
                    ["precioMaple", "Precio maple Bs"],
                  ] as const
                ).map(([name, label]) => (
                  <label key={name} className="text-xs">
                    {label}
                    <input
                      aria-label={`${label} línea ${index + 1}`}
                      className="op-input"
                      type="number"
                      min={name === "precioMaple" ? 0.01 : 0}
                      max={name === "sueltos" ? 29 : 999999}
                      step={name === "precioMaple" ? 0.01 : 1}
                      required
                      value={line[name]}
                      onChange={(e) =>
                        setLines(
                          lines.map((l, i) =>
                            i === index
                              ? { ...l, [name]: Number(e.target.value) }
                              : l,
                          ),
                        )
                      }
                    />
                  </label>
                ))}
                <button
                  type="button"
                  className="text-red-700 text-xs"
                  disabled={lines.length === 1}
                  onClick={() => setLines(lines.filter((_, i) => i !== index))}
                >
                  Quitar línea
                </button>
              </div>
            ))}
            <button
              type="button"
              className="underline text-emerald-800 text-sm"
              onClick={() =>
                setLines([
                  ...lines,
                  {
                    tallaId: "M",
                    cajas: 0,
                    maples: 1,
                    sueltos: 0,
                    precioMaple: 30,
                  },
                ])
              }
            >
              Agregar talla
            </button>
            <p className="font-bold text-xl">Total: {moneda(total)}</p>
            {error && (
              <p role="alert" className="text-red-700">
                {error}
              </p>
            )}
            {success && (
              <p role="status" className="text-emerald-800">
                {success}
              </p>
            )}
            <button
              className="op-button"
              disabled={pending || !navigator.onLine}
            >
              {pending ? "Guardando…" : "Guardar y despachar"}
            </button>
          </form>
        </Panel>
        <ActionForm
          title="Anotar pago / abono"
          path="/pagos"
          fields={[
            {
              name: "notaId",
              label: "Remisión con saldo pendiente",
              options: notas
                .filter(
                  (n) =>
                    Number(n.total) - n.pagado > 0.005 &&
                    n.estado !== "ANULADA",
                )
                .map((n) => [
                  n.id,
                  `#${n.numeroNota} · ${n.cliente} · saldo ${moneda(Number(n.total) - n.pagado)}`,
                ]),
            },
            dateField,
            {
              name: "monto",
              label: "Monto recibido (Bs)",
              type: "number",
              min: 0.01,
              step: 0.01,
            },
            {
              name: "notas",
              label: "Referencia / observación",
              required: false,
            },
          ]}
        />
        <Panel title="Remisiones e historial de entrega">
          <Table
            rows={notas}
            columns={[
              [
                "Nota",
                (r) => (
                  <button
                    className="underline text-emerald-800"
                    onClick={() => setSelected(r.id)}
                  >
                    #{r.numeroNota}
                  </button>
                ),
              ],
              ["Fecha", "fecha"],
              ["Cliente", "cliente"],
              ["Destino", "destino"],
              ["Total", (r) => moneda(r.total)],
              ["Pagado", (r) => moneda(r.pagado)],
              ["Saldo", (r) => moneda(Number(r.total) - r.pagado)],
              ["Estado", "estado"],
            ]}
          />
          {selected && (
            <div className="space-y-3 pt-3">
              <h3 className="font-semibold">
                Detalle de remisión #
                {notas.find((n) => n.id === selected)?.numeroNota}
              </h3>
              <Table
                rows={details.filter((d) => d.notaId === selected)}
                columns={[
                  ["Talla", "tallaId"],
                  ["Maples", "cantidadMaples"],
                  ["Sueltos", "cantidadSueltos"],
                  ["Precio maple", (r) => moneda(r.precioUnitarioMaple)],
                  ["Subtotal", (r) => moneda(r.subtotalLinea)],
                ]}
              />
              <h3 className="font-semibold">Historial de pagos</h3>
              <Table
                rows={pagos.filter((p) => p.notaId === selected)}
                columns={[
                  ["Fecha", "fecha"],
                  ["Monto", (r) => moneda(r.monto)],
                  ["Método", "metodoPago"],
                  ["Referencia", "notas"],
                ]}
              />
            </div>
          )}
        </Panel>
        <Panel title="Saldos por cliente">
          <Table
            rows={clientes}
            columns={[
              ["Cliente", "nombre"],
              ["Teléfono", "telefono"],
              ["Por cobrar", (r) => moneda(r.saldoPendiente)],
            ]}
          />
        </Panel>
      </State>
    </Page>
  );
}
