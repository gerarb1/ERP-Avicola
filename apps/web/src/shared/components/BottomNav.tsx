import React from 'react';
import { NavLink } from 'react-router-dom';
import { Egg, Package, ShoppingCart, DollarSign, BarChart2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/auth-store';

export function BottomNav() {
  const role = useAuthStore(s => s.userRole);

  const navItems = [
    { to: '/produccion', icon: Egg, label: 'Producción', roles: ['administrador', 'encargado_galpon'] },
    { to: '/inventario', icon: Package, label: 'Inventario', roles: ['administrador', 'encargado_almacen'] },
    { to: '/ventas', icon: ShoppingCart, label: 'Ventas', roles: ['administrador', 'encargado_almacen'] },
    { to: '/finanzas', icon: DollarSign, label: 'Finanzas', roles: ['administrador'] },
    { to: '/bi', icon: BarChart2, label: 'BI', roles: ['administrador'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role || ''));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-30 shadow-[0_-1px_3px_rgba(0,0,0,0.03)] select-none">
      <div className="flex justify-around items-center h-14 max-w-md mx-auto">
        {visibleItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-colors ${
                isActive ? 'text-emerald-800 font-bold' : 'text-slate-400 hover:text-slate-700'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-[10px] leading-tight">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
