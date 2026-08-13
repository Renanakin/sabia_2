"use client";

import { MessageSquareQuote } from "lucide-react";
import { testimonialsData } from "@/app/data";

export default function TestimonialsDesktop() {
  return (
    <section className="bg-[#021824] py-16 sm:py-20 lg:py-24 border-y border-white/5">
      <div className="site-container">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Lo que dicen <span className="text-[#E30080]">Nuestros Clientes</span>
          </h2>
          <p className="text-slate-400 text-base">
            Empresarios y directores que ya optimizaron su carga tributaria y delegaron su contabilidad con nosotros.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {testimonialsData.map((testimonial, idx) => (
            <div key={idx} className="bg-[#0E273B] p-8 rounded-2xl border border-white/5 relative">
              <MessageSquareQuote size={40} className="text-[#E30080]/20 absolute top-6 right-6" />
              <p className="text-slate-300 italic mb-6 relative z-10 leading-relaxed text-sm lg:text-base">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="border-t border-white/10 pt-4">
                <p className="font-bold text-white">{testimonial.author}</p>
                <p className="text-xs text-[#E30080] uppercase tracking-wider font-semibold mt-1">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
