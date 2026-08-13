/**
 * POST /api/auth/login
 * =====================
 * Body: { email, password }
 *
 * Flujo:
 * 1. Validar con Zod
 * 2. Rate limit por IP+email (5 req / 5 min)
 * 3. Buscar usuario por email en la instalación actual
 * 4. Verificar password (bcrypt)
 * 5. Verificar cuenta activa y no bloqueada
 * 6. Generar access token (JWT) + refresh token (random)
 * 7. Guardar refresh token hasheado en DB
 * 8. Setear cookies (access httpOnly, refresh httpOnly, csrf)
 * 9. Audit log
 *
 * SEGURIDAD:
 * - Mensaje de error genérico (no filtra si el email existe)
 * - Lockout tras 10 intentos fallidos (30 min)
 * - JWT firmado con HS256 + AUTH_SECRET
 * - Refresh token almacenado hasheado en DB
 * - CSRF token para mutaciones
 */

import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { users, refreshTokens } from '@/lib/db/schema';
import { verifyPassword } from '@/lib/auth/password';
import {
  signAccessToken,
  generateRefreshToken,
  refreshTokenExpiresAt,
  REFRESH_TTL_SECONDS,
} from '@/lib/auth/jwt';
import { rateLimit } from '@/lib/auth/rate-limit';
import { generateCsrfToken, setCsrfCookie } from '@/lib/auth/csrf';
import { audit } from '@/lib/auth/audit';
import { SESSION_COOKIES, SESSION_OPTIONS } from '@/lib/auth/session';
import {
  parseJsonBody,
  getClientIp,
  getUserAgent,
  HttpError,
} from '@/lib/http';

const loginSchema = z.object({
  email: z.string().email().max(255).toLowerCase().trim(),
  password: z.string().min(1).max(200),
});

const FAILED_LOGIN_LIMIT = 10;
const LOCKOUT_MINUTES = 30;

export async function POST(req: Request): Promise<NextResponse> {
  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  // 1. Parsear y validar body
  let body;
  try {
    body = await parseJsonBody(req, loginSchema);
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json(
        { ok: false, error: { code: e.code, message: e.message, details: e.details } },
        { status: e.status }
      );
    }
    throw e;
  }

  const { email, password } = body;

  // 2. Rate limit por IP+email
  const rl = await rateLimit('login', `${ip}|${email}`, 5, 300);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'rate_limited',
          message: 'Demasiados intentos. Intenta más tarde.',
          details: { resetIn: rl.resetIn },
        },
      },
      { status: 429, headers: { 'Retry-After': String(rl.resetIn) } }
    );
  }

  // 3. Resolver instalación actual
  // En MVP single-tenant, usamos INSTALLATION_SLUG de env.
  // En multi-install, el middleware setea X-Installation-Slug.
  const installationSlug =
    req.headers.get('x-installation-slug') ?? process.env.INSTALLATION_SLUG ?? 'dev';

  const installation = await db.query.installations.findFirst({
    where: (i, { eq }) => eq(i.slug, installationSlug),
  });
  if (!installation) {
    return NextResponse.json(
      { ok: false, error: { code: 'invalid_credentials', message: 'Credenciales inválidas' } },
      { status: 401 }
    );
  }

  // 4. Buscar usuario
  const user = await db.query.users.findFirst({
    where: and(eq(users.installationId, installation.id), eq(users.email, email)),
  });

  const invalidCredsResponse = () =>
    NextResponse.json(
      { ok: false, error: { code: 'invalid_credentials', message: 'Credenciales inválidas' } },
      { status: 401 }
    );

  if (!user) {
    await audit({
      installationId: installation.id,
      action: 'login_failed',
      ipAddress: ip,
      userAgent: ua,
      metadata: { email, reason: 'user_not_found' },
    });
    return invalidCredsResponse();
  }

  if (!user.active) {
    await audit({
      installationId: installation.id,
      userId: user.id,
      action: 'login_failed',
      ipAddress: ip,
      userAgent: ua,
      metadata: { email, reason: 'user_inactive' },
    });
    return invalidCredsResponse();
  }

  // 5. Verificar lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await audit({
      installationId: installation.id,
      userId: user.id,
      action: 'login_locked',
      ipAddress: ip,
      userAgent: ua,
    });
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'account_locked',
          message: 'Cuenta bloqueada temporalmente',
          details: { until: user.lockedUntil.toISOString() },
        },
      },
      { status: 423 }
    );
  }

  // 6. Verificar password
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const newCount = parseInt(user.failedLoginCount, 10) + 1;
    const shouldLock = newCount >= FAILED_LOGIN_LIMIT;
    await db
      .update(users)
      .set({
        failedLoginCount: String(newCount),
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    await audit({
      installationId: installation.id,
      userId: user.id,
      action: 'login_failed',
      ipAddress: ip,
      userAgent: ua,
      metadata: { reason: 'bad_password', failedCount: newCount },
    });
    return invalidCredsResponse();
  }

  // 7. Generar tokens
  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    installation: installationSlug,
  });

  const { token: refreshToken, hash: refreshHash } = generateRefreshToken();

  // 8. Guardar refresh token hasheado en DB
  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: refreshHash,
    expiresAt: refreshTokenExpiresAt(),
    userAgent: ua,
    ipAddress: ip,
  });

  // 9. Resetear failed count + actualizar lastLoginAt
  await db
    .update(users)
    .set({
      failedLoginCount: '0',
      lockedUntil: null,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  // 10. Setear cookies
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIES.access, accessToken, SESSION_OPTIONS.access);
  cookieStore.set(SESSION_COOKIES.refresh, refreshToken, {
    ...SESSION_OPTIONS.refresh,
    maxAge: REFRESH_TTL_SECONDS,
  });

  // 11. CSRF token
  const csrf = generateCsrfToken();
  await setCsrfCookie(csrf);

  // 12. Audit
  await audit({
    installationId: installation.id,
    userId: user.id,
    action: 'login_success',
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
      csrfToken: csrf, // el cliente lo guarda para mutaciones
    },
  });
}
