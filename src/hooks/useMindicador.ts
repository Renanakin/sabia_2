import { useState, useEffect } from "react";
import { CONSTANTS } from "@/utils/salaryMath";

interface Indicators {
  uf: number;
  utm: number;
  dolar: number;
  loading: boolean;
  error: boolean;
}

export function useMindicador() {
  const [indicators, setIndicators] = useState<Indicators>({
    uf: CONSTANTS.UF,
    utm: CONSTANTS.UTM,
    dolar: 890, // Fallback aproximado
    loading: true,
    error: false,
  });

  useEffect(() => {
    let active = true;
    async function fetchIndicators() {
      try {
        const res = await fetch("/api/indicators");
        if (!res.ok) throw new Error("Error en API proxy de indicadores");
        
        const data = await res.json();
        if (active) {
          setIndicators({
            uf: data.uf || CONSTANTS.UF,
            utm: data.utm || CONSTANTS.UTM,
            dolar: data.dolar || 890,
            loading: false,
            error: false,
          });
        }
      } catch (err) {
        console.error("Error cargando mindicador:", err);
        if (active) {
          setIndicators((prev) => ({ ...prev, loading: false, error: true }));
        }
      }
    }
    fetchIndicators();
    return () => {
      active = false;
    };
  }, []);

  return indicators;
}
