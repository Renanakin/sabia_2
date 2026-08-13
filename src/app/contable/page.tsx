/**
 * Dashboard del panel contable
 * =============================
 *
 * Métricas del contador:
 * - Cola por status (pending, in_review, observed, approved)
 * - Top clientes con más documentos
 * - Últimos documentos subidos
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { desc, count, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { documents } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { getPanelContext } from '@/lib/auth/panel-context';
import StatusBadge from './StatusBadge';

export default async function PanelDashboardPage() {
  const session = await getSession();
  if (!session || (session.role !== 'contador' && session.role !== 'asistente')) {
    redirect('/contable/login');
  }

  const ctx = await getPanelContext(session);
  if (!ctx) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-6">
          <h2 className="font-semibold text-amber-900 dark:text-amber-200">
            No tienes clientes asignados
          </h2>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
            Pide al superadmin que te asigne clientes para empezar a trabajar.
          </p>
        </div>
      </div>
    );
  }

  const clientIds = ctx.clients.map((c) => c.client.id);

  // Cola por status
  const byStatusRows = await db
    .select({ status: documents.status, count: count() })
    .from(documents)
    .where(inArray(documents.clientId, clientIds))
    .groupBy(documents.status);

  const byStatus: Record<string, number> = {
    pending: 0,
    in_review: 0,
    observed: 0,
    approved: 0,
    published: 0,
    archived: 0,
  };
  byStatusRows.forEach((r) => {
    byStatus[r.status] = Number(r.count);
  });

  // Total
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

  // Últimos documentos
  const recent = await db
    .select({
      id: documents.id,
      clientId: documents.clientId,
      period: documents.period,
      documentType: documents.documentType,
      fileName: documents.fileName,
      status: documents.status,
      visibleToClient: documents.visibleToClient,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(inArray(documents.clientId, clientIds))
    .orderBy(desc(documents.createdAt))
    .limit(10);

  // Map client id → name
  const clientNames = new Map(ctx.clients.map((c) => [c.client.id, c.client.legalName]));

  const statusList = [
    { key: 'pending', label: 'Pendientes' },
    { key: 'in_review', label: 'En revisión' },
    { key: 'observed', label: 'Observados' },
    { key: 'approved', label: 'Aprobados' },
    { key: 'published', label: 'Publicados' },
  ];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {ctx.clients.length} cliente{ctx.clients.length === 1 ? '' : 's'} · {total} documento{total === 1 ? '' : 's'} en total
        </p>
      </header>

      {/* Cola por status */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statusList.map((s) => (
          <Link
            key={s.key}
            href={`/contable/documentos?status=${s.key}`}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:border-blue-500 transition-colors"
          >
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              {s.label}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {byStatus[s.key] ?? 0}
            </p>
          </Link>
        ))}
      </div>

      {/* Últimos documentos */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Últimos documentos
          </h2>
          <Link
            href="/contable/documentos"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
            Aún no hay documentos.{' '}
            <Link href="/contable/subir" className="text-blue-600 dark:text-blue-400 hover:underline">
              Subir el primero
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Documento</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Período</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((d) => (
                <tr key={d.id} className="border-t border-slate-100 dark:border-slate-700/50">
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                    {d.fileName}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {clientNames.get(d.clientId) ?? d.clientId.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                    {d.period}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/contable/documentos/${d.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
