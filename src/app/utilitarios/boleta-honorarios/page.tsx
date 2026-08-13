"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Calculator, ArrowRight } from "lucide-react";

const parseFormattedNumber = (val: string): string => {
  let clean = val.replace(/\./g, "").replace(/,/g, ".");
  const dotCount = (clean.match(/\./g) || []).length;
  if (dotCount > 1) {
    const parts = clean.split(".");
    clean = parts[0] + "." + parts.slice(1).join("");
  }
  return clean.replace(/[^0-9.]/g, "");
};

const formatNumberInput = (val: string | number): string => {
  if (val === undefined || val === null || val === "") return "";
  const strVal = val.toString();
  const parts = strVal.split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];
  const num = Number(integerPart);
  const formattedInteger = isNaN(num) ? "" : new Intl.NumberFormat("es-CL").format(num);
  if (parts.length > 1) {
    return `${formattedInteger},${decimalPart}`;
  }
  return formattedInteger;
};

export default function BoletaHonorarios() {
  const [monto, setMonto] = useState<string>("");
  const [tipo, setTipo] = useState<"bruto" | "liquido">("bruto");

  // Tasa de retención de Boletas de Honorarios para el año 2026 en Chile: 15.25%
  const tasaRetencion = 0.1525;

  const numMonto = parseFloat(monto) || 0;

  let bruto = 0;
  let retencion = 0;
  let liquido = 0;

  if (tipo === "bruto") {
    bruto = numMonto;
    retencion = Math.round(numMonto * tasaRetencion);
    liquido = bruto - retencion;
  } else {
    liquido = numMonto;
    bruto = Math.round(numMonto / (1 - tasaRetencion));
    retencion = Math.round(bruto - liquido);
  }

  const formatCurrency = (val: number) => {
    if (isNaN(val)) return "$0";
    const roundedVal = Math.round((val + Number.EPSILON) * 100) / 100;
    return "$" + new Intl.NumberFormat("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(roundedVal);
  };

  return (
    <div className="bg-[#032030] text-slate-100 min-h-screen py-16 sm:py-20 lg:py-24 min-[1920px]:py-28">
      <div className="site-container max-w-4xl space-y-10 sm:space-y-12">
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

        {/* Encabezado */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#d80073]/10 border border-[#d80073]/20 text-xs font-semibold text-[#d80073] tracking-wide uppercase">
            Cálculo Oficial 15.25%
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Calculadora de Boletas de Honorarios
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-xl">
            Calcula tu boleta de honorarios en Chile de forma rápida, obteniendo el monto bruto, la retención del SII y el valor líquido a recibir.
          </p>
        </div>

        {/* Contenido e Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Formulario */}
          <div className="bg-[#0b2545] p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Tipo de Cálculo
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                   onClick={() => setTipo("bruto")}
                  className={`py-3 rounded-xl text-sm font-semibold transition-colors focus:outline-none ${
                    tipo === "bruto"
                      ? "bg-[#d80073] text-white"
                      : "bg-[#032030] text-slate-400 hover:text-white border border-white/5"
                  }`}
                >
                  Desde Bruto
                </button>
                <button
                   onClick={() => setTipo("liquido")}
                  className={`py-3 rounded-xl text-sm font-semibold transition-colors focus:outline-none ${
                    tipo === "liquido"
                      ? "bg-[#d80073] text-white"
                      : "bg-[#032030] text-slate-400 hover:text-white border border-white/5"
                  }`}
                >
                  Desde Líquido
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="honorario-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Monto ($)
              </label>
              <input
                id="honorario-input"
                type="text"
                inputMode="decimal"
                value={formatNumberInput(monto)}
                onChange={(e) => setMonto(parseFormattedNumber(e.target.value))}
                placeholder="Ej. 500.000"
                className="w-full bg-[#032030] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#d80073] transition-colors"
              />
            </div>
          </div>

          {/* Resultados */}
          <div className="bg-[#0b2545]/50 p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
                <Calculator size={18} className="text-[#d80073]" />
                Detalle del Honorario
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Monto Bruto:</span>
                  <span className="font-semibold text-white">{formatCurrency(bruto)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1">
                    Retención SII (15.25%):
                  </span>
                  <span className="font-semibold text-white">{formatCurrency(retencion)}</span>
                </div>
                <div className="border-t border-white/5 pt-4 flex justify-between text-base">
                  <span className="font-bold text-white">Monto Líquido:</span>
                  <span className="font-extrabold text-[#d80073]">{formatCurrency(liquido)}</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/contacto"
                className="btn-interactive w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10"
              >
                ¿Necesitas iniciar actividades? Contáctanos
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

