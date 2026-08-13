"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { navItems } from "../core/NavigationModel";

export default function HeaderMobile() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-[60] bg-[#0E273B]/90 backdrop-blur-md border-b border-white/5 md:hidden">
      <div className="site-container">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" aria-label="Ir al inicio" onClick={() => setIsOpen(false)}>
              <Image
                src="/images/logo.png"
                alt="Sabia Contable Logo"
                width={180}
                height={56}
                priority
                className="h-10 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#E30080] p-2 rounded-lg"
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-[70] bg-[#0E273B] border-b border-white/5 px-4 pt-2 pb-6 space-y-3 shadow-2xl overflow-y-auto max-h-[calc(100vh-80px)]">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                item.path === "/contacto"
                  ? "bg-[#E30080] text-center text-white font-semibold mt-4"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
