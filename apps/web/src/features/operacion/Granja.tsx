import { edadSemanas } from "@erp-avicola/shared";
import {
  Page,
  Panel,
  State,
  Table,
  ActionForm,
  useData,
  fechaBolivia,
  type Row,
} from "./common";
export function Granja() {
  const q = useData<Row>("/granja");
  const data = q.data,
    activos: Row[] = (data?.lotes ?? []).filter((l: Row) => l.activo);
  return (
    <Page
      title="Configuración de granja"
      description="Capacidad de los galpones, lote en operación y ración de referencia. No elimina historiales."
    >
      <State query={q}>
        <Panel title="Galpones instalados">
          <Table
            rows={data?.galpones ?? []}
            columns={[
              ["Galpón", "nombre"],
              ["Capacidad de aves", "capacidad"],
              [
                "Operación",
                (g) => (g.activo ? "En funcionamiento" : "Fuera de operación"),
              ],
            ]}
          />
        </Panel>
        {activos.map((l) => (
          <Panel
            key={l.id}
            title={`Lote activo: ${data?.galpones.find((g: Row) => g.id === l.galponId)?.nombre}`}
          >
            <p>
              {l.avesActuales} aves vivas · censo inicial {l.avesIniciales} ·
              inicio del registro {l.fechaIngreso}
            </p>
            <p className="text-sm text-slate-600">
              Nacimiento: {l.fechaNacimiento ?? "No registrado"} · llegada:{" "}
              {l.fechaLlegada ?? "No registrada"}. Edad:{" "}
              {l.fechaNacimiento
                ? `${edadSemanas(l.fechaIngreso, l.edadSemanasIngreso, fechaBolivia(), l.fechaNacimiento)} semanas completas hoy`
                : l.edadConfirmada
                  ? `${l.edadSemanasIngreso} semanas al ${l.fechaIngreso}`
                  : "Pendiente de confirmar; no se calculan referencias por edad"}
              . Ración:{" "}
              {l.racionG
                ? `${l.racionG} g/ave/día configurados`
                : "Referencia Hy-Line por edad confirmada"}
              . Los cambios siguientes aplican a registros futuros; no
              reescriben estimaciones anteriores.
            </p>
            <ActionForm
              title="Confirmar edad / ajustar ración"
              path={`/granja/lotes/${l.id}`}
              fields={[
                {
                  name: "fechaNacimiento",
                  label: "Fecha de nacimiento",
                  type: "date",
                  required: false,
                  value: l.fechaNacimiento ?? undefined,
                },
                {
                  name: "fechaLlegada",
                  label: "Fecha de llegada a la granja",
                  type: "date",
                  required: false,
                  value: l.fechaLlegada ?? undefined,
                },
                ...(!l.fechaNacimiento
                  ? [
                      {
                        name: "edadSemanasIngreso",
                        label: `Edad en semanas que tenían al ${l.fechaIngreso}`,
                        type: "number",
                        min: 1,
                        max: 200,
                        required: false,
                        value: l.edadConfirmada
                          ? l.edadSemanasIngreso
                          : undefined,
                      },
                    ]
                  : []),
                {
                  name: "racionG",
                  label: "Ración acordada (g/ave/día, opcional)",
                  type: "number",
                  min: 1,
                  max: 300,
                  required: false,
                  value: l.racionG ?? undefined,
                },
              ]}
            >
              <p className="text-xs text-slate-500">
                La fecha de nacimiento tiene prioridad sobre una edad aproximada
                y permite avanzar la edad en el día correcto. Sin fecha de
                nacimiento, la edad se expresa para la fecha de inicio del
                registro, no para hoy si pasó tiempo. Una ración manual debe ser
                confirmada por el responsable; el sistema no prescribe dietas.
              </p>
            </ActionForm>
            {l.racionG && (
              <ActionForm
                title="Volver a la referencia por edad"
                path={`/granja/lotes/${l.id}`}
                fields={[]}
                transform={() => ({ racionG: null })}
              />
            )}
          </Panel>
        ))}
        <ActionForm
          title="Iniciar operación con un solo galpón"
          path="/granja/iniciar"
          fields={[
            {
              name: "galponId",
              label: "Galpón que está en funcionamiento",
              options: (data?.galpones ?? []).map((g: Row) => [
                g.id,
                `${g.nombre} · capacidad ${g.capacidad}`,
              ]),
              value: data?.galpones.find((g: Row) => g.capacidad === 2500)?.id,
            },
            {
              name: "aves",
              label: "Censo actual de aves (confirmar)",
              type: "number",
              min: 1,
              value: 2500,
            },
            {
              name: "fechaNacimiento",
              label: "Nacimiento (si se conoce)",
              type: "date",
              required: false,
            },
            {
              name: "fechaLlegada",
              label: "Llegada a la granja (si se conoce)",
              type: "date",
              required: false,
            },
            {
              name: "edadSemanas",
              label: `Edad actual al ${fechaBolivia()} (semanas, si se conoce)`,
              type: "number",
              min: 1,
              max: 200,
              required: false,
            },
            {
              name: "sustituirLotes",
              label:
                "Archivar los lotes activos anteriores y conservar sus historiales",
              type: "checkbox",
            },
          ]}
        >
          <p className="text-sm text-slate-600">
            Esta acción inicia un censo desde hoy. Solo el galpón elegido queda
            en operación; el otro conserva su capacidad y su historial. No se
            inventan recolecciones, saldos ni compras anteriores. Si ya hay
            lotes activos, debes marcar la confirmación para archivarlos. Para
            ajustar únicamente edad o ración, usa el formulario del lote activo.
          </p>
        </ActionForm>
      </State>
    </Page>
  );
}
