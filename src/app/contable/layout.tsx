/**
 * Layout del panel contable
 * ==========================
 *
 * Shell visual con sidebar. Auth check se hace en cada page.
 */

import Link from 'next/link';
import LogoutButton from './LogoutButton';

export default function ContableLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Panel Contable
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sabia Contable</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/contable">Dashboard</NavLink>
          <NavLink href="/contable/documentos">Cola de documentos</NavLink>
          <NavLink href="/contable/clientes">Clientes</NavLink>
          <NavLink href="/contable/subir">+ Subir documento</NavLink>
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
