/**
 * Dashboard del portal del cliente
 * =================================
 *
 * Server component. Requiere sesión de cliente con acceso al cliente.
 * Muestra KPIs simples (los reales se computan en Fase 7).
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { eq, and, desc, count } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { documents } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';
import { getPortalContext } from '@/lib/auth/portal-context';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default async function PortalDashboardPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getSession();
  if (!session) {
    redirect(`/portal/${slug}/login`);
  }

  const ctx = await getPortalContext(session!);
  if (!ctx) {
    redirect(`/portal/${slug}/login?error=forbidden`);
  }

  // (simplificado: en MVP single-tenant, el slug del subdominio debe coincidir con INSTALLATION_SLUG)
  if (session!.installation !== slug) {
    redirect(`/portal/${session!.installation}/login?error=forbidden`);
  }

  const period = currentPeriod();

  // Métricas
  const totalVisibles = await db
    .select({ count: count() })
    .from(documents)
    .where(
      and(
        eq(documents.clientId, ctx!.client.id),
        eq(documents.visibleToClient, true)
      )
    )
    .then((r) => r[0]?.count ?? 0);

  const docsDelPeriodo = await db
    .select({ count: count() })
    .from(documents)
    .where(
      and(
        eq(documents.clientId, ctx!.client.id),
        eq(documents.visibleToClient, true),
        eq(documents.period, period)
      )
    )
    .then((r) => r[0]?.count ?? 0);

  const ultimosDocs = await db
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
        eq(documents.clientId, ctx!.client.id),
        eq(documents.visibleToClient, true)
      )
    )
    .orderBy(desc(documents.publishedAt))
    .limit(5);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Bienvenido, {ctx!.client.legalName}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          RUT: <span className="font-mono">{ctx!.client.rut}</span>
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Documentos disponibles
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {Number(totalVisibles)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
            Período actual ({period})
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {Number(docsDelPeriodo)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            documentos publicados este mes
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Documentos recientes
          </h2>
          <Link
            href={`/portal/${slug}/documentos`}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        {ultimosDocs.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
            Aún no hay documentos publicados.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {ultimosDocs.map((d) => (
              <li key={d.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {d.fileName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {d.documentType} · {d.period}
                  </p>
                </div>
                {d.publishedAt && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(d.publishedAt).toLocaleDateString('es-CL')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
