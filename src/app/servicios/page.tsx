import Link from "next/link";
import { CheckCircle2, ChevronRight, Settings, Users, FileText, Briefcase, Landmark, type LucideIcon } from "lucide-react";
import { servicesData } from "@/app/data";

const iconMap: Record<string, LucideIcon> = {
  "contabilidad-integral": Briefcase,
  "gestion-de-remuneraciones": Users,
  "gestion-tributaria": FileText,
  "creacion-de-empresa": Settings,
  "auditoria-financiera": Landmark,
};

export default function Servicios() {
  return (
    <div className="bg-[#032030] text-slate-100 min-h-screen py-16 sm:py-20 lg:py-24 min-[1920px]:py-28">
      <div className="site-container max-w-6xl space-y-12 sm:space-y-16">
        {/* Encabezado */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <span className="text-[#d80073] text-sm font-semibold tracking-wider uppercase">Nuestras Especialidades</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl min-[1920px]:text-6xl font-extrabold text-white tracking-tight">
            Servicios que ordenan y hacen crecer tu empresa
          </h1>
          <p className="text-slate-400 text-lg">
            Acompañamos la contabilidad, remuneraciones y gestión tributaria de tu empresa, con foco en orden, cumplimiento y claridad para la toma de decisiones.
          </p>
        </div>

        {/* Grid de Servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {servicesData.map((service) => {
            const Icon = iconMap[service.slug] || Briefcase;
            return (
              <div
                key={service.slug}
                className="card-spotlight rounded-2xl p-8 flex flex-col justify-between h-full"
              >
                <div className="space-y-4">
                  <div className="p-3 bg-[#d80073]/10 text-[#d80073] w-fit rounded-xl">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{service.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {service.shortDescription}
                  </p>
                  <ul className="space-y-2 pt-2">
                    {(service.homeBullets || service.bullets).slice(0, 3).map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 size={14} className="text-[#d80073] shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-8">
                  <Link
                    href={`/servicios/${service.slug}`}
                    className="btn-interactive inline-flex items-center justify-center w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 text-xs"
                  >
                    Ver Detalle del Servicio
                    <ChevronRight size={14} className="ml-1" />
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

