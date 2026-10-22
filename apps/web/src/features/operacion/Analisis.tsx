import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Page,
  Panel,
  Stats,
  State,
  Table,
  useData,
  num,
  type Row,
} from "./common";
export function Analisis() {
  const q = useData<Row>("/analisis");
  const [selected, setSelected] = useState("");
  const data = q.data,
    lotes: Row[] = data?.lotes ?? [],
    l = lotes.find((x) => x.id === selected) ?? lotes[0];
  return (
    <Page
      title="Rendimiento por edad"
      description="Indicadores calculados desde recolecciones y censo histórico. Referencias semanales Hy-Line Brown, diciembre de 2025."
    >
      <State query={q}>
        <Stats
          items={[
            ["Aves vivas", lotes.reduce((a, l) => a + l.avesActuales, 0)],
            ["Alimento en almacén", `${num(data?.alimentoKg)} kg`],
            [
              "Consumo diario de referencia",
              `${num(data?.consumoMin)}–${num(data?.consumoMax)} kg`,
            ],
            [
              "Cobertura estimada",
              data?.coberturaMin !== null
                ? `${num(data?.coberturaMin)}–${num(data?.coberturaMax)} días`
                : "Sin referencia",
            ],
          ]}
        />
        <Panel title="Lotes y censo">
          <Table
            rows={lotes}
            columns={[
              ["Galpón", "galpon"],
              ["Lote", "codigo"],
              [
                "Edad",
                (r) =>
                  r.edad === null ? "Por confirmar" : `${r.edad} semanas`,
              ],
              ["Iniciales", "avesIniciales"],
              ["Vivas", "avesActuales"],
              ["Bajas acumuladas", (r) => r.avesIniciales - r.avesActuales],
              ["Mortalidad acumulada", (r) => num(r.mortalidad, 2) + "%"],
              [
                "Rango de postura actual",
                (r) =>
                  r.referencia?.posturaMin
                    ? `${r.referencia.posturaMin}–${r.referencia.posturaMax}%`
                    : "Sin rango",
              ],
            ]}
          />
        </Panel>
        <label className="block max-w-md text-sm">
          Analizar lote
          <select
            className="op-input mt-1"
            value={l?.id ?? ""}
            onChange={(e) => setSelected(e.target.value)}
          >
            {lotes.map((x) => (
              <option key={x.id} value={x.id}>
                {x.galpon} · {x.codigo}
              </option>
            ))}
          </select>
        </label>
        {l && (
          <>
            <Panel
              title={`Última semana completa: ${data?.semana.desde} al ${data?.semana.hasta}`}
            >
              <Stats
                items={[
                  ["Días registrados", `${l.actual.dias}/7`],
                  [
                    "Postura ave-día",
                    l.actual.postura !== null
                      ? num(l.actual.postura) + "%"
                      : "Sin datos",
                  ],
                  [
                    "Alimento",
                    l.actual.alimento !== null
                      ? num(l.actual.alimento) + " g/ave/día"
                      : "Sin datos",
                  ],
                  [
                    "Agua",
                    l.actual.aguaPorAve !== null
                      ? num(l.actual.aguaPorAve) + " ml/ave/día"
                      : "Sin datos",
                  ],
                ]}
              />
              <p className="text-sm text-slate-500">
                Alimento estimado por ración: {num(l.actual.alimentoEstimado)}{" "}
                g/ave/día. Se informa por separado del consumo medido.
              </p>
              <p className="text-sm text-slate-500">
                Postura = todos los huevos recolectados ÷ aves vivas de los días
                registrados × 100. Solo se comparan semanas con los siete días
                registrados. No se rellenan días faltantes con cero. El agua
                faltante no se estima.
              </p>
            </Panel>
            <Panel title="Postura real y rango esperado por edad">
              <div className="h-80">
                {l.serie.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={l.serie}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                      <YAxis unit="%" domain={[0, 100]} />
                      <Tooltip
                        formatter={(value: number) => num(value) + "%"}
                      />
                      <Legend />
                      <Line
                        type="linear"
                        dataKey="postura"
                        name="Postura registrada"
                        stroke="#047857"
                        dot={false}
                        connectNulls={false}
                      />
                      <Line
                        type="linear"
                        dataKey="min"
                        name="Hy-Line mínimo"
                        stroke="#d97706"
                        dot={false}
                        strokeDasharray="4 4"
                      />
                      <Line
                        type="linear"
                        dataKey="max"
                        name="Hy-Line máximo"
                        stroke="#2563eb"
                        dot={false}
                        strokeDasharray="4 4"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-slate-500">
                    Aún no hay recolecciones. Registra producción para ver la
                    curva real.
                  </p>
                )}
              </div>
            </Panel>
            <Panel title="Consumos diarios por ave">
              <Table
                rows={l.serie.slice(-30).reverse()}
                columns={[
                  ["Fecha", "fecha"],
                  [
                    "Postura",
                    (r) =>
                      r.postura === null
                        ? "Censo no disponible"
                        : num(r.postura) + "%",
                  ],
                  [
                    "Alimento medido",
                    (r) =>
                      r.alimento === null
                        ? "Sin medición"
                        : num(r.alimento) + " g/ave/día",
                  ],
                  [
                    "Agua",
                    (r) =>
                      r.agua === null
                        ? "No registrada"
                        : num(r.agua) + " ml/ave/día",
                  ],
                  [
                    "Referencia de postura",
                    (r) =>
                      r.min === null
                        ? "Fuera de tabla / crianza"
                        : `${r.min}–${r.max}%`,
                  ],
                ]}
              />
            </Panel>
          </>
        )}
        <Panel title="Cómo interpretar estos datos">
          <p className="text-sm text-slate-600">
            {data?.fuente}. Las tablas cubren las semanas 1–100; fuera de ese
            rango no se extrapola. La guía es una referencia de manejo para
            sistemas convencionales, no una garantía de resultados. Dieta,
            temperatura, sanidad y sistema de alojamiento influyen. La fase de
            alimentación en postura depende de producción y tamaño del huevo; no
            se cambia solo por edad. La cobertura agrupa alimentos y debe
            revisarse por tipo antes de comprar. No se presentan márgenes ni
            ganancias simuladas.
          </p>
        </Panel>
      </State>
    </Page>
  );
}
