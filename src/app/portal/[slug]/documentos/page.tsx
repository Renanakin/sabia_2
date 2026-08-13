/**
 * Lista de documentos visibles al cliente
 * =========================================
 */

import { redirect } from 'next/navigation';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { documents } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { getPortalContext } from '@/lib/auth/portal-context';
import DownloadButton from './DownloadButton';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ period?: string; type?: string }>;
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

export default async function DocumentosPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { period, type } = await searchParams;

  const session = await getSession();
  if (!session) redirect(`/portal/${slug}/login`);

  const ctx = await getPortalContext(session);
  if (!ctx) redirect(`/portal/${slug}/login?error=forbidden`);

  if (session.installation !== slug) {
    redirect(`/portal/${session.installation}/login?error=forbidden`);
  }

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
      publishedAt: documents.publishedAt,
    })
    .from(documents)
    .where(and(...whereConditions))
    .orderBy(desc(documents.publishedAt));

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mis documentos</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {items.length} documento{items.length === 1 ? '' : 's'} disponible{items.length === 1 ? '' : 's'}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-12 text-center text-slate-500 dark:text-slate-400">
          No hay documentos para los filtros aplicados.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Documento</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Período</th>
                <th className="px-4 py-3 font-medium">Publicado</th>
                <th className="px-4 py-3 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((d) => (
                <tr key={d.id} className="border-t border-slate-100 dark:border-slate-700/50">
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                    {d.fileName}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {TYPE_LABELS[d.documentType] ?? d.documentType}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                    {d.period}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {d.publishedAt
                      ? new Date(d.publishedAt).toLocaleDateString('es-CL')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DownloadButton docId={d.id} fileName={d.fileName} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
