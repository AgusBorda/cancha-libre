"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateShort, formatTime, formatCurrency, RESERVATION_STATUS } from "@/lib/utils"
import type { Reservation } from "@/lib/supabase/types"
import { toast } from "sonner"
import { Phone, MessageCircle, ChevronDown } from "lucide-react"

interface ReservationWithCourt extends Reservation {
  courts?: { name: string; type: string }
}

interface Props {
  reservations: ReservationWithCourt[]
  onStatusChange?: (id: string, status: string) => Promise<void>
}

const STATUS_OPTIONS = [
  { value: "confirmed", label: "Confirmar" },
  { value: "pending_deposit", label: "Pendiente seña" },
  { value: "cancelled", label: "Cancelar" },
  { value: "completed", label: "Finalizada" },
  { value: "no_show", label: "No asistió" },
]

export function ReservationTable({ reservations, onStatusChange }: Props) {
  const [changing, setChanging] = useState<string | null>(null)

  async function handleStatus(id: string, status: string) {
    if (!onStatusChange) return
    setChanging(id)
    try {
      await onStatusChange(id, status)
      toast.success("Estado actualizado")
    } catch {
      toast.error("Error al actualizar estado")
    } finally {
      setChanging(null)
    }
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">No hay reservas para mostrar</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Jugador
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Cancha
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Fecha / Hora
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Seña
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Estado
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {reservations.map((r) => {
            const statusInfo = RESERVATION_STATUS[r.status]
            return (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{r.player_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <a
                      href={`tel:${r.player_phone}`}
                      className="text-xs text-gray-400 flex items-center gap-1 hover:text-green-600"
                    >
                      <Phone size={11} />
                      {r.player_phone}
                    </a>
                    <a
                      href={`https://wa.me/${r.player_phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-green-600"
                    >
                      <MessageCircle size={11} />
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-700">{r.courts?.name ?? "—"}</p>
                  <p className="text-xs text-gray-400">{r.courts?.type}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-700">{formatDateShort(r.date)}</p>
                  <p className="text-xs text-gray-400">
                    {formatTime(r.start_time)} – {formatTime(r.end_time)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-700 font-medium">
                    {formatCurrency(r.deposit_amount)}
                  </p>
                  <Badge variant={r.deposit_paid ? "green" : "yellow"}>
                    {r.deposit_paid ? "Pagada" : "Pendiente"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="relative group inline-block">
                    <Button
                      variant="outline"
                      size="sm"
                      loading={changing === r.id}
                      className="flex items-center gap-1"
                    >
                      Cambiar <ChevronDown size={13} />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10 hidden group-hover:block">
                      {STATUS_OPTIONS.filter((o) => o.value !== r.status).map(
                        (opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleStatus(r.id, opt.value)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                          >
                            {opt.label}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
