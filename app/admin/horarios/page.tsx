import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getComplexByOwner } from "@/lib/supabase/queries"
import { HorariosClient } from "./HorariosClient"

export default async function HorariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const complex = await getComplexByOwner(user.id)
  if (!complex) redirect("/admin/complejo")

  const { data: courts } = await supabase
    .from("courts")
    .select("*, schedules(*)")
    .eq("complex_id", complex.id)
    .eq("is_active", true)
    .order("name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Horarios</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Configurá los días y horarios disponibles por cancha
        </p>
      </div>
      <HorariosClient courts={courts ?? []} />
    </div>
  )
}
