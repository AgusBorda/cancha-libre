import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getComplexByOwner, getCourtsByComplex } from "@/lib/supabase/queries"
import { formatCurrency, COURT_TYPES } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Pencil, Dumbbell } from "lucide-react"

export default async function CanchasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const complex = await getComplexByOwner(user.id)
  if (!complex) redirect("/admin/complejo")

  const courts = await getCourtsByComplex(complex.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Canchas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {courts.length} cancha{courts.length !== 1 ? "s" : ""} en {complex.name}
          </p>
        </div>
        <Link href="/admin/canchas/nueva">
          <Button>
            <Plus size={16} />
            Nueva cancha
          </Button>
        </Link>
      </div>

      {courts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="h-7 w-7 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Sin canchas todavía</h3>
          <p className="text-sm text-gray-500 mb-4">
            Cargá tu primera cancha para que los jugadores puedan reservar.
          </p>
          <Link href="/admin/canchas/nueva">
            <Button>
              <Plus size={16} />
              Crear primera cancha
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courts.map((court) => (
            <div
              key={court.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Color header */}
              <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600" />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{court.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {COURT_TYPES[court.type]} · {court.capacity} jugadores
                    </p>
                  </div>
                  <Badge variant={court.is_active ? "green" : "gray"}>
                    {court.is_active ? "Activa" : "Inactiva"}
                  </Badge>
                </div>

                {court.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {court.description}
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">Precio/hora</p>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">
                      {formatCurrency(court.price_per_hour)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">Seña</p>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">
                      {court.deposit_amount > 0
                        ? formatCurrency(court.deposit_amount)
                        : "Sin seña"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href={`/admin/canchas/${court.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil size={14} />
                      Editar
                    </Button>
                  </Link>
                  <Link href={`/admin/horarios?court=${court.id}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full">
                      Horarios
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
