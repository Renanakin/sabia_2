import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import LoginForm from './LoginForm';

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await getSession();
  if (session?.role === 'contador' || session?.role === 'asistente') {
    redirect('/contable');
  }

  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Panel Contable
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Sabia Contable</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Iniciar sesión
          </h2>
          <LoginForm initialError={error} />
        </div>
      </div>
    </main>
  );
}
