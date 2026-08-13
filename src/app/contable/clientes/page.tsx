/**
 * Listado de clientes del contador
 * ==================================
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';
import { getPanelContext } from '@/lib/auth/panel-context';

export default async function ClientesPage() {
  const session = await getSession();
  if (!session || (session.role !== 'contador' && session.role !== 'asistente')) {
    redirect('/contable/login');
  }

  const ctx = await getPanelContext(session);
  if (!ctx) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">No tienes clientes asignados.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Clientes</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {ctx.clients.length} cliente{ctx.clients.length === 1 ? '' : 's'} asignado{ctx.clients.length === 1 ? '' : 's'}
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr className="text-left text-slate-500 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">Razón social</th>
              <th className="px-4 py-3 font-medium">RUT</th>
              <th className="px-4 py-3 font-medium">Régimen</th>
              <th className="px-4 py-3 font-medium">Acceso</th>
              <th className="px-4 py-3 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {ctx.clients.map((c) => (
              <tr key={c.client.id} className="border-t border-slate-100 dark:border-slate-700/50">
                <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                  {c.client.legalName}
                </td>
                <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                  {c.client.rut}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {c.client.taxRegime ?? '—'}
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 capitalize">
                  {c.accessLevel}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/contable/clientes/${c.client.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    Ver documentos →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
