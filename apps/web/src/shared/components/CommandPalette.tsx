import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Egg, Package, ShoppingCart, DollarSign, BarChart2 } from 'lucide-react';
import { useGlobalContextStore, ContextUnit } from '../stores/context-store';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const setUnit = useGlobalContextStore((s) => s.setUnit);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    { label: 'Galpón 01 (1,500 aves)', icon: Egg, category: 'Unidad', action: () => { setUnit('galpon-1'); navigate('/produccion'); onClose(); } },
    { label: 'Galpón 02 (2,500 aves)', icon: Egg, category: 'Unidad', action: () => { setUnit('galpon-2'); navigate('/produccion'); onClose(); } },
    { label: 'Almacén Central (Stock de Tallas)', icon: Package, category: 'Unidad', action: () => { setUnit('almacen'); navigate('/inventario'); onClose(); } },
    { label: 'Nueva Nota de Remisión Dominical', icon: ShoppingCart, category: 'Ventas', action: () => { navigate('/ventas'); onClose(); } },
    { label: 'Tablero BI & Analítica de Rentabilidad', icon: BarChart2, category: 'Analítica', action: () => { navigate('/bi'); onClose(); } },
    { label: 'Caja Chica & Arqueo Semanal', icon: DollarSign, category: 'Finanzas', action: () => { navigate('/finanzas'); onClose(); } },
  ];

  const filtered = quickActions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()) || a.category.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Input */}
        <div className="p-3.5 border-b border-slate-100 flex items-center gap-2.5 bg-white">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar galpón, lote, remisión o módulo..."
            className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Accesos Rápidos
          </div>
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No se encontraron resultados para "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between group transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-slate-900">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.category}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })
          )}
        </div>

        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navega con teclado</span>
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">ESC para cerrar</kbd>
        </div>
      </div>
    </div>
  );
}
