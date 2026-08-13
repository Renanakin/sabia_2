/**
 * PATCH /api/contable/documents/[id]/status
 * ===========================================
 *
 * Cambia el status de un documento. Workflow:
 *   pending → in_review → observed → approved → published
 *
 * Solo `contador` puede transicionar a `published`.
 * `asistente` puede hacer pending → in_review → observed.
 *
 * SEGURIDAD: verifica que el user tiene acceso al cliente del documento.
 */

import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { documents, userClientAccess } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { audit } from '@/lib/auth/audit';
import { getClientIp, getUserAgent } from '@/lib/http';
import { validateCsrf } from '@/lib/auth/csrf';

const STATUS_VALUES = [
  'pending',
  'in_review',
  'observed',
  'approved',
  'published',
  'archived',
] as const;

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  // De → puede ir a
  pending: ['in_review', 'observed', 'archived'],
  in_review: ['observed', 'approved', 'pending', 'archived'],
  observed: ['in_review', 'approved', 'archived'],
  approved: ['published', 'in_review', 'archived'],
  published: ['archived'],
  archived: [], // no se puede sacar de archived (es terminal)
};

const schema = z.object({
  status: z.enum(STATUS_VALUES),
  notes: z.string().max(1000).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, ctx: RouteContext): Promise<NextResponse> {
  const { id } = await ctx.params;
  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  const session = await getSession();
  if (!session || (session.role !== 'contador' && session.role !== 'asistente')) {
    return NextResponse.json(
      { ok: false, error: { code: 'forbidden', message: 'No autorizado' } },
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

  // 1. Body
  let body;
  try {
    const json = await req.json();
    body = schema.parse(json);
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'validation_error', message: 'Datos inválidos' } },
      { status: 400 }
    );
  }

  // 2. Obtener doc
  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, id),
  });
  if (!doc) {
    return NextResponse.json(
      { ok: false, error: { code: 'not_found', message: 'Documento no existe' } },
      { status: 404 }
    );
  }

  // 3. Verificar acceso del user al cliente
  const access = await db.query.userClientAccess.findFirst({
    where: and(
      eq(userClientAccess.userId, session.userId),
      eq(userClientAccess.clientId, doc.clientId)
    ),
  });
  if (!access) {
    return NextResponse.json(
      { ok: false, error: { code: 'forbidden', message: 'No tienes acceso a ese documento' } },
      { status: 403 }
    );
  }

  // 4. Validar transición
  const allowedNext = ALLOWED_TRANSITIONS[doc.status] ?? [];
  if (!allowedNext.includes(body.status)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'invalid_transition',
          message: `No se puede pasar de "${doc.status}" a "${body.status}"`,
        },
      },
      { status: 400 }
    );
  }

  // 5. Restricción de rol para 'published' (solo contador)
  if (body.status === 'published' && session.role !== 'contador') {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'forbidden_role',
          message: 'Solo un contador puede publicar un documento',
        },
      },
      { status: 403 }
    );
  }

  // 6. Update
  const updates: Partial<typeof documents.$inferInsert> = {
    status: body.status,
    updatedAt: new Date(),
  };
  if (body.notes !== undefined) updates.notes = body.notes;

  const updated = await db
    .update(documents)
    .set(updates)
    .where(eq(documents.id, id))
    .returning();

  // 7. Audit
  await audit({
    installationId: null,
    userId: session.userId,
    action: 'document_published',
    resourceType: 'document',
    resourceId: id,
    ipAddress: ip,
    userAgent: ua,
    metadata: { from: doc.status, to: body.status },
  });

  return NextResponse.json({ ok: true, data: { document: updated[0] } });
}
