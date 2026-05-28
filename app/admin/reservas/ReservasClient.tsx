"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ReservationTable } from "@/components/admin/ReservationTable"
import type { Reservation } from "@/lib/supabase/types"
import { RESERVATION_STATUS } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface ReservationWithCourt extends Reservation {
  courts?: { name: string; type: string }
}

interface Props {
  initialReservations: ReservationWithCourt[]
}

const STATUS_FILTER = [
  { value: "", label: "Todos" },
  { value: "pending_deposit", label: "Pendiente seña" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "cancelled", label: "Canceladas" },
  { value: "completed", label: "Finalizadas" },
  { value: "no_show", label: "No asistió" },
]

export function ReservasClient({ initialReservations }: Props) {
  const [reservations, setReservations] = useState(initialReservations)
  const [statusFilter, setStatusFilter] = useState("")
  const router = useRouter()

  const filtered = statusFilter
    ? reservations.filter((r) => r.status === statusFilter)
    : reservations

  async function handleStatusChange(id: string, status: string) {
    const supabase = createClient()
    const update: Record<string, unknown> = { status }
    if (status === "cancelled") update.cancelled_at = new Date().toISOString()

    const { error } = await supabase
      .from("reservations")
      .update(update)
      .eq("id", id)

    if (error) throw error

    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: status as Reservation["status"] } : r
      )
    )
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTER.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                statusFilter === f.value
                  ? "bg-green-600 border-green-600 text-white"
                  : "bg-white border-gray-300 text-gray-600 hover:border-green-400"
              }`}
            >
              {f.label}
              {f.value && (
                <span className="ml-1.5 opacity-70">
                  ({reservations.filter((r) => r.status === f.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-900">
            {filtered.length} reserva{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <ReservationTable
          reservations={filtered}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  )
}
