/**
 * Página placeholder del panel contable.
 * En Fase 4 se implementa el dashboard, carga de documentos, etc.
 */

export default function PanelContablePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Panel Contable
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Esta vista atenderá subdominio <code>panel.sabiacontable.cl</code> (o{' '}
          <code>panel.localhost</code> en dev). En Fase 4 se implementa la carga de
          documentos, gestión de clientes, F29, etc.
        </p>
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            En construcción. Ver <code>docs/ORQUESTADOR.md</code> para el roadmap.
          </p>
        </div>
      </div>
    </main>
  );
}
