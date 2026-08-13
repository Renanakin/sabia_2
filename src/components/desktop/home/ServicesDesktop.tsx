"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { servicesData } from "@/app/data";

export default function ServicesDesktop() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 min-[1920px]:py-28">
      <div className="site-container">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl min-[1920px]:text-5xl font-extrabold text-white tracking-tight">
            Nuestros Servicios de <span className="text-[#d80073]">Asesoría Especializada</span>
          </h2>
          <p className="text-slate-400 text-base">
            Ordenamos la gestión contable, laboral y tributaria de tu empresa, para que operes con tranquilidad y tomes mejores decisiones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {servicesData.map((service) => (
            <div key={service.slug} className="card-spotlight rounded-2xl p-8 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">{service.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{service.shortDescription}</p>
                <ul className="space-y-2.5 pt-2">
                  {(service.homeBullets || service.bullets).slice(0, 3).map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 size={14} className="text-[#d80073] shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-6">
                <Link
                  href={`/servicios/${service.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#E30080] hover:text-[#ff389d] transition-colors"
                >
                  Saber más <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
