/**
 * Cliente API helper para componentes del cliente
 * ================================================
 *
 * Wrapper que:
 * - Parsea JSON
 * - Maneja errores
 * - Lee la cookie CSRF y la envía en header `X-CSRF-Token` para mutaciones
 *
 * Uso:
 *   const res = await api.post('/api/auth/login', { email, password });
 */

'use client';

const CSRF_COOKIE = 'sabia_csrf';

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CSRF_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.split('=')[1]);
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

async function request<T>(
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: unknown
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (method !== 'GET') {
    const csrf = getCsrfToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }

  const res = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    return {
      ok: false,
      error: { code: 'invalid_response', message: 'Respuesta inválida del servidor' },
    };
  }

  return json;
}

export const api = {
  get: <T>(url: string) => request<T>(url, 'GET'),
  post: <T>(url: string, body?: unknown) => request<T>(url, 'POST', body),
  patch: <T>(url: string, body?: unknown) => request<T>(url, 'PATCH', body),
  delete: <T>(url: string) => request<T>(url, 'DELETE'),
};
