"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqsData } from "@/app/data";

export default function FaqDesktop() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#032D42] py-16 sm:py-20 lg:py-24 border-y border-white/5">
      <div className="site-container max-w-4xl">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Preguntas Frecuentes
          </h2>
          <p className="text-slate-400">Todo lo que necesitas saber antes de empezar.</p>
        </div>

        <div className="space-y-4">
          {faqsData.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="bg-[#0E273B] border border-white/5 rounded-xl overflow-hidden transition-all duration-300">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                >
                  <h3 className="font-bold text-white text-base lg:text-lg pr-8">{faq.question}</h3>
                  <ChevronDown
                    className={`text-[#E30080] transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`}
                    size={20}
                  />
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 pb-6 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-slate-300 leading-relaxed text-sm lg:text-base border-t border-white/5 pt-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
