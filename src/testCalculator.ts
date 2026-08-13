import { calculateSalary } from "./utils/salaryMath";

const inputs = {
  sueldoBase: 400000,
  isGratificacionLegal: true,
  gratificacionManual: 0,
  comisiones: 0,
  bonos: 100000,
  semanaCorrida: 0,
  cantidadHorasExtras: 5,
  recargoHorasExtras: 50,
  colacion: 0,
  movilizacion: 0,
  afpId: "habitat",
  saludType: "fonasa" as const,
  isapreUF: 0,
  isContratoIndefinido: true,
  apv: 0,
  ufValue: 40844.79,
  utmValue: 71649,
  horasSemanales: 42
};

const results = calculateSalary(inputs);
console.log(JSON.stringify(results, null, 2));
