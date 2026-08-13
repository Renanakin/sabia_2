/**
 * POST /api/contable/documents/[id]/publish
 * ===========================================
 *
 * Atajo para "cambiar a published + visible_to_client = true".
 * Solo `contador`. Dispara lo que el cliente ve en su portal.
 *
 * Validaciones:
 * - Sesión de contador
 * - Acceso al cliente
 * - Doc en status `approved` (no se puede publicar pending)
 *
 * SEGURIDAD: registra en audit_log con metadata completa.
 */

import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { documents, userClientAccess } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { audit } from '@/lib/auth/audit';
import { getClientIp, getUserAgent } from '@/lib/http';
import { validateCsrf } from '@/lib/auth/csrf';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, ctx: RouteContext): Promise<NextResponse> {
  const { id } = await ctx.params;
  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  const session = await getSession();
  if (!session || session.role !== 'contador') {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'forbidden',
          message: 'Solo contadores pueden publicar',
        },
      },
      { status: 403 }
    );
  }

  // CSRF
  const csrfOk = await validateCsrf(req.headers.get('x-csrf-token'));
  if (!csrfOk) {
    return NextResponse.json(
      { ok: false, error: { code: 'invalid_csrf', message: 'CSRF inválido' } },
      { status: 403 }
    );
  }

  // 1. Obtener doc
  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, id),
  });
  if (!doc) {
    return NextResponse.json(
      { ok: false, error: { code: 'not_found', message: 'Documento no existe' } },
      { status: 404 }
    );
  }

  // 2. Verificar acceso
  const access = await db.query.userClientAccess.findFirst({
    where: and(
      eq(userClientAccess.userId, session.userId),
      eq(userClientAccess.clientId, doc.clientId)
    ),
  });
  if (!access) {
    return NextResponse.json(
      { ok: false, error: { code: 'forbidden', message: 'Sin acceso al cliente' } },
      { status: 403 }
    );
  }

  // 3. Solo se puede publicar desde 'approved' o re-publicar desde 'published'
  if (doc.status !== 'approved' && doc.status !== 'published') {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'invalid_status',
          message: `El documento debe estar en 'approved' para publicar. Está en '${doc.status}'`,
        },
      },
      { status: 400 }
    );
  }

  // 4. Update
  const updated = await db
    .update(documents)
    .set({
      status: 'published',
      visibleToClient: true,
      publishedAt: new Date(),
      publishedBy: session.userId,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, id))
    .returning();

  // 5. Audit
  await audit({
    installationId: null,
    userId: session.userId,
    action: 'document_published',
    resourceType: 'document',
    resourceId: id,
    ipAddress: ip,
    userAgent: ua,
    metadata: {
      clientId: doc.clientId,
      period: doc.period,
      documentType: doc.documentType,
      fileName: doc.fileName,
    },
  });

  return NextResponse.json({ ok: true, data: { document: updated[0] } });
}
