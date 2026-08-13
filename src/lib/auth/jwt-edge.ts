/**
 * JWT — versión Edge-compatible (solo para middleware).
 * =======================================================
 *
 * El middleware de Next.js corre en Edge Runtime, que NO soporta `node:crypto`.
 * Por eso este archivo usa SOLO `jose` y la Web Crypto API.
 *
 * Para el resto del código (Node runtime), usar `jwt.ts` que también maneja
 * refresh tokens con `node:crypto`.
 */

import { SignJWT, jwtVerify } from 'jose';

const ACCESS_TOKEN_TTL = '15m';

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    // En middleware, loguear y devolver array vacío causaría fallos silenciosos.
    // Mejor fallar alto con un mensaje claro.
    throw new Error(
      'AUTH_SECRET no definida o menor a 32 caracteres. ' +
        'Genera una con: openssl rand -base64 32'
    );
  }
  return new TextEncoder().encode(secret);
}

export interface AccessTokenClaims {
  sub: string;
  email: string;
  role: 'superadmin' | 'contador' | 'asistente' | 'cliente';
  installation: string;
  iat?: number;
  exp?: number;
}

export async function signAccessToken(
  claims: Omit<AccessTokenClaims, 'iat' | 'exp'>
): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .setIssuer('sabiacontable')
    .setAudience('sabiacontable-web')
    .sign(getSecret());
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: 'sabiacontable',
      audience: 'sabiacontable-web',
    });
    return payload as unknown as AccessTokenClaims;
  } catch {
    return null;
  }
}
