import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { getCourtById, getComplexByOwner } from "@/lib/supabase/queries"
import { EditCourtClient } from "./EditCourtClient"

export default async function EditCourtPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const complex = await getComplexByOwner(user.id)
  if (!complex) redirect("/admin/complejo")

  const court = await getCourtById(id)
  if (!court || court.complex_id !== complex.id) notFound()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Editar cancha</h1>
        <p className="text-sm text-gray-500 mt-0.5">{court.name}</p>
      </div>
      <EditCourtClient court={court} />
    </div>
  )
}
