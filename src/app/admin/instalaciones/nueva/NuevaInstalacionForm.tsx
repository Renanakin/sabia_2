'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/auth/client';

interface CreatedSecret {
  panelApiToken: string;
}

interface CreatedInstallation {
  id: string;
  slug: string;
  subdomain: string;
  dbName: string;
  storageBucket: string;
}

export default function NuevaInstalacionForm() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [dbName, setDbName] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{
    installation: CreatedInstallation;
    secrets: CreatedSecret;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Auto-completar campos derivados
  function onSlugChange(v: string) {
    const normalized = v.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(normalized);
    if (!subdomain || subdomain.startsWith(`${slug}.`)) {
      setSubdomain(`${normalized}.localhost`);
    }
    if (!dbName || dbName === `sabia_${slug.replace(/-/g, '_')}`) {
      setDbName(`sabia_${normalized.replace(/-/g, '_')}`);
    }
    if (!storageBucket || storageBucket === `sabia-${slug}`) {
      setStorageBucket(`sabia-${normalized}`);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await api.post<{
      installation: CreatedInstallation;
      secrets: CreatedSecret;
    }>('/api/admin/instalaciones', {
      slug,
      subdomain,
      dbName,
      storageBucket,
    });

    if (!res.ok) {
      setError(res.error?.message ?? 'Error creando la instalación');
      setLoading(false);
      return;
    }

    if (res.data) {
      setCreated(res.data);
    }
    setLoading(false);
  }

  async function copySecrets() {
    if (!created) return;
    const text = `Sabia Contable - Instalación ${created.installation.slug}
Panel API Token: ${created.secrets.panelApiToken}
(Este token se muestra UNA sola vez. Guárdalo en tu gestor de secretos AHORA.)`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // ignore
    }
  }

  if (created) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
          <h2 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-2">
            ✅ Instalación creada
          </h2>
          <dl className="text-sm space-y-1 text-green-800 dark:text-green-300">
            <div>
              <dt className="inline font-medium">Slug:</dt>{' '}
              <dd className="inline font-mono">{created.installation.slug}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Subdominio:</dt>{' '}
              <dd className="inline font-mono">{created.installation.subdomain}</dd>
            </div>
            <div>
              <dt className="inline font-medium">DB:</dt>{' '}
              <dd className="inline font-mono">{created.installation.dbName}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Storage:</dt>{' '}
              <dd className="inline font-mono">{created.installation.storageBucket}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">
            ⚠️ Panel API Token (se muestra UNA sola vez)
          </h3>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded font-mono text-xs break-all text-slate-900 dark:text-white">
              {created.secrets.panelApiToken}
            </code>
            <button
              onClick={copySecrets}
              className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium px-3 py-2 transition-colors"
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-2">
            Guarda este token en tu gestor de secretos AHORA. No se puede volver a mostrar.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push('/admin/instalaciones')}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 transition-colors"
          >
            Volver al listado
          </button>
          <button
            onClick={() => {
              setCreated(null);
              setSlug('');
              setSubdomain('');
              setDbName('');
              setStorageBucket('');
            }}
            className="rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium px-4 py-2 transition-colors"
          >
            Crear otra
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          Slug
        </label>
        <input
          id="slug"
          type="text"
          required
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
          placeholder="cliente-a"
          pattern="[a-z0-9-]+"
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 font-mono text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Solo minúsculas, números y guiones. Se usa en la URL.
        </p>
      </div>

      <div>
        <label
          htmlFor="subdomain"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          Subdominio
        </label>
        <input
          id="subdomain"
          type="text"
          required
          value={subdomain}
          onChange={(e) => setSubdomain(e.target.value)}
          placeholder="cliente-a.sabiacontable.cl"
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 font-mono text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="dbName"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          Nombre de BD
        </label>
        <input
          id="dbName"
          type="text"
          required
          value={dbName}
          onChange={(e) => setDbName(e.target.value)}
          placeholder="sabia_cliente_a"
          pattern="[a-z0-9_]+"
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 font-mono text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
        />
      </div>

      <div>
        <label
          htmlFor="storageBucket"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          Bucket de Storage
        </label>
        <input
          id="storageBucket"
          type="text"
          required
          value={storageBucket}
          onChange={(e) => setStorageBucket(e.target.value)}
          placeholder="sabia-cliente-a"
          pattern="[a-z0-9-]+"
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 font-mono text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 transition-colors"
      >
        {loading ? 'Creando…' : 'Crear instalación'}
      </button>
    </form>
  );
}
