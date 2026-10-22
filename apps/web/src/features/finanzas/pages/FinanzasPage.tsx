import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { MOVIMIENTOS_CAJA_INICIALES, MovimientoCaja } from '@/lib/mockData';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, CheckCircle2, DollarSign } from 'lucide-react';

export function FinanzasPage() {
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>(MOVIMIENTOS_CAJA_INICIALES);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [tipoMov, setTipoMov] = useState<'EGRESO' | 'INGRESO'>('EGRESO');
  const [categoria, setCategoria] = useState<any>('ALIMENTO');
  const [monto, setMonto] = useState<number>(120);
  const [descripcion, setDescripcion] = useState<string>('Sacos de alimento balanceado');

  const [saldoRealEfectivo, setSaldoRealEfectivo] = useState<number>(450);

  const totalIngresos = movimientos.filter(m => m.tipo === 'INGRESO').reduce((acc, m) => acc + m.monto, 0);
  const totalEgresos = movimientos.filter(m => m.tipo === 'EGRESO').reduce((acc, m) => acc + m.monto, 0);
  const saldoAnterior = 200;
  const saldoEsperado = saldoAnterior + totalIngresos - totalEgresos;
  const diferenciaArqueo = saldoRealEfectivo - saldoEsperado;

  const handleGuardarMovimiento = (e: React.FormEvent) => {
    e.preventDefault();
    const nuevo: MovimientoCaja = {
      id: `mov-${Date.now()}`,
      fecha: new Date().toISOString().split('T')[0],
      tipo: tipoMov,
      categoria,
      descripcion,
      monto,
    };

    setMovimientos([nuevo, ...movimientos]);
    setMensaje(`${tipoMov} por $${monto.toFixed(2)} registrado en ${categoria}.`);
    setTimeout(() => setMensaje(null), 3500);
  };

  return (
    <div className="space-y-5 pb-8 max-w-7xl mx-auto">
      
      {mensaje && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{mensaje}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Caja Chica & Arqueo Semanal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Control de egresos operativos, costo de alimento y conciliación dominical
          </p>
        </div>

        <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-right self-start sm:self-auto shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Saldo Teórico Esperado</span>
          <span className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">${saldoEsperado.toFixed(2)}</span>
        </div>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total Ingresos</span>
            <div className="text-lg font-bold text-emerald-700 tabular-nums">+${totalIngresos.toFixed(2)}</div>
          </div>
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total Egresos (Insumos + Alimento)</span>
            <div className="text-lg font-bold text-red-600 tabular-nums">-${totalEgresos.toFixed(2)}</div>
          </div>
          <div className="p-2 bg-red-50 rounded-lg text-red-600">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Conciliación Dominical</span>
            <div className={`text-lg font-bold tabular-nums ${diferenciaArqueo === 0 ? 'text-emerald-800' : 'text-amber-700'}`}>
              {diferenciaArqueo === 0 ? 'Cuadrado ($0)' : `$${diferenciaArqueo.toFixed(2)} dif.`}
            </div>
          </div>
          <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Grid: Movimiento + Arqueo Dominical */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Formulario de Movimiento */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Plus className="w-4 h-4 text-emerald-800" />
            <h2 className="font-bold text-sm text-slate-900">Registrar Movimiento de Caja</h2>
          </div>

          <form onSubmit={handleGuardarMovimiento} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Tipo</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl h-11 items-center">
                  <button
                    type="button"
                    onClick={() => setTipoMov('EGRESO')}
                    className={`h-9 text-xs rounded-lg font-bold transition-all ${
                      tipoMov === 'EGRESO' ? 'bg-white text-red-600 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Egreso
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoMov('INGRESO')}
                    className={`h-9 text-xs rounded-lg font-bold transition-all ${
                      tipoMov === 'INGRESO' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Ingreso
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Categoría</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                >
                  <option value="ALIMENTO">Alimento Concentrado</option>
                  <option value="INSUMOS_VITAMINAS">Insumos / Vitaminas</option>
                  <option value="MAPLES_VACIOS">Maples Vacíos</option>
                  <option value="TRANSPORTE_FLETE">Transporte / Flete</option>
                  <option value="VETERINARIA">Veterinaria</option>
                  <option value="VENTAS">Cobro Remisión Contado</option>
                  <option value="VARIOS">Varios</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700">Descripción</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full h-11 px-3 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Monto ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={monto}
                  onChange={(e) => setMonto(Number(e.target.value))}
                  className="w-full h-11 px-3 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs">
              Registrar en Libro Diario
            </Button>
          </form>
        </div>

        {/* Módulo de Arqueo Dominical */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Wallet className="w-4 h-4 text-emerald-800" />
              <h2 className="font-bold text-sm text-slate-900">Arqueo Semanal Dominical</h2>
            </div>
            <p className="text-xs text-slate-500">
              Conciliación obligatoria dominical entre ventas de contado, compras y dinero físico en mano.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Saldo Inicial Apertura:</span>
                <span className="font-mono">${saldoAnterior.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>(+) Ingresos Contado:</span>
                <span className="font-mono">+${totalIngresos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-600 font-semibold">
                <span>(-) Egresos Menores:</span>
                <span className="font-mono">-${totalEgresos.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>(=) Saldo Teórico Esperado:</span>
                <span className="font-mono tabular-nums">${saldoEsperado.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Efectivo Real Contado en Mano ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={saldoRealEfectivo}
                onChange={(e) => setSaldoRealEfectivo(Number(e.target.value))}
                className="w-full h-11 px-3 border border-slate-300 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
              diferenciaArqueo === 0 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              <span>Estado Arqueo:</span>
              <span>{diferenciaArqueo === 0 ? '✓ CAJA CUADRADA EXACTA' : `Diferencia de $${diferenciaArqueo.toFixed(2)}`}</span>
            </div>

            <Button
              type="button"
              onClick={() => {
                setMensaje(`Arqueo dominical conciliado correctamente.`);
                setTimeout(() => setMensaje(null), 3500);
              }}
              className="w-full h-11 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs sm:text-sm"
            >
              Cerrar y Conciliar Semana
            </Button>
          </div>
        </div>

      </div>

      {/* Libro Diario */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900">Libro Diario de Caja Chica</h3>
          <span className="text-xs text-slate-400">{movimientos.length} movimientos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3">Concepto</th>
                <th className="py-2.5 px-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimientos.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-500">{m.fecha}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      m.tipo === 'INGRESO' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {m.tipo}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-700">{m.categoria}</td>
                  <td className="py-2.5 px-3 text-slate-600">{m.descripcion}</td>
                  <td className={`py-2.5 px-3 text-right font-bold tabular-nums ${
                    m.tipo === 'INGRESO' ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {m.tipo === 'INGRESO' ? '+' : '-'}${m.monto.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
