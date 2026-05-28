import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getComplexByOwner, getFrequentClients } from "@/lib/supabase/queries"
import { formatDateShort } from "@/lib/utils"
import { Users, Phone, MessageCircle } from "lucide-react"

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const complex = await getComplexByOwner(user.id)
  if (!complex) redirect("/admin/complejo")

  const clients = await getFrequentClients(complex.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {clients.length} clientes con al menos una reserva
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {clients.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              Todavía no hay reservas registradas
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Jugador
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Contacto
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Reservas
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Última visita
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clients.map((c) => (
                  <tr key={c.phone} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {c.name}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${c.phone}`}
                          className="flex items-center gap-1 text-gray-500 hover:text-green-600 text-xs"
                        >
                          <Phone size={12} />
                          {c.phone}
                        </a>
                        <a
                          href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-green-600"
                          title="Abrir WhatsApp"
                        >
                          <MessageCircle size={14} />
                        </a>
                      </div>
                      {c.email && (
                        <p className="text-xs text-gray-400 mt-0.5">{c.email}</p>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          {c.count}
                        </span>
                        {c.count >= 5 && (
                          <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                            Frecuente
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {formatDateShort(c.lastDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
