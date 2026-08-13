"use client";

import { MessageSquareQuote } from "lucide-react";
import { testimonialsData } from "@/app/data";

export default function TestimonialsMobile() {
  return (
    <section className="bg-[#021824] py-16 px-5 border-y border-white/5">
      <h2 className="text-2xl font-extrabold text-white mb-8">
        Lo que dicen <span className="text-[#E30080]">Nuestros Clientes</span>
      </h2>
      <div className="flex flex-col gap-5">
        {testimonialsData.map((testimonial, idx) => (
          <div key={idx} className="bg-[#0E273B] p-6 rounded-xl border border-white/5 relative">
            <MessageSquareQuote size={30} className="text-[#E30080]/20 absolute top-4 right-4" />
            <p className="text-slate-300 italic mb-4 relative z-10 leading-relaxed text-sm">
              &quot;{testimonial.quote}&quot;
            </p>
            <div className="border-t border-white/10 pt-3">
              <p className="font-bold text-white text-sm">{testimonial.author}</p>
              <p className="text-[10px] text-[#E30080] uppercase tracking-wider font-semibold mt-1">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
