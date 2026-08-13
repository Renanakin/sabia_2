/**
 * CSRF protection — double submit cookie pattern
 * ===============================================
 * - En cada respuesta (login, refresh) el server setea una cookie `sabia_csrf`
 *   con un valor aleatorio (NO httpOnly, para que JS lo pueda leer).
 * - En mutaciones (POST/PUT/PATCH/DELETE) el cliente debe enviar el mismo
 *   valor en el header `X-CSRF-Token`.
 * - El server valida: header === cookie.
 *
 * Esto previene que un sitio externo con la sesión del usuario (cookie)
 * pueda hacer POST porque no puede leer la cookie (mismo-origin policy).
 */

import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { SESSION_COOKIES, SESSION_OPTIONS } from './session';

export const CSRF_HEADER = 'x-csrf-token';

export function generateCsrfToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Setea el CSRF token en la respuesta (cookie no httpOnly).
 * Llamar desde el Route Handler que emite cookies de sesión.
 */
export async function setCsrfCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIES.csrf, token, SESSION_OPTIONS.csrf);
}

/**
 * Valida que el CSRF token del header coincida con el de la cookie.
 * Para usar en mutaciones.
 */
export async function validateCsrf(headerToken: string | null): Promise<boolean> {
  if (!headerToken) return false;
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(SESSION_COOKIES.csrf)?.value;
  if (!cookieToken) return false;

  // Comparación en tiempo constante
  return timingSafeEqual(headerToken, cookieToken);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
