import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getComplexByOwner, getReservationsByComplex } from "@/lib/supabase/queries"
import { ReservasClient } from "./ReservasClient"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function ReservasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const complex = await getComplexByOwner(user.id)
  if (!complex) redirect("/admin/complejo")

  const reservations = await getReservationsByComplex(complex.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Todas las reservas de {complex.name}
          </p>
        </div>
        <Link href="/admin/reservas/nueva">
          <Button>
            <Plus size={16} />
            Nueva reserva
          </Button>
        </Link>
      </div>

      <ReservasClient initialReservations={reservations as any} />
    </div>
  )
}
