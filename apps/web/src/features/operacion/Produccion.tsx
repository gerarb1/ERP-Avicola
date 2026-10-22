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
    sucesos = useData("/sucesos");
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
  const referencia = l?.referencia;
  const racion =
    l?.racionG ??
    (referencia ? (referencia.alimentoMin + referencia.alimentoMax) / 2 : null);
  return (
    <Page
      title="Galpones y postura"
      description="Recolección sin clasificar, censo de aves y bitácora sanitaria por lote."
    >
      <State query={lotes}>
        {!lista.length && (
          <Panel title="Galpón pendiente de configuración">
            <p className="text-sm text-slate-600">
              No hay un lote activo. Administración debe configurar el galpón y
              su censo desde Configuración de granja.
            </p>
          </Panel>
        )}
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
                [
                  "Edad actual",
                  l.edad === null ? "Por confirmar" : `${l.edad} semanas`,
                ],
                [
                  "Postura de referencia",
                  l.referencia?.posturaMin
                    ? `${l.referencia.posturaMin}–${l.referencia.posturaMax}%`
                    : "Sin rango de postura",
                ],
                [
                  "Alimento de referencia",
                  racion !== null
                    ? `${num(racion)} g/ave/día estimados`
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
                  name: "observaciones",
                  label: "Observaciones",
                  required: false,
                },
              ]}
            >
              <p className="text-sm text-slate-600">
                Registra solo la recolección. No hace falta medir alimento ni
                agua cada día.{" "}
                {racion !== null
                  ? `La ración de referencia actual es ${num(racion)} g/ave/día: aproximadamente ${num((l.avesActuales * racion) / 1000)} kg (${num((l.avesActuales * racion) / 44000, 2)} bolsas de 44 kg) para este lote.`
                  : "Administración debe confirmar la edad o la ración del lote para calcular el alimento estimado."}
              </p>
              <p className="text-xs text-slate-500">
                La postura incluye los huevos rotos; el almacén solo clasifica
                los sanos. Las estimaciones se guardan separadas de las
                mediciones y no descuentan stock. Las entregas reales de
                alimento se registran por bolsas en Almacén.
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
                ["Alimento estimado kg", "kgPlanificado"],
                ["Medido kg", "kgAlimento"],
                ["Tipo", "tipoAlimento"],
                ["Agua de referencia L", "aguaPlanificadaL"],
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
