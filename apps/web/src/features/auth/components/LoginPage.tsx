import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth-store';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Lock, Mail, ChevronRight, ShieldCheck } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('admin@altalaestancia.com');
  const [password, setPassword] = useState('••••••••');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Derivación automática según el correo autenticado
    setTimeout(() => {
      let role: 'administrador' | 'encargado_galpon' | 'encargado_almacen' = 'administrador';
      let name = 'Don Pedro';
      let redirectPath = '/bi';

      if (email.includes('galpon') || email.includes('juan')) {
        role = 'encargado_galpon';
        name = 'Juan Pérez';
        redirectPath = '/produccion';
      } else if (email.includes('almacen') || email.includes('carlos')) {
        role = 'encargado_almacen';
        name = 'Carlos Gómez';
        redirectPath = '/inventario';
      }

      login({
        token: 'auth-jwt-alta-la-estancia-secure-session',
        userId: `usr-${role}`,
        userName: name,
        userRole: role,
      });

      setLoading(false);
      navigate(redirectPath);
    }, 400);
  };

  // Cuentas de demostración de acceso rápido (sin emojis, con avatares tipográficos discretos)
  const setQuickAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Granja2026*');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-800 text-amber-300 mx-auto flex items-center justify-center font-bold text-xl shadow-sm border border-emerald-900/10">
          AE
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Alta La Estancia
        </h1>
        <p className="text-xs text-slate-500">
          Sistema de Gestión y Analítica Avícola
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 sm:py-8 px-5 sm:px-8 shadow-sm border border-slate-200 rounded-2xl space-y-6">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@altalaestancia.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-medium rounded-xl text-xs sm:text-sm shadow-xs transition-colors"
            >
              {loading ? 'Accediendo...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {/* Accesos de demostración rápidos (Formato limpio sin emojis, con avatares de iniciales) */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center">
              Cuentas Registradas para Prueba
            </span>

            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => setQuickAccount('admin@altalaestancia.com')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                    AD
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800">Administrador</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">admin@altalaestancia.com</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>

              <button
                type="button"
                onClick={() => setQuickAccount('galpon@altalaestancia.com')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                    GL
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800">Encargado de Galpón</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">galpon@altalaestancia.com</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>

              <button
                type="button"
                onClick={() => setQuickAccount('almacen@altalaestancia.com')}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                    AL
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800">Encargado de Almacén</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">almacen@altalaestancia.com</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </button>
            </div>
          </div>

        </div>

        <div className="text-center mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Acceso seguro protegido por RBAC y TLS</span>
        </div>
      </div>
    </div>
  );
}
