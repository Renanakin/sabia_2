"use client";

import Link from "next/link";
import { PhoneCall } from "lucide-react";

export default function CtaDesktop() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 min-[1920px]:py-28 text-center space-y-8">
      <div className="site-container max-w-5xl">
        <div className="inline-flex items-center gap-2 p-3 rounded-full bg-white/5 border border-white/10 w-fit text-slate-300 text-sm mx-auto">
          <PhoneCall size={16} className="text-[#E30080]" />
          <span>¿Tienes dudas? Conversa con un consultor directamente</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-5xl min-[1920px]:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Un equipo que ordena <br />
          <span className="text-[#E30080]">y respalda tu empresa</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto mt-4 text-sm sm:text-base leading-relaxed">
          En Sabia Contable apoyamos a empresas en su contabilidad, impuestos y remuneraciones, asegurando orden, cumplimiento y claridad en su gestión.
          <br />
          Nos involucramos en tu operación diaria para que tengas control financiero y respaldo en cada decisión.
          <br />
          Más que un servicio contable, somos un aliado estratégico enfocado en el crecimiento y la tranquilidad de tu empresa.
        </p>
        <div className="pt-8">
          <Link
            href="/contacto"
            className="btn-interactive inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[#E30080] hover:bg-[#c2006d] text-white font-bold shadow-lg shadow-[#E30080]/20"
          >
            Comenzar Asesoría
          </Link>
        </div>
      </div>
    </section>
  );
}
