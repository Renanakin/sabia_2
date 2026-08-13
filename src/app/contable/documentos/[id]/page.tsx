/**
 * Detalle de documento (contador)
 * =================================
 *
 * Muestra metadata + botones para cambiar status / publicar.
 * Solo accesible para contadores con acceso al cliente del doc.
 */

import { redirect, notFound } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { documents, accountingClients, userClientAccess } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import StatusBadge from '../../StatusBadge';
import AccionesDocumento from './AccionesDocumento';

interface PageProps {
  params: Promise<{ id: string }>;
}

const TYPE_LABELS: Record<string, string> = {
  boleta_venta: 'Boleta de venta',
  factura_venta: 'Factura de venta',
  boleta_honorarios: 'Boleta de honorarios',
  factura_compra: 'Factura de compra',
  nota_credito: 'Nota de crédito',
  nota_debito: 'Nota de débito',
  comprobante_pago: 'Comprobante de pago',
  f29: 'F29',
  balance: 'Balance',
  estado_resultados: 'Estado de resultados',
  libro_mayor: 'Libro mayor',
  libro_diario: 'Libro diario',
  conciliacion_bancaria: 'Conciliación bancaria',
  otro: 'Otro',
};

export default async function DocumentoDetallePage({ params }: PageProps) {
  const { id } = await params;

  const session = await getSession();
  if (!session || (session.role !== 'contador' && session.role !== 'asistente')) {
    redirect('/contable/login');
  }

  const doc = await db.query.documents.findFirst({
    where: eq(documents.id, id),
  });
  if (!doc) notFound();

  // Verificar acceso
  const access = await db.query.userClientAccess.findFirst({
    where: and(
      eq(userClientAccess.userId, session.userId),
      eq(userClientAccess.clientId, doc.clientId)
    ),
  });
  if (!access) notFound();

  const client = await db.query.accountingClients.findFirst({
    where: eq(accountingClients.id, doc.clientId),
  });

  return (
    <div className="p-8 max-w-3xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{doc.fileName}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          {TYPE_LABELS[doc.documentType] ?? doc.documentType} · {client?.legalName}
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 mb-6">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={doc.status} />
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Visible al cliente</dt>
            <dd className="mt-1 text-slate-900 dark:text-white">
              {doc.visibleToClient ? '✅ Sí' : '❌ No'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Período</dt>
            <dd className="mt-1 font-mono text-slate-900 dark:text-white">{doc.period}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Tamaño</dt>
            <dd className="mt-1 text-slate-900 dark:text-white">
              {doc.fileSize ? `${(parseInt(doc.fileSize, 10) / 1024).toFixed(1)} KB` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Hash SHA256</dt>
            <dd className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
              {doc.fileHash}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Publicado</dt>
            <dd className="mt-1 text-slate-900 dark:text-white">
              {doc.publishedAt
                ? new Date(doc.publishedAt).toLocaleString('es-CL')
                : '—'}
            </dd>
          </div>
        </dl>
      </div>

      <AccionesDocumento
        docId={doc.id}
        currentStatus={doc.status}
        role={session.role}
      />
    </div>
  );
}
