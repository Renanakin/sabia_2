/**
 * Sesión — cookies httpOnly + helpers
 * =====================================
 * - access_token: cookie httpOnly, secure en prod, sameSite=lax, 15 min
 * - refresh_token: cookie httpOnly, secure en prod, sameSite=lax, 24 h
 * - csrf_token: cookie NO httpOnly (JS necesita leerla), 24 h
 *
 * En server components / route handlers, usar `getSession()` para leer
 * la sesión actual desde las cookies.
 */

import { cookies } from 'next/headers';
import { verifyAccessToken, type AccessTokenClaims } from './jwt';

export const SESSION_COOKIES = {
  access: 'sabia_access',
  refresh: 'sabia_refresh',
  csrf: 'sabia_csrf',
} as const;

export const SESSION_OPTIONS = {
  access: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 15 * 60, // 15 min
  },
  refresh: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 24 * 60 * 60, // 24 h
  },
  csrf: {
    // NO httpOnly: el cliente necesita leerlo para enviarlo en header
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 24 * 60 * 60,
  },
} as const;

export interface Session {
  userId: string;
  email: string;
  role: AccessTokenClaims['role'];
  installation: string;
}

/**
 * Lee la sesión actual desde la cookie de access token.
 * Devuelve null si no hay sesión o el token es inválido/expirado.
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIES.access)?.value;
  if (!token) return null;

  const claims = await verifyAccessToken(token);
  if (!claims) return null;

  return {
    userId: claims.sub,
    email: claims.email,
    role: claims.role,
    installation: claims.installation,
  };
}

/**
 * Helper para requerir un rol específico en route handlers.
 * Devuelve la sesión si el rol coincide, sino null.
 */
export async function requireRole(
  allowedRoles: AccessTokenClaims['role'][]
): Promise<Session | null> {
  const session = await getSession();
  if (!session) return null;
  if (!allowedRoles.includes(session.role)) return null;
  return session;
}
