"use client";

import Link from "next/link";
import { PhoneCall } from "lucide-react";

export default function CtaMobile() {
  return (
    <section className="py-16 px-5 text-center pb-28">
      <div className="inline-flex items-center gap-2 p-3 rounded-full bg-white/5 border border-white/10 w-fit text-slate-300 text-xs mb-6 mx-auto">
        <PhoneCall size={14} className="text-[#E30080]" />
        <span>Conversa con un consultor directamente</span>
      </div>
      <h2 className="text-3xl font-extrabold text-white mb-5">Un equipo que ordena <span className="text-[#E30080]">y respalda tu empresa</span></h2>
      <p className="text-slate-400 text-sm mb-8">
        En Sabia Contable apoyamos a empresas en su contabilidad, impuestos y remuneraciones, asegurando orden, cumplimiento y claridad en su gestión.
        <br />
        Nos involucramos en tu operación diaria para que tengas control financiero y respaldo en cada decisión.
        <br />
        Más que un servicio contable, somos un aliado estratégico enfocado en el crecimiento y la tranquilidad de tu empresa.
      </p>
      <Link
        href="/contacto"
        className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[#E30080] text-white font-bold w-full shadow-lg shadow-[#E30080]/20"
      >
        Comenzar Asesoría
      </Link>
    </section>
  );
}
