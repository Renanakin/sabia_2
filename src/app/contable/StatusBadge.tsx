const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  in_review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  observed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  published: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  archived: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_review: 'En revisión',
  observed: 'Observado',
  approved: 'Aprobado',
  published: 'Publicado',
  archived: 'Archivado',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        STATUS_STYLES[status] ?? STATUS_STYLES.pending
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
