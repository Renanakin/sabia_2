/**
 * POST /api/auth/logout
 * ======================
 * - Invalida el refresh token actual (revocado en DB)
 * - Limpia las cookies
 * - Audit log
 *
 * Idempotente: si no hay sesión, también limpia cookies.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { refreshTokens } from '@/lib/db/schema';
import { hashRefreshToken } from '@/lib/auth/jwt';
import { audit } from '@/lib/auth/audit';
import { SESSION_COOKIES, getSession } from '@/lib/auth/session';
import { getClientIp, getUserAgent } from '@/lib/http';

export async function POST(req: Request): Promise<NextResponse> {
  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  // Leer sesión actual y refresh token antes de limpiar
  const session = await getSession();
  const refreshTokenValue = cookieStore.get(SESSION_COOKIES.refresh)?.value;

  // Revocar refresh token en DB si existe
  if (refreshTokenValue) {
    const hash = hashRefreshToken(refreshTokenValue);
    try {
      await db
        .update(refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(refreshTokens.tokenHash, hash));
    } catch {
      // Si falla, no importa: igual limpiamos cookies
    }
  }

  // Audit
  if (session) {
    await audit({
      installationId: null,
      userId: session.userId,
      action: 'logout',
      ipAddress: ip,
      userAgent: ua,
    });
  }

  // Limpiar cookies
  cookieStore.delete(SESSION_COOKIES.access);
  cookieStore.delete(SESSION_COOKIES.refresh);
  cookieStore.delete(SESSION_COOKIES.csrf);

  return NextResponse.json({ ok: true, data: { loggedOut: true } });
}
