/**
 * GET /api/portal/dashboard
 * ==========================
 *
 * Devuelve KPIs del cliente:
 * - Período actual
 * - Cantidad de documentos visibles (mes actual / total)
 * - Último documento publicado
 *
 * SEGURIDAD: client_id viene de la sesión, no del request.
 */

import { NextResponse } from 'next/server';
import { eq, and, desc, count } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { documents } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { getPortalContext } from '@/lib/auth/portal-context';

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export async function GET(): Promise<NextResponse> {
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
      { ok: false, error: { code: 'forbidden', message: 'No tienes un cliente asignado' } },
      { status: 403 }
    );
  }

  const period = currentPeriod();

  // Total docs visibles
  const totalVisibles = await db
    .select({ count: count() })
    .from(documents)
    .where(
      and(
        eq(documents.clientId, ctx.client.id),
        eq(documents.visibleToClient, true)
      )
    )
    .then((r) => r[0]?.count ?? 0);

  // Docs visibles del período actual
  const docsDelPeriodo = await db
    .select({ count: count() })
    .from(documents)
    .where(
      and(
        eq(documents.clientId, ctx.client.id),
        eq(documents.visibleToClient, true),
        eq(documents.period, period)
      )
    )
    .then((r) => r[0]?.count ?? 0);

  // Último documento publicado
  const ultimoDoc = await db
    .select({
      id: documents.id,
      fileName: documents.fileName,
      period: documents.period,
      documentType: documents.documentType,
      publishedAt: documents.publishedAt,
    })
    .from(documents)
    .where(
      and(
        eq(documents.clientId, ctx.client.id),
        eq(documents.visibleToClient, true)
      )
    )
    .orderBy(desc(documents.publishedAt))
    .limit(1)
    .then((r) => r[0] ?? null);

  return NextResponse.json({
    ok: true,
    data: {
      client: {
        id: ctx.client.id,
        legalName: ctx.client.legalName,
        rut: ctx.client.rut,
      },
      currentPeriod: period,
      totalDocuments: Number(totalVisibles),
      documentsThisPeriod: Number(docsDelPeriodo),
      lastDocument: ultimoDoc,
    },
  });
}
