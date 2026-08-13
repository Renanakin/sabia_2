"use client";

import { CheckCircle2 } from "lucide-react";
import * as Icons from "lucide-react";
import { homeFeatures } from "@/app/data";

export default function FeaturesDesktop() {
  return (
    <section className="bg-[#032D42] py-16 sm:py-20 lg:py-24 min-[1920px]:py-28 border-y border-white/5">
      <div className="site-container grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl min-[1920px]:text-5xl font-extrabold text-white tracking-tight">
            ¿Por qué elegir <span className="text-[#E30080]">Sabia Contable</span>?
          </h2>
          <p className="text-slate-300 leading-relaxed">
            Combinamos tecnología, experiencia y asesoría contable profesional para ayudarte a mantener tu empresa al día en contabilidad, impuestos y remuneraciones, y tomar mejores decisiones financieras. Más que una consultora contable, somos un aliado estratégico comprometido con el crecimiento, el cumplimiento tributario y la tranquilidad de tu negocio.
          </p>
          <div className="space-y-4 pt-2">
            <div className="flex gap-3">
              <CheckCircle2 className="text-[#E30080] shrink-0 mt-1" size={18} />
              <div>
                <h4 className="font-semibold text-white">Transparencia y control</h4>
                <p className="text-sm text-slate-400">Tendrás claridad sobre tu contabilidad e impuestos, con información actualizada y seguimiento mensual.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="text-[#E30080] shrink-0 mt-1" size={18} />
              <div>
                <h4 className="font-semibold text-white">Control preventivo de cumplimiento</h4>
                <p className="text-sm text-slate-400">Gestionamos plazos y obligaciones tributarias y laborales para evitar atrasos y contingencias.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {homeFeatures.map((feature, idx) => {
            // @ts-expect-error - Icons are typed dynamically
            const Icon = Icons[feature.iconName] || Icons.HelpCircle;
            return (
              <div
                key={idx}
                className="bg-[#0E273B] p-6 rounded-xl border border-white/5 space-y-3 transition-colors hover:border-[#E30080]/30"
              >
                <div className="p-3 rounded-lg bg-[#E30080]/10 w-fit text-[#E30080]">
                  <Icon size={22} />
                </div>
                <h4 className="font-bold text-white">{feature.title}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
