/**
 * Layout del panel superadmin
 * ============================
 *
 * Aplica a todas las rutas /admin/* EXCEPTO /admin/login (que tiene su
 * propio layout visual sin sidebar).
 *
 * Para evitar que el auth check se aplique a /admin/login, lo hacemos
 * en cada page que lo requiera, NO en este layout. Así /admin/login
 * es accesible sin sesión.
 */

import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Sabia Contable
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Superadmin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/admin">Dashboard</NavLink>
          <NavLink href="/admin/instalaciones">Instalaciones</NavLink>
          <NavLink href="/admin/instalaciones/nueva">+ Nueva instalación</NavLink>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
    >
      {children}
    </Link>
  );
}
