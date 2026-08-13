"use client";

import React, { useState, useMemo } from "react";
import { calculateSalary, SalaryInputs, AFPS, CONSTANTS } from "@/utils/salaryMath";
import { exportSalaryToPDF, exportSalaryToExcel } from "@/utils/exportTools";
import { useMindicador } from "@/hooks/useMindicador";
import { PlusCircle, MinusCircle, Info, Settings, Download, FileSpreadsheet, Loader2 } from "lucide-react";

const formatCurrency = (val: number) => {
  if (isNaN(val)) return "$0";
  const roundedVal = Math.round((val + Number.EPSILON) * 100) / 100;
  return "$" + new Intl.NumberFormat("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(roundedVal);
};

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

interface SalaryFormInputs {
  sueldoBase: string;
  isGratificacionLegal: boolean;
  gratificacionManual: string;
  comisiones: string;
  bonos: string;
  semanaCorrida: string;
  cantidadHorasExtras: string;
  recargoHorasExtras: string;
  colacion: string;
  movilizacion: string;
  afpId: string;
  saludType: "fonasa" | "isapre";
  isapreUF: string;
  isContratoIndefinido: boolean;
  apv: string;
  horasSemanales: string;
  diasAusenteType: string;
  diasAusenteCount: string;
}


const TooltipInfo = ({ text }: { text: string }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div 
      className="relative inline-flex items-center"
      onMouseLeave={() => setOpen(false)}
    >
      <button 
        type="button" 
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        className="focus:outline-none"
      >
        <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" />
      </button>
      {open && (
        <div className="absolute z-10 bottom-full mb-2 w-56 p-2.5 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded shadow-lg left-1/2 -translate-x-1/2 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-slate-800 dark:before:border-t-slate-700 text-center font-normal leading-relaxed">
          {text}
        </div>
      )}
    </div>
  );
};


