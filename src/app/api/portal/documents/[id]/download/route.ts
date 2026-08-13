/**
 * GET /api/portal/documents/[id]/download
 * =========================================
 *
 * Genera una URL firmada de corta duración (5 min) para descargar
 * un documento. El cliente hace GET a esa URL directamente a S3/MinIO.
 *
 * SEGURIDAD:
 * - Verifica sesión + client_id del session
 * - Verifica que el doc es visible al cliente
 * - URL firmada expira en 5 min
 * - Registra descarga en audit_log
 * - NUNCA expone el storage_path completo en logs
 */

import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { documents } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { getPortalContext } from '@/lib/auth/portal-context';
import { getSignedDownloadUrl, downloadFilename } from '@/lib/storage/signed-url';
import { audit } from '@/lib/auth/audit';
import { getClientIp, getUserAgent } from '@/lib/http';

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

  // Generar URL firmada
  const { url, expiresIn } = await getSignedDownloadUrl(doc.storagePath, {
    expirationSeconds: 300, // 5 min
    responseContentDisposition: downloadFilename(doc.fileName),
  });

  // Audit log (no loguear la URL completa)
  await audit({
    installationId: null,
    userId: session.userId,
    action: 'document_downloaded',
    resourceType: 'document',
    resourceId: doc.id,
    ipAddress: getClientIp(req),
    userAgent: getUserAgent(req),
    metadata: { period: doc.period },
  });

  return NextResponse.json({
    ok: true,
    data: {
      url,
      expiresIn,
      fileName: doc.fileName,
    },
  });
}
