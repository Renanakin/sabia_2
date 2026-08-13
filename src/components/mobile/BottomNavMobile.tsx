"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "../core/NavigationModel";

export default function BottomNavMobile() {
  const pathname = usePathname();

  const bottomNavItems = navItems.filter((item) => item.showInBottomNav);

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden bg-[#032D42]/90 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl px-6 py-3">
      <div className="flex justify-between items-center">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center gap-1 text-xs font-medium transition-colors"
            >
              <div
                className={`p-2 rounded-xl transition-all ${
                  isActive ? "bg-[#E30080] text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon size={20} />
              </div>
              <span className={isActive ? "text-white font-semibold" : "text-slate-400"}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
