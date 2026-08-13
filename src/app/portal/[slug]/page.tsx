/**
 * Página placeholder del portal del cliente.
 * En Fase 3 se implementa el dashboard, lista de documentos, etc.
 *
 * Recibe el slug del cliente desde la URL (viene del middleware).
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PortalClientePage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Portal del Cliente
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Esta vista atenderá subdominios como{' '}
          <code>{slug}.sabiacontable.cl</code> (o <code>{slug}.localhost</code> en dev).
          En Fase 3 se implementa el dashboard con KPIs, documentos visibles y carga de archivos.
        </p>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
            Cliente actual
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Slug: <code className="text-slate-900 dark:text-white">{slug}</code>
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            En construcción. Ver <code>docs/ORQUESTADOR.md</code>.
          </p>
        </div>
      </div>
    </main>
  );
}
