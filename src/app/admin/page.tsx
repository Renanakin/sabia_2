/**
 * Dashboard del superadmin
 * =========================
 *
 * Métricas globales:
 * - Instalaciones totales / activas / archivadas
 * - Usuarios totales (desglosado por rol)
 * - Logins en las últimas 24h
 *
 * Server component. Requiere sesión de superadmin.
 */

import { eq, and, gte, count } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { installations, users, auditLog } from '@/lib/db/schema';
import { requireRolePage } from '@/lib/auth/guard';

interface Metric {
  label: string;
  value: number;
  sub?: string;
}

export default async function AdminDashboardPage() {
  await requireRolePage(['superadmin']);

  // 1. Instalaciones
  const instalacionesTotal = await db
    .select({ count: count() })
    .from(installations)
    .then((r) => r[0]?.count ?? 0);

  const instalacionesActivas = await db
    .select({ count: count() })
    .from(installations)
    .where(eq(installations.status, 'active'))
    .then((r) => r[0]?.count ?? 0);

  // 2. Usuarios por rol
  const usuariosPorRol = await db
    .select({ role: users.role, count: count() })
    .from(users)
    .groupBy(users.role);

  const usuariosTotal = usuariosPorRol.reduce((acc, r) => acc + Number(r.count), 0);

  // 3. Logins últimas 24h
  // eslint-disable-next-line react-hooks/purity -- server component, no render instability
  const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const logins24h = await db
    .select({ count: count() })
    .from(auditLog)
    .where(and(eq(auditLog.action, 'login_success'), gte(auditLog.createdAt, hace24h)))
    .then((r) => r[0]?.count ?? 0);

  const metrics: Metric[] = [
    {
      label: 'Instalaciones',
      value: Number(instalacionesTotal),
      sub: `${instalacionesActivas} activas`,
    },
    {
      label: 'Usuarios totales',
      value: Number(usuariosTotal),
      sub: usuariosPorRol.map((r) => `${r.count} ${r.role}`).join(' · '),
    },
    {
      label: 'Logins (24h)',
      value: Number(logins24h),
    },
  ];

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Métricas globales del sistema
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6"
          >
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {m.label}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{m.value}</p>
            {m.sub && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{m.sub}</p>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Distribución de usuarios por rol
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <th className="py-2">Rol</th>
              <th className="py-2">Cantidad</th>
            </tr>
          </thead>
          <tbody>
            {usuariosPorRol.map((r) => (
              <tr key={r.role} className="border-b border-slate-100 dark:border-slate-700/50">
                <td className="py-2 text-slate-900 dark:text-white capitalize">{r.role}</td>
                <td className="py-2 text-slate-700 dark:text-slate-300">{r.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
