/**
 * Layout del portal del cliente
 * ==============================
 *
 * Shell visual con branding del cliente. El auth check se hace
 * en cada page que lo requiera, no acá.
 */

import Link from 'next/link';
import LogoutButton from './LogoutButton';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function PortalLayout({ children, params }: LayoutProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href={`/portal/${slug}`} className="text-lg font-bold text-slate-900 dark:text-white">
                Mi Portal
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <PortalNavLink href={`/portal/${slug}`} label="Dashboard" />
                <PortalNavLink href={`/portal/${slug}/documentos`} label="Mis documentos" />
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
                {slug}.sabiacontable.cl
              </span>
              <LogoutButton slug={slug} />
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}

function PortalNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
    >
      {label}
    </Link>
  );
}
