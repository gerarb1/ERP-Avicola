import { useAuthStore } from "@/features/auth/auth-store";
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
  tallas,
  moneda,
  type Row,
} from "./common";
export function Inventario() {
  const admin = useAuthStore((s) => s.userRole) === "administrador";
  const q = useData<Row>("/inventario"),
    ins = useData<Row>("/insumos"),
    lotes = useData("/galpones");
  const [insumoId, setInsumo] = useState("");
  const items: Row[] = ins.data?.insumos ?? [],
    selected = items.find((i) => i.id === insumoId) ?? items[0];
  const movs: Row[] = ins.data?.movimientos ?? [];
  const referenciasCompletas = (lotes.data ?? []).every(
    (l) => l.avesActuales === 0 || l.referencia,
  );
  const kg = items
    .filter((i) => i.tipo === "ALIMENTO")
    .reduce((a, i) => a + Number(i.stock), 0);
  const minimo = (lotes.data ?? []).reduce(
      (a, l) =>
        a +
        (l.referencia ? (l.avesActuales * l.referencia.alimentoMin) / 1000 : 0),
      0,
    ),
    maximo = (lotes.data ?? []).reduce(
      (a, l) =>
        a +
        (l.referencia ? (l.avesActuales * l.referencia.alimentoMax) / 1000 : 0),
      0,
    );
  return (
    <Page
      title="Inventario y almacén"
      description="Clasificación por talla, mermas, despacho e insumos con historial de entradas y salidas."
    >
      <State query={q}>
        <Stats
          items={[
            [
              "Huevos en stock",
              (q.data?.stock ?? []).reduce(
                (a: number, i: Row) =>
                  a + i.maplesDisponibles * 30 + i.huevosSueltos,
                0,
              ),
            ],
            ["Alimento disponible", `${num(kg)} kg`],
            ["Consumo diario previsto", `${num(minimo)}–${num(maximo)} kg`],
            [
              "Cobertura de alimento",
              minimo && referenciasCompletas
                ? `${num(kg / maximo)}–${num(kg / minimo)} días`
                : "Sin referencia",
            ],
          ]}
        />
        <Panel title="Stock físico por tallas">
          <Table
            rows={q.data?.stock ?? []}
            columns={[
              ["Talla", "tallaId"],
              ["Maples", "maplesDisponibles"],
              ["Sueltos", "huevosSueltos"],
              ["Cajas completas", (r) => Math.floor(r.maplesDisponibles / 12)],
            ]}
          />
        </Panel>
        <ActionForm
          title="Clasificar huevos recolectados"
          path="/inventario/clasificar"
          fields={[
            {
              name: "produccionId",
              label: "Recolección pendiente",
              emptyMessage:
                "No hay huevos pendientes de clasificar. Registra primero una recolección en Galpones y postura; si ya se clasificó completa, aparecerá en el historial.",
              options: (q.data?.pendientes ?? []).map((p: Row) => [
                p.id,
                `${p.fecha} · ${lotes.data?.find((l) => l.id === p.loteId)?.galpon ?? "Lote"} · ${p.pendientes} huevos`,
              ]),
            },
            dateField,
            { name: "tallaId", label: "Talla", options: tallas },
            {
              name: "cajas",
              label: "Cajas completas de esta talla",
              type: "number",
              value: 0,
            },
            {
              name: "maples",
              label: "Maples adicionales",
              type: "number",
              value: 0,
              max: 11,
            },
            {
              name: "sueltos",
              label: "Huevos sueltos adicionales",
              type: "number",
              value: 0,
              max: 29,
            },
          ]}
        >
          <p className="text-xs text-slate-500">
            Puedes clasificar una misma recolección en varias tallas. Nunca se
            ingresa más de lo recolectado. 1 maple = 30 huevos; 1 caja = 12
            maples.
          </p>
        </ActionForm>
        {admin && (
          <ActionForm
            title="Stock inicial contado (solo al comenzar)"
            path="/inventario/inicial"
            fields={[
              dateField,
              {
                name: "tallaId",
                label: "Talla sin movimientos previos",
                options: tallas.filter(([t]) => {
                  const st = q.data?.stock.find((s: Row) => s.tallaId === t);
                  return (
                    st &&
                    !q.data?.movimientos.some(
                      (m: Row) => m.inventarioStockId === st.id,
                    )
                  );
                }),
                emptyMessage:
                  "Todas las tallas ya tienen movimientos; los saldos iniciales están registrados.",
              },
              {
                name: "cajas",
                label: "Cajas completas contadas",
                type: "number",
                value: 0,
              },
              {
                name: "maples",
                label: "Maples adicionales contados",
                type: "number",
                max: 11,
                value: 0,
              },
              {
                name: "sueltos",
                label: "Huevos sueltos contados",
                type: "number",
                max: 29,
                value: 0,
              },
            ]}
          >
            <p className="text-sm text-slate-500">
              Si ya había huevos antes de comenzar a usar el sistema, registra
              aquí el conteo físico por talla. No requiere inventar una
              recolección anterior. Solo se permite una vez por talla y conserva
              una constancia del ajuste inicial.
            </p>
          </ActionForm>
        )}
        <ActionForm
          title="Descontar merma de almacén"
          path="/inventario/merma"
          fields={[
            dateField,
            { name: "tallaId", label: "Talla", options: tallas },
            {
              name: "unidades",
              label: "Huevos rotos / perdidos (unidades)",
              type: "number",
              min: 1,
            },
            { name: "motivo", label: "Qué ocurrió" },
          ]}
        />
        <Panel title="Movimientos de huevos">
          <Table
            rows={q.data?.movimientos ?? []}
            columns={[
              ["Fecha", "fecha"],
              ["Tipo", "tipo"],
              [
                "Talla",
                (r) =>
                  q.data?.stock.find((s: Row) => s.id === r.inventarioStockId)
                    ?.tallaId,
              ],
              ["Maples", "cantidadMaples"],
              ["Sueltos", "cantidadSueltos"],
              ["Motivo", "motivo"],
            ]}
          />
        </Panel>
      </State>
      <State query={lotes}>
        <></>
      </State>
      <State query={ins}>
        <Panel title="Insumos disponibles">
          <Table
            rows={items}
            columns={[
              ["Insumo", "nombre"],
              ["Tipo", "tipo"],
              ["Disponible", (r) => `${r.stock} ${r.unidad}`],
              [
                "Bolsas equivalentes",
                (r) =>
                  r.tipo === "ALIMENTO"
                    ? num(Number(r.stock) / Number(r.kgBolsa), 2)
                    : "—",
              ],
              ["Kg / bolsa", (r) => (r.tipo === "ALIMENTO" ? r.kgBolsa : "—")],
            ]}
          />
          <p className="text-xs text-slate-500">
            La cobertura es una estimación de toda la granja; revisa cada tipo
            de alimento por separado. Las bolsas se convierten a kg con el peso
            de cada producto (44 kg por defecto).
          </p>
        </Panel>
        <ActionForm
          title="Crear insumo"
          path="/insumos"
          fields={[
            { name: "nombre", label: "Nombre / fase (ej. Ponedoras pico)" },
            {
              name: "tipo",
              label: "Tipo",
              options: [
                ["ALIMENTO", "Alimento"],
                ["VITAMINA", "Vitamina"],
                ["VACUNA", "Vacuna"],
                ["CAMA", "Cama: viruta / arroz"],
                ["OTRO", "Otro"],
              ],
            },
            {
              name: "unidad",
              label: "Unidad de control",
              options: [
                ["kg", "Kilogramos"],
                ["litro", "Litros"],
                ["unidad", "Unidades"],
                ["dosis", "Dosis"],
              ],
            },
            {
              name: "kgBolsa",
              label: "Peso de bolsa (para alimento)",
              type: "number",
              step: 0.001,
              min: 0.001,
              value: 44,
            },
          ]}
        />
        <Panel title="Elegir insumo para compra / salida">
          <select
            className="op-input max-w-lg"
            value={selected?.id ?? ""}
            onChange={(e) => setInsumo(e.target.value)}
          >
            <option value="">Seleccionar…</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre}
              </option>
            ))}
          </select>
        </Panel>
        {selected && (
          <ActionForm
            key={selected.id}
            title={`Registrar movimiento: ${selected.nombre}`}
            path="/insumos/movimientos"
            fields={[
              {
                name: "insumoId",
                label: "Insumo",
                options: [[selected.id, selected.nombre]],
                value: selected.id,
              },
              dateField,
              {
                name: "tipo",
                label: "Movimiento",
                options: [
                  ["ENTRADA", "Compra / entrada"],
                  ["SALIDA", "Uso / salida"],
                  ["MERMA", "Merma"],
                ],
              },
              {
                name: "cantidad",
                label:
                  selected.tipo === "ALIMENTO"
                    ? "Cantidad de bolsas"
                    : `Cantidad (${selected.unidad})`,
                type: "number",
                min: 0.001,
                step: 0.001,
              },
              {
                name: "costoTotal",
                label: "Costo total de la compra (Bs)",
                type: "number",
                step: 0.01,
                value: 0,
              },
              { name: "motivo", label: "Proveedor / destino / motivo" },
              {
                name: "vencimiento",
                label: "Vencimiento del lote comprado",
                type: "date",
                max: "2100-12-31",
                required: false,
              },
              {
                name: "pagarCaja",
                label: "Registrar también como gasto de caja",
                type: "checkbox",
              },
            ]}
            transform={(d) => ({
              ...d,
              cantidad:
                selected.tipo === "ALIMENTO"
                  ? d.cantidad * Number(selected.kgBolsa)
                  : d.cantidad,
            })}
          >
            <p className="text-xs text-slate-500">
              Las bolsas se registran a {selected.kgBolsa} kg cada una. El costo
              es el total pagado, no el precio por bolsa. Marca gasto de caja
              solo si se pagó desde caja y aún no fue anotado. El consumo diario
              se descuenta desde Galpones; no lo dupliques aquí.
            </p>
          </ActionForm>
        )}
        <Panel title="Historial de compras y uso">
          <Table
            rows={movs}
            columns={[
              ["Fecha", "fecha"],
              ["Insumo", (r) => items.find((i) => i.id === r.insumoId)?.nombre],
              ["Movimiento", "tipo"],
              ["Cantidad", "cantidad"],
              ["Costo Bs", (r) => moneda(r.costoTotal)],
              [
                "Precio por bolsa",
                (r) => {
                  const i = items.find((i) => i.id === r.insumoId);
                  return r.tipo === "ENTRADA" &&
                    i?.tipo === "ALIMENTO" &&
                    Number(r.cantidad) > 0
                    ? moneda(
                        Number(r.costoTotal) /
                          (Number(r.cantidad) / Number(i.kgBolsa)),
                      )
                    : "—";
                },
              ],
              ["Motivo", "motivo"],
              ["Vencimiento", "vencimiento"],
            ]}
          />
        </Panel>
      </State>
    </Page>
  );
}
