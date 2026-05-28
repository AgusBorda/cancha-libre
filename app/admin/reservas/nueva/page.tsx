import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getComplexByOwner, getCourtsByComplex } from "@/lib/supabase/queries"
import { NuevaReservaClient } from "./NuevaReservaClient"

export default async function NuevaReservaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const complex = await getComplexByOwner(user.id)
  if (!complex) redirect("/admin/complejo")

  const courts = await getCourtsByComplex(complex.id)

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva reserva manual</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Cargá una reserva que llegó por WhatsApp o teléfono
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <NuevaReservaClient courts={courts as any} complexId={complex.id} />
      </div>
    </div>
  )
}
