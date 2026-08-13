/**
 * POST /api/auth/refresh
 * =======================
 * - Lee refresh token de la cookie
 * - Verifica hash en DB (no revocado, no expirado)
 * - Genera nuevo access token
 * - Rota refresh token (revoca el viejo, crea uno nuevo)
 * - Actualiza cookies
 * - Audit log
 */

import { NextResponse } from 'next/server';
import { eq, and, isNull, gt } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { refreshTokens, users } from '@/lib/db/schema';
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  refreshTokenExpiresAt,
  REFRESH_TTL_SECONDS,
} from '@/lib/auth/jwt';
import { rateLimit } from '@/lib/auth/rate-limit';
import { audit } from '@/lib/auth/audit';
import { SESSION_COOKIES, SESSION_OPTIONS } from '@/lib/auth/session';
import { getClientIp, getUserAgent } from '@/lib/http';

export async function POST(req: Request): Promise<NextResponse> {
  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  // Rate limit por IP
  const rl = await rateLimit('refresh', ip, 20, 300);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'rate_limited',
          message: 'Demasiados intentos de refresh',
        },
      },
      { status: 429, headers: { 'Retry-After': String(rl.resetIn) } }
    );
  }

  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const oldRefresh = cookieStore.get(SESSION_COOKIES.refresh)?.value;

  if (!oldRefresh) {
    return NextResponse.json(
      { ok: false, error: { code: 'no_refresh_token', message: 'No hay sesión activa' } },
      { status: 401 }
    );
  }

  const oldHash = hashRefreshToken(oldRefresh);

  // Buscar refresh token válido (no revocado, no expirado)
  const stored = await db.query.refreshTokens.findFirst({
    where: and(
      eq(refreshTokens.tokenHash, oldHash),
      isNull(refreshTokens.revokedAt),
      gt(refreshTokens.expiresAt, new Date())
    ),
  });

  if (!stored) {
    // Token inválido o expirado: limpiar cookies
    cookieStore.delete(SESSION_COOKIES.access);
    cookieStore.delete(SESSION_COOKIES.refresh);
    cookieStore.delete(SESSION_COOKIES.csrf);

    return NextResponse.json(
      { ok: false, error: { code: 'invalid_refresh_token', message: 'Token inválido o expirado' } },
      { status: 401 }
    );
  }

  // Buscar usuario
  const user = await db.query.users.findFirst({
    where: eq(users.id, stored.userId),
  });

  if (!user || !user.active) {
    // Revocar el token
    await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.id, stored.id));
    return NextResponse.json(
      { ok: false, error: { code: 'user_inactive', message: 'Usuario inactivo' } },
      { status: 401 }
    );
  }

  // Resolver instalación
  const installation = await db.query.installations.findFirst({
    where: (i, { eq }) => eq(i.id, user.installationId),
  });
  if (!installation) {
    return NextResponse.json(
      { ok: false, error: { code: 'installation_not_found', message: 'Instalación no encontrada' } },
      { status: 401 }
    );
  }

  // Generar nuevos tokens (rotación)
  const newAccess = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    installation: installation.slug,
  });

  const { token: newRefresh, hash: newHash } = generateRefreshToken();

  // Revocar el viejo
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.id, stored.id));

  // Guardar el nuevo
  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: newHash,
    expiresAt: refreshTokenExpiresAt(),
    userAgent: ua,
    ipAddress: ip,
  });

  // Actualizar cookies
  cookieStore.set(SESSION_COOKIES.access, newAccess, SESSION_OPTIONS.access);
  cookieStore.set(SESSION_COOKIES.refresh, newRefresh, {
    ...SESSION_OPTIONS.refresh,
    maxAge: REFRESH_TTL_SECONDS,
  });

  // Audit
  await audit({
    installationId: installation.id,
    userId: user.id,
    action: 'refresh_token',
    ipAddress: ip,
    userAgent: ua,
  });

  return NextResponse.json({
    ok: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    },
  });
}
