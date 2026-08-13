import Link from "next/link";
import { Percent, Users, FileText } from "lucide-react";

export default function Utilitarios() {
  const tools = [
    {
      title: "Cálculo IVA",
      desc: "Calcula el IVA en Chile de forma rápida, obteniendo valores netos y brutos para tus operaciones.",
      href: "/utilitarios/calculo-iva",
      icon: Percent,
    },
    {
      title: "Cálculo Boleta de Honorarios",
      desc: "Simula el cálculo de boleta de honorarios, incluyendo retención vigente según normativa chilena.",
      href: "/utilitarios/boleta-honorarios",
      icon: FileText,
    },
    {
      title: "Cálculo Sueldo Líquido",
      desc: "Calcula el sueldo líquido considerando cotizaciones y descuentos según la normativa vigente en Chile.",
      href: "/utilitarios/calculadora-sueldos",
      icon: Users,
    },
  ];

  return (
    <div className="bg-[#032030] text-slate-100 min-h-screen py-16 sm:py-20 lg:py-24 min-[1920px]:py-28">
      <div className="site-container max-w-6xl space-y-12 sm:space-y-16">
        {/* Encabezado */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <span className="text-[#d80073] text-sm font-semibold tracking-wider uppercase">Herramientas para tu empresa</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl min-[1920px]:text-6xl font-extrabold text-white tracking-tight">
            Utilitarios y Calculadoras
          </h1>
          <p className="text-slate-400 text-lg">
            Herramientas para calcular IVA, boletas de honorarios y sueldo líquido en Chile, de forma rápida, clara y actualizada.
          </p>
        </div>

        {/* Grid de herramientas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {tools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <div
                key={idx}
                className="card-spotlight rounded-2xl p-8 flex flex-col justify-between h-full"
              >
                <div className="space-y-4">
                  <div className="p-3 bg-[#d80073]/10 text-[#d80073] w-fit rounded-xl">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{tool.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
                <div className="pt-8">
                  <Link
                    href={tool.href}
                    className="btn-interactive w-full flex items-center justify-center py-3 rounded-xl bg-[#d80073] hover:bg-[#b0005d] text-white font-bold text-xs"
                  >
                    Usar Calculadora
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

