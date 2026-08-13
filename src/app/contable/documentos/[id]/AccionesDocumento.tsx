'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/auth/client';

interface Props {
  docId: string;
  currentStatus: string;
  role: 'superadmin' | 'contador' | 'asistente' | 'cliente';
}

const TRANSITIONS: Record<string, { to: string; label: string; variant: 'primary' | 'secondary' | 'danger' }[]> = {
  pending: [
    { to: 'in_review', label: 'Marcar en revisión', variant: 'primary' },
    { to: 'observed', label: 'Observar', variant: 'secondary' },
    { to: 'archived', label: 'Archivar', variant: 'danger' },
  ],
  in_review: [
    { to: 'approved', label: 'Aprobar', variant: 'primary' },
    { to: 'observed', label: 'Observar', variant: 'secondary' },
  ],
  observed: [
    { to: 'approved', label: 'Aprobar', variant: 'primary' },
    { to: 'in_review', label: 'Volver a revisión', variant: 'secondary' },
  ],
  approved: [
    { to: 'published', label: '🚀 Publicar al portal', variant: 'primary' },
  ],
  published: [],
  archived: [],
};

export default function AccionesDocumento({ docId, currentStatus, role }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transitions = TRANSITIONS[currentStatus] ?? [];

  async function changeStatus(newStatus: string) {
    setLoading(true);
    setError(null);

    let res;
    if (newStatus === 'published' && currentStatus === 'approved') {
      // Usar endpoint dedicado de publicación
      res = await api.post(`/api/contable/documents/${docId}/publish`);
    } else {
      res = await api.patch(`/api/contable/documents/${docId}/status`, {
        status: newStatus,
      });
    }

    if (!res.ok) {
      setError(res.error?.message ?? 'Error');
      setLoading(false);
      return;
    }
    router.refresh();
    setLoading(false);
  }

  if (transitions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center text-slate-500 dark:text-slate-400">
        No hay acciones disponibles para el status actual.
      </div>
    );
  }

  // Asistente no puede publicar
  const filteredTransitions = transitions.filter(
    (t) => !(t.to === 'published' && role === 'asistente')
  );

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
        Acciones
      </h2>
      <div className="flex flex-wrap gap-2">
        {filteredTransitions.map((t) => (
          <button
            key={t.to}
            onClick={() => changeStatus(t.to)}
            disabled={loading}
            className={`rounded-lg font-medium text-sm px-4 py-2 transition-colors disabled:opacity-50 ${
              t.variant === 'primary'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : t.variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