export default function SalaryCalculator() {
  const [inputs, setInputs] = React.useState<SalaryFormInputs>({
    sueldoBase: "",
    isGratificacionLegal: true,
    gratificacionManual: "0",
    comisiones: "0",
    bonos: "0",
    semanaCorrida: "0",
    cantidadHorasExtras: "0",
    recargoHorasExtras: "50",
    colacion: "0",
    movilizacion: "0",
    afpId: "habitat",
    saludType: "fonasa",
    isapreUF: "0",
    isContratoIndefinido: true,
    apv: "0",
    horasSemanales: "42",
    diasAusenteType: "no",
    diasAusenteCount: "0",
  });

  const [isExportingPDF, setIsExportingPDF] = React.useState(false);
  const [isExportingExcel, setIsExportingExcel] = React.useState(false);

  const indicators = useMindicador();

  const parsedInputsForCalc = React.useMemo<SalaryInputs>(() => {
    return {
      sueldoBase: Number(inputs.sueldoBase) || 0,
      isGratificacionLegal: inputs.isGratificacionLegal,
      gratificacionManual: Number(inputs.gratificacionManual) || 0,
      comisiones: Number(inputs.comisiones) || 0,
      bonos: Number(inputs.bonos) || 0,
      semanaCorrida: Number(inputs.semanaCorrida) || 0,
      cantidadHorasExtras: Number(inputs.cantidadHorasExtras) || 0,
      recargoHorasExtras: Number(inputs.recargoHorasExtras) || 50,
      colacion: Number(inputs.colacion) || 0,
      movilizacion: Number(inputs.movilizacion) || 0,
      afpId: inputs.afpId,
      saludType: inputs.saludType,
      isapreUF: Number(inputs.isapreUF.replace(/,/g, ".")) || 0,
      isContratoIndefinido: inputs.isContratoIndefinido,
      apv: Number(inputs.apv) || 0,
      horasSemanales: Number(inputs.horasSemanales) || 42,
      diasAusenteType: inputs.diasAusenteType as "no" | "dias" | "horas",
      diasAusenteCount: Number(inputs.diasAusenteCount) || 0,
    };
  }, [inputs]);

  const results = React.useMemo(() => calculateSalary({
    ...parsedInputsForCalc,
    ufValue: indicators.uf,
    utmValue: indicators.utm
  }), [parsedInputsForCalc, indicators]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setInputs((prev) => ({ ...prev, [name]: checked }));
    } else {
      setInputs((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const rawValue = parseFormattedNumber(value);
    setInputs((prev) => ({ ...prev, [name]: rawValue }));
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await exportSalaryToPDF(parsedInputsForCalc, results, indicators);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      await exportSalaryToExcel(parsedInputsForCalc, results, indicators);
    } catch (error) {
      console.error("Error al exportar Excel:", error);
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header Texts */}
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl md:text-4xl font-semibold text-white">Calculadora de Sueldo Líquido en Chile</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Calcula el sueldo líquido en Chile de forma rápida y clara, considerando cotizaciones, descuentos y normativa vigente.
        </p>
      </div>

      {/* Indicadores Top */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border-b border-dotted border-slate-400 pb-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <Info className="w-3 h-3" /> UTM 2026 {indicators.loading && "(Cargando...)"} {indicators.error && "(Valor Base)"}
          </div>
          <div className="text-sm font-semibold dark:text-white">
            {indicators.loading ? "..." : formatCurrency(indicators.utm)}
          </div>
        </div>
        <div className="border-b border-dotted border-slate-400 pb-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <Info className="w-3 h-3" /> UF 2026 {indicators.loading && "(Cargando...)"} {indicators.error && "(Valor Base)"}
          </div>
          <div className="text-sm font-semibold dark:text-white">
            {indicators.loading ? "..." : formatCurrency(indicators.uf)}
          </div>
        </div>
        <div className="border-b border-dotted border-slate-400 pb-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <Info className="w-3 h-3" /> IMM 2026
          </div>
          <div className="text-sm font-semibold dark:text-white">{formatCurrency(CONSTANTS.SMM)}</div>
        </div>
      </div>

      {/* Calculadora Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-md overflow-hidden">

        {/* Contrato Top Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 mb-4 text-slate-700 dark:text-slate-200 font-semibold text-sm">
            <Settings className="w-4 h-4" /> Contrato
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Condición</label>
              <select className="w-full bg-transparent dark:bg-slate-900 border-b border-dotted border-slate-400 py-1 text-sm outline-none dark:text-white focus:border-magenta">
                <option>Mensual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Plazo contrato</label>
              <select
                className="w-full bg-transparent dark:bg-slate-900 border-b border-dotted border-slate-400 py-1 text-sm outline-none dark:text-white focus:border-magenta"
                name="isContratoIndefinido"
                value={inputs.isContratoIndefinido ? "true" : "false"}
                onChange={(e) => setInputs(prev => ({ ...prev, isContratoIndefinido: e.target.value === "true" }))}
              >
                <option value="true">Indefinido</option>
                <option value="false">Plazo Fijo</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs text-slate-500 mb-1" >Horas semanales <TooltipInfo text="Cantidad de horas acordadas por semana. El límite legal es 42 horas semanales y 10 horas al día. Lo que exceda este límite se considera hora extra, con un máximo de 2 horas extra diarias." /></label>
              <input 
                type="number" 
                name="horasSemanales"
                value={inputs.horasSemanales}
                onChange={handleChange}
                placeholder="42" 
                className="w-full bg-transparent border-b border-dotted border-slate-400 py-1 text-sm outline-none dark:text-white focus:border-magenta" 
              />
            </div>
          </div>
        </div>

        {/* Columnas Haberes y Descuentos */}
        <div className="flex flex-col md:flex-row">
          {/* Columna Izquierda: Haberes */}
          <div className="flex-1 p-4 md:p-6 md:border-r border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-sm dark:text-white">Haberes</h3>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-xs text-slate-500 mb-1" >Sueldo base <TooltipInfo text="El monto no puede ser inferior al ingreso mínimo legal. En caso de que este valor ya contenga la gratificación, asegúrate de desmarcar la opción correspondiente." /></label>
                  <input type="text" inputMode="decimal" name="sueldoBase" placeholder="Sin puntos" value={formatNumberInput(inputs.sueldoBase)} onChange={handleMoneyChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white" />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs text-slate-500 mb-1" >Días ausente <TooltipInfo text="Considera días de licencia médica, inasistencias sin justificar, o si el inicio del contrato ocurrió una vez empezado el mes." /></label>
                  <select name="diasAusenteType" value={inputs.diasAusenteType} onChange={handleChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white">
                    <option value="no">No</option>
                    <option value="licencia">Licencia</option>
                    <option value="ausencia">Ausencia no justificada</option>
                    <option value="fraccion">Fracción (comenzó en el mes)</option>
                  </select>
                  {inputs.diasAusenteType !== "no" && (
                    <div className="mt-2 flex items-center gap-2">
                      <label className="text-xs text-slate-500">Días:</label>
                      <input type="number" min="0" max="30" name="diasAusenteCount" value={inputs.diasAusenteCount} onChange={handleChange} className="w-16 bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-xs text-slate-500 mb-1">Gratificación</label>
                  <select
                    className="w-full bg-transparent dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white"
                    value={inputs.isGratificacionLegal ? "legal" : "manual"}
                    onChange={(e) => setInputs(prev => ({ ...prev, isGratificacionLegal: e.target.value === "legal" }))}
                  >
                    <option value="legal">Si</option>
                    <option value="manual">Monto Manual</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs text-slate-500 mb-1" >Valor grat. <TooltipInfo text="Si está habilitada, se calculará el monto menor entre el 25% de tu sueldo base y el tope legal equivalente a 4,75 ingresos mínimos mensuales divididos en 12." /></label>
                  {inputs.isGratificacionLegal ? (
                    <div className="w-full bg-transparent border-b border-dotted border-slate-400 py-1 text-sm text-slate-600 dark:text-slate-400">{results.gratificacion > 0 ? formatCurrency(results.gratificacion) : "-"}</div>
                  ) : (
                    <input type="text" inputMode="decimal" name="gratificacionManual" value={formatNumberInput(inputs.gratificacionManual)} onChange={handleMoneyChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-xs text-slate-500 mb-1">Horas extra</label>
                  <input type="text" inputMode="decimal" placeholder="Cantidad" name="cantidadHorasExtras" value={formatNumberInput(inputs.cantidadHorasExtras)} onChange={handleMoneyChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white" />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs text-slate-500 mb-1" >Recargo hrs. <TooltipInfo text="Porcentaje adicional que se paga por cada hora extraordinaria trabajada. Por ley, este recargo debe ser de al menos un 50%." /></label>
                  <input type="text" inputMode="decimal" placeholder="50%" name="recargoHorasExtras" value={inputs.recargoHorasExtras + "%"} onChange={(e) => setInputs(prev => ({ ...prev, recargoHorasExtras: e.target.value.replace("%", "") }))} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs text-slate-500 mb-1" >Valor horas extra <TooltipInfo text="Monto total correspondiente a las horas extra, calculado en base a tu sueldo, la jornada de horas semanales y el porcentaje de recargo ingresado." /></label>
                <div className="w-full bg-transparent border-b border-dotted border-slate-400 py-1 text-sm text-slate-600 dark:text-slate-400">{results.valorHorasExtras > 0 ? formatCurrency(results.valorHorasExtras) : "-"}</div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs text-slate-500 mb-1">Comisiones</label>
                <input type="text" inputMode="decimal" placeholder="(opcional)" name="comisiones" value={formatNumberInput(inputs.comisiones)} onChange={handleMoneyChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white" />
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs text-slate-500 mb-1" >Semana Corrida <TooltipInfo text="Remuneración por los días de descanso y festivos. Utiliza una herramienta especializada si tienes dudas sobre cómo calcular este valor." /></label>
                <input type="text" inputMode="decimal" placeholder="(opcional)" name="semanaCorrida" value={formatNumberInput(inputs.semanaCorrida)} onChange={handleMoneyChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white" />
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs text-slate-500 mb-1">Bonos</label>
                <input type="text" inputMode="decimal" placeholder="(opcional)" name="bonos" value={formatNumberInput(inputs.bonos)} onChange={handleMoneyChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-xs text-slate-500 mb-1">Colación</label>
                  <input type="text" inputMode="decimal" placeholder="(opcional)" name="colacion" value={formatNumberInput(inputs.colacion)} onChange={handleMoneyChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white" />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs text-slate-500 mb-1">Movilización</label>
                  <input type="text" inputMode="decimal" placeholder="(opcional)" name="movilizacion" value={formatNumberInput(inputs.movilizacion)} onChange={handleMoneyChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs text-slate-500 mb-1">Asignación familiar</label>
                <input type="text" inputMode="decimal" placeholder="(opcional)" className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white" />
              </div>

            </div>
          </div>

          {/* Columna Derecha: Descuentos */}
          <div className="flex-1 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-6">
              <MinusCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-sm dark:text-white">Descuentos</h3>
            </div>

            <div className="space-y-5">
              
              {results.descuentoAusencias > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-800/30 mb-4">
                  <label className="flex items-center justify-between text-xs text-red-600 dark:text-red-400 mb-1">
                    <span>Descuento por {inputs.diasAusenteType} ({inputs.diasAusenteCount} días)</span>
                    <span className="font-semibold">{formatCurrency(results.descuentoAusencias)}</span>
                  </label>
                  <p className="text-[10px] text-red-500/80 dark:text-red-400/80">Este monto se restó directamente de tu sueldo base.</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-xs text-slate-500 mb-1">AFP</label>
                  <select name="afpId" value={inputs.afpId} onChange={handleChange} className="w-full bg-transparent dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white">
                    {AFPS.map((afp) => (
                      <option key={afp.id} value={afp.id}>
                        {afp.name} ({(afp.rate * 100).toFixed(2).replace('.', ',')}%)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs text-slate-500 mb-1" >Total AFP <TooltipInfo text="Incluye el 10% obligatorio destinado a tu fondo de pensión más el costo de administración (comisión) cobrado por la AFP seleccionada." /></label>
                  <div className="w-full bg-transparent border-b border-dotted border-slate-400 py-1 text-sm text-slate-600 dark:text-slate-400">{results.afpMonto > 0 ? formatCurrency(results.afpMonto) : "-"}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-xs text-slate-500 mb-1">Previsión</label>
                  <select
                    name="saludType"
                    value={inputs.saludType}
                    onChange={handleChange}
                    className="w-full bg-transparent dark:bg-slate-900 border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white"
                  >
                    <option value="fonasa">Fonasa 7%</option>
                    <option value="isapre">Isapre</option>
                  </select>
                </div>
                {inputs.saludType === "isapre" ? (
                  <div>
                    <label className="flex items-center gap-1 text-xs text-slate-500 mb-1" >Plan Isapre (UF) <TooltipInfo text="Equivale al valor del plan acordado en UF si estás afiliado a una Isapre." /></label>
                    <input type="text" inputMode="decimal" placeholder="Ej: 2.5" name="isapreUF" value={inputs.isapreUF} onChange={handleChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white" />
                  </div>
                ) : (
                  <div>
                    <label className="flex items-center gap-1 text-xs text-slate-500 mb-1" >Total salud <TooltipInfo text="Equivale al 7% obligatorio sobre tu renta imponible para Fonasa." /></label>
                    <div className="w-full bg-transparent border-b border-dotted border-slate-400 py-1 text-sm text-slate-600 dark:text-slate-400">{results.saludMonto > 0 ? formatCurrency(results.saludMonto) : "-"}</div>
                  </div>
                )}
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs text-slate-500 mb-1" >Seguro de cesantía <TooltipInfo text="Descuento del 0,6% sobre la base imponible, aplicable únicamente si tu contrato de trabajo es de carácter indefinido." /></label>
                <div className="w-full bg-transparent border-b border-dotted border-slate-400 py-1 text-sm text-slate-600 dark:text-slate-400">{results.cesantiaMonto > 0 ? formatCurrency(results.cesantiaMonto) : "-"}</div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs text-slate-500 mb-1" >Impuesto <TooltipInfo text="Tributo progresivo calculado sobre tu renta tributable. Solo se aplica si esta base supera el tramo exento de 13,5 UTM al mes." /></label>
                <div className="w-full bg-transparent border-b border-dotted border-slate-400 py-1 text-sm text-slate-600 dark:text-slate-400">{results.impuestoUnico > 0 ? formatCurrency(results.impuestoUnico) : "-"}</div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs text-slate-500 mb-1" >APV <TooltipInfo text="Aporte adicional y voluntario para incrementar tu futura pensión (Ahorro Previsional Voluntario)." /></label>
                <input type="text" inputMode="decimal" placeholder="(opcional)" name="apv" value={formatNumberInput(inputs.apv)} onChange={handleMoneyChange} className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white" />
              </div>
              
              <div>
                <label className="flex items-center gap-1 text-xs text-slate-500 mb-1" >Otros descuentos legales <TooltipInfo text="Retenciones adicionales dictadas por ley, tales como cuotas sindicales o retenciones judiciales por pensión de alimentos." /></label>
                <input type="text" inputMode="decimal" placeholder="(opcional)" className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white" />
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs text-slate-500 mb-1" >Otros descuentos <TooltipInfo text="Descuentos pactados de forma voluntaria, por ejemplo: pago de créditos sociales, préstamos de la empresa o anticipos de sueldo." /></label>
                <input type="text" inputMode="decimal" placeholder="(opcional)" className="w-full bg-transparent border-b border-slate-300 dark:border-slate-600 py-1 text-sm outline-none focus:border-magenta dark:text-white" />
              </div>

            </div>
          </div>
        </div>

        {/* Footer Totales */}
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-b md:border-b-0 border-dotted border-slate-400 pb-2 md:pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1" >Haberes <TooltipInfo text="Suma de todos tus ingresos imponibles y no imponibles antes de cualquier deducción. Se le conoce también como sueldo bruto." /></span>
              </div>
              <span className="font-bold dark:text-white">{formatCurrency(results.totalHaberes)}</span>
            </div>
          </div>

          <div className="border-b md:border-b-0 border-dotted border-slate-400 pb-2 md:pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MinusCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1" >Descuentos <TooltipInfo text="Suma de todas las deducciones legales y voluntarias que se restan de tu sueldo bruto." /></span>
              </div>
              <span className="font-bold dark:text-white">{formatCurrency(results.totalDescuentos)}</span>
            </div>
          </div>

          <div className="border-b md:border-b-0 border-dotted border-slate-400 pb-2 md:pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">$</div>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1" >Sueldo líquido <TooltipInfo text="Monto final que se deposita en tu cuenta. Es el resultado de restar todos los descuentos a tu sueldo bruto." /></span>
              </div>
              <span className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrency(results.sueldoLiquido)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 text-right">
        <button type="button" className="text-xs text-slate-500 dark:text-slate-400 underline hover:text-magenta transition-colors bg-transparent border-none p-0 cursor-pointer">Mostrar bases imponibles y tributable</button>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="border border-slate-200 dark:border-slate-700 rounded-md p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Descarga tu <strong>simulación en PDF</strong> y obtén mayor detalle.</p>
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded text-sm flex items-center gap-2 transition-colors"
          >
            {isExportingPDF ? (
              <>GENERANDO <Loader2 className="w-4 h-4 animate-spin" /></>
            ) : (
              <>DESCARGAR PDF <Download className="w-4 h-4" /></>
            )}
          </button>
        </div>
        <div className="border border-slate-200 dark:border-slate-700 rounded-md p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow bg-white dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Descarga en la <strong>versión Excel</strong> de esta calculadora.</p>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="bg-[#f39c12] hover:bg-[#e67e22] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded text-sm flex items-center gap-2 transition-colors"
          >
            {isExportingExcel ? (
              <>GENERANDO <Loader2 className="w-4 h-4 animate-spin" /></>
            ) : (
              <>DESCARGAR EXCEL <FileSpreadsheet className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
