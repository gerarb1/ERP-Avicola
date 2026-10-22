import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Egg,
  Package,
  ShoppingCart,
  Wallet,
  ChartNoAxesCombined,
  Bell,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { useAuthStore } from "@/features/auth/auth-store";
import { useData, State, type Row } from "@/features/operacion/common";
import { apiClient } from "@/lib/api-client";
export function Layout() {
  const { userName, userRole, logout } = useAuthStore();
  const navigate = useNavigate(),
    cache = useQueryClient();
  const [menu, setMenu] = useState(false),
    [notifications, setNotifications] = useState(false),
    [online, setOnline] = useState(navigator.onLine);
  const q = useData("/notificaciones"),
    me = useData<Row>("/auth/me");
  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);
  const links = [
    {
      to: "/produccion",
      label: "Galpones y postura",
      icon: Egg,
      roles: ["administrador", "encargado_galpon"],
    },
    {
      to: "/inventario",
      label: "Inventario y almacén",
      icon: Package,
      roles: ["administrador", "encargado_almacen"],
    },
    {
      to: "/ventas",
      label: "Notas de remisión",
      icon: ShoppingCart,
      roles: ["administrador", "encargado_almacen"],
    },
    {
      to: "/finanzas",
      label: userRole === "administrador" ? "Caja y arqueos" : "Mis gastos",
      icon: Wallet,
      roles: ["administrador", "encargado_galpon", "encargado_almacen"],
    },
    {
      to: "/bi",
      label: "Rendimiento y análisis",
      icon: ChartNoAxesCombined,
      roles: ["administrador"],
    },
  ].filter((l) => l.roles.includes(userRole ?? ""));
  const roles: Record<string, string> = {
    administrador: "Administración",
    encargado_galpon: "Encargado de galpón",
    encargado_almacen: "Encargado de almacén",
  };
  async function salir() {
    try {
      await apiClient("/auth/logout", { method: "POST" });
    } finally {
      logout();
      cache.clear();
      navigate("/login");
    }
  }
  async function leer(id: string) {
    await apiClient("/notificaciones/leer", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
    await cache.invalidateQueries({
      queryKey: [useAuthStore.getState().userId, "/notificaciones"],
    });
  }
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="h-16 bg-white border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            aria-label="Abrir menú"
            onClick={() => setMenu(!menu)}
            className="md:hidden p-2"
          >
            <Menu size={20} />
          </button>
          <div className="rounded-xl bg-emerald-900 text-amber-200 p-2 font-bold">
            AE
          </div>
          <div>
            <p className="font-bold text-sm">Alta La Estancia</p>
            <p className="text-xs text-slate-500">
              Gestión avícola · Bolivianos (Bs)
            </p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button
            aria-label="Notificaciones"
            onClick={() => setNotifications(true)}
            className="relative p-2"
          >
            <Bell size={20} />
            {q.data?.some((n) => !n.leida) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold">
              {me.data?.nombre ?? userName}
            </p>
            <p className="text-xs text-slate-500">{roles[userRole ?? ""]}</p>
          </div>
          <button
            aria-label="Cerrar sesión"
            onClick={salir}
            className="p-2 text-slate-500"
          >
            <LogOut size={19} />
          </button>
        </div>
      </header>
      {!online && (
        <p
          role="alert"
          className="bg-amber-100 text-amber-900 px-6 py-3 text-sm"
        >
          Sin conexión. Los nuevos registros requieren conexión para confirmar
          stock y evitar duplicados.
        </p>
      )}
      <div className="flex">
        <aside
          className={`${menu ? "block fixed inset-y-16 left-0 z-20 shadow-xl" : "hidden"} md:block md:sticky md:top-16 w-60 h-[calc(100vh-4rem)] bg-white border-r shrink-0 p-4`}
        >
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">
            Operación de la granja
          </p>
          <nav className="space-y-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenu(false)}
                className={({ isActive }) =>
                  `flex gap-3 items-center p-3 rounded-xl text-sm ${isActive ? "bg-emerald-50 text-emerald-900 font-semibold" : "text-slate-600 hover:bg-slate-50"}`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
          <p className="text-xs text-slate-400 mt-8">
            Tu cuenta tiene acceso según su función. Los movimientos conservan
            fecha y responsable.
          </p>
        </aside>
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      {notifications && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            aria-label="Cerrar panel de notificaciones"
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setNotifications(false)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Notificaciones semanales"
            className="relative bg-white w-full max-w-lg h-full overflow-auto p-6 space-y-4 shadow-xl"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Notificaciones semanales</h2>
              <button
                aria-label="Cerrar"
                onClick={() => setNotifications(false)}
              >
                <X />
              </button>
            </div>
            <p className="text-sm text-slate-500">
              Resumen de la última semana de lunes a domingo y seguimientos
              pendientes. Se actualiza al comenzar cada semana.
            </p>
            <State query={q}>
              {q.data?.length ? (
                q.data.map((n) => (
                  <article
                    key={n.id}
                    className={`p-4 rounded-xl border space-y-2 ${n.leida ? "bg-slate-50" : "border-emerald-200 bg-emerald-50"}`}
                  >
                    <h3 className="text-sm font-semibold">{n.titulo}</h3>
                    <p className="text-sm text-slate-600">{n.texto}</p>
                    {!n.leida && (
                      <button
                        className="text-sm underline text-emerald-800"
                        onClick={() => leer(n.id)}
                      >
                        Marcar como leída
                      </button>
                    )}
                  </article>
                ))
              ) : (
                <p>No hay notificaciones.</p>
              )}
            </State>
          </section>
        </div>
      )}
    </div>
  );
}
