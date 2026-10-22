import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { PRODUCCION_HISTORICA_7_DIAS, RegistroProduccion } from '@/lib/mockData';
import { UNIDADES, calcularPorcentajePostura, calcularFCR } from '@erp-avicola/shared';
import { SlideOverSheet } from '@/shared/components/SlideOverSheet';
import { 
  Egg, 
  Plus, 
  Minus,
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Layers, 
  Clock,
  ArrowRight
} from 'lucide-react';

export function ProduccionPage() {
  const [historial, setHistorial] = useState<RegistroProduccion[]>(PRODUCCION_HISTORICA_7_DIAS);
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  const [mortalidadOpen, setMortalidadOpen] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Galpones activos con censo
  const [galpones, setGalpones] = useState([
    { id: 'g1', nombre: 'Galpón 01', capacidad: 1500, avesVivas: 1485, semanaEdad: 34, bajasHoy: 1, alimentoHoy: 165 },
    { id: 'g2', nombre: 'Galpón 02', capacidad: 2500, avesVivas: 2468, semanaEdad: 28, bajasHoy: 3, alimentoHoy: 275 },
  ]);

  const [selectedGalponId, setSelectedGalponId] = useState('g1');
  const [maples, setMaples] = useState<number>(46);
  const [sueltos, setSueltos] = useState<number>(10);
  const [kgAlimento, setKgAlimento] = useState<number>(165);

  const [bajasCantidad, setBajasCantidad] = useState<number>(1);
  const [bajasCausa, setBajasCausa] = useState<string>('Causa natural / Picaje');

  const galponActual = galpones.find(g => g.id === selectedGalponId) || galpones[0];

  const totalHuevos = (maples * UNIDADES.HUEVOS_POR_MAPLE) + sueltos;
  const pctCalculado = calcularPorcentajePostura(totalHuevos, galponActual.avesVivas);
  const fcrCalculado = calcularFCR(kgAlimento, maples);
  const esExcesivo = totalHuevos > galponActual.avesVivas;

  const handleGuardarPostura = (e: React.FormEvent) => {
    e.preventDefault();
    if (esExcesivo) return;

    const nuevo: RegistroProduccion = {
      id: `p-${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      galponId: galponActual.id,
      galponNombre: `${galponActual.nombre} (${galponActual.avesVivas.toLocaleString()} aves)`,
      maples,
      sueltos,
      totalHuevos,
      kgAlimento,
      posturaPct: pctCalculado,
      fcr: fcrCalculado,
      mortalidad: 0
    };

    setHistorial([nuevo, ...historial]);
    setQuickEntryOpen(false);
    setMensajeExito(`Captura de postura para ${galponActual.nombre} guardada exitosamente.`);
    setTimeout(() => setMensajeExito(null), 3500);
  };

  const handleGuardarBajas = (e: React.FormEvent) => {
    e.preventDefault();
    if (bajasCantidad <= 0) return;

    setGalpones(prev => prev.map(g => {
      if (g.id === selectedGalponId) {
        return { 
          ...g, 
          avesVivas: Math.max(0, g.avesVivas - bajasCantidad),
          bajasHoy: g.bajasHoy + bajasCantidad
        };
      }
      return g;
    }));

    setMortalidadOpen(false);
    setMensajeExito(`Bajas registradas (${bajasCantidad} aves). Censo actualizado en ${galponActual.nombre}.`);
    setTimeout(() => setMensajeExito(null), 3500);
  };

  return (
    <div className="space-y-5 pb-8 max-w-5xl mx-auto">
      
      {/* Mensaje de confirmación */}
      {mensajeExito && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* Bloque Superior Destacado: Modo de Entrada Rápida ("Registro del Día") */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Tarea Operativa del Día</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              Captura de Recolección — {galponActual.nombre}
            </h1>
            <p className="text-xs text-slate-500">
              Censo actual: <strong>{galponActual.avesVivas.toLocaleString()} aves vivas</strong> (Hy-Line Brown · Sem {galponActual.semanaEdad})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuickEntryOpen(true)}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Registrar Recolección</span>
            </button>
            <button
              onClick={() => setMortalidadOpen(true)}
              className="px-3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm transition-all"
            >
              Registrar Bajas
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas de Galpones (Card Grid Limpio y Táctil) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {galpones.map(g => (
          <div
            key={g.id}
            onClick={() => setSelectedGalponId(g.id)}
            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
              selectedGalponId === g.id
                ? 'bg-white border-emerald-700 ring-2 ring-emerald-700/10 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center">
                  {g.nombre.replace('Galpón ', 'G')}
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{g.nombre}</h3>
                  <span className="text-[11px] text-slate-500">Hy-Line Brown · Semana {g.semanaEdad}</span>
                </div>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                selectedGalponId === g.id ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {selectedGalponId === g.id ? 'Seleccionado' : 'Tocar para activar'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center py-3">
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Aves Vivas</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">{g.avesVivas.toLocaleString()}</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bajas Hoy</span>
                <span className="text-base font-bold text-slate-800 tabular-nums">{g.bajasHoy} aves</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Alimento</span>
                <span className="text-base font-bold text-slate-800 tabular-nums">{g.alimentoHoy} kg</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Capacidad: {g.capacidad.toLocaleString()} aves</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedGalponId(g.id); setQuickEntryOpen(true); }}
                className="font-bold text-emerald-800 hover:underline flex items-center gap-1"
              >
                <span>Cargar dato</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Historial Reciente de Producción */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900">Historial Diario de Recolección</h3>
          <span className="text-xs text-slate-400">Últimas capturas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Galpón</th>
                <th className="py-2.5 px-3 text-right">Maples</th>
                <th className="py-2.5 px-3 text-right">Sueltos</th>
                <th className="py-2.5 px-3 text-right">Total Huevos</th>
                <th className="py-2.5 px-3 text-right">Alimento</th>
                <th className="py-2.5 px-3 text-center">% Postura</th>
                <th className="py-2.5 px-3 text-right">FCR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historial.slice(0, 8).map((reg) => (
                <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-600">{reg.fecha}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{reg.galponNombre}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">{reg.maples}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400 tabular-nums">+{reg.sueltos}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">{reg.totalHuevos.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600 tabular-nums">{reg.kgAlimento} kg</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      reg.posturaPct >= 92 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {reg.posturaPct}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-500">{reg.fcr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLIDE-OVER SHEET: Formulario Táctil para Smartphone/Tablet */}
      <SlideOverSheet
        isOpen={quickEntryOpen}
        onClose={() => setQuickEntryOpen(false)}
        title={`Captura de Postura — ${galponActual.nombre}`}
        subtitle={`Aves vivas alojadas: ${galponActual.avesVivas.toLocaleString()}`}
      >
        <form onSubmit={handleGuardarPostura} className="space-y-4">
          
          {esExcesivo && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Validación: El total de huevos ({totalHuevos}) supera el número de aves vivas ({galponActual.avesVivas}).</span>
            </div>
          )}

          {/* Stepper Táctil para Maples */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Maples Recolectados (30 huevos c/u)</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMaples(Math.max(0, maples - 1))}
                className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center font-bold text-lg text-slate-700 active:scale-95 transition-transform"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input
                type="number"
                min="0"
                value={maples}
                onChange={(e) => setMaples(Number(e.target.value))}
                className="flex-1 h-12 text-center text-xl font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setMaples(maples + 1)}
                className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center font-bold text-lg text-slate-700 active:scale-95 transition-transform"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Huevos Sueltos */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Huevos Sueltos (&lt;30)</label>
            <input
              type="number"
              min="0"
              max="29"
              value={sueltos}
              onChange={(e) => setSueltos(Number(e.target.value))}
              className="w-full h-11 px-3 border border-slate-300 rounded-xl text-base font-semibold focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          {/* Alimento */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Alimento Administrado (Kg)</label>
            <input
              type="number"
              min="1"
              step="0.5"
              value={kgAlimento}
              onChange={(e) => setKgAlimento(Number(e.target.value))}
              className="w-full h-11 px-3 border border-slate-300 rounded-xl text-base font-semibold focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            />
          </div>

          {/* Resumen Calculado en Vivo */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Total Huevos</span>
              <span className="font-bold text-slate-900 text-sm">{totalHuevos} u.</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">% Postura</span>
              <span className={`font-bold text-sm ${pctCalculado >= 92 ? 'text-emerald-800' : 'text-amber-700'}`}>
                {pctCalculado}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">FCR</span>
              <span className="font-bold text-slate-900 text-sm">{fcrCalculado}</span>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={esExcesivo}
            className="w-full h-12 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-sm"
          >
            Guardar Captura Diaria
          </Button>
        </form>
      </SlideOverSheet>

      {/* SLIDE-OVER SHEET: Formulario de Bajas */}
      <SlideOverSheet
        isOpen={mortalidadOpen}
        onClose={() => setMortalidadOpen(false)}
        title={`Registrar Bajas — ${galponActual.nombre}`}
        subtitle="Descuenta aves del censo activo inmediatamente"
      >
        <form onSubmit={handleGuardarBajas} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Número de Aves</label>
            <input
              type="number"
              min="1"
              value={bajasCantidad}
              onChange={(e) => setBajasCantidad(Number(e.target.value))}
              className="w-full h-11 px-3 border border-slate-300 rounded-xl text-base font-bold text-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Causa Observada</label>
            <select
              value={bajasCausa}
              onChange={(e) => setBajasCausa(e.target.value)}
              className="w-full h-11 px-3 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
            >
              <option value="Causa natural / Picaje">Causa natural / Picaje</option>
              <option value="Selección productiva">Selección productiva</option>
              <option value="Prolapso">Prolapso</option>
              <option value="Otro">Otro diagnóstico</option>
            </select>
          </div>

          <Button type="submit" variant="danger" className="w-full h-12 rounded-xl font-bold text-sm">
            Confirmar Descuento de Censo
          </Button>
        </form>
      </SlideOverSheet>

    </div>
  );
}
