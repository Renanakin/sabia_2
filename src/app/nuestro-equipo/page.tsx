"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa6";
import { teamData, TeamMember } from "@/app/data";

// Helper to parse bio markdown
function renderBio(bio: string) {
  const blocks = bio.split("\n\n");
  
  const formatBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return blocks.map((block, i) => {
    if (block.startsWith("### ")) {
      return (
        <h5 key={i} className="text-sm font-bold text-white mt-6 mb-3">
          {block.replace("### ", "")}
        </h5>
      );
    }
    return (
      <p key={i} className="text-sm text-slate-300 leading-relaxed mb-6 text-justify">
        {formatBold(block)}
      </p>
    );
  });
}

export default function NuestroEquipo() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Escuchar la tecla ESC para cerrar el modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedMember(null);
      }
    };

    if (selectedMember) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedMember]);

  // Prevenir scroll en el body cuando el modal está abierto
  useEffect(() => {
    if (selectedMember) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedMember]);

  return (
    <div className="bg-[#032030] text-slate-100 min-h-screen py-16 sm:py-20 lg:py-24 min-[1920px]:py-28">
      <div className="site-container max-w-6xl space-y-12 sm:space-y-16">
        {/* Encabezado */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <span className="text-[#d80073] text-sm font-semibold tracking-wider uppercase">Profesionales Calificados</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl min-[1920px]:text-6xl font-extrabold text-white tracking-tight">
            Nuestro Equipo
          </h1>
          <p className="text-slate-400 text-lg">
            En Sabia Contable trabajamos con compromiso, rigurosidad y cercanía, acompañando a nuestros clientes en sus procesos contables, tributarios y laborales.
            Nuestro enfoque está en entregar información clara y oportuna para la toma de decisiones, asegurando el cumplimiento normativo y construyendo relaciones de largo plazo basadas en la confianza, la transparencia y un servicio de alto estándar.
          </p>
        </div>

        {/* Grid de Miembros */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {teamData.map((member) => (
            <div
              key={member.id}
              className="card-spotlight rounded-2xl p-6 flex flex-col justify-between cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <div className="space-y-4 flex-grow flex flex-col">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full bg-[#032030] overflow-hidden border-2 border-[#E30080]/40 shrink-0 flex items-center justify-center">
                    {/* AQUÍ SE APLICA EL AJUSTE DE IMAGEN. Lee objectPosition desde data.ts */}
                    <Image src={member.image} alt={member.name} fill className="object-cover" style={{ objectPosition: member.objectPosition || "center" }} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-white leading-tight">{member.name}</h3>
                    <span className="text-[11px] font-semibold text-[#E30080] uppercase tracking-wider mt-0.5">{member.role}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed text-justify flex-grow mt-2">
                  {member.shortDesc}
                </p>
              </div>
              <div className="pt-6 flex justify-between items-center text-xs font-semibold text-[#E30080]">
                <span>Ver perfil detallado &rarr;</span>
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`LinkedIn de ${member.name}`}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 rounded-full bg-[#0077B5] text-white inline-flex items-center justify-center transition-transform hover:-translate-y-0.5 hover:brightness-110"
                  >
                    <FaLinkedinIn size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Detalle */}
        {selectedMember && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedMember(null)}
          >
            <div
              className="relative w-full max-w-2xl bg-[#0b2545] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cerrar */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-3 right-3 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors focus:outline-none z-10 bg-[#0b2545]/80 backdrop-blur"
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>

              <div className="overflow-y-auto p-6 md:p-8">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="relative w-24 h-24 rounded-2xl bg-[#032030] border-2 border-[#E30080] overflow-hidden flex items-center justify-center shrink-0">
                    {/* AQUÍ SE APLICA EL AJUSTE DE IMAGEN. Lee objectPosition desde data.ts */}
                    <Image src={selectedMember.image} alt={selectedMember.name} fill className="object-cover" style={{ objectPosition: selectedMember.objectPosition || "center" }} />
                  </div>
                  <div className="space-y-2 pr-6 flex flex-col items-start">
                    <h2 className="text-2xl font-bold text-white">{selectedMember.name}</h2>
                    <span className="inline-block px-2.5 py-1 rounded-full bg-[#E30080]/10 text-xs font-bold text-[#E30080] tracking-wide uppercase">
                      {selectedMember.role}
                    </span>
                    {selectedMember.linkedin && (
                      <a
                        href={selectedMember.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`LinkedIn de ${selectedMember.name}`}
                        className="h-8 w-8 rounded-full bg-[#0077B5] text-white inline-flex items-center justify-center transition-transform hover:-translate-y-0.5 hover:brightness-110 mt-2"
                      >
                        <FaLinkedinIn size={14} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6 mt-6">
                  <h4 className="font-bold text-[#E30080] text-xs uppercase tracking-wider mb-2">Acerca de su rol</h4>
                  <div>
                    {renderBio(selectedMember.bio)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

