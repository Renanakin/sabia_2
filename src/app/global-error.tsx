"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("GlobalError caught an error:", error);
  }, [error]);

  return (
    <html lang="es">
      <body className="bg-[#032030] text-slate-100 flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="p-4 bg-red-500/10 rounded-full mb-6">
          <AlertTriangle size={48} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">
          Error Crítico del Sistema
        </h2>
        <p className="text-slate-400 max-w-md mb-8">
          La aplicación no pudo inicializarse correctamente.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[#E30080] hover:bg-[#c2006d] text-white rounded-xl transition-colors font-semibold"
        >
          Forzar Recarga
        </button>
      </body>
    </html>
  );
}
