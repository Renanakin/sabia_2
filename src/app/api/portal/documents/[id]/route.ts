/**
 * GET /api/portal/documents/[id]
 * ===============================
 *
 * Devuelve metadata de un documento visible al cliente.
 * 404 si no existe O si no es visible (no se filtra info).
 *
 * SEGURIDAD: client_id desde sesión, no del request.
 */

import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { documents } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { getPortalContext } from '@/lib/auth/portal-context';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, ctx: RouteContext): Promise<NextResponse> {
  const { id } = await ctx.params;

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'not_authenticated', message: 'No autenticado' } },
      { status: 401 }
    );
  }

  const portalCtx = await getPortalContext(session);
  if (!portalCtx) {
    return NextResponse.json(
      { ok: false, error: { code: 'forbidden', message: 'No autorizado' } },
      { status: 403 }
    );
  }

  // Buscar SOLO si es visible y del cliente correcto
  const doc = await db.query.documents.findFirst({
    where: and(
      eq(documents.id, id),
      eq(documents.clientId, portalCtx.client.id),
      eq(documents.visibleToClient, true)
    ),
  });

  if (!doc) {
    return NextResponse.json(
      { ok: false, error: { code: 'not_found', message: 'Documento no encontrado' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    data: {
      id: doc.id,
      period: doc.period,
      documentType: doc.documentType,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      status: doc.status,
      publishedAt: doc.publishedAt,
      createdAt: doc.createdAt,
    },
  });
}
