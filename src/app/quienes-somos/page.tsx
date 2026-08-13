import { Award, CalendarDays, History } from "lucide-react";

export default function QuienesSomos() {
  return (
    <div className="bg-[#032030] text-slate-100 min-h-screen py-16 sm:py-20 lg:py-24 min-[1920px]:py-28">
      <div className="site-container max-w-5xl space-y-12 sm:space-y-16">
        {/* Hero de Nosotros */}
        <div className="space-y-4 text-center">
          <span className="text-[#d80073] text-sm font-semibold tracking-wider uppercase">Nuestra Misión y Visión</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl min-[1920px]:text-6xl font-extrabold text-white tracking-tight">
            Quiénes Somos
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
            En Sabia Contable, firma fundada en 2015, apoyamos a empresas en su contabilidad, impuestos y remuneraciones, entregando información clara y útil para la toma de decisiones. Transformamos la contabilidad en una herramienta estratégica, cercana y fácil de comprender, que impulsa el crecimiento y la gestión ordenada de cada negocio.
          </p>
        </div>

        {/* Misión y Visión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#0b2545] p-8 rounded-2xl border border-white/5 space-y-4">
            <div className="p-3 bg-[#d80073]/10 text-[#d80073] w-fit rounded-xl">
              <Award size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">Nuestra Misión</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Apoyar a nuestros clientes en su contabilidad, tributación y gestión laboral, entregando información clara y oportuna que respalde decisiones seguras y sostenibles.
            </p>
          </div>

          <div className="bg-[#0b2545] p-8 rounded-2xl border border-white/5 space-y-4">
            <div className="p-3 bg-[#d80073]/10 text-[#d80073] w-fit rounded-xl">
              <CalendarDays size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">Nuestra Visión</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Ser una consultora contable reconocida por su cercanía, rigurosidad y capacidad de generar valor en la gestión de sus clientes.
            </p>
          </div>
        </div>

        {/* Historia de Sabia Contable */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <History className="text-[#d80073]" size={24} />
            <h2 className="text-2xl font-bold text-white">Nuestra Trayectoria</h2>
          </div>
          <div className="relative border-l border-white/10 ml-4 space-y-8 pl-8">
            <div className="relative">
              <div className="absolute -left-12 top-1 w-8 h-8 rounded-full bg-[#d80073]/10 border border-[#d80073] flex items-center justify-center text-xs text-[#d80073] font-bold">1</div>
              <h3 className="font-bold text-white">Consultoría desde 2015</h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Desde 2015 acompañamos a empresas en sus procesos contables, tributarios y laborales, entregando soluciones claras y adaptadas a cada negocio.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -left-12 top-1 w-8 h-8 rounded-full bg-[#d80073]/10 border border-[#d80073] flex items-center justify-center text-xs text-[#d80073] font-bold">2</div>
              <h3 className="font-bold text-white">Enfoque y servicios integrales</h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Ofrecemos un servicio integral que incluye contabilidad, remuneraciones y asesoría tributaria, adaptándonos a las necesidades específicas de cada empresa.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -left-12 top-1 w-8 h-8 rounded-full bg-[#d80073]/10 border border-[#d80073] flex items-center justify-center text-xs text-[#d80073] font-bold">3</div>
              <h3 className="font-bold text-white">Relaciones de confianza a largo plazo</h3>
              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                Construimos relaciones de confianza con nuestros clientes, acompañándolos en su crecimiento con información clara, orden y respaldo en cada etapa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

