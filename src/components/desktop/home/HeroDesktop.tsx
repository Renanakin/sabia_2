"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

export default function HeroDesktop() {
  const video1Ref = useRef<HTMLVideoElement | null>(null);
  const video2Ref = useRef<HTMLVideoElement | null>(null);
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);

  useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!v1 || !v2) return;

    // Duración del crossfade en segundos
    const crossfadeDuration = 1.5;

    const handleV1TimeUpdate = () => {
      if (v1.duration - v1.currentTime <= crossfadeDuration) {
        if (v2.paused) {
          v2.currentTime = 0;
          v2.play().catch(() => {});
        }
        setActiveVideo(2);
      }
    };

    const handleV2TimeUpdate = () => {
      if (v2.duration - v2.currentTime <= crossfadeDuration) {
        if (v1.paused) {
          v1.currentTime = 0;
          v1.play().catch(() => {});
        }
        setActiveVideo(1);
      }
    };

    v1.addEventListener("timeupdate", handleV1TimeUpdate);
    v2.addEventListener("timeupdate", handleV2TimeUpdate);

    // Iniciar el primer video
    v1.play().catch(() => {});

    return () => {
      v1.removeEventListener("timeupdate", handleV1TimeUpdate);
      v2.removeEventListener("timeupdate", handleV2TimeUpdate);
    };
  }, []);

  return (
    <section className="relative overflow-hidden pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-28 lg:pb-28 min-[1920px]:pt-32 min-[1920px]:pb-32 border-b border-white/5 bg-[#0E273B]">
      {/* Video 1: Firma */}
      <video
        ref={video1Ref}
        className={`absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity ease-in-out ${activeVideo === 1 ? "opacity-30" : "opacity-0"}`}
        style={{ transitionDuration: "1500ms" }}
        src="/videos/firma.mp4"
        muted
        playsInline
        preload="auto"
      />
      {/* Video 2: Acuerdo */}
      <video
        ref={video2Ref}
        className={`absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity ease-in-out ${activeVideo === 2 ? "opacity-30" : "opacity-0"}`}
        style={{ transitionDuration: "1500ms" }}
        src="/videos/acuerdo.mp4"
        muted
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(227,0,128,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[#0E273B]/55 pointer-events-none" />
      <div className="site-container relative z-10">
        <div className="max-w-3xl text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E30080]/10 border border-[#E30080]/20 text-xs font-semibold text-[#E30080] tracking-wide uppercase">
            Asesoría Contable Premium
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl min-[1920px]:text-7xl font-extrabold tracking-tight text-white leading-tight">
            ¡Lleva la Contabilidad de tu Empresa <br />
            <span className="text-[#E30080]">al Siguiente Nivel!</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl min-[1920px]:text-2xl text-slate-300 leading-relaxed max-w-2xl">
            Tu tranquilidad contable y tributaria comienza aquí. En <strong>Sabia Contable</strong>, estudio contable líder para Empresas y Pymes en Chile, convertimos los desafíos financieros y laborales en soluciones claras y efectivas. Te acompañamos con asesoría experta, cercana y 100% transparente para que tomes decisiones estratégicas con total confianza.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/contacto"
              className="btn-interactive inline-flex items-center justify-center px-8 py-4 rounded-xl bg-[#E30080] hover:bg-[#c2006d] text-white font-bold shadow-lg shadow-[#E30080]/20 text-base"
            >
              Agenda tu Asesoría Gratuita
              <ChevronRight size={18} className="ml-1" />
            </Link>
            <Link
              href="/servicios"
              className="btn-interactive inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 text-base"
            >
              Conocer Servicios
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
