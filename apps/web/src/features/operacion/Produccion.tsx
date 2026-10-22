import { useState } from "react";
import {
  Page,
  Panel,
  Stats,
  State,
  Table,
  ActionForm,
  useData,
  num,
  dateField,
  fechaBolivia,
  type Row,
} from "./common";
export function Produccion() {
  const lotes = useData("/galpones"),
    produccion = useData("/produccion"),
    sucesos = useData("/sucesos"),
    insumos = useData<Row>("/insumos");
  const [selected, setSelected] = useState("");
  const lista = lotes.data ?? [],
    l = lista.find((x) => x.id === selected) ?? lista[0];
  const options: [string, string][] = lista.map((x) => [
    x.id,
    `${x.galpon} · ${x.codigo}`,
  ]);
  const loteField = {
    name: "loteId",
    label: "Lote / galpón",
    options,
    value: l?.id,
  };
  const alimentoOptions: [string, string][] = (insumos.data?.insumos ?? [])
    .filter((i: Row) => i.tipo === "ALIMENTO")
    .map((i: Row) => [i.id, `${i.nombre} · ${i.stock} kg disponibles`]);
  return (
    <Page
      title="Galpones y postura"
      description="Recolección sin clasificar, censo de aves y bitácora sanitaria por lote."
    >
      <State query={lotes}>
        <label className="block text-sm max-w-md">
          Consultar lote
          <select
            className="op-input mt-1"
            value={l?.id ?? ""}
            onChange={(e) => setSelected(e.target.value)}
          >
            {options.map(([v, n]) => (
              <option key={v} value={v}>
                {n}
              </option>
            ))}
          </select>
        </label>
        {l && (
          <>
            <Stats
              items={[
                ["Aves vivas", l.avesActuales],
                ["Edad actual", `${l.edad} semanas`],
                [
                  "Postura de referencia",
                  l.referencia?.posturaMin
                    ? `${l.referencia.posturaMin}–${l.referencia.posturaMax}%`
                    : "Sin rango de postura",
                ],
                [
                  "Alimento de referencia",
                  l.referencia
                    ? `${l.referencia.alimentoMin}–${l.referencia.alimentoMax} g/ave/día`
                    : "Fuera de la tabla",
                ],
              ]}
            />
            <Panel title="Referencia Hy-Line Brown">
              <p className="text-sm text-slate-600">
                Agua:{" "}
                {l.referencia
                  ? `${l.referencia.aguaMin}–${l.referencia.aguaMax} ml/ave/día`
                  : "Sin referencia para esta edad"}
                . Fuente: diciembre 2025, pp. 4–6. Las condiciones ambientales
                afectan el consumo. Los cambios de dieta de producción dependen
                también de la postura y tamaño del huevo (pp. 13–18); registra
                el alimento indicado para tu lote.
              </p>
            </Panel>
            <ActionForm
              key={"p" + l.id}
              title="Registrar recolección diaria"
              path="/produccion"
              fields={[
                loteField,
                dateField,
                {
                  name: "huevosSanos",
                  label: "Huevos sanos (unidades)",
                  type: "number",
                  value: 0,
                },
                {
                  name: "huevosRotos",
                  label: "Huevos rotos en recolección",
                  type: "number",
                  value: 0,
                },
                {
                  name: "kgAlimento",
                  label: "Alimento consumido (kg)",
                  type: "number",
                  step: 0.01,
                  value: 0,
                },
                {
                  name: "aguaL",
                  label: "Agua consumida (litros)",
                  type: "number",
                  step: 0.01,
                  value: 0,
                },
                {
                  name: "insumoId",
                  label: "Alimento del almacén",
                  options: alimentoOptions,
                  required: false,
                },
                {
                  name: "tipoAlimento",
                  label: "Tipo / fase de alimento utilizado",
                },
                {
                  name: "observaciones",
                  label: "Observaciones",
                  required: false,
                },
              ]}
            >
              <p className="text-xs text-slate-500">
                30 huevos = 1 maple. Registra una vez por lote y día. El consumo
                descuenta kg del almacén; solicita al encargado registrar
                primero la compra. La postura incluye los huevos rotos; el
                almacén solo podrá clasificar los sanos.
              </p>
            </ActionForm>
            <ActionForm
              key={"b" + l.id}
              title="Registrar bajas"
              path="/mortalidad"
              fields={[
                loteField,
                dateField,
                {
                  name: "cantidad",
                  label: "Número de bajas",
                  type: "number",
                  min: 1,
                },
                { name: "causa", label: "Causa / explicación" },
              ]}
            >
              <p className="text-xs text-slate-500">
                Actualiza las aves vivas y la postura histórica afectada. No se
                reemplaza el censo a mano.
              </p>
            </ActionForm>
            <ActionForm
              key={"e" + l.id}
              title="Agregar suceso al historial"
              path="/sucesos"
              fields={[
                loteField,
                dateField,
                {
                  name: "tipo",
                  label: "Suceso",
                  options: [
                    ["VACUNA", "Vacuna"],
                    ["VITAMINA", "Vitaminas"],
                    ["DESPIQUE", "Despique"],
                    ["ALIMENTO", "Cambio de alimento"],
                    ["OBSERVACION", "Observación"],
                  ],
                },
                {
                  name: "producto",
                  label: "Producto utilizado",
                  required: false,
                },
                {
                  name: "dosis",
                  label: "Dosis / aplicación realizada",
                  required: false,
                },
                { name: "descripcion", label: "Qué se hizo / qué ocurrió" },
                {
                  name: "proximaFecha",
                  label: "Próximo seguimiento",
                  type: "date",
                  max: "2100-12-31",
                  required: false,
                },
              ]}
            />
          </>
        )}
        <Panel title="Historial de recolección">
          <State query={produccion}>
            <Table
              rows={(produccion.data ?? []).filter((p) => p.loteId === l?.id)}
              columns={[
                ["Fecha", "fecha"],
                ["Sanos", (r) => r.totalHuevos - r.huevosRotos],
                ["Rotos", "huevosRotos"],
                ["Aves vivas", "avesVivas"],
                [
                  "Postura",
                  (r) =>
                    r.avesVivas
                      ? num((r.totalHuevos / r.avesVivas) * 100) + "%"
                      : "Censo histórico no disponible",
                ],
                ["Alimento kg", "kgAlimento"],
                ["Tipo", "tipoAlimento"],
                ["Agua L", "aguaL"],
              ]}
            />
          </State>
        </Panel>
        <Panel title="Bitácora del galpón">
          <State query={sucesos}>
            <Table
              rows={(sucesos.data ?? []).filter((p) => p.loteId === l?.id)}
              columns={[
                ["Fecha", "fecha"],
                ["Suceso", "tipo"],
                ["Detalle", "descripcion"],
                ["Producto", "producto"],
                ["Dosis", "dosis"],
                ["Seguimiento", "proximaFecha"],
              ]}
            />
          </State>
        </Panel>
      </State>
    </Page>
  );
}
