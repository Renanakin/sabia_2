"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle2, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

function ContactoForm() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    servicio: "",
    telefono: "",
    mensaje: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      if (!executeRecaptcha) {
        throw new Error("El sistema anti-spam (reCAPTCHA) no está disponible en este momento.");
      }

      // Obtener el token de reCAPTCHA v3
      const recaptchaToken = await executeRecaptcha("contacto");

      const response = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, recaptchaToken }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("success");
        setFormData({ nombre: "", email: "", servicio: "", telefono: "", mensaje: "" });
      } else {
        setStatus("error");
        let finalError = result.error || "Hubo un problema al enviar el mensaje.";
        if (result.details) {
          finalError += ` | Detalles: ${JSON.stringify(result.details)}`;
        }
        setErrorMessage(finalError);
      }
    } catch (err: unknown) {
      console.error("Error en formulario:", err);
      setStatus("error");
      const errorMsg = err instanceof Error ? err.message : "No se pudo conectar con el servidor. Inténtalo más tarde.";
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#032030] text-slate-100 min-h-screen py-16 sm:py-20 lg:py-24 min-[1920px]:py-28">
      <div className="site-container max-w-6xl space-y-12 sm:space-y-16">
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <span className="text-[#d80073] text-sm font-semibold tracking-wider uppercase">Contacto Directo</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl min-[1920px]:text-6xl font-extrabold text-white tracking-tight">Agenda tu Asesoría Contable</h1>
          <p className="text-slate-400 text-lg">
            Estamos listos para ayudarte a simplificar tus impuestos y optimizar tu gestión. Elige el medio que te sea más cómodo.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="space-y-8">
            <div className="bg-[#0b2545] p-6 rounded-2xl border border-white/5 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-2">Información de Contacto</h3>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <MapPin size={20} className="text-[#d80073] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">Nuestra Oficina</h4>
                    <p className="text-sm text-slate-300">Gran Avenida José Miguel Carrera 5234, Oficina 402, San Miguel, Región Metropolitana.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <Phone size={20} className="text-[#d80073] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">Llámanos</h4>
                    <p className="text-sm text-slate-300">Teléfono fijo: +56 2 3302 8411</p>
                    <p className="text-sm text-slate-300">Celular: +56 9 8222 3173</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <Mail size={20} className="text-[#d80073] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">Email Corporativo</h4>
                    <a href="mailto:contacto@sabiacontable.cl" className="text-sm text-slate-300 hover:text-white transition-colors">
                      contacto@sabiacontable.cl
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 overflow-hidden h-72 relative bg-[#0b2545]/50">
              <iframe
                title="Ubicación Sabia Contable"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3326.5401314959147!2d-70.6625807!3d-33.5133604!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662da5c3a373b57%3A0xc34cc4b9df099684!2sGran%20Av.%20Jos%C3%A9%20Miguel%20Carrera%205234%2C%20San%20Miguel%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1ses-419!2scl!4v1700000000000!5m2!1ses-419!2scl"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="font-bold text-white flex items-center justify-center md:justify-start gap-2">
                  <MessageCircle className="text-emerald-400" size={20} />
                  ¿Prefieres conversar por WhatsApp?
                </h4>
                <p className="text-xs text-slate-300">Resolución de dudas tributarias o cotizaciones rápidas con un consultor disponible.</p>
              </div>
              <a
                href="https://wa.me/56982223173?text=Hola,%20equipo%20de%20Sabia%20Contable.%20Quisiera%20solicitar%20asesor%C3%ADa%20y%20conocer%20m%C3%A1s%20detalles%20sobre%20los%20servicios%20contables%20y%20tributarios%20para%20mi%20negocio.%20%C2%BFPodr%C3%ADan%20orientarme,%20por%20favor%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-interactive shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/10"
              >
                Escríbenos Ya
              </a>
            </div>
          </div>

          <div className="bg-[#0b2545] p-8 rounded-2xl border border-white/5 shadow-2xl">
            {status === "success" ? (
              <div className="text-center py-16 space-y-4">
                <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full w-fit mx-auto">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-2xl font-bold text-white">Mensaje enviado con éxito</h3>
                <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Gracias por tu consulta. Tu requerimiento ha sido registrado y uno de nuestros consultores se pondrá en contacto contigo a la brevedad posible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-bold text-white border-b border-white/5 pb-3">Enviar Consulta</h3>

                {status === "error" && (
                  <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-xl flex gap-3 text-sm text-rose-300">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="nombre" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Nombre Completo</label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-[#032030] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#d80073] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Correo Electrónico</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#032030] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#d80073] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="servicio" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Servicio de Interés</label>
                  <select
                    id="servicio"
                    value={formData.servicio}
                    onChange={(e) => setFormData({ ...formData, servicio: e.target.value })}
                    className="w-full bg-[#032030] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#d80073] transition-colors"
                  >
                    <option value="" disabled>Seleccione un servicio</option>
                    <option value="Contabilidad Integral">Contabilidad Integral</option>
                    <option value="Gestión de Remuneraciones">Gestión de Remuneraciones</option>
                    <option value="Gestión Tributaria">Gestión Tributaria</option>
                    <option value="Creación de Empresa">Creación de Empresa</option>
                    <option value="Auditoría y Control">Auditoría y Control</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="telefono" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Teléfono Celular (Opcional)</label>
                  <input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-[#032030] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#d80073] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="mensaje" className="block text-xs font-bold uppercase tracking-wider text-slate-300">Requerimientos o Mensaje</label>
                  <textarea
                    id="mensaje"
                    rows={4}
                    required
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    className="w-full bg-[#032030] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#d80073] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-interactive w-full py-4 rounded-xl bg-[#d80073] hover:bg-[#b0005d] text-white font-bold shadow-lg shadow-[#d80073]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Verificando seguridad...
                    </>
                  ) : (
                    "Enviar Solicitud de Asesoría"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 
        <div className="border-t border-white/5 pt-12 space-y-6">
          <h3 className="text-center font-bold text-white text-lg">Referencias Financieras Oficiales (Chile)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0b2545]/40 p-6 rounded-2xl border border-white/5 text-center space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Unidad de Fomento (UF)</span>
              <p className="text-base font-semibold text-white">
                {indicators.loading ? "Cargando..." : formatCurrency(indicators.uf)}
              </p>
              <a className="text-xs text-[#d80073] hover:underline" href="https://www.bcentral.cl/" target="_blank" rel="noopener noreferrer">Banco Central de Chile</a>
            </div>
            <div className="bg-[#0b2545]/40 p-6 rounded-2xl border border-white/5 text-center space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Unidad Tributaria Mensual (UTM)</span>
              <p className="text-base font-semibold text-white">
                {indicators.loading ? "Cargando..." : formatCurrency(indicators.utm)}
              </p>
              <a className="text-xs text-[#d80073] hover:underline" href="https://www.sii.cl/" target="_blank" rel="noopener noreferrer">Servicio de Impuestos Internos</a>
            </div>
            <div className="bg-[#0b2545]/40 p-6 rounded-2xl border border-white/5 text-center space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Dólar Observado</span>
              <p className="text-base font-semibold text-white">
                {indicators.loading ? "Cargando..." : formatCurrency(indicators.dolar)}
              </p>
              <a className="text-xs text-[#d80073] hover:underline" href="https://www.bcentral.cl/" target="_blank" rel="noopener noreferrer">Banco Central de Chile</a>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400">Estos datos son referenciales y deben validarse según la fecha de operación.</p>
        </div>
        */}
      </div>
    </div>
  );
}

export default function Contacto() {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  
  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey} language="es">
      <ContactoForm />
    </GoogleReCaptchaProvider>
  );
}

