/**
 * Crear nueva instalación
 * ========================
 *
 * Server component que renderiza el form. El form es client-side
 * y hace POST a /api/admin/instalaciones.
 *
 * Tras crear, muestra los secrets generados UNA SOLA VEZ (panelApiToken).
 * El superadmin debe copiarlos antes de navegar a otro lado.
 */

import { requireRolePage } from '@/lib/auth/guard';
import NuevaInstalacionForm from './NuevaInstalacionForm';

export default async function NuevaInstalacionPage() {
  await requireRolePage(['superadmin']);

  return (
    <div className="p-8 max-w-2xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Nueva instalación
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Crea una nueva instalación para un cliente de la firma. Se generan
          credenciales únicas.
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <NuevaInstalacionForm />
      </div>
    </div>
  );
}
