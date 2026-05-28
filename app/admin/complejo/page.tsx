import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getComplexByOwner } from "@/lib/supabase/queries"
import { ComplexFormClient } from "./ComplexFormClient"

export default async function ComplexPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const complex = await getComplexByOwner(user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Complejo</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {complex
            ? "Editá los datos de tu complejo"
            : "Completá los datos para empezar a recibir reservas"}
        </p>
      </div>
      <ComplexFormClient complex={complex} userId={user.id} />
    </div>
  )
}
