import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import SalaryCalculator from "@/components/calculators/SalaryCalculator";

export const metadata = {
  title: "Calculadora de Sueldo Líquido Chile 2024 | Sabia Contable",
  description: "Simula tu liquidación de sueldo con los valores legales actualizados en Chile. Calcula gratificación, AFP, Isapre y Fonasa de manera automática y precisa.",
};

export default function SalaryCalculatorPage() {
  return (
    <main className="min-h-screen bg-[#032030] pt-24 pb-12 dark">
      <div className="container mx-auto px-4 max-w-5xl space-y-6">
        {/* Volver */}
        <div>
          <Link
            href="/utilitarios"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#d80073] hover:text-[#ff389d] transition-colors"
          >
            <ChevronLeft size={16} />
            Volver a Utilitarios
          </Link>
        </div>

        {/* Breadcrumb / Etiqueta */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#d80073]/10 border border-[#d80073]/20 text-xs font-semibold text-[#d80073] tracking-wide uppercase">
            Calculadora de Sueldos
          </div>
        </div>
        
        {/* Componente Interactivo */}
        <div className="dark">
          <SalaryCalculator />
        </div>
      </div>
    </main>
  );
}
