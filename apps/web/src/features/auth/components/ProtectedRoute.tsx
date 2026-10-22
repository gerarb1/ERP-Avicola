import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../auth-store";

interface Props {
  allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, userRole, cambiarPassword } = useAuthStore();

  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (cambiarPassword && location.pathname !== "/mi-cuenta")
    return <Navigate to="/mi-cuenta" replace />;

  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
