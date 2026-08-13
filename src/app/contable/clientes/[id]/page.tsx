/**
 * Vista 360 de un cliente (contador)
 * ====================================
 *
 * Muestra los documentos del cliente, agrupados por status.
 * Solo accesible para contadores con acceso al cliente.
 */

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { documents, accountingClients, userClientAccess } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import StatusBadge from '../../StatusBadge';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClienteDetallePage({ params }: PageProps) {
  const { id } = await params;

  const session = await getSession();
  if (!session || (session.role !== 'contador' && session.role !== 'asistente')) {
    redirect('/contable/login');
  }

  // Verificar acceso
  const access = await db.query.userClientAccess.findFirst({
    where: and(
      eq(userClientAccess.userId, session.userId),
      eq(userClientAccess.clientId, id)
    ),
  });
  if (!access) {
    notFound();
  }

  // Cliente
  const client = await db.query.accountingClients.findFirst({
    where: eq(accountingClients.id, id),
  });
  if (!client) {
    notFound();
  }

  // Documentos
  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.clientId, id))
    .orderBy(desc(documents.createdAt));

  return (
    <div className="p-8">
      <header className="mb-6">
        <Link
          href="/contable/clientes"
          className="text-sm text-slate-600 dark:text-slate-400 hover:underline"
        >
          ← Clientes
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
          {client.legalName}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 font-mono">{client.rut}</p>
      </header>

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {docs.length} documento{docs.length === 1 ? '' : 's'} en total
        </p>
        <Link
          href={`/contable/subir?clientId=${id}`}
          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2"
        >
          + Subir documento
        </Link>
      </div>

      {docs.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-12 text-center text-slate-500 dark:text-slate-400">
          Aún no hay documentos para este cliente.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr className="text-left text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">Documento</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Período</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-t border-slate-100 dark:border-slate-700/50">
                  <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                    {d.fileName}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400 capitalize">
                    {d.documentType.replace(/_/g, ' ')}
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
