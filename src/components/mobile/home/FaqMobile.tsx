"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqsData } from "@/app/data";

export default function FaqMobile() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#032D42] py-16 px-5 border-y border-white/5">
      <h2 className="text-2xl font-extrabold text-white mb-2">Preguntas Frecuentes</h2>
      <p className="text-slate-400 text-sm mb-8">Todo lo que necesitas saber antes de empezar.</p>

      <div className="space-y-3">
        {faqsData.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="bg-[#0E273B] border border-white/5 rounded-xl overflow-hidden transition-all duration-300">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
              >
                <h3 className="font-bold text-white text-sm pr-4">{faq.question}</h3>
                <ChevronDown
                  className={`text-[#E30080] transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""}`}
                  size={18}
                />
              </button>
              <div
                className={`px-4 overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-96 pb-4 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-slate-300 leading-relaxed text-sm border-t border-white/5 pt-3">
                  {faq.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
