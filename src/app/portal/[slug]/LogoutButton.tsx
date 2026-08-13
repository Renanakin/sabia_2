'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/auth/client';

export default function LogoutButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    await api.post('/api/auth/logout');
    router.push(`/portal/${slug}/login`);
    router.refresh();
  }

  return (
    <button
      onClick={onLogout}
      disabled={loading}
      className="text-sm text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
    >
      {loading ? 'Cerrando…' : 'Cerrar sesión'}
    </button>
  );
}
