'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface Client {
  id: string;
  label: string;
}

interface DocumentType {
  value: string;
  label: string;
}

interface Props {
  clients: Client[];
  documentTypes: DocumentType[];
  preselectedClientId?: string;
}

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('sabia_csrf='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function SubirDocumentoForm({
  clients,
  documentTypes,
  preselectedClientId,
}: Props) {
  const router = useRouter();
  const [clientId, setClientId] = useState(preselectedClientId ?? clients[0]?.id ?? '');
  const [period, setPeriod] = useState(currentPeriod());
  const [documentType, setDocumentType] = useState(documentTypes[0]?.value ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (clients.length === 0) {
    return <p className="text-slate-600 dark:text-slate-400">No tienes clientes asignados.</p>;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) {
      setError('Selecciona un archivo');
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);

    const form = new FormData();
    form.append('clientId', clientId);
    form.append('period', period);
    form.append('documentType', documentType);
    form.append('file', file);

    const csrf = getCsrfToken();
    const res = await fetch('/api/contable/documents', {
      method: 'POST',
      body: form,
      credentials: 'include',
      headers: csrf ? { 'X-CSRF-Token': csrf } : {},
    });

    const json = await res.json();
    if (!res.ok || !json.ok) {
      setError(json.error?.message ?? 'Error subiendo el documento');
      setLoading(false);
      return;
    }

    setSuccess('Documento subido correctamente. Redirigiendo...');
    setTimeout(() => {
      router.push(`/contable/documentos/${json.data.document.id}`);
    }, 1000);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="clientId" className="block text-sm font-medium mb-1">
          Cliente
        </label>
        <select
          id="clientId"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="period" className="block text-sm font-medium mb-1">
            Período
          </label>
          <input
            id="period"
            type="text"
            required
            pattern="\d{4}-(0[1-9]|1[0-2])"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            disabled={loading}
            placeholder="2026-07"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 font-mono"
          />
        </div>
        <div>
          <label htmlFor="documentType" className="block text-sm font-medium mb-1">
            Tipo
          </label>
          <select
            id="documentType"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            required
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2"
          >
            {documentTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="file" className="block text-sm font-medium mb-1">
          Archivo
        </label>
        <input
          id="file"
          type="file"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={loading}
          accept=".pdf,.xml,.jpg,.jpeg,.png,.xls,.xlsx,.doc,.docx,.csv,.txt"
          className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          PDF, XML, imágenes, Excel, Word, CSV. Máximo 10 MB.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-3 py-2 text-sm text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !file}
        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5"
      >
        {loading ? 'Subiendo…' : 'Subir documento'}
      </button>
    </form>
  );
}
