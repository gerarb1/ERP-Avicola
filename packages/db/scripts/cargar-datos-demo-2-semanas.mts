import { Pool } from "pg";
import { randomUUID } from "node:crypto";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Falta DATABASE_URL");

const pool = new Pool({ connectionString: url });
const client = await pool.connect();

try {
  await client.query("BEGIN");

  // Obtener IDs de usuarios
  const usersRes = await client.query("SELECT id, rol FROM usuarios");
  const adminId = usersRes.rows.find(u => u.rol === 'administrador')?.id;
  const galponId = usersRes.rows.find(u => u.rol === 'encargado_galpon')?.id;
  const almacenId = usersRes.rows.find(u => u.rol === 'encargado_almacen')?.id;

  if (!adminId || !galponId || !almacenId) {
    throw new Error("No se encontraron los usuarios requeridos en la base de datos");
  }

  // 1. Obtener lotes y galpones
  const galponesRes = await client.query("SELECT id, nombre, capacidad FROM galpones ORDER BY nombre");
  const g1 = galponesRes.rows.find(g => g.capacidad === 1500);
  const g2 = galponesRes.rows.find(g => g.capacidad === 2500);

  if (!g2) throw new Error("No se encontró el galpón de 2500 aves");

  // Desactivar Galpón 1 para que el foco quede 100% en el galpón de 2500
  if (g1) {
    await client.query("UPDATE galpones SET activo = false WHERE id = $1", [g1.id]);
    await client.query("UPDATE lotes_aves SET activo = false WHERE galpon_id = $1", [g1.id]);
  }

  // Activar y configurar Lote 2 (2500 aves)
  const lote2Res = await client.query("SELECT id FROM lotes_aves WHERE galpon_id = $1", [g2.id]);
  let loteId = lote2Res.rows[0]?.id;
  if (!loteId) {
    loteId = randomUUID();
    await client.query(`
      INSERT INTO lotes_aves (id, galpon_id, codigo, raza, aves_iniciales, aves_actuales, fecha_ingreso, edad_semanas_ingreso, edad_confirmada, racion_g, fecha_nacimiento, fecha_llegada, activo)
      VALUES ($1, $2, 'LOTE-2026-G2', 'Hy-Line Brown', 2500, 2496, '2026-02-01', 16, true, 114, '2025-10-12', '2026-02-01', true)
    `, [loteId, g2.id]);
  } else {
    await client.query(`
      UPDATE lotes_aves
      SET aves_iniciales = 2500, aves_actuales = 2496, fecha_ingreso = '2026-02-01', edad_semanas_ingreso = 16,
          edad_confirmada = true, racion_g = 114, fecha_nacimiento = '2025-10-12', fecha_llegada = '2026-02-01', activo = true
      WHERE id = $1
    `, [loteId]);
  }
  await client.query("UPDATE galpones SET activo = true WHERE id = $1", [g2.id]);

  // Limpiar datos previos de prueba si los hubiera
  await client.query("DELETE FROM lecturas_notificaciones");
  await client.query("DELETE FROM detalle_remision");
  await client.query("DELETE FROM pagos");
  await client.query("DELETE FROM notas_remision");
  await client.query("DELETE FROM clientes");
  await client.query("DELETE FROM movimientos_inventario");
  await client.query("DELETE FROM sucesos_galpon");
  await client.query("DELETE FROM mortalidad_diaria");
  await client.query("DELETE FROM produccion_diaria");
  await client.query("DELETE FROM movimientos_insumos");
  await client.query("DELETE FROM insumos");
  await client.query("DELETE FROM arqueos_semanales");
  await client.query("DELETE FROM movimientos_caja");

  console.log("Tablas operativas limpiadas para inserción limpia.");

  // 2. Insumos
  const insumoAlimentoId = randomUUID();
  await client.query(`
    INSERT INTO insumos (id, nombre, tipo, unidad, stock, kg_bolsa)
    VALUES ($1, 'Alimento Postura Fase 2', 'ALIMENTO', 'kg', 439.000, 44.000)
  `, [insumoAlimentoId]);

  const insumoVitId = randomUUID();
  await client.query(`
    INSERT INTO insumos (id, nombre, tipo, unidad, stock, kg_bolsa)
    VALUES ($1, 'Complejo B + Electrolitos', 'VITAMINA', 'kg', 8.000, 1.000)
  `, [insumoVitId]);

  // Entrada inicial de alimento: 100 bolsas = 4400 kg
  await client.query(`
    INSERT INTO movimientos_insumos (id, insumo_id, lote_id, fecha, tipo, cantidad, costo_total, motivo, registrado_por)
    VALUES ($1, $2, $3, '2026-10-04', 'ENTRADA', 4400.000, 9200.00, 'Compra de 100 bolsas a Bs 92 c/u', $4)
  `, [randomUUID(), insumoAlimentoId, loteId, almacenId]);

  // Entrada de vitaminas: 10 kg
  await client.query(`
    INSERT INTO movimientos_insumos (id, insumo_id, lote_id, fecha, tipo, cantidad, costo_total, motivo, registrado_por)
    VALUES ($1, $2, $3, '2026-10-04', 'ENTRADA', 10.000, 350.00, 'Stock de suplemento vitamínico', $4)
  `, [randomUUID(), insumoVitId, loteId, almacenId]);

  // 3. Fondo inicial de caja
  await client.query(`
    INSERT INTO movimientos_caja (id, fecha, tipo, monto, categoria, descripcion, registrado_por)
    VALUES ($1, '2026-10-04', 'INGRESO', 5000.00, 'VARIOS', 'Fondo de apertura de caja chica', $2)
  `, [randomUUID(), adminId]);

  // Pago de parte de la compra de alimento desde caja
  await client.query(`
    INSERT INTO movimientos_caja (id, fecha, tipo, monto, categoria, descripcion, registrado_por)
    VALUES ($1, '2026-10-04', 'EGRESO', 2000.00, 'ALIMENTO', 'Anticipo compra 100 bolsas alimento postura', $2)
  `, [randomUUID(), almacenId]);

  // 4. Bajas / Mortalidad (4 eventos a lo largo de las 2 semanas)
  const bajas = [
    { fecha: '2026-10-06', cantidad: 1, causa: 'Prolapso / causa natural' },
    { fecha: '2026-10-10', cantidad: 1, causa: 'Asfixia mecánica en nidal' },
    { fecha: '2026-10-14', cantidad: 1, causa: 'Muerte súbita / causa natural' },
    { fecha: '2026-10-17', cantidad: 1, causa: 'Descarte por debilidad' },
  ];
  for (const b of bajas) {
    await client.query(`
      INSERT INTO mortalidad_diaria (id, lote_id, fecha, cantidad, causa, registrado_por)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [randomUUID(), loteId, b.fecha, b.cantidad, b.causa, galponId]);
  }

  // 5. Bitácora / Sucesos de galpón
  const sucesos = [
    {
      fecha: '2026-10-06', tipo: 'VITAMINA', descripcion: 'Suministro en agua de bebida durante 3 días para estimular postura',
      producto: 'Complejo B + Electrolitos', dosis: '1 g/L de agua', proxima_fecha: '2026-10-20'
    },
    {
      fecha: '2026-10-12', tipo: 'OBSERVACION', descripcion: 'Revisión y calibración de bebederos niple y tolva de alimento automática',
      producto: null, dosis: null, proxima_fecha: null
    },
    {
      fecha: '2026-10-15', tipo: 'VACUNA', descripcion: 'Refuerzo ocular/aerosol según protocolo preventivo',
      producto: 'Cepa LaSota New Castle', dosis: '1 dosis/ave según veterinario', proxima_fecha: '2026-11-15'
    }
  ];
  for (const s of sucesos) {
    await client.query(`
      INSERT INTO sucesos_galpon (id, lote_id, fecha, tipo, descripcion, producto, dosis, proxima_fecha, registrado_por)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [randomUUID(), loteId, s.fecha, s.tipo, s.descripcion, s.producto, s.dosis, s.proxima_fecha, galponId]);
  }

  // Salida de 2 kg de vitamina aplicada
  await client.query(`
    INSERT INTO movimientos_insumos (id, insumo_id, lote_id, fecha, tipo, cantidad, costo_total, motivo, registrado_por)
    VALUES ($1, $2, $3, '2026-10-06', 'SALIDA', 2.000, 0.00, 'Aplicación en agua de bebida lote G2', $4)
  `, [randomUUID(), insumoVitId, loteId, galponId]);

  // 6. Recolección Diaria (14 días: 2026-10-05 al 2026-10-18)
  // Semana 1: 51 semanas de edad, postura promedio ~91.8%
  // Semana 2: 52-53 semanas de edad, postura promedio ~93.6% (+1.7 puntos de aumento)
  const produccionDias = [
    // Semana 1
    { fecha: '2026-10-05', sanos: 2280, rotos: 12, kg: 280.0, agua: 460.0, vivas: 2500, obs: 'Inicio de semana con buena actividad' },
    { fecha: '2026-10-06', sanos: 2285, rotos: 10, kg: 281.0, agua: 465.0, vivas: 2499, obs: 'Inicio suministro de vitaminas en agua' },
    { fecha: '2026-10-07', sanos: 2278, rotos: 14, kg: 279.0, agua: 455.0, vivas: 2499, obs: 'Temperatura ambiente 21°C estable' },
    { fecha: '2026-10-08', sanos: 2290, rotos: 11, kg: 282.0, agua: 470.0, vivas: 2499, obs: 'Buen consumo de ración diaria' },
    { fecha: '2026-10-09', sanos: 2282, rotos: 13, kg: 280.0, agua: 462.0, vivas: 2499, obs: 'Ventilación activa en galpón' },
    { fecha: '2026-10-10', sanos: 2275, rotos: 9, kg: 281.0, agua: 465.0, vivas: 2498, obs: 'Calidad de cáscara óptima' },
    { fecha: '2026-10-11', sanos: 2295, rotos: 12, kg: 283.0, agua: 475.0, vivas: 2498, obs: 'Cierre de semana 51 conforme a rango' },
    // Semana 2 (mayor postura y respuesta positiva al suplemento)
    { fecha: '2026-10-12', sanos: 2320, rotos: 11, kg: 284.0, agua: 480.0, vivas: 2498, obs: 'Incremento positivo en postura ave-día' },
    { fecha: '2026-10-13', sanos: 2330, rotos: 10, kg: 285.0, agua: 485.0, vivas: 2498, obs: 'Pico de producción de la quincena' },
    { fecha: '2026-10-14', sanos: 2325, rotos: 12, kg: 286.0, agua: 482.0, vivas: 2497, obs: 'Censo verificado tras baja matutina' },
    { fecha: '2026-10-15', sanos: 2335, rotos: 8, kg: 287.0, agua: 490.0, vivas: 2497, obs: 'Vacunación de refuerzo completada sin estrés' },
    { fecha: '2026-10-16', sanos: 2328, rotos: 13, kg: 285.0, agua: 485.0, vivas: 2497, obs: 'Consumo de agua y alimento regular' },
    { fecha: '2026-10-17', sanos: 2318, rotos: 9, kg: 283.0, agua: 478.0, vivas: 2496, obs: 'Lote uniforme y plumaje sano' },
    { fecha: '2026-10-18', sanos: 2326, rotos: 11, kg: 285.0, agua: 485.0, vivas: 2496, obs: 'Cierre de semana 52 con +1.7% sobre la previa' },
  ];

  const produccionIds: Record<string, { id: string, sanos: number, fecha: string }> = {};

  for (const p of produccionDias) {
    const prodId = randomUUID();
    produccionIds[p.fecha] = { id: prodId, sanos: p.sanos, fecha: p.fecha };
    const total = p.sanos + p.rotos;
    const pct = ((total / p.vivas) * 100).toFixed(2);
    const fcr = (p.kg / (total / 30)).toFixed(4);

    await client.query(`
      INSERT INTO produccion_diaria (
        id, lote_id, fecha, maples_recolectados, huevos_sueltos, total_huevos, huevos_rotos,
        kg_alimento, agua_l, aves_vivas, tipo_alimento, observaciones, pct_postura, fcr, registrado_por
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Alimento Postura Fase 2', $11, $12, $13, $14)
    `, [
      prodId, loteId, p.fecha, Math.floor(p.sanos / 30), p.sanos % 30, total, p.rotos,
      p.kg.toFixed(2), p.agua.toFixed(2), p.vivas, p.obs, pct, fcr, galponId
    ]);

    // Consumo diario de alimento deducido en almacén
    await client.query(`
      INSERT INTO movimientos_insumos (id, insumo_id, lote_id, fecha, tipo, cantidad, costo_total, motivo, registrado_por)
      VALUES ($1, $2, $3, $4, 'SALIDA', $5, 0.00, 'Consumo diario galpón lote G2', $6)
    `, [randomUUID(), insumoAlimentoId, loteId, p.fecha, p.kg.toFixed(3), galponId]);
  }

  // 7. Clasificación en Almacén (por tallas)
  // Distribución real por talla: P: 2%, CH: 5%, M: 25%, G: 45%, XG: 18%, XXG: 5%
  const stockRows = await client.query("SELECT id, talla_id FROM inventario_stock");
  const stockIdMap: Record<string, string> = {};
  for (const r of stockRows.rows) stockIdMap[r.talla_id] = r.id;

  const totalClasificadoPorTalla: Record<string, number> = { P: 0, CH: 0, M: 0, G: 0, XG: 0, XXG: 0 };

  for (const p of produccionDias) {
    const s = p.sanos;
    const pU = Math.round(s * 0.02);
    const chU = Math.round(s * 0.05);
    const mU = Math.round(s * 0.25);
    const gU = Math.round(s * 0.45);
    const xgU = Math.round(s * 0.18);
    const xxgU = s - (pU + chU + mU + gU + xgU); // Ajuste exacto para sumar s

    const desglose = [
      { talla: 'P', u: pU },
      { talla: 'CH', u: chU },
      { talla: 'M', u: mU },
      { talla: 'G', u: gU },
      { talla: 'XG', u: xgU },
      { talla: 'XXG', u: xxgU },
    ];

    for (const d of desglose) {
      totalClasificadoPorTalla[d.talla] += d.u;
      await client.query(`
        INSERT INTO movimientos_inventario (
          id, inventario_stock_id, fecha, tipo, cantidad_maples, cantidad_sueltos, motivo,
          referencia_id, referencia_tipo, registrado_por
        )
        VALUES ($1, $2, $3, 'ENTRADA', $4, $5, 'Clasificación diaria de recolección', $6, 'PRODUCCION', $7)
      `, [
        randomUUID(), stockIdMap[d.talla], p.fecha, Math.floor(d.u / 30), d.u % 30,
        produccionIds[p.fecha].id, almacenId
      ]);
    }
  }

  // 8. Mermas en Almacén
  await client.query(`
    INSERT INTO movimientos_inventario (id, inventario_stock_id, fecha, tipo, cantidad_maples, cantidad_sueltos, motivo, registrado_por)
    VALUES ($1, $2, '2026-10-07', 'MERMA', 0, 6, 'Rotura accidental durante manipulación en mesa', $3)
  `, [randomUUID(), stockIdMap['M'], almacenId]);
  totalClasificadoPorTalla['M'] -= 6;

  await client.query(`
    INSERT INTO movimientos_inventario (id, inventario_stock_id, fecha, tipo, cantidad_maples, cantidad_sueltos, motivo, registrado_por)
    VALUES ($1, $2, '2026-10-13', 'MERMA', 0, 5, 'Merma por apilado en tarima', $3)
  `, [randomUUID(), stockIdMap['G'], almacenId]);
  totalClasificadoPorTalla['G'] -= 5;

  // 9. Clientes
  const c1Id = randomUUID();
  await client.query(`
    INSERT INTO clientes (id, nombre, telefono, direccion, saldo_pendiente, activo)
    VALUES ($1, 'Distribuidora Doña Elena - Mercado Central', '77123456', 'Calle Junín #45, Puesto 12', 0.00, true)
  `, [c1Id]);

  const c2Id = randomUUID();
  await client.query(`
    INSERT INTO clientes (id, nombre, telefono, direccion, saldo_pendiente, activo)
    VALUES ($1, 'Supermercado El Valle - Sucursal 1', '78901234', 'Av. Las Américas esq. 3er Anillo', 0.00, true)
  `, [c2Id]);

  const c3Id = randomUUID();
  await client.query(`
    INSERT INTO clientes (id, nombre, telefono, direccion, saldo_pendiente, activo)
    VALUES ($1, 'Comercial Los Álamos - Venta Mayorista', '76543210', 'Terminal de Carga, Galpón 4', 0.00, true)
  `, [c3Id]);

  // 10. Notas de Remisión, Despachos y Cobros
  // Nota 1 (2026-10-08) a Doña Elena:
  // - 20 cajas talla G (240 maples = 7200 u) a Bs 30/maple = Bs 7,200.00
  // - 10 cajas talla M (120 maples = 3600 u) a Bs 28/maple = Bs 3,360.00
  // Total: Bs 10,560.00. Pagado: 10,560.00 (PAGADA)
  const n1Id = randomUUID();
  await client.query(`
    INSERT INTO notas_remision (id, numero_nota, cliente_id, fecha, destino, tipo_pago, subtotal, total, estado, registrado_por)
    VALUES ($1, 1001, $2, '2026-10-08', 'Mercado Central - Puesto 12', 'CONTADO', 10560.00, 10560.00, 'PAGADA', $3)
  `, [n1Id, c1Id, almacenId]);

  await client.query(`
    INSERT INTO detalle_remision (id, nota_id, talla_id, cantidad_maples, cantidad_sueltos, precio_unitario_maple, subtotal_linea)
    VALUES
      ($1, $2, 'G', 240, 0, 30.00, 7200.00),
      ($3, $2, 'M', 120, 0, 28.00, 3360.00)
  `, [randomUUID(), n1Id, randomUUID()]);

  // Descontar inventario de Nota 1
  await client.query(`
    INSERT INTO movimientos_inventario (id, inventario_stock_id, fecha, tipo, cantidad_maples, cantidad_sueltos, motivo, referencia_id, referencia_tipo, registrado_por)
    VALUES
      ($1, $2, '2026-10-08', 'SALIDA', 240, 0, 'Despacho remisión 1001 a Mercado Central', $3, 'NOTA_REMISION', $4),
      ($5, $6, '2026-10-08', 'SALIDA', 120, 0, 'Despacho remisión 1001 a Mercado Central', $3, 'NOTA_REMISION', $4)
  `, [randomUUID(), stockIdMap['G'], n1Id, almacenId, randomUUID(), stockIdMap['M']]);
  totalClasificadoPorTalla['G'] -= 7200;
  totalClasificadoPorTalla['M'] -= 3600;

  // Pago y caja Nota 1
  await client.query(`
    INSERT INTO pagos (id, nota_id, cliente_id, monto, fecha, metodo_pago, notas, registrado_por)
    VALUES ($1, $2, $3, 10560.00, '2026-10-08', 'EFECTIVO', 'Pago total al contado contra entrega', $4)
  `, [randomUUID(), n1Id, c1Id, almacenId]);

  await client.query(`
    INSERT INTO movimientos_caja (id, fecha, tipo, monto, categoria, descripcion, registrado_por)
    VALUES ($1, '2026-10-08', 'INGRESO', 10560.00, 'VARIOS', 'Cobro remisión 1001 — Distribuidora Doña Elena', $2)
  `, [randomUUID(), almacenId]);

  // Nota 2 (2026-10-11) a Supermercado El Valle:
  // - 15 cajas talla G (180 maples = 5400 u) a Bs 30.00 = Bs 5,400.00
  // - 5 cajas talla XG (60 maples = 1800 u) a Bs 32.00 = Bs 1,920.00
  // Total: Bs 7,320.00. Pagado inicial: Bs 4,000.00 (PARCIAL)
  const n2Id = randomUUID();
  await client.query(`
    INSERT INTO notas_remision (id, numero_nota, cliente_id, fecha, destino, tipo_pago, subtotal, total, estado, registrado_por)
    VALUES ($1, 1002, $2, '2026-10-11', 'Sucursal Las Américas', 'CREDITO', 7320.00, 7320.00, 'PAGADA', $3)
  `, [n2Id, c2Id, almacenId]); // Estado final PAGADA tras el abono de la segunda semana

  await client.query(`
    INSERT INTO detalle_remision (id, nota_id, talla_id, cantidad_maples, cantidad_sueltos, precio_unitario_maple, subtotal_linea)
    VALUES
      ($1, $2, 'G', 180, 0, 30.00, 5400.00),
      ($3, $2, 'XG', 60, 0, 32.00, 1920.00)
  `, [randomUUID(), n2Id, randomUUID()]);

  await client.query(`
    INSERT INTO movimientos_inventario (id, inventario_stock_id, fecha, tipo, cantidad_maples, cantidad_sueltos, motivo, referencia_id, referencia_tipo, registrado_por)
    VALUES
      ($1, $2, '2026-10-11', 'SALIDA', 180, 0, 'Despacho remisión 1002 a Sucursal Las Américas', $3, 'NOTA_REMISION', $4),
      ($5, $6, '2026-10-11', 'SALIDA', 60, 0, 'Despacho remisión 1002 a Sucursal Las Américas', $3, 'NOTA_REMISION', $4)
  `, [randomUUID(), stockIdMap['G'], n2Id, almacenId, randomUUID(), stockIdMap['XG']]);
  totalClasificadoPorTalla['G'] -= 5400;
  totalClasificadoPorTalla['XG'] -= 1800;

  // Pago 1 de Nota 2 (Bs 4000)
  await client.query(`
    INSERT INTO pagos (id, nota_id, cliente_id, monto, fecha, metodo_pago, notas, registrado_por)
    VALUES ($1, $2, $3, 4000.00, '2026-10-11', 'EFECTIVO', 'Anticipo en efectivo al descargar', $4)
  `, [randomUUID(), n2Id, c2Id, almacenId]);

  await client.query(`
    INSERT INTO movimientos_caja (id, fecha, tipo, monto, categoria, descripcion, registrado_por)
    VALUES ($1, '2026-10-11', 'INGRESO', 4000.00, 'VARIOS', 'Cobro remisión 1002 — Supermercado El Valle (Anticipo)', $2)
  `, [randomUUID(), almacenId]);

  // Pago 2 de Nota 2 (Bs 3320 en semana 2, saldando la nota)
  await client.query(`
    INSERT INTO pagos (id, nota_id, cliente_id, monto, fecha, metodo_pago, notas, registrado_por)
    VALUES ($1, $2, $3, 3320.00, '2026-10-16', 'EFECTIVO', 'Cancelación de saldo pendiente remisión 1002', $4)
  `, [randomUUID(), n2Id, c2Id, almacenId]);

  await client.query(`
    INSERT INTO movimientos_caja (id, fecha, tipo, monto, categoria, descripcion, registrado_por)
    VALUES ($1, '2026-10-16', 'INGRESO', 3320.00, 'VARIOS', 'Abono remisión 1002 — Supermercado El Valle (Saldo cancelado)', $2)
  `, [randomUUID(), almacenId]);

  // Nota 3 (2026-10-15) a Comercial Los Álamos:
  // - 25 cajas talla XG (300 maples = 9000 u) a Bs 32.00 = Bs 9,600.00
  // Total: Bs 9,600.00 al contado
  const n3Id = randomUUID();
  await client.query(`
    INSERT INTO notas_remision (id, numero_nota, cliente_id, fecha, destino, tipo_pago, subtotal, total, estado, registrado_por)
    VALUES ($1, 1003, $2, '2026-10-15', 'Terminal de Carga Mayorista', 'CONTADO', 9600.00, 9600.00, 'PAGADA', $3)
  `, [n3Id, c3Id, almacenId]);

  await client.query(`
    INSERT INTO detalle_remision (id, nota_id, talla_id, cantidad_maples, cantidad_sueltos, precio_unitario_maple, subtotal_linea)
    VALUES ($1, $2, 'XG', 100, 0, 32.00, 3200.00), ($3, $2, 'M', 100, 0, 28.00, 2800.00), ($4, $2, 'G', 120, 0, 30.00, 3600.00)
  `, [randomUUID(), n3Id, randomUUID(), randomUUID()]);

  await client.query(`
    INSERT INTO movimientos_inventario (id, inventario_stock_id, fecha, tipo, cantidad_maples, cantidad_sueltos, motivo, referencia_id, referencia_tipo, registrado_por)
    VALUES
      ($1, $2, '2026-10-15', 'SALIDA', 100, 0, 'Despacho remisión 1003 a Los Álamos', $3, 'NOTA_REMISION', $4),
      ($5, $6, '2026-10-15', 'SALIDA', 100, 0, 'Despacho remisión 1003 a Los Álamos', $3, 'NOTA_REMISION', $4),
      ($7, $8, '2026-10-15', 'SALIDA', 120, 0, 'Despacho remisión 1003 a Los Álamos', $3, 'NOTA_REMISION', $4)
  `, [randomUUID(), stockIdMap['XG'], n3Id, almacenId, randomUUID(), stockIdMap['M'], randomUUID(), stockIdMap['G']]);
  totalClasificadoPorTalla['XG'] -= 3000;
  totalClasificadoPorTalla['M'] -= 3000;
  totalClasificadoPorTalla['G'] -= 3600;

  await client.query(`
    INSERT INTO pagos (id, nota_id, cliente_id, monto, fecha, metodo_pago, notas, registrado_por)
    VALUES ($1, $2, $3, 9600.00, '2026-10-15', 'EFECTIVO', 'Pago total en efectivo contra entrega', $4)
  `, [randomUUID(), n3Id, c3Id, almacenId]);

  await client.query(`
    INSERT INTO movimientos_caja (id, fecha, tipo, monto, categoria, descripcion, registrado_por)
    VALUES ($1, '2026-10-15', 'INGRESO', 9600.00, 'VARIOS', 'Cobro remisión 1003 — Comercial Los Álamos', $2)
  `, [randomUUID(), almacenId]);

  // Actualizar stock remanente en inventario_stock
  for (const [talla, totalU] of Object.entries(totalClasificadoPorTalla)) {
    const finalU = Math.max(0, totalU);
    await client.query(`
      UPDATE inventario_stock
      SET maples_disponibles = $1, huevos_sueltos = $2, updated_at = NOW()
      WHERE id = $3
    `, [Math.floor(finalU / 30), finalU % 30, stockIdMap[talla]]);
  }

  // 11. Gastos menores en Caja
  await client.query(`
    INSERT INTO movimientos_caja (id, fecha, tipo, monto, categoria, descripcion, registrado_por)
    VALUES
      ($1, '2026-10-07', 'EGRESO', 80.00, 'VARIOS', 'Cinta de embalaje y marcadores para clasificación', $2),
      ($3, '2026-10-08', 'EGRESO', 45.00, 'TRANSPORTE_FLETE', 'Flete de transporte local de vitaminas', $4),
      ($5, '2026-10-14', 'EGRESO', 250.00, 'MAPLES_VACIOS', 'Adquisición de 10 paquetes de maples de cartón', $2)
  `, [randomUUID(), almacenId, randomUUID(), galponId, randomUUID()]);

  // 12. Arqueo Semanal de Semana 1 (2026-10-05 al 2026-10-11)
  // Saldo anterior al 2026-10-05: 5000 (apertura) - 2000 (alimento) = 3000.00
  // Ingresos semana 1: 10560.00 (Doña Elena) + 4000.00 (El Valle) = 14560.00
  // Egresos semana 1: 80.00 (cinta) + 45.00 (flete) = 125.00
  // Saldo esperado: 3000 + 14560 - 125 = 17,435.00
  // Saldo real contado: 17,435.00. Diferencia: 0.00. Conciliado: true.
  await client.query(`
    INSERT INTO arqueos_semanales (
      id, fecha_inicio, fecha_fin, saldo_anterior, total_ingresos, total_egresos,
      saldo_esperado, saldo_real, diferencia, conciliado, notas, registrado_por
    )
    VALUES ($1, '2026-10-05', '2026-10-11', 3000.00, 14560.00, 125.00, 17435.00, 17435.00, 0.00, true, 'Arqueo semanal conciliado conforme sin diferencias.', $2)
  `, [randomUUID(), adminId]);

  await client.query("COMMIT");
  console.log("¡Datos de 2 semanas cargados exitosamente!");
} catch (e) {
  await client.query("ROLLBACK");
  console.error("Error al cargar datos:", e);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
