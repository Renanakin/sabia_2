"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function HeroMobile() {
  const video1Ref = useRef<HTMLVideoElement | null>(null);
  const video2Ref = useRef<HTMLVideoElement | null>(null);
  const [activeVideo, setActiveVideo] = useState<1 | 2>(1);

  useEffect(() => {
    const v1 = video1Ref.current;
    const v2 = video2Ref.current;
    if (!v1 || !v2) return;

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

    v1.play().catch(() => {});

    return () => {
      v1.removeEventListener("timeupdate", handleV1TimeUpdate);
      v2.removeEventListener("timeupdate", handleV2TimeUpdate);
    };
  }, []);

  return (
    <section className="relative pt-12 pb-16 bg-[#0E273B] px-5 border-b border-white/5 overflow-hidden">
      {/* Video 1: Firma */}
      <video
        ref={video1Ref}
        className={`absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity ease-in-out ${activeVideo === 1 ? "opacity-20" : "opacity-0"}`}
        style={{ transitionDuration: "1500ms" }}
        src="/videos/firma.mp4"
        muted
        playsInline
        preload="auto"
      />
      {/* Video 2: Acuerdo */}
      <video
        ref={video2Ref}
        className={`absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity ease-in-out ${activeVideo === 2 ? "opacity-20" : "opacity-0"}`}
        style={{ transitionDuration: "1500ms" }}
        src="/videos/acuerdo.mp4"
        muted
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-[#0E273B]/80 pointer-events-none" />
      <div className="relative z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E30080]/10 text-xs font-semibold text-[#E30080]">
          Asesoría Contable Premium
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
          ¡Lleva la Contabilidad de tu Empresa <br />
          <span className="text-[#E30080]">al Siguiente Nivel!</span>
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          Tu tranquilidad contable y tributaria comienza aquí. En <strong>Sabia Contable</strong>, estudio contable líder para Empresas y Pymes en Chile, convertimos los desafíos financieros y laborales en soluciones claras y efectivas.
        </p>
        <div className="flex flex-col gap-3 pt-4">
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center px-6 py-4 rounded-xl bg-[#E30080] text-white font-bold shadow-lg shadow-[#E30080]/20 text-base w-full"
          >
            Agendar Asesoría Gratuita
          </Link>
          <Link
            href="/servicios"
            className="inline-flex items-center justify-center px-6 py-4 rounded-xl bg-white/5 text-white font-bold border border-white/10 text-base w-full"
          >
            Conocer Servicios
          </Link>
        </div>
      </div>
    </section>
  );
}
