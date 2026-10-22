import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { REMISIONES_INICIALES, TALLAS_INICIALES, NotaRemision } from '@/lib/mockData';
import { ShoppingCart, Plus, CheckCircle2, FileText, Calendar, Trash2 } from 'lucide-react';

export function VentasPage() {
  const [remisiones, setRemisiones] = useState<NotaRemision[]>(REMISIONES_INICIALES);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Formulario
  const [clienteNombre, setClienteNombre] = useState('Distribuidora Avícola Don Pedro');
  const [tipoCliente, setTipoCliente] = useState<'MAYORISTA' | 'MINORISTA'>('MAYORISTA');
  const [tipoPago, setTipoPago] = useState<'CONTADO' | 'CREDITO'>('CREDITO');
  
  const [lineas, setLineas] = useState([
    { tallaCodigo: 'G', maples: 50, precioMaple: 4.40 },
    { tallaCodigo: 'M', maples: 30, precioMaple: 3.85 },
  ]);

  const clientesRegistrados = [
    { nombre: 'Distribuidora Avícola Don Pedro', tipo: 'MAYORISTA', saldo: 1034.00 },
    { nombre: 'Mercado Central - Puesto 45', tipo: 'MAYORISTA', saldo: 0.00 },
    { nombre: 'Panadería La Espiga Dorada', tipo: 'MINORISTA', saldo: 0.00 },
    { nombre: 'Restaurante El Gran Corral', tipo: 'MAYORISTA', saldo: 420.00 },
  ];

  const totalCalculado = lineas.reduce((acc, l) => acc + (l.maples * l.precioMaple), 0);

  const handleAgregarLinea = () => {
    setLineas([...lineas, { tallaCodigo: 'CH', maples: 10, precioMaple: 3.20 }]);
  };

  const handleEliminarLinea = (idx: number) => {
    setLineas(lineas.filter((_, i) => i !== idx));
  };

  const handleEmitirRemision = (e: React.FormEvent) => {
    e.preventDefault();
    if (lineas.length === 0) return;

    const nueva: NotaRemision = {
      id: `rem-${Date.now()}`,
      numero: remisiones.length + 101,
      fecha: new Date().toISOString().split('T')[0],
      cliente: clienteNombre,
      tipoCliente,
      tipoPago,
      items: lineas.map(l => ({
        tallaCodigo: l.tallaCodigo,
        maples: l.maples,
        precioMaple: l.precioMaple,
        subtotal: l.maples * l.precioMaple,
      })),
      total: totalCalculado,
      estado: tipoPago === 'CONTADO' ? 'PAGADA' : 'PENDIENTE',
    };

    setRemisiones([nueva, ...remisiones]);
    setMensaje(`Nota de Remisión #${nueva.numero} emitida por $${totalCalculado.toFixed(2)}.`);
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
            Ventas & Notas de Remisión
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Emisión de despachos dominicales, pedidos de semana y control de crédito a mayoristas
          </p>
        </div>

        <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 text-xs font-medium self-start sm:self-auto flex items-center gap-1.5 shadow-2xs">
          <Calendar className="w-4 h-4 text-emerald-700" />
          <span>Despacho fuerte: <strong>Domingo</strong></span>
        </div>
      </div>

      {/* Grid: Formulario + Cuentas por Cobrar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Formulario de Emisión */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-800" />
              <h2 className="font-bold text-sm text-slate-900">Nueva Nota de Remisión</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">Folio #{remisiones.length + 101}</span>
          </div>

          <form onSubmit={handleEmitirRemision} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-slate-700">Cliente Mayorista / Minorista</label>
                <select
                  value={clienteNombre}
                  onChange={(e) => {
                    setClienteNombre(e.target.value);
                    const cli = clientesRegistrados.find(c => c.nombre === e.target.value);
                    if (cli) setTipoCliente(cli.tipo as any);
                  }}
                  className="w-full h-11 px-3 border border-slate-300 rounded-xl text-xs sm:text-sm bg-white focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                >
                  {clientesRegistrados.map(c => (
                    <option key={c.nombre} value={c.nombre}>{c.nombre} ({c.tipo})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Condición de Pago</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl h-11 items-center">
                  <button
                    type="button"
                    onClick={() => setTipoPago('CONTADO')}
                    className={`h-9 text-xs rounded-lg font-bold transition-all ${
                      tipoPago === 'CONTADO' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Contado
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoPago('CREDITO')}
                    className={`h-9 text-xs rounded-lg font-bold transition-all ${
                      tipoPago === 'CREDITO' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Crédito
                  </button>
                </div>
              </div>
            </div>

            {/* Selector de tallas */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Detalle de Huevos por Talla</span>
                <button
                  type="button"
                  onClick={handleAgregarLinea}
                  className="text-emerald-800 hover:text-emerald-900 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Talla
                </button>
              </div>

              {lineas.map((linea, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="col-span-5 sm:col-span-5">
                    <select
                      value={linea.tallaCodigo}
                      onChange={(e) => {
                        const nuevaTalla = TALLAS_INICIALES.find(t => t.codigo === e.target.value);
                        const copy = [...lineas];
                        copy[idx].tallaCodigo = e.target.value;
                        if (nuevaTalla) copy[idx].precioMaple = nuevaTalla.precioMaple;
                        setLineas(copy);
                      }}
                      className="w-full h-9 px-2 text-xs bg-white border border-slate-300 rounded-lg font-semibold"
                    >
                      {TALLAS_INICIALES.map(t => (
                        <option key={t.codigo} value={t.codigo}>Talla {t.codigo} (${t.precioMaple.toFixed(2)})</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-4 sm:col-span-4">
                    <input
                      type="number"
                      min="1"
                      placeholder="Maples"
                      value={linea.maples}
                      onChange={(e) => {
                        const copy = [...lineas];
                        copy[idx].maples = Number(e.target.value);
                        setLineas(copy);
                      }}
                      className="w-full h-9 px-2 text-xs border border-slate-300 rounded-lg text-right font-bold"
                    />
                  </div>

                  <div className="col-span-2 text-right text-xs font-bold text-slate-900 tabular-nums">
                    ${(linea.maples * linea.precioMaple).toFixed(2)}
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleEliminarLinea(idx)}
                      className="text-slate-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 uppercase font-semibold block">Total Remisión</span>
                <span className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">${totalCalculado.toFixed(2)}</span>
              </div>
              <Button type="submit" className="h-11 px-5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs">
                Emitir y Descontar Stock
              </Button>
            </div>
          </form>
        </div>

        {/* Panel Secundario: Cuentas por Cobrar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Cuentas por Cobrar (Crédito)</h3>
            <p className="text-xs text-slate-500">Saldo pendiente de mayoristas</p>
          </div>

          <div className="space-y-2.5">
            {clientesRegistrados.map((c) => (
              <div key={c.nombre} className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{c.nombre}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">{c.tipo}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-500">Saldo:</span>
                  <span className={`font-bold tabular-nums ${c.saldo > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    ${c.saldo.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-semibold text-slate-700">
            <span>Total en Calle:</span>
            <span className="font-bold text-red-600 tabular-nums">
              ${clientesRegistrados.reduce((acc, c) => acc + c.saldo, 0).toFixed(2)}
            </span>
          </div>
        </div>

      </div>

      {/* Historial */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900">Historial de Despachos</h3>
          <span className="text-xs text-slate-400">{remisiones.length} remisiones</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Folio</th>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Condición</th>
                <th className="py-2.5 px-3">Tallas</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {remisiones.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">#{r.numero}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{r.fecha}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{r.cliente}</td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.tipoPago === 'CONTADO' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {r.tipoPago}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {r.items.map(it => `${it.maples}m. ${it.tallaCodigo}`).join(', ')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                    ${r.total.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.estado === 'PAGADA' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {r.estado}
                    </span>
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
