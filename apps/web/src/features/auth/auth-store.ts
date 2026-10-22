import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Role = "administrador" | "encargado_galpon" | "encargado_almacen";

interface AuthState {
  token: string | null;
  userId: string | null;
  userName: string | null;
  userRole: Role | null;
  isAuthenticated: boolean;
  cambiarPassword: boolean;
  login: (data: {
    token: string;
    userId: string;
    userName: string;
    userRole: Role | string;
    cambiarPassword?: boolean;
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      userName: null,
      userRole: null,
      isAuthenticated: false,
      cambiarPassword: false,
      login: (data) =>
        set({
          ...data,
          cambiarPassword: data.cambiarPassword ?? false,
          userRole: data.userRole as Role,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          token: null,
          userId: null,
          userName: null,
          userRole: null,
          isAuthenticated: false,
          cambiarPassword: false,
        }),
    }),
    {
      name: "auth-storage-v2",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
