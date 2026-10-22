import { useAuthStore } from '../features/auth/auth-store';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { token, userId, userRole } = useAuthStore.getState();
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (userId) {
    headers.set('X-User-Id', userId);
  }
  if (userRole) {
    headers.set('X-User-Role', userRole);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
