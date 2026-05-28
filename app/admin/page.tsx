import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getDashboardStats, getTodayReservations, getComplexByOwner } from "@/lib/supabase/queries"
import { StatsCard } from "@/components/admin/StatsCard"
import { ReservationTable } from "@/components/admin/ReservationTable"
import { formatCurrency, formatTime, RESERVATION_STATUS } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Dumbbell,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const complex = await getComplexByOwner(user.id)

  if (!complex) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
          <Dumbbell className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Todavía no configuraste tu complejo
        </h2>
        <p className="text-gray-500 text-sm mb-6 max-w-sm">
          Creá tu complejo deportivo para empezar a recibir reservas online.
        </p>
        <Link href="/admin/complejo">
          <Button size="lg">
            <Plus size={16} />
            Crear mi complejo
          </Button>
        </Link>
      </div>
    )
  }

  const [stats, todayReservations] = await Promise.all([
    getDashboardStats(complex.id),
    getTodayReservations(complex.id),
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{complex.name}</p>
        </div>
        <Link href="/admin/reservas/nueva">
          <Button>
            <Plus size={16} />
            Nueva reserva
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Reservas hoy"
          value={stats.todayCount}
          subtitle={
            stats.todayCount === 0 ? "Sin reservas" : "turnos confirmados"
          }
          icon={CalendarCheck}
        />
        <StatsCard
          title="Ingresos hoy"
          value={formatCurrency(stats.todayRevenue)}
          subtitle="estimado"
          icon={DollarSign}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <StatsCard
          title="Ingresos del mes"
          value={formatCurrency(stats.monthRevenue)}
          subtitle="estimado"
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <StatsCard
          title="Canchas activas"
          value={stats.activeCourts}
          subtitle="disponibles"
          icon={Dumbbell}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
        />
      </div>

      {/* Today's reservations */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Reservas de hoy</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <Link href="/admin/reservas">
            <button className="text-sm text-green-600 font-medium hover:underline">
              Ver todas →
            </button>
          </Link>
        </div>
        {todayReservations.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No hay reservas para hoy
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Jugador
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Cancha
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Horario
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {todayReservations.map((r) => {
                  const s = RESERVATION_STATUS[r.status]
                  return (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {r.player_name}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {(r as { courts?: { name: string } }).courts?.name ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {formatTime(r.start_time)} – {formatTime(r.end_time)}
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
