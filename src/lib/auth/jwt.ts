/**
 * JWT — versión Node (para Route Handlers, Server Components, scripts).
 * =====================================================================
 *
 * Re-exporta las funciones de `jwt-edge.ts` (compatibles con ambos runtimes)
 * y agrega las funciones específicas de Node con `node:crypto`:
 * - Generación de refresh tokens (random bytes)
 * - Hashing de refresh tokens (sha256)
 */

import 'server-only';
import { randomBytes, createHash } from 'node:crypto';

export { signAccessToken, verifyAccessToken, type AccessTokenClaims } from './jwt-edge';

const REFRESH_TOKEN_TTL = 24 * 60 * 60; // 24h en segundos

/**
 * Genera un refresh token en texto plano y su hash.
 * El texto plano va al cliente, el hash va a la DB.
 */
export function generateRefreshToken(): { token: string; hash: string } {
  const token = randomBytes(48).toString('base64url');
  const hash = createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function refreshTokenExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL * 1000);
}

export const REFRESH_TTL_SECONDS = REFRESH_TOKEN_TTL;
