import { getComplexBySlug } from "@/lib/supabase/queries"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/public/Navbar"
import { Footer } from "@/components/public/Footer"
import { CourtBooking } from "./CourtBooking"
import { formatCurrency, COURT_TYPES, SERVICES_OPTIONS } from "@/lib/utils"
import { MapPin, Phone, CheckCircle2, Dumbbell } from "lucide-react"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const complex = await getComplexBySlug(slug)
    return {
      title: `${complex.name} — CanchaLibre`,
      description: complex.description ?? `Reservá en ${complex.name}, ${complex.city}`,
    }
  } catch {
    return { title: "Complejo — CanchaLibre" }
  }
}

export default async function ComplexPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let complex
  try {
    complex = await getComplexBySlug(slug)
  } catch {
    notFound()
  }

  const activeCourts = complex.courts?.filter((c: { is_active: boolean }) => c.is_active) ?? []

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-green-950 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold mb-2">{complex.name}</h1>
          <div className="flex items-center gap-1.5 text-gray-300 text-sm">
            <MapPin size={15} />
            <span>
              {complex.address}, {complex.city}
              {complex.province ? `, ${complex.province}` : ""}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {complex.phone && (
              <a
                href={`tel:${complex.phone}`}
                className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm"
              >
                <Phone size={14} />
                {complex.phone}
              </a>
            )}
            {complex.instagram && (
              <a
                href={`https://instagram.com/${complex.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm"
              >
                📷 {complex.instagram}
              </a>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: info */}
          <div className="lg:col-span-1 space-y-6">
            {complex.description && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide text-gray-500">
                  Sobre el complejo
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {complex.description}
                </p>
              </div>
            )}

            {complex.services && complex.services.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-500">
                  Servicios
                </h2>
                <div className="space-y-2">
                  {complex.services.map((s: string) => (
                    <div key={s} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={15} className="text-green-600 shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {complex.rules && (
              <div>
                <h2 className="font-semibold mb-2 text-sm uppercase tracking-wide text-gray-500">
                  Reglas
                </h2>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-line">
                    {complex.rules}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: courts + booking */}
          <div className="lg:col-span-2 space-y-6">
            {activeCourts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Dumbbell className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">
                  Este complejo no tiene canchas disponibles por ahora
                </p>
              </div>
            ) : (
              activeCourts.map((court: any) => (
                <div
                  key={court.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-500" />
                  <div className="p-6">
                    <CourtBooking court={court} complex={complex as any} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
