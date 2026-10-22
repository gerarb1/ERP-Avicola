import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { TALLAS_INICIALES } from '@/lib/mockData';
import { SlideOverSheet } from '@/shared/components/SlideOverSheet';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

export function DashboardPage() {
  const [diasFiltro, setDiasFiltro] = useState<'7' | '30'>('7');
  const [incidentOpen, setIncidentOpen] = useState(false);
  const tallas = TALLAS_INICIALES;

  // Cálculos consolidados
  const totalMaplesVendidos = tallas.reduce((acc, t) => acc + t.ventasSemanalesMaples, 0);
  const ingresoBrutoTotal = tallas.reduce((acc, t) => acc + (t.ventasSemanalesMaples * t.precioMaple), 0);
  const costoAlimentoTotal = tallas.reduce((acc, t) => acc + (t.ventasSemanalesMaples * t.costoAlimentoPorMaple), 0);
  const gananciaNetaTotal = ingresoBrutoTotal - costoAlimentoTotal;
  const margenPromedioPct = ((gananciaNetaTotal / ingresoBrutoTotal) * 100).toFixed(1);

  const tallasOrdenadas = [...tallas].sort((a, b) => b.ventasSemanalesMaples - a.ventasSemanalesMaples);
  const tallaMasVendida = tallasOrdenadas[0];

  // Datos para Curva de Postura en Líneas (Recharts)
  const datosCurvaLineas = [
    { dia: 'Lun', galpon1: 92.8, galpon2: 93.0, guiaHyLine: 92.0 },
    { dia: 'Mar', galpon1: 91.4, galpon2: 93.6, guiaHyLine: 92.0 },
    { dia: 'Mié', galpon1: 92.4, galpon2: 92.2, guiaHyLine: 92.0 },
    { dia: 'Jue', galpon1: 94.1, galpon2: 95.3, guiaHyLine: 92.0 },
    { dia: 'Vie', galpon1: 93.1, galpon2: 93.3, guiaHyLine: 92.0 },
    { dia: 'Sáb', galpon1: 92.7, galpon2: 93.9, guiaHyLine: 92.0 },
    { dia: 'Dom', galpon1: 93.8, galpon2: 94.2, guiaHyLine: 92.0 },
  ];

  const datosVentasTallas = tallas.map(t => ({
    talla: t.codigo,
    maples: t.ventasSemanalesMaples,
    ganancia: Number(((t.precioMaple - t.costoAlimentoPorMaple) * t.ventasSemanalesMaples).toFixed(2))
  }));

  return (
    <div className="space-y-5 pb-8 max-w-7xl mx-auto">
      
      {/* Header con Contexto y Selector de Período */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Dirección & Analítica de Granja
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Diagnóstico productivo, márgenes por talla y rotación para 4,000 aves Hy-Line Brown
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setDiasFiltro('7')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              diasFiltro === '7' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Últimos 7 Días
          </button>
          <button
            onClick={() => setDiasFiltro('30')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              diasFiltro === '30' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mes Completo
          </button>
        </div>
      </div>

      {/* Capa 1: Fila de KPIs con Delta Porcentual */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">% Postura Actual</div>
          <div className="mt-2 flex items-baseline justify-between gap-1 flex-wrap">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">93.2%</span>
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              ▲ +1.2%
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Guía Hy-Line: 92.0%</div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Mortalidad Semanal</div>
          <div className="mt-2 flex items-baseline justify-between gap-1 flex-wrap">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">0.22%</span>
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              ▼ -0.05%
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">9 aves bajas en 7 días</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Alimento en Silo</div>
          <div className="mt-2 flex items-baseline justify-between gap-1 flex-wrap">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">8.5 días</span>
            <span className="inline-flex items-center text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              3,740 kg
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Consumo: ~440 kg/día granja</div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Costo / Huevo</div>
          <div className="mt-2 flex items-baseline justify-between gap-1 flex-wrap">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">$0.062</span>
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Margen {margenPromedioPct}%
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">FCR: 3.55 kg/maple</div>
        </div>
      </div>

      {/* Capa 2: Gráfico Principal de Líneas + Resumen de Lectura Fácil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Curva de Producción en Líneas */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 border-b border-slate-100">
            <div>
              <h2 className="font-bold text-sm sm:text-base text-slate-900">
                Curva de Postura Diaria vs Estándar Genético
              </h2>
              <p className="text-xs text-slate-500">Comparativa de líneas por galpón y guía genética esperada</p>
            </div>
            <div className="text-xs text-slate-500 font-mono self-start sm:self-auto">
              Meta genética: &gt;92%
            </div>
          </div>

          {/* Gráfico Recharts con Líneas Continuas y Leyendas Claras */}
          <div className="h-60 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosCurvaLineas} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[88, 98]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }} 
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
                  iconType="plainline"
                />
                <Line 
                  type="monotone" 
                  dataKey="galpon1" 
                  name="Galpón 01 (1,500 aves)" 
                  stroke="#15803D" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#15803D' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="galpon2" 
                  name="Galpón 02 (2,500 aves)" 
                  stroke="#0F172A" 
                  strokeWidth={2.5} 
                  dot={{ r: 3, fill: '#0F172A' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="guiaHyLine" 
                  name="Estándar Hy-Line Brown (92%)" 
                  stroke="#DC2626" 
                  strokeDasharray="4 4" 
                  strokeWidth={1.75} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cuadro Resumen de Fácil Lectura (Solicitado por el usuario) */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Resumen Ejecutivo de Producción:</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              La postura promedio semanal se sitúa en <strong>93.2%</strong> (Galpón 01: 92.8% · Galpón 02: 93.7%), manteniéndose <strong>+1.2% por encima de la guía genética estándar Hy-Line Brown</strong>. Ambos lotes presentan estabilidad productiva normal sin desvíos sanitarios.
            </p>
          </div>
        </div>

        {/* Tabla de Alertas por Excepción (Solo Desviaciones) */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-900">Alertas por Excepción</h3>
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                1 Activa
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Filtro inteligente: solo unidades con desvíos respecto a su media histórica:
            </p>

            <div 
              onClick={() => setIncidentOpen(true)}
              className="mt-3 p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition-all cursor-pointer group space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-950 flex items-center gap-1">
                  Galpón 02 — Lote 28
                </span>
                <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-mono">
                  Hoy
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Se registraron 3 bajas acumuladas. Postura estable en 93.9%.
              </p>
              <div className="text-[11px] font-bold text-emerald-800 group-hover:underline flex items-center gap-1 pt-0.5">
                <span>Inspeccionar detalle en panel lateral</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            <div className="mt-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-700 font-semibold">
                <span>Galpón 01 — Lote 34</span>
                <span className="text-emerald-700 text-[10px] font-bold">Estado Normal</span>
              </div>
              <p className="text-slate-500">
                1,485 aves vivas. Recolección matutina completada en 46 maples.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIncidentOpen(true)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Ver Registro de Incidentes
            </button>
          </div>
        </div>

      </div>

      {/* Capa 3: Matriz de Rentabilidad y Ganancia por Talla */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900">
              Rentabilidad y Ganancia Neta por Talla Comercial
            </h2>
            <p className="text-xs text-slate-500">
              Costos de alimento balanceado asignados proporcionalmente según masa de recolección
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            6 Tallas Calibradas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Talla</th>
                <th className="py-3 px-3">Peso</th>
                <th className="py-3 px-3 text-right">Precio Venta</th>
                <th className="py-3 px-3 text-right">Costo Alimento</th>
                <th className="py-3 px-3 text-right">Ganancia Neta</th>
                <th className="py-3 px-3 text-center">Margen %</th>
                <th className="py-3 px-3 text-right">Venta Semanal</th>
                <th className="py-3 px-4 text-right">Total Ganancia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tallas.map((t) => {
                const gananciaUnit = t.precioMaple - t.costoAlimentoPorMaple;
                const margenPct = ((gananciaUnit / t.precioMaple) * 100).toFixed(1);
                const gananciaTotal = gananciaUnit * t.ventasSemanalesMaples;

                return (
                  <tr key={t.codigo} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span className="inline-block w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-center leading-6 font-bold text-[10px] mr-2">
                        {t.codigo}
                      </span>
                      {t.nombre}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">{t.rangoGramos}</td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900 tabular-nums">${t.precioMaple.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right text-slate-500 tabular-nums">${t.costoAlimentoPorMaple.toFixed(2)}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-800 tabular-nums">+${gananciaUnit.toFixed(2)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-bold">
                        {margenPct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 tabular-nums">{t.ventasSemanalesMaples} m.</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">${gananciaTotal.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Capa 4: Diagnóstico para Tallas que Menos se Venden */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
          <h3 className="font-bold text-sm text-slate-900">
            Estrategia de Rotación: ¿Qué hacer con las tallas de menor salida?
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Talla P */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Talla Pequeño (P &lt;48g) — 14 días estancado</span>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">Rotación lenta</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Empaquetar en <strong>Cajas estándar de 12 maples</strong> y colocar con panaderías a <strong>$2.50/maple</strong> (manteniendo $0.65 de margen limpio), o activar el combo dominical con descuento por volumen.
            </p>
          </div>

          {/* Talla XXG */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900">Talla Jumbo (XXG &gt;72g) — 9 días estancado</span>
              <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Margen unitario alto</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vender en estuches de 12 unidades como <strong>Huevo Gourmet Doble Yema</strong> para clientes selectos o restaurantes ejecutivos a $2.50 la docena (equivale a $6.25 por maple).
            </p>
          </div>
        </div>
      </div>

      {/* Slide-over de Incidente */}
      <SlideOverSheet
        isOpen={incidentOpen}
        onClose={() => setIncidentOpen(false)}
        title="Detalle Operativo — Galpón 02"
        subtitle="Lote Hy-Line Brown 28 (2,468 aves)"
        footer={
          <button
            onClick={() => setIncidentOpen(false)}
            className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
          >
            Cerrar Panel
          </button>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 block text-xs">Censo y Parámetros:</span>
            <div className="text-xs text-slate-600">Aves actuales: <strong>2,468 gallinas</strong></div>
            <div className="text-xs text-slate-600">Postura acumulada hoy: <strong>78 maples + 6 sueltos (93.9%)</strong></div>
            <div className="text-xs text-slate-600">Alimento servido: <strong>276 kg</strong></div>
          </div>

          <div className="p-3 bg-slate-100 rounded-xl text-slate-500 text-xs">
            * Telemetría de agua, temperatura interna y clima programada para fase de sensores IoT futura.
          </div>
        </div>
      </SlideOverSheet>

    </div>
  );
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  );
}
