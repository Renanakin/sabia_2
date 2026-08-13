/**
 * GET /api/contable/documents
 * ============================
 *
 * Cola global de documentos de los clientes asignados al contador.
 * Filtros: ?clientId=...&status=...&period=...
 *
 * POST /api/contable/documents
 * =============================
 *
 * Sube un documento nuevo (multipart/form-data).
 * Body: { clientId, period, documentType, file }
 */

import { NextResponse } from 'next/server';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { documents, accountingClients } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { getPanelContext, checkClientAccess } from '@/lib/auth/panel-context';
import { uploadDocument, UploadError } from '@/lib/storage/upload';
import { audit } from '@/lib/auth/audit';
import { getClientIp, getUserAgent } from '@/lib/http';
import { validateCsrf } from '@/lib/auth/csrf';

const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const VALID_TYPES = [
  'boleta_venta',
  'factura_venta',
  'boleta_honorarios',
  'factura_compra',
  'nota_credito',
  'nota_debito',
  'comprobante_pago',
  'f29',
  'balance',
  'estado_resultados',
  'libro_mayor',
  'libro_diario',
  'conciliacion_bancaria',
  'otro',
] as const;

export async function GET(req: Request): Promise<NextResponse> {
  const session = await getSession();
  if (!session || (session.role !== 'contador' && session.role !== 'asistente')) {
    return NextResponse.json(
      { ok: false, error: { code: 'forbidden', message: 'No autorizado' } },
      { status: 403 }
    );
  }

  const ctx = await getPanelContext(session);
  if (!ctx) {
    return NextResponse.json(
      { ok: false, error: { code: 'no_clients', message: 'No tienes clientes' } },
      { status: 404 }
    );
  }

  const clientIds = ctx.clients.map((c) => c.client.id);
  const url = new URL(req.url);
  const filterClientId = url.searchParams.get('clientId');
  const filterStatus = url.searchParams.get('status');

  // Si se pasa clientId, verificar que esté en la lista del contador
  const whereClients =
    filterClientId && clientIds.includes(filterClientId)
      ? [filterClientId]
      : clientIds;

  const whereConditions = [inArray(documents.clientId, whereClients)];
  if (filterStatus) whereConditions.push(eq(documents.status, filterStatus as never));

  const items = await db
    .select({
      id: documents.id,
      clientId: documents.clientId,
      period: documents.period,
      documentType: documents.documentType,
      fileName: documents.fileName,
      status: documents.status,
      visibleToClient: documents.visibleToClient,
      publishedAt: documents.publishedAt,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(and(...whereConditions))
    .orderBy(desc(documents.createdAt))
    .limit(200);

  // Agrupar por status para el dashboard
  const byStatus = items.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return NextResponse.json({
    ok: true,
    data: { items, byStatus, total: items.length },
  });
}

export async function POST(req: Request): Promise<NextResponse> {
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

  // 1. Parse multipart
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'invalid_form', message: 'multipart/form-data inválido' } },
      { status: 400 }
    );
  }

  const clientId = form.get('clientId') as string | null;
  const period = form.get('period') as string | null;
  const documentType = form.get('documentType') as string | null;
  const file = form.get('file');

  if (!clientId || !period || !documentType || !(file instanceof File)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'missing_fields',
          message: 'Faltan clientId, period, documentType o file',
        },
      },
      { status: 400 }
    );
  }

  if (!PERIOD_REGEX.test(period)) {
    return NextResponse.json(
      { ok: false, error: { code: 'invalid_period', message: 'Período debe ser YYYY-MM' } },
      { status: 400 }
    );
  }

  if (!VALID_TYPES.includes(documentType as (typeof VALID_TYPES)[number])) {
    return NextResponse.json(
      { ok: false, error: { code: 'invalid_type', message: 'Tipo de documento inválido' } },
      { status: 400 }
    );
  }

  // 2. Verificar acceso al cliente
  const access = await checkClientAccess(session.userId, clientId);
  if (!access) {
    return NextResponse.json(
      { ok: false, error: { code: 'forbidden_client', message: 'No tienes acceso a ese cliente' } },
      { status: 403 }
    );
  }

  // 3. Verificar que el cliente existe
  const client = await db.query.accountingClients.findFirst({
    where: eq(accountingClients.id, clientId),
  });
  if (!client) {
    return NextResponse.json(
      { ok: false, error: { code: 'client_not_found', message: 'Cliente no existe' } },
      { status: 404 }
    );
  }

  // 4. Subir a storage
  let uploaded;
  try {
    uploaded = await uploadDocument(file, {
      installationSlug: session.installation,
      clientId,
      period,
    });
  } catch (e) {
    if (e instanceof UploadError) {
      return NextResponse.json(
        { ok: false, error: { code: e.code, message: e.message } },
        { status: 400 }
      );
    }
    throw e;
  }

  // 5. Crear registro en DB
  const inserted = await db
    .insert(documents)
    .values({
      clientId,
      period,
      documentType: documentType as (typeof VALID_TYPES)[number],
      fileName: uploaded.fileName,
      storagePath: uploaded.storagePath,
      fileHash: uploaded.fileHash,
      fileSize: uploaded.fileSize,
      mimeType: uploaded.mimeType,
      status: 'pending',
      visibleToClient: false,
      uploadedBy: session.userId,
    })
    .returning();

  // 6. Audit
  await audit({
    installationId: null,
    userId: session.userId,
    action: 'document_uploaded',
    resourceType: 'document',
    resourceId: inserted[0].id,
    ipAddress: ip,
    userAgent: ua,
    metadata: {
      clientId,
      period,
      documentType,
      fileName: uploaded.fileName,
      fileSize: uploaded.fileSize,
    },
  });

  return NextResponse.json(
    { ok: true, data: { document: inserted[0] } },
    { status: 201 }
  );
}
