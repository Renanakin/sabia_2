/**
 * GET /api/admin/instalaciones
 * =============================
 * Lista todas las instalaciones (solo superadmin).
 *
 * POST /api/admin/instalaciones
 * ==============================
 * Crea una nueva instalación. Genera `panel_api_token_hash` y
 * `dbName/storageBucket` sugeridos. Devuelve los secrets sin hashear
 * UNA SOLA VEZ — el superadmin debe copiarlos antes de cerrar.
 */

import { NextResponse } from 'next/server';
import { desc, ilike, count } from 'drizzle-orm';
import { z } from 'zod';
import { randomBytes, createHash } from 'node:crypto';
import { db } from '@/lib/db/client';
import { installations, type Installation } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { audit } from '@/lib/auth/audit';
import {
  parseJsonBody,
  getClientIp,
  getUserAgent,
  HttpError,
} from '@/lib/http';
import { validateCsrf } from '@/lib/auth/csrf';

const createSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  subdomain: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9.-]+$/, 'Subdominio inválido'),
  dbName: z.string().min(3).max(100).regex(/^[a-z0-9_]+$/),
  storageBucket: z.string().min(3).max(100).regex(/^[a-z0-9-]+$/),
});

export async function GET(req: Request): Promise<NextResponse> {
  // 1. Auth
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'not_authenticated', message: 'No autenticado' } },
      { status: 401 }
    );
  }
  if (session.role !== 'superadmin') {
    return NextResponse.json(
      { ok: false, error: { code: 'forbidden', message: 'Requiere superadmin' } },
      { status: 403 }
    );
  }

  // 2. Query params (search + paginación simple)
  const url = new URL(req.url);
  const search = url.searchParams.get('q') ?? '';
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 200);
  const offset = Math.max(parseInt(url.searchParams.get('offset') ?? '0', 10), 0);

  const where = search ? ilike(installations.slug, `%${search}%`) : undefined;

  const items = await db
    .select()
    .from(installations)
    .where(where)
    .orderBy(desc(installations.createdAt))
    .limit(limit)
    .offset(offset);

  const total = await db
    .select({ count: count() })
    .from(installations)
    .where(where)
    .then((r) => r[0]?.count ?? 0);

  return NextResponse.json({
    ok: true,
    data: {
      items,
      total: Number(total),
      limit,
      offset,
    },
  });
}

export async function POST(req: Request): Promise<NextResponse> {
  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  // 1. Auth
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'not_authenticated', message: 'No autenticado' } },
      { status: 401 }
    );
  }
  if (session.role !== 'superadmin') {
    return NextResponse.json(
      { ok: false, error: { code: 'forbidden', message: 'Requiere superadmin' } },
      { status: 403 }
    );
  }

  // 2. CSRF
  const csrfToken = req.headers.get('x-csrf-token');
  const csrfOk = await validateCsrf(csrfToken);
  if (!csrfOk) {
    return NextResponse.json(
      { ok: false, error: { code: 'invalid_csrf', message: 'CSRF token inválido' } },
      { status: 403 }
    );
  }

  // 3. Body
  let body;
  try {
    body = await parseJsonBody(req, createSchema);
  } catch (e) {
    if (e instanceof HttpError) {
      return NextResponse.json(
        { ok: false, error: { code: e.code, message: e.message, details: e.details } },
        { status: e.status }
      );
    }
    throw e;
  }

  // 4. Verificar unicidad de slug y subdomain
  const existing = await db.query.installations.findFirst({
    where: (i, { or, eq }) =>
      or(eq(i.slug, body.slug), eq(i.subdomain, body.subdomain)),
  });
  if (existing) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'duplicate', message: 'slug o subdomain ya existe' },
      },
      { status: 409 }
    );
  }

  // 5. Generar panel_api_token (se devuelve hasheado a la DB; en plaintext al cliente UNA vez)
  const panelApiToken = randomBytes(32).toString('base64url');
  const panelApiTokenHash = createHash('sha256').update(panelApiToken).digest('hex');

  // 6. Crear
  const inserted = await db
    .insert(installations)
    .values({
      slug: body.slug,
      subdomain: body.subdomain,
      status: 'active',
      panelApiTokenHash,
      dbName: body.dbName,
      storageBucket: body.storageBucket,
    })
    .returning();

  const installation = inserted[0] as Installation;

  // 7. Audit
  await audit({
    installationId: installation.id,
    userId: session.userId,
    action: 'installation_created',
    ipAddress: ip,
    userAgent: ua,
    metadata: {
      slug: body.slug,
      subdomain: body.subdomain,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      data: {
        installation,
        // ⚠️ ESTOS VALORES SOLO SE MUESTRAN UNA VEZ.
        // El superadmin debe copiarlos y guardarlos en su gestor de secretos.
        secrets: {
          panelApiToken,
        },
      },
    },
    { status: 201 }
  );
}
