'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/auth/client';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    await api.post('/api/auth/logout');
    router.push('/contable/login');
    router.refresh();
  }

  return (
    <button
      onClick={onLogout}
      disabled={loading}
      className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors disabled:opacity-50"
    >
      {loading ? 'Cerrando…' : 'Cerrar sesión'}
    </button>
  );
}
