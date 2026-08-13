/**
 * GET /api/portal/documents
 * ==========================
 *
 * Lista documentos visibles al cliente autenticado.
 * Filtros opcionales: ?period=YYYY-MM, ?type=f29
 *
 * SEGURIDAD:
 * - client_id viene de la sesión
 * - SIEMPRE filtra por visible_to_client = true
 * - NUNCA acepta client_id del request
 */

import { NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { documents } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { getPortalContext } from '@/lib/auth/portal-context';

export async function GET(req: Request): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: 'not_authenticated', message: 'No autenticado' } },
      { status: 401 }
    );
  }

  const ctx = await getPortalContext(session);
  if (!ctx) {
    return NextResponse.json(
      { ok: false, error: { code: 'forbidden', message: 'No autorizado' } },
      { status: 403 }
    );
  }

  const url = new URL(req.url);
  const period = url.searchParams.get('period');
  const type = url.searchParams.get('type');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 200);

  // Construir WHERE seguro — client_id SIEMPRE del session
  const whereConditions = [
    eq(documents.clientId, ctx.client.id),
    eq(documents.visibleToClient, true),
  ];
  if (period) whereConditions.push(eq(documents.period, period));
  if (type) whereConditions.push(eq(documents.documentType, type as never));

  const items = await db
    .select({
      id: documents.id,
      period: documents.period,
      documentType: documents.documentType,
      fileName: documents.fileName,
      fileSize: documents.fileSize,
      mimeType: documents.mimeType,
      status: documents.status,
      publishedAt: documents.publishedAt,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(and(...whereConditions))
    .orderBy(desc(documents.createdAt))
    .limit(limit);

  return NextResponse.json({
    ok: true,
    data: { items },
  });
}
