import { getActiveComplexes } from "@/lib/supabase/queries"
import { ComplexCard } from "@/components/public/ComplexCard"
import { Navbar } from "@/components/public/Navbar"
import { Footer } from "@/components/public/Footer"
import { Search } from "lucide-react"

export default async function CanchasPage() {
  let complexes: Awaited<ReturnType<typeof getActiveComplexes>> = []
  try {
    complexes = await getActiveComplexes()
  } catch {
    // Supabase no configurado
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="bg-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold mb-2">Buscá tu cancha</h1>
          <p className="text-gray-400">
            {complexes.length > 0
              ? `${complexes.length} complejo${complexes.length !== 1 ? "s" : ""} disponible${complexes.length !== 1 ? "s" : ""}`
              : "Explorá los complejos disponibles"}
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        {complexes.length === 0 ? (
          <div className="text-center py-24">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Todavía no hay complejos
            </h2>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Pronto habrá canchas disponibles en tu zona. Si tenés una cancha,{" "}
              <a href="/login" className="text-green-600 hover:underline">
                registrala acá
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {complexes.map((c) => (
              <ComplexCard key={c.id} complex={c as any} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
