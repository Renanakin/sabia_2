'use client';

import { useState } from 'react';
import { api } from '@/lib/auth/client';

export default function DownloadButton({ docId }: { docId: string; fileName: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDownload() {
    setLoading(true);
    setError(null);
    const res = await api.get<{ url: string; fileName: string; expiresIn: number }>(
      `/api/portal/documents/${docId}/download`
    );
    if (!res.ok || !res.data) {
      setError(res.error?.message ?? 'Error generando link de descarga');
      setLoading(false);
      return;
    }
    // Abrir URL firmada en nueva pestaña
    window.open(res.data.url, '_blank', 'noopener,noreferrer');
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={onDownload}
        disabled={loading}
        className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium disabled:opacity-50"
      >
        {loading ? 'Generando…' : 'Descargar'}
      </button>
      {error && <span className="ml-2 text-xs text-red-600">{error}</span>}
    </>
  );
}
