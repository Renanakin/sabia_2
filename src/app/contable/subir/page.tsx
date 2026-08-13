/**
 * Página de subir documento
 * ==========================
 *
 * Server component que lista clientes + pasa al form.
 * El form hace POST con FormData (multipart) a /api/contable/documents.
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { getPanelContext } from '@/lib/auth/panel-context';
import SubirDocumentoForm from './SubirDocumentoForm';

interface PageProps {
  searchParams: Promise<{ clientId?: string }>;
}

const DOCUMENT_TYPES = [
  { value: 'boleta_venta', label: 'Boleta de venta' },
  { value: 'factura_venta', label: 'Factura de venta' },
  { value: 'boleta_honorarios', label: 'Boleta de honorarios' },
  { value: 'factura_compra', label: 'Factura de compra' },
  { value: 'nota_credito', label: 'Nota de crédito' },
  { value: 'nota_debito', label: 'Nota de débito' },
  { value: 'comprobante_pago', label: 'Comprobante de pago' },
  { value: 'f29', label: 'F29' },
  { value: 'balance', label: 'Balance' },
  { value: 'estado_resultados', label: 'Estado de resultados' },
  { value: 'libro_mayor', label: 'Libro mayor' },
  { value: 'libro_diario', label: 'Libro diario' },
  { value: 'conciliacion_bancaria', label: 'Conciliación bancaria' },
  { value: 'otro', label: 'Otro' },
];

export default async function SubirDocumentoPage({ searchParams }: PageProps) {
  const { clientId: preselectedClientId } = await searchParams;

  const session = await getSession();
  if (!session || (session.role !== 'contador' && session.role !== 'asistente')) {
    redirect('/contable/login');
  }

  const ctx = await getPanelContext(session);
  if (!ctx) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Subir documento</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">No tienes clientes asignados.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Subir documento</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Carga un documento para uno de tus clientes. Máximo 10 MB.
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <SubirDocumentoForm
          clients={ctx.clients.map((c) => ({
            id: c.client.id,
            label: `${c.client.legalName} (${c.client.rut})`,
          }))}
          documentTypes={DOCUMENT_TYPES}
          preselectedClientId={preselectedClientId}
        />
      </div>
    </div>
  );
}
