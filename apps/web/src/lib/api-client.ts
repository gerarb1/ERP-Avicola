import { useAuthStore } from "../features/auth/auth-store";
const configured =
  (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";
const BASE_URL = configured.endsWith("/api") ? configured : `${configured}/api`;
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const { token } = useAuthStore.getState();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (
    options.method &&
    options.method !== "GET" &&
    !headers.has("X-Idempotency-Key")
  )
    headers.set("X-Idempotency-Key", crypto.randomUUID());
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 && endpoint !== "/auth/login")
      useAuthStore.getState().logout();
    const detail =
      data.details?.map((d: any) => d.message).join(". ") ||
      data.error?.issues?.map((d: any) => d.message).join(". ");
    throw new Error(
      detail ||
        (typeof data.error === "string" ? data.error : null) ||
        data.message ||
        "No se pudo completar la operación",
    );
  }
  return response.status === 204 ? ({} as T) : response.json();
}
