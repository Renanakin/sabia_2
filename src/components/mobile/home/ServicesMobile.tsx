"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { servicesData } from "@/app/data";

export default function ServicesMobile() {
  return (
    <section className="py-16 px-5">
      <div className="mb-10 space-y-3">
        <h2 className="text-2xl font-extrabold text-white">Nuestros Servicios de <span className="text-[#d80073]">Asesoría</span></h2>
        <p className="text-slate-400 text-sm">Ordenamos la gestión contable, laboral y tributaria de tu empresa, para que operes con tranquilidad y tomes mejores decisiones.</p>
      </div>
      <div className="flex flex-col gap-6">
        {servicesData.map((service) => (
          <div key={service.slug} className="bg-[#0E273B] rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-bold text-white mb-2">{service.title}</h3>
            <p className="text-sm text-slate-400 mb-5">{service.shortDescription}</p>
            <ul className="space-y-2.5 mb-6">
              {(service.homeBullets || service.bullets).slice(0, 3).map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={14} className="text-[#d80073] shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/servicios/${service.slug}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#E30080]"
            >
              Saber más <ChevronRight size={16} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
