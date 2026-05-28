import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ComplexCard } from "@/components/public/ComplexCard";
import { getActiveComplexes } from "@/lib/supabase/queries";
import {
  CalendarCheck,
  CreditCard,
  Bell,
  BarChart3,
  ArrowRight,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Reservas 24/7",
    desc: "Tus clientes reservan en cualquier momento, sin esperar respuesta por WhatsApp.",
  },
  {
    icon: CreditCard,
    title: "Señas automáticas",
    desc: "Pedí seña antes de confirmar el turno. Eliminá los plantones para siempre.",
  },
  {
    icon: Bell,
    title: "Recordatorios",
    desc: "El sistema avisa automáticamente antes del partido.",
  },
  {
    icon: BarChart3,
    title: "Reportes simples",
    desc: "Mirá ingresos, horarios más reservados y clientes frecuentes desde el panel.",
  },
];

export default async function Home() {
  let complexes: Awaited<ReturnType<typeof getActiveComplexes>> = [];
  try {
    complexes = await getActiveComplexes();
  } catch {
    // Supabase no configurado todavía
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-1.5 text-sm font-medium text-green-300 mb-6">
              <Zap size={14} />
              La plataforma para canchas de barrio
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Reservás tu cancha.
              <br />
              <span className="text-green-400">Sin WhatsApp. Sin esperas.</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8">
              CanchaLibre ayuda a canchas de fútbol de barrio a ordenar sus
              reservas, cobrar señas y llenar horarios vacíos automáticamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/canchas"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-base"
              >
                Buscar cancha <ArrowRight size={18} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3.5 rounded-xl transition-colors text-base border border-white/20"
              >
                Soy dueño de cancha
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Cómo funciona</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              En 3 pasos reservás tu cancha sin llamar ni esperar respuesta
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Buscá tu cancha", desc: "Filtrá por zona, tipo (F5, F7, F11) y precio. Mirá fotos y leé reglas del complejo." },
              { step: "02", title: "Elegí día y horario", desc: "Ves los turnos disponibles en tiempo real. Elegís el que más te conviene." },
              { step: "03", title: "Confirmás y listo", desc: "Completás tus datos, pagás la seña si aplica y recibís la confirmación." },
            ].map((s) => (
              <div key={s.step} className="bg-white rounded-2xl border border-gray-200 p-6 relative overflow-hidden">
                <span className="absolute top-4 right-4 text-5xl font-black text-gray-100">{s.step}</span>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complexes */}
      {complexes.length > 0 && (
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Complejos disponibles</h2>
              <Link href="/canchas" className="text-sm font-medium text-green-600 hover:underline flex items-center gap-1">
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {complexes.slice(0, 6).map((c) => (
                <ComplexCard key={c.id} complex={c as any} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* For owners */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-green-400 font-semibold text-sm uppercase tracking-wide mb-3">Para dueños de canchas</p>
              <h2 className="text-3xl font-bold mb-4 leading-tight">
                Tu cancha llena,<br />
                <span className="text-green-400">tu WhatsApp tranquilo</span>
              </h2>
              <p className="text-gray-400 text-base leading-relaxed mb-6">
                Mientras trabajás o dormís, la cancha sigue tomando reservas. Sin errores de agenda,
                sin plantones, con todos los datos de tus clientes ordenados.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                Empezar gratis <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="w-9 h-9 bg-green-500/20 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
