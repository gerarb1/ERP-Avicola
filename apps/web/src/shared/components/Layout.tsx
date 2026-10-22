import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Egg, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  BarChart2, 
  Menu, 
  X, 
  Search, 
  Bell, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/auth-store';
import { useGlobalContextStore } from '../stores/context-store';
import { CommandPalette } from './CommandPalette';
import { SlideOverSheet } from './SlideOverSheet';
import { OfflineBanner } from './OfflineBanner';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { BottomNav } from './BottomNav';

export function Layout() {
  const { userName, userRole, logout } = useAuthStore();
  const { currentUnit, unitLabel, loteActivo, setUnit } = useGlobalContextStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [contextDropdownOpen, setContextDropdownOpen] = useState(false);
  const [incidentSheetOpen, setIncidentSheetOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Avatar con iniciales limpias (sin emojis)
  const userInitials = (userName || 'Admin').substring(0, 2).toUpperCase();

  const getRoleDisplayName = (role: string | null) => {
    switch (role) {
      case 'administrador': return 'Administrador';
      case 'encargado_galpon': return 'Encargado de Galpón';
      case 'encargado_almacen': return 'Encargado de Almacén';
      default: return 'Usuario';
    }
  };

  // Breadcrumbs dinámicos según ruta
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes('produccion')) return ['Granja', 'Aves de Postura', unitLabel, 'Producción'];
    if (path.includes('inventario')) return ['Granja', 'Logística', 'Almacén', 'Stock Tallas'];
    if (path.includes('ventas')) return ['Granja', 'Comercialización', 'Remisiones'];
    if (path.includes('finanzas')) return ['Granja', 'Administración', 'Caja Chica'];
    if (path.includes('bi')) return ['Granja', 'Dirección', 'Business Intelligence'];
    return ['Granja', unitLabel, 'Panel'];
  };

  // Estructura modular del menú con filtrado estricto por rol
  const menuSections = [
    {
      heading: 'General',
      roles: ['administrador', 'encargado_galpon', 'encargado_almacen'],
      items: [
        { to: '/produccion', label: 'Galpones y Postura', icon: Egg, roles: ['administrador', 'encargado_galpon'] },
        { to: '/inventario', label: 'Inventario y Almacén', icon: Package, roles: ['administrador', 'encargado_almacen'] },
      ]
    },
    {
      heading: 'Comercial',
      roles: ['administrador', 'encargado_almacen'],
      items: [
        { to: '/ventas', label: 'Notas de Remisión', icon: ShoppingCart, roles: ['administrador', 'encargado_almacen'] },
      ]
    },
    {
      heading: 'Administración',
      roles: ['administrador'],
      items: [
        { to: '/finanzas', label: 'Caja Chica y Arqueos', icon: DollarSign, roles: ['administrador'] },
        { to: '/bi', label: 'Módulo BI & Analítica', icon: BarChart2, roles: ['administrador'] },
      ]
    }
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F8FAFC] text-slate-800">
      <OfflineBanner />

      {/* =================================================================== */}
      {/* TOP APP BAR FIJA: Contexto Global, Breadcrumbs y Cambio Rápido */}
      {/* =================================================================== */}
      <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between shrink-0 z-30 select-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        
        {/* Lado Izquierdo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botón menú móvil (hamburguesa) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Botón colapsar sidebar desktop */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Colapsar o expandir barra lateral"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Logo / Marca */}
          <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center text-amber-300 font-bold text-xs shadow-xs">
              AE
            </div>
            <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-900 hidden sm:inline">
              Alta La Estancia
            </span>
          </div>

          {/* Selector Global de Galpón / Almacén (Pill Selector) */}
          <div className="relative">
            <button
              onClick={() => setContextDropdownOpen(!contextDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-full text-xs font-medium text-slate-800 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
              <span className="font-semibold truncate max-w-[110px] sm:max-w-none">{unitLabel}</span>
              <span className="text-[11px] text-slate-400 hidden lg:inline font-normal">· {loteActivo}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>

            {/* Dropdown Selector de Contexto */}
            {contextDropdownOpen && (
              <div className="absolute top-9 left-0 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unidades Productivas</div>
                <button
                  onClick={() => { setUnit('galpon-1'); setContextDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${currentUnit === 'galpon-1' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'}`}
                >
                  <span>Galpón 01 (1,500 aves · Sem 34)</span>
                  {currentUnit === 'galpon-1' && <span className="text-emerald-700 text-xs">✓</span>}
                </button>
                <button
                  onClick={() => { setUnit('galpon-2'); setContextDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${currentUnit === 'galpon-2' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'}`}
                >
                  <span>Galpón 02 (2,500 aves · Sem 28)</span>
                  {currentUnit === 'galpon-2' && <span className="text-emerald-700 text-xs">✓</span>}
                </button>
                <div className="my-1 border-t border-slate-100" />
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logística</div>
                <button
                  onClick={() => { setUnit('almacen'); setContextDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${currentUnit === 'almacen' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'}`}
                >
                  <span>Almacén Central (Stock Tallas)</span>
                  {currentUnit === 'almacen' && <span className="text-emerald-700 text-xs">✓</span>}
                </button>
                <button
                  onClick={() => { setUnit('todos'); setContextDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${currentUnit === 'todos' ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'}`}
                >
                  <span>Toda la Granja (Consolidado)</span>
                  {currentUnit === 'todos' && <span className="text-emerald-700 text-xs">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Breadcrumbs (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1.5 text-xs text-slate-400 pl-2">
            {getBreadcrumbs().map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
                <span className={i === getBreadcrumbs().length - 1 ? 'font-semibold text-slate-800' : 'hover:text-slate-600'}>
                  {b}
                </span>
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Lado Derecho */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Command Palette Trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500 transition-colors w-44 lg:w-52 justify-between"
          >
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Buscar galpón, lote...</span>
            </span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-500 font-mono">
              Ctrl+K
            </kbd>
          </button>

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Indicador de Sincronización Offline */}
          <SyncStatusIndicator />

          {/* Notificaciones Críticas (Punto discreto ámbar si hay anomalía) */}
          <button
            onClick={() => setIncidentSheetOpen(true)}
            className="relative p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Inspeccionar incidentes"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          </button>

          {/* Perfil & Avatar Simple (Sin emojis) */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-800">
              {userInitials}
            </div>
            <div className="hidden lg:block text-left text-xs leading-tight">
              <div className="font-semibold text-slate-900 truncate max-w-[120px]">{userName || 'Usuario'}</div>
              <div className="text-[10px] text-slate-500">{getRoleDisplayName(userRole)}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-0.5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* =================================================================== */}
      {/* CONTENEDOR PRINCIPAL: SIDEBAR + CANVAS DE TRABAJO */}
      {/* =================================================================== */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* SIDEBAR MODULAR (DESKTOP) */}
        <aside
          className={`hidden md:flex flex-col justify-between shrink-0 bg-white border-r border-slate-200 transition-all duration-200 select-none overflow-y-auto ${
            sidebarCollapsed ? 'w-16' : 'w-60'
          }`}
        >
          <div className="p-3 space-y-5">
            {menuSections
              .filter(sec => sec.roles.includes(userRole || ''))
              .map((sec, secIdx) => {
                const visibleItems = sec.items.filter(it => it.roles.includes(userRole || ''));
                if (visibleItems.length === 0) return null;

                return (
                  <div key={secIdx} className="space-y-1">
                    {!sidebarCollapsed && (
                      <div className="px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {sec.heading}
                      </div>
                    )}
                    {visibleItems.map((item, itIdx) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={itIdx}
                          to={item.to}
                          title={sidebarCollapsed ? item.label : undefined}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-800 border-l-2 border-emerald-700 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                          }
                        >
                          <Icon className="w-4 h-4 shrink-0 text-slate-600" />
                          {!sidebarCollapsed && <span>{item.label}</span>}
                        </NavLink>
                      );
                    })}
                  </div>
                );
              })}
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <div className={`flex items-center justify-between text-xs text-slate-500 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {!sidebarCollapsed && <span className="font-medium text-[11px]">Sistema Online</span>}
              </div>
            </div>
          </div>
        </aside>

        {/* SIDEBAR MÓVIL (DRAWER DESLIZANTE CON OVERLAY) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 shadow-2xl flex flex-col justify-between p-4 z-50 animate-in slide-in-from-left duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center text-amber-300 font-bold text-xs">AE</div>
                    <span className="font-bold text-sm text-slate-900">Alta La Estancia</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {menuSections
                    .filter(sec => sec.roles.includes(userRole || ''))
                    .map((sec, secIdx) => (
                      <div key={secIdx} className="space-y-1">
                        <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sec.heading}</div>
                        {sec.items
                          .filter(it => it.roles.includes(userRole || ''))
                          .map((item, itIdx) => {
                            const Icon = item.icon;
                            return (
                              <NavLink
                                key={itIdx}
                                to={item.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className={({ isActive }) =>
                                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                                    isActive ? 'bg-emerald-50 text-emerald-800 border-l-2 border-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                                  }`
                                }
                              >
                                <Icon className="w-4 h-4 text-slate-600" />
                                <span>{item.label}</span>
                              </NavLink>
                            );
                          })}
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                    {userInitials}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 leading-tight">{userName}</div>
                    <div className="text-[10px] text-slate-500">{getRoleDisplayName(userRole)}</div>
                  </div>
                </div>
                <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-slate-700">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CANVAS DE TRABAJO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* NAVEGACIÓN INFERIOR (BOTTOM NAV) — SÓLO EN PANTALLAS MÓVILES */}
      <div className="md:hidden">
        <BottomNav />
      </div>

      {/* COMMAND PALETTE MODAL (Ctrl+K) */}
      <CommandPalette isOpen={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />

      {/* SLIDE-OVER SHEET DE INCIDENTES / DETALLE */}
      <SlideOverSheet
        isOpen={incidentSheetOpen}
        onClose={() => setIncidentSheetOpen(false)}
        title="Bitácora de Monitoreo — Galpón 02"
        subtitle="Monitoreo de lote Hy-Line Brown (Semana 28)"
        footer={
          <button
            onClick={() => setIncidentSheetOpen(false)}
            className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            Entendido
          </button>
        }
      >
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Observación preventiva de postura</span>
            </div>
            <p className="text-slate-600">
              Galpón 02 registró una recolección ligeramente menor en el lote de 2,468 aves. El censo está validado y dentro del rango biológico normal.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Aves Vivas</span>
              <span className="text-base font-bold text-slate-900">2,468</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Postura Promedio</span>
              <span className="text-base font-bold text-emerald-700">93.9%</span>
            </div>
          </div>
        </div>
      </SlideOverSheet>

    </div>
  );
}
