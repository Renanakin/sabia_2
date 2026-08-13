'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/auth/client';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email o contraseña incorrectos.',
  rate_limited: 'Demasiados intentos. Espera unos minutos.',
  account_locked: 'Cuenta bloqueada temporalmente.',
  forbidden: 'No tienes permisos para acceder al panel contable.',
};

export default function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    initialError ? ERROR_MESSAGES[initialError] ?? 'Error de acceso.' : null
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await api.post<{ user: { role: string } }>('/api/auth/login', {
      email,
      password,
    });

    if (!res.ok) {
      setError(
        res.error?.code && ERROR_MESSAGES[res.error.code]
          ? ERROR_MESSAGES[res.error.code]
          : res.error?.message ?? 'Error desconocido'
      );
      setLoading(false);
      return;
    }

    const role = res.data?.user.role;
    if (role !== 'contador' && role !== 'asistente') {
      await api.post('/api/auth/logout');
      setError('Esta cuenta no corresponde a un contador o asistente.');
      setLoading(false);
      return;
    }

    router.push('/contable');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
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
        className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5"
      >
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  );
}
