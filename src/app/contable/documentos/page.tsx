/**
 * Cola global de documentos (contador)
 * ======================================
 *
 * Filtros: status, clientId.
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getPanelContext } from '@/lib/auth/panel-context';
import { db } from '@/lib/db/client';
import { documents } from '@/lib/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import StatusBadge from '../StatusBadge';

interface PageProps {
  searchParams: Promise<{ status?: string; clientId?: string }>;
}

export default async function DocumentosColaPage({ searchParams }: PageProps) {
  const { status, clientId } = await searchParams;

  const session = await getSession();
  if (!session || (session.role !== 'contador' && session.role !== 'asistente')) {
    redirect('/contable/login');
  }

  const ctx = await getPanelContext(session);
  if (!ctx) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Cola de documentos</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">No tienes clientes asignados.</p>
      </div>
    );
  }

  const clientIds = ctx.clients.map((c) => c.client.id);

  const whereConditions = [inArray(documents.clientId, clientIds)];
  if (clientId && clientIds.includes(clientId)) {
    whereConditions.push(eq(documents.clientId, clientId));
  }
  if (status) {
    whereConditions.push(eq(documents.status, status as never));
  }

  const items = await db
    .select()
    .from(documents)
    .where(and(...whereConditions))
    .orderBy(desc(documents.createdAt))
    .limit(200);

  const clientNames = new Map(ctx.clients.map((c) => [c.client.id, c.client.legalName]));

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Cola de documentos</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {items.length} documento{items.length === 1 ? '' : 's'}
          {status && ` con status "${status}"`}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-12 text-center text-slate-500 dark:text-slate-400">
          No hay documentos con esos filtros.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
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
              {items.map((d) => (
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
                      Gestionar →
                    </Link>
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
