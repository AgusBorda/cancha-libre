import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getComplexByOwner } from "@/lib/supabase/queries"
import { NewCourtClient } from "./NewCourtClient"

export default async function NuevaCancha() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const complex = await getComplexByOwner(user.id)
  if (!complex) redirect("/admin/complejo")

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva cancha</h1>
        <p className="text-sm text-gray-500 mt-0.5">{complex.name}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <NewCourtClient complexId={complex.id} />
      </div>
    </div>
  )
}
