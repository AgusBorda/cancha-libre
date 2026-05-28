import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getComplexByOwner, getReservationsByComplex } from "@/lib/supabase/queries"
import { AdminCalendar } from "@/components/admin/AdminCalendar"

export default async function CalendarioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const complex = await getComplexByOwner(user.id)
  if (!complex) redirect("/admin/complejo")

  const reservations = await getReservationsByComplex(complex.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Vista semanal de todas las reservas
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <AdminCalendar reservations={reservations as any} />
      </div>
    </div>
  )
}
