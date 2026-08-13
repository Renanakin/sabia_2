"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="p-4 bg-red-500/10 rounded-full mb-6">
        <AlertTriangle size={48} className="text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">
        ¡Vaya! Algo no salió como esperábamos.
      </h2>
      <p className="text-slate-400 max-w-md mb-8">
        Ha ocurrido un error inesperado al cargar esta sección. Nuestro equipo técnico ha sido notificado.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors font-semibold"
        >
          Intentar nuevamente
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-[#E30080] hover:bg-[#c2006d] text-white rounded-xl transition-colors font-semibold"
        >
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
