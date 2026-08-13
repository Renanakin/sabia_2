/**
 * Listado de instalaciones
 * =========================
 *
 * Server component. Requiere superadmin.
 * Tabla con: slug, subdomain, status, fecha de creación.
 */

import Link from 'next/link';
import { desc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { installations } from '@/lib/db/schema';
import { requireRolePage } from '@/lib/auth/guard';

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  archived: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

export default async function InstalacionesPage() {
  await requireRolePage(['superadmin']);

  const items = await db
    .select()
    .from(installations)
    .orderBy(desc(installations.createdAt));

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Instalaciones</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {items.length} instalación{items.length === 1 ? '' : 'es'} registrada{items.length === 1 ? '' : 's'}
          </p>
        </div>
        <Link
          href="/admin/instalaciones/nueva"
          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 transition-colors"
        >
          + Nueva instalación
        </Link>
      </header>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr className="text-left text-slate-500 dark:text-slate-400">
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Subdominio</th>
              <th className="px-4 py-3 font-medium">DB</th>
              <th className="px-4 py-3 font-medium">Storage</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Creada</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  No hay instalaciones todavía.{' '}
                  <Link
                    href="/admin/instalaciones/nueva"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Crear la primera
                  </Link>
                </td>
              </tr>
            ) : (
              items.map((i) => (
                <tr
                  key={i.id}
                  className="border-t border-slate-100 dark:border-slate-700/50"
                >
                  <td className="px-4 py-3 font-mono text-slate-900 dark:text-white">
                    {i.slug}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {i.subdomain}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {i.dbName}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {i.storageBucket}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_BADGE[i.status] ?? STATUS_BADGE.archived
                      }`}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {i.createdAt.toLocaleDateString('es-CL')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
