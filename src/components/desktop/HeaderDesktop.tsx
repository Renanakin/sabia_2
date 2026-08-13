"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { servicesItems, utilsItems } from "../core/NavigationModel";

export default function HeaderDesktop() {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [utilsOpen, setUtilsOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onClickOutside = (event: Event) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
        setUtilsOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setServicesOpen(false);
        setUtilsOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <header ref={navRef} className="sticky top-0 z-[60] bg-[#0E273B]/90 backdrop-blur-md border-b border-white/5 hidden md:block">
      <div className="site-container">
        <div className="flex items-center justify-between h-[5.5rem] lg:h-24">
          <div className="flex-shrink-0">
            <Link href="/" aria-label="Ir al inicio" className="group flex items-center">
              <Image
                src="/images/logo.png"
                alt="Sabia Contable Logo"
                width={230}
                height={72}
                priority
                className="h-[3.25rem] lg:h-14 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_16px_rgba(227,0,128,0.6)] group-hover:-translate-y-0.5"
              />
            </Link>
          </div>

          <nav className="flex space-x-8 items-center">
            <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Inicio
            </Link>
            <Link href="/quienes-somos" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Nosotros
            </Link>
            <Link href="/nuestro-equipo" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Equipo
            </Link>

            {/* Dropdown Servicios */}
            <div className="relative">
              <button
                onClick={() => {
                  setServicesOpen(!servicesOpen);
                  setUtilsOpen(false);
                }}
                className="flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-white transition-colors focus:outline-none"
              >
                Servicios <ChevronDown size={16} className={`transition-transform duration-300 ${servicesOpen ? "rotate-180" : ""}`} />
              </button>

              {servicesOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl bg-[#032D42] border border-white/10 p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {servicesItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors"
                        onClick={() => setServicesOpen(false)}
                      >
                        <Icon size={16} className="text-[#E30080]" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dropdown Utilitarios */}
            <div className="relative">
              <button
                onClick={() => {
                  setUtilsOpen(!utilsOpen);
                  setServicesOpen(false);
                }}
                className="flex items-center gap-1 text-sm font-medium text-slate-300 hover:text-white transition-colors focus:outline-none"
              >
                Utilitarios <ChevronDown size={16} className={`transition-transform duration-300 ${utilsOpen ? "rotate-180" : ""}`} />
              </button>

              {utilsOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl bg-[#032D42] border border-white/10 p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {utilsItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 text-sm text-slate-300 hover:text-white transition-colors"
                        onClick={() => setUtilsOpen(false)}
                      >
                        <Icon size={16} className="text-[#E30080]" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/contacto"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#E30080] hover:bg-[#b0005d] text-white text-sm font-semibold shadow-lg shadow-[#E30080]/20"
            >
              Agenda Asesoría
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
