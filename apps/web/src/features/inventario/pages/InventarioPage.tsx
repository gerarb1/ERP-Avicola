import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { TALLAS_INICIALES, TallaInfo } from '@/lib/mockData';
import { maplesACajas, calcularTotalUnidades } from '@erp-avicola/shared';
import { SlideOverSheet } from '@/shared/components/SlideOverSheet';
import { 
  Boxes, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  Filter,
  Layers
} from 'lucide-react';

export function InventarioPage() {
  const [tallasStock, setTallasStock] = useState<TallaInfo[]>(TALLAS_INICIALES);
  const [recepcionOpen, setRecepcionOpen] = useState(false);
  const [mermaOpen, setMermaOpen] = useState(false);
  const [filtroChip, setFiltroChip] = useState<'TODOS' | 'ALIMENTO' | 'TALLAS' | 'EMPAQUE'>('TODOS');
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Formulario Recepción
  const [tallaRecepcion, setTallaRecepcion] = useState<string>('G');
  const [maplesRecepcion, setMaplesRecepcion] = useState<number>(30);
  const [sueltosRecepcion, setSueltosRecepcion] = useState<number>(0);

  // Formulario Merma
  const [tallaMerma, setTallaMerma] = useState<string>('M');
  const [maplesMerma, setMaplesMerma] = useState<number>(1);
  const [sueltosMerma, setSueltosMerma] = useState<number>(5);
  const [motivoMerma, setMotivoMerma] = useState<string>('Cascarón fisurado en clasificación');

  // Historial movimientos
  const [movimientos, setMovimientos] = useState([
    { id: 'm1', fecha: 'Hoy 14:30', tipo: 'ENTRADA', categoria: 'TALLAS', item: 'Huevo Talla G (Grande)', cantidad: '+35 maples (3 cajas)', nota: 'Clasificación Postura Galpón 02' },
    { id: 'm2', fecha: 'Hoy 11:15', tipo: 'DESPACHO', categoria: 'ALIMENTO', item: 'Alimento Concentrado Fase 2', cantidad: '-275 kg', nota: 'Entrega a Galpón 02' },
    { id: 'm3', fecha: 'Ayer 18:00', tipo: 'MERMA', categoria: 'TALLAS', item: 'Huevo Talla M (Mediano)', cantidad: '-1 maple (8 sueltos)', nota: 'Rotura en mesa de empaque' },
    { id: 'm4', fecha: 'Ayer 15:30', tipo: 'DESPACHO', categoria: 'EMPAQUE', item: 'Maples Vacíos Cartón', cantidad: '-120 unidades', nota: 'Dotación sala clasificación' },
  ]);

  const totalMaplesAlmacen = tallasStock.reduce((acc, t) => acc + t.stockMaples, 0);
  const totalCajas = maplesACajas(totalMaplesAlmacen);

  const handleRecepcion = (e: React.FormEvent) => {
    e.preventDefault();
    setTallasStock(prev => prev.map(t => {
      if (t.codigo === tallaRecepcion) {
        return {
          ...t,
          stockMaples: t.stockMaples + maplesRecepcion,
          stockSueltos: t.stockSueltos + sueltosRecepcion,
        };
      }
      return t;
    }));

    setMovimientos([
      {
        id: `mov-${Date.now()}`,
        fecha: 'Ahora',
        tipo: 'ENTRADA',
        categoria: 'TALLAS',
        item: `Huevo Talla ${tallaRecepcion}`,
        cantidad: `+${maplesRecepcion} maples`,
        nota: 'Recepción clasificada'
      },
      ...movimientos
    ]);

    setRecepcionOpen(false);
    setMensaje(`Recepción de ${maplesRecepcion} maples talla ${tallaRecepcion} guardada.`);
    setTimeout(() => setMensaje(null), 3500);
  };

  const handleMerma = (e: React.FormEvent) => {
    e.preventDefault();
    setTallasStock(prev => prev.map(t => {
      if (t.codigo === tallaMerma) {
        return {
          ...t,
          stockMaples: Math.max(0, t.stockMaples - maplesMerma),
          stockSueltos: Math.max(0, t.stockSueltos - sueltosMerma),
        };
      }
      return t;
    }));

    setMovimientos([
      {
        id: `mov-${Date.now()}`,
        fecha: 'Ahora',
        tipo: 'MERMA',
        categoria: 'TALLAS',
        item: `Huevo Talla ${tallaMerma}`,
        cantidad: `-${maplesMerma} maples`,
        nota: motivoMerma
      },
      ...movimientos
    ]);

    setMermaOpen(false);
    setMensaje(`Merma (${maplesMerma} maples talla ${tallaMerma}) descontada de inventario.`);
    setTimeout(() => setMensaje(null), 3500);
  };

  const movimientosFiltrados = movimientos.filter(m => {
    if (filtroChip === 'TODOS') return true;
    return m.categoria === filtroChip;
  });

  return (
    <div className="space-y-5 pb-8 max-w-7xl mx-auto">
      
      {/* Mensaje de confirmación */}
      {mensaje && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{mensaje}</span>
        </div>
      )}

      {/* Header con resumen y acciones rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Control de Stock & Logística
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Stock de huevos en 6 tallas comerciales, silos de alimento y material de empaque
          </p>
        </div>

        {/* Acciones Rápidas Primarias (Accesibles para móvil y desktop) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setRecepcionOpen(true)}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Entrada de Tallas</span>
          </button>
          <button
            onClick={() => setMermaOpen(true)}
            className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors"
          >
            Registrar Merma
          </button>
        </div>
      </div>

      {/* Indicadores de Nivel Tipo Barra de Progreso (Silos & Empaque) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-sm text-slate-900">Capacidad de Silos y Stock Crítico</h2>
            <p className="text-xs text-slate-500">Semáforo de reposición de inventario</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 self-start sm:self-auto">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600" /> &gt;30% Normal</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 15–30% Alerta</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600" /> &lt;15% Crítico</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Silo Concentrado */}
          <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
            <div className="flex justify-between text-xs font-semibold text-slate-800">
              <span>Silo Concentrado Postura</span>
              <span className="text-emerald-800 font-bold">62% (3,720 kg)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-700 h-2.5 rounded-full transition-all" style={{ width: '62%' }} />
            </div>
            <span className="text-[11px] text-slate-500 block">Autonomía: ~8.5 días de consumo</span>
          </div>

          {/* Maples Vacíos */}
          <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
            <div className="flex justify-between text-xs font-semibold text-slate-800">
              <span>Maples Vacíos (Empaque)</span>
              <span className="text-amber-800 font-bold">22% (480 u.)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-amber-500 h-2.5 rounded-full transition-all" style={{ width: '22%' }} />
            </div>
            <span className="text-[11px] text-slate-500 block">Sugerencia: Pedir 1,000 maples el jueves</span>
          </div>

          {/* Cajas de Cartón */}
          <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
            <div className="flex justify-between text-xs font-semibold text-slate-800">
              <span>Cajas Estándar (12 maples)</span>
              <span className="text-emerald-800 font-bold">78% (180 cajas)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div className="bg-emerald-700 h-2.5 rounded-full transition-all" style={{ width: '78%' }} />
            </div>
            <span className="text-[11px] text-slate-500 block">Óptimo para despacho dominical</span>
          </div>
        </div>
      </div>

      {/* Grid de las 6 Tallas Comerciales con Conversión Maples <-> Cajas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm sm:text-base text-slate-900">
            Stock Físico por Tallas Comerciales
          </h2>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
            Total: {totalMaplesAlmacen} maples ({totalCajas.cajas} cajas + {totalCajas.maplesRestantes} m.)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {tallasStock.map(t => {
            const conv = maplesACajas(t.stockMaples);
            const unidades = calcularTotalUnidades(t.stockMaples, t.stockSueltos);

            return (
              <div key={t.codigo} className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center">
                    {t.codigo}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{t.rangoGramos}</span>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-800 truncate">{t.nombre}</div>
                  <div className="text-lg font-bold text-slate-900 tabular-nums">
                    {t.stockMaples} <span className="text-xs text-slate-400 font-normal">m.</span>
                  </div>
                </div>

                <div className="p-1.5 bg-slate-50 rounded-lg text-[10px] text-slate-600 font-medium">
                  {conv.cajas} c. {conv.maplesRestantes > 0 ? `+${conv.maplesRestantes}m` : ''}
                </div>

                <div className="text-[10px] text-slate-400 flex justify-between pt-1 border-t border-slate-100">
                  <span>{unidades} u.</span>
                  <span className={t.rotacionDias > 10 ? 'text-amber-700 font-bold' : 'text-slate-500'}>
                    {t.rotacionDias}d rot.
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla de Movimientos / Kardex con Chips Facetados */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-3 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Kardex de Movimientos Recientes</h3>
            <p className="text-xs text-slate-500">Historial auditable de entradas y salidas de almacén</p>
          </div>

          {/* Chips de Filtrado Facetado */}
          <div className="flex items-center gap-1 text-xs overflow-x-auto pb-1 self-start sm:self-auto">
            <button
              onClick={() => setFiltroChip('TODOS')}
              className={`px-3 py-1 rounded-full font-semibold text-xs transition-all ${
                filtroChip === 'TODOS' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroChip('TALLAS')}
              className={`px-3 py-1 rounded-full font-semibold text-xs transition-all ${
                filtroChip === 'TALLAS' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Huevos
            </button>
            <button
              onClick={() => setFiltroChip('ALIMENTO')}
              className={`px-3 py-1 rounded-full font-semibold text-xs transition-all ${
                filtroChip === 'ALIMENTO' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Alimento
            </button>
            <button
              onClick={() => setFiltroChip('EMPAQUE')}
              className={`px-3 py-1 rounded-full font-semibold text-xs transition-all ${
                filtroChip === 'EMPAQUE' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Empaque
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Fecha/Hora</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Ítem / Concepto</th>
                <th className="py-2.5 px-3 text-right">Cantidad</th>
                <th className="py-2.5 px-3">Detalle / Referencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientosFiltrados.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-500">{m.fecha}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      m.tipo === 'ENTRADA' ? 'bg-emerald-100 text-emerald-800' :
                      m.tipo === 'DESPACHO' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{m.item}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-800 tabular-nums">{m.cantidad}</td>
                  <td className="py-2.5 px-3 text-slate-500">{m.nota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLIDE-OVER SHEET: Recepción de Tallas Clasificadas */}
      <SlideOverSheet
        isOpen={recepcionOpen}
        onClose={() => setRecepcionOpen(false)}
        title="Recepción de Postura Clasificada"
        subtitle="Ingreso de producción seleccionada por talla"
      >
        <form onSubmit={handleRecepcion} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Talla Comercial</label>
            <select
              value={tallaRecepcion}
              onChange={(e) => setTallaRecepcion(e.target.value)}
              className="w-full h-11 px-3 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            >
              {tallasStock.map(t => (
                <option key={t.codigo} value={t.codigo}>Talla {t.codigo} — {t.nombre} ({t.rangoGramos})</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Maples a Ingresar</label>
            <input
              type="number"
              min="1"
              value={maplesRecepcion}
              onChange={(e) => setMaplesRecepcion(Number(e.target.value))}
              className="w-full h-11 px-3 border border-slate-300 rounded-xl text-base font-bold focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Huevos Sueltos (&lt;30)</label>
            <input
              type="number"
              min="0"
              max="29"
              value={sueltosRecepcion}
              onChange={(e) => setSueltosRecepcion(Number(e.target.value))}
              className="w-full h-11 px-3 border border-slate-300 rounded-xl text-base font-semibold focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          <Button type="submit" className="w-full h-12 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm">
            Cargar al Inventario de Almacén
          </Button>
        </form>
      </SlideOverSheet>

      {/* SLIDE-OVER SHEET: Registro de Merma */}
      <SlideOverSheet
        isOpen={mermaOpen}
        onClose={() => setMermaOpen(false)}
        title="Registro de Merma / Rotura"
        subtitle="Descuenta huevos fisurados durante la selección"
      >
        <form onSubmit={handleMerma} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Talla</label>
            <select
              value={tallaMerma}
              onChange={(e) => setTallaMerma(e.target.value)}
              className="w-full h-11 px-3 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              {tallasStock.map(t => (
                <option key={t.codigo} value={t.codigo}>Talla {t.codigo} — {t.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Maples</label>
              <input
                type="number"
                min="0"
                value={maplesMerma}
                onChange={(e) => setMaplesMerma(Number(e.target.value))}
                className="w-full h-11 px-3 border border-slate-300 rounded-xl text-base font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Sueltos</label>
              <input
                type="number"
                min="0"
                max="29"
                value={sueltosMerma}
                onChange={(e) => setSueltosMerma(Number(e.target.value))}
                className="w-full h-11 px-3 border border-slate-300 rounded-xl text-base font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Motivo</label>
            <input
              type="text"
              value={motivoMerma}
              onChange={(e) => setMotivoMerma(e.target.value)}
              className="w-full h-11 px-3 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            />
          </div>

          <Button type="submit" variant="danger" className="w-full h-12 rounded-xl font-bold text-sm">
            Descontar de Stock Vendible
          </Button>
        </form>
      </SlideOverSheet>

    </div>
  );
}
