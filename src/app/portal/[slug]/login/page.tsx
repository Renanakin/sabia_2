/**
 * Login del portal del cliente
 * =============================
 *
 * Ruta: /portal/[slug]/login
 *
 * Si el usuario YA está logueado como cliente del cliente correcto,
 * redirige al dashboard.
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getPortalContext } from '@/lib/auth/portal-context';
import { db } from '@/lib/db/client';
import { installations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import LoginForm from './LoginForm';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function PortalLoginPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { error } = await searchParams;

  // Verificar que la instalación existe
  const installation = await db.query.installations.findFirst({
    where: eq(installations.slug, slug),
  });
  if (!installation) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Portal no disponible
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          La instalación &quot;{slug}&quot; no existe o está inactiva.
        </p>
      </div>
    );
  }

  // Si ya está logueado y es cliente del cliente correcto
  const session = await getSession();
  if (session?.role === 'cliente') {
    const ctx = await getPortalContext(session);
    if (ctx && ctx.client.id) {
      redirect(`/portal/${slug}`);
    }
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Mi Portal
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Cliente: <span className="font-mono">{slug}</span>
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          Iniciar sesión
        </h2>
        <LoginForm slug={slug} initialError={error} />
      </div>
    </div>
  );
}
