/**
 * Página placeholder del superadmin.
 * En Fase 2 se implementa el dashboard, gestión de instalaciones, etc.
 */

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Panel Superadmin
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Esta vista atenderá subdominio <code>admin.sabiacontable.cl</code> (o{' '}
          <code>admin.localhost</code> en dev). En Fase 2 se implementa el dashboard
          con gestión de instalaciones, asignación de contadores, etc.
        </p>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <h2 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
            Estado actual
          </h2>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li>✅ Fase 0 — Bootstrap del repositorio</li>
            <li>✅ Fase 1 — Foundations (DB + Auth + Redis + Middleware)</li>
            <li>⏳ Fase 2 — Superadmin (próxima)</li>
            <li>⏳ Fase 3 — Portal del cliente</li>
            <li>⏳ Fase 4 — Panel contable</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
