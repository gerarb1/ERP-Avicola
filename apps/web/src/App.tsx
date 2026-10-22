import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./shared/components/Layout";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { LoginPage } from "./features/auth/components/LoginPage";
import { useAuthStore } from "./features/auth/auth-store";
import { ProduccionPage } from "./features/produccion/pages/ProduccionPage";
import { InventarioPage } from "./features/inventario/pages/InventarioPage";
import { VentasPage } from "./features/ventas/pages/VentasPage";
import { FinanzasPage } from "./features/finanzas/pages/FinanzasPage";
import { DashboardPage } from "./features/bi/pages/DashboardPage";

import {
  Cuentas,
  MiCuenta,
  CodigoRespaldo,
  RecuperarCuenta,
} from "./features/operacion/Cuentas";
import { Granja } from "./features/operacion/Granja";

function RootRedirect() {
  const role = useAuthStore((s) => s.userRole);
  if (!role) return <Navigate to="/login" replace />;
  if (role === "administrador") return <Navigate to="/bi" replace />;
  if (role === "encargado_galpon") return <Navigate to="/produccion" replace />;
  if (role === "encargado_almacen")
    return <Navigate to="/inventario" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar-cuenta" element={<RecuperarCuenta />} />
        <Route path="/codigo-respaldo" element={<CodigoRespaldo />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<RootRedirect />} />

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["administrador", "encargado_galpon"]}
                />
              }
            >
              <Route path="/produccion" element={<ProduccionPage />} />
            </Route>

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["administrador", "encargado_almacen"]}
                />
              }
            >
              <Route path="/inventario" element={<InventarioPage />} />
              <Route path="/ventas" element={<VentasPage />} />
            </Route>

            <Route path="/finanzas" element={<FinanzasPage />} />
            <Route path="/mi-cuenta" element={<MiCuenta />} />
            <Route
              element={<ProtectedRoute allowedRoles={["administrador"]} />}
            >
              <Route path="/bi" element={<DashboardPage />} />
              <Route path="/cuentas" element={<Cuentas />} />
              <Route path="/granja" element={<Granja />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
