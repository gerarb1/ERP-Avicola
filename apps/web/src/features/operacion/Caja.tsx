import { useState } from "react";
import { useAuthStore } from "@/features/auth/auth-store";
import { centavos, semanaAnteriorCompleta } from "@erp-avicola/shared";
import {
  Page,
  Panel,
  State,
  Stats,
  Table,
  ActionForm,
  useData,
  dateField,
  fechaBolivia,
  moneda,
  csv,
  type Row,
} from "./common";
export function Caja() {
  const q = useData<Row>("/caja"),
    equipo = useData("/equipo");
  const admin = useAuthStore((s) => s.userRole) === "administrador";
  const anterior = semanaAnteriorCompleta(fechaBolivia());
  const [desde, setDesde] = useState(anterior.desde),
    [hasta, setHasta] = useState(anterior.hasta);
  const movimientos: Row[] = q.data?.movimientos ?? [],
    rows = movimientos.filter((m) => m.fecha >= desde && m.fecha <= hasta),
    arqueos: Row[] = q.data?.arqueos ?? [];
  const ingresos =
      rows
        .filter((m) => m.tipo === "INGRESO")
        .reduce((a, m) => a + centavos(m.monto), 0) / 100,
    egresos =
      rows
        .filter((m) => m.tipo === "EGRESO")
        .reduce((a, m) => a + centavos(m.monto), 0) / 100;
  const apertura =
    movimientos
      .filter((m) => m.fecha < desde)
      .reduce(
        (a, m) => a + (m.tipo === "INGRESO" ? 1 : -1) * centavos(m.monto),
        0,
      ) / 100;
  const nombre = (id: string) =>
    equipo.data?.find((u) => u.id === id)?.nombre ?? id;
  function exportar() {
    csv(`caja-${desde}-${hasta}.csv`, [
      ["Informe interno de movimientos Bs", desde, hasta],
      ["Fecha", "Tipo", "Concepto", "Monto Bs", "Responsable"],
      ...rows.map((m) => [
        m.fecha,
        m.tipo,
        m.descripcion,
        m.monto,
        nombre(m.registradoPor),
      ]),
      ["Ingresos", ingresos],
      ["Egresos", egresos],
      ...(admin
        ? [
            ["Saldo inicial", apertura],
            ["Saldo esperado al cierre", apertura + ingresos - egresos],
          ]
        : []),
    ]);
  }
  return (
    <Page
      title={admin ? "Caja chica y arqueo" : "Mis gastos de caja"}
      description="Anota qué se pagó, cuánto y para qué. Registro interno de transacciones en Bs, sin facturación ni contabilidad."
    >
      <State query={q}>
        <ActionForm
          title={admin ? "Anotar gasto o ingreso" : "Anotar un gasto"}
          path="/caja"
          fields={[
            dateField,
            {
              name: "tipo",
              label: "Movimiento",
              options: admin
                ? [
                    ["EGRESO", "Gasté / pagué"],
                    ["INGRESO", "Recibí dinero / reposición"],
                  ]
                : [["EGRESO", "Gasté / pagué"]],
              value: "EGRESO",
            },
            {
              name: "monto",
              label: "Monto (Bs)",
              type: "number",
              step: 0.01,
              min: 0.01,
            },
            { name: "descripcion", label: "¿En qué se gastó / de dónde vino?" },
            {
              name: "categoria",
              label: "Concepto",
              value: "VARIOS",
              options: [
                ["ALIMENTO", "Alimento"],
                ["INSUMOS_VITAMINAS", "Insumos / vitaminas"],
                ["MAPLES_VACIOS", "Maples vacíos"],
                ["TRANSPORTE_FLETE", "Transporte"],
                ["VETERINARIA", "Veterinaria"],
                ["VARIOS", "Otro / ingreso"],
              ],
            },
          ]}
        >
          <p className="text-xs text-slate-500">
            Los cobros de remisiones ingresan automáticamente. Si una compra de
            insumos ya se anotó en caja, no la registres de nuevo.
          </p>
        </ActionForm>
        <Panel title="Historial e informe semanal">
          <div className="flex flex-wrap gap-3 items-end">
            <label className="text-sm">
              Desde
              <input
                aria-label="Informe desde"
                className="op-input"
                type="date"
                value={desde}
                max={hasta}
                onChange={(e) => setDesde(e.target.value)}
              />
            </label>
            <label className="text-sm">
              Hasta
              <input
                aria-label="Informe hasta"
                className="op-input"
                type="date"
                value={hasta}
                min={desde}
                max={fechaBolivia()}
                onChange={(e) => setHasta(e.target.value)}
              />
            </label>
            <button className="op-button" onClick={exportar}>
              Descargar informe CSV
            </button>
          </div>
          <Stats
            items={
              admin
                ? [
                    ["Saldo inicial del período", moneda(apertura)],
                    ["Ingresos", moneda(ingresos)],
                    ["Gastos", moneda(egresos)],
                    [
                      "Saldo esperado al cierre",
                      moneda(apertura + ingresos - egresos),
                    ],
                  ]
                : [
                    ["Gastos registrados por mí", moneda(egresos)],
                    ["Registros", rows.length],
                  ]
            }
          />
          <Table
            rows={rows}
            columns={[
              ["Fecha", "fecha"],
              ["Movimiento", "tipo"],
              ["Descripción", "descripcion"],
              ["Monto", (r) => moneda(r.monto)],
              ["Responsable", (r) => nombre(r.registradoPor)],
            ]}
          />
        </Panel>
        {admin && (
          <>
            <ActionForm
              title="Conciliar una semana finalizada"
              path="/arqueos"
              fields={[
                {
                  name: "fechaInicio",
                  label: "Lunes de la semana",
                  type: "date",
                  value: anterior.desde,
                },
                {
                  name: "fechaFin",
                  label: "Domingo de la semana",
                  type: "date",
                  value: anterior.hasta,
                },
                {
                  name: "saldoReal",
                  label: "Efectivo contado al cierre (Bs)",
                  type: "number",
                  step: 0.01,
                },
                {
                  name: "notas",
                  label: "Explicación de diferencia / observaciones",
                  required: false,
                },
              ]}
            >
              <p className="text-xs text-slate-500">
                El saldo inicial se obtiene de todos los movimientos anteriores.
                El arqueo deja constancia y cierra las fechas anteriores: no
                admite gastos retroactivos ni modifica el saldo para ocultar
                diferencias. Si hay una diferencia, explica el motivo y registra
                luego la corrección en una fecha abierta.
              </p>
            </ActionForm>
            <Panel title="Arqueos guardados">
              <Table
                rows={arqueos}
                columns={[
                  ["Semana", (r) => `${r.fechaInicio} al ${r.fechaFin}`],
                  ["Inicial", (r) => moneda(r.saldoAnterior)],
                  ["Ingresos", (r) => moneda(r.totalIngresos)],
                  ["Gastos", (r) => moneda(r.totalEgresos)],
                  ["Esperado", (r) => moneda(r.saldoEsperado)],
                  ["Contado", (r) => moneda(r.saldoReal)],
                  ["Diferencia", (r) => moneda(r.diferencia)],
                  [
                    "Estado",
                    (r) =>
                      r.conciliado ? "Conciliado" : "Diferencia por revisar",
                  ],
                  ["Notas", "notas"],
                ]}
              />
            </Panel>
          </>
        )}
      </State>
    </Page>
  );
}
