"use client"

import { useState } from "react"
import { addDays, formatDateShort, formatTime, RESERVATION_STATUS, cn } from "@/lib/utils"
import type { Reservation } from "@/lib/supabase/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getTodayString } from "@/lib/utils"

interface ReservationWithCourt extends Reservation {
  courts?: { name: string; type: string }
}

interface Props {
  reservations: ReservationWithCourt[]
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8) // 08:00 - 23:00

export function AdminCalendar({ reservations }: Props) {
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date(getTodayString() + "T00:00:00")
    const day = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
    return monday.toISOString().split("T")[0]
  })

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const today = getTodayString()

  function prevWeek() {
    setWeekStart(addDays(weekStart, -7))
  }
  function nextWeek() {
    setWeekStart(addDays(weekStart, 7))
  }

  function getReservationsForDay(date: string) {
    return reservations.filter(
      (r) =>
        r.date === date &&
        r.status !== "cancelled"
    )
  }

  const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">
          {formatDateShort(weekStart)} — {formatDateShort(addDays(weekStart, 6))}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prevWeek}>
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const d = new Date(today + "T00:00:00")
              const day = d.getDay()
              const monday = new Date(d)
              monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
              setWeekStart(monday.toISOString().split("T")[0])
            }}
          >
            Hoy
          </Button>
          <Button variant="outline" size="sm" onClick={nextWeek}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Calendar grid - day view (vertical list per day) */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((date, i) => {
          const dayRes = getReservationsForDay(date)
          const isToday = date === today
          const d = new Date(date + "T00:00:00")
          const dayNum = d.getDate()

          return (
            <div
              key={date}
              className={cn(
                "min-h-24 rounded-lg border p-2",
                isToday
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white"
              )}
            >
              <div className="text-center mb-2">
                <p className="text-xs text-gray-500 uppercase">{DAY_NAMES[i]}</p>
                <p
                  className={cn(
                    "text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center mx-auto",
                    isToday
                      ? "bg-green-600 text-white"
                      : "text-gray-900"
                  )}
                >
                  {dayNum}
                </p>
              </div>
              <div className="space-y-1">
                {dayRes.slice(0, 4).map((r) => {
                  const statusInfo = RESERVATION_STATUS[r.status]
                  return (
                    <div
                      key={r.id}
                      className={cn(
                        "text-xs rounded px-1.5 py-1 truncate",
                        r.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : r.status === "pending_deposit"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-600"
                      )}
                      title={`${r.player_name} — ${formatTime(r.start_time)}`}
                    >
                      <span className="font-medium">{formatTime(r.start_time)}</span>{" "}
                      {r.courts?.name ?? r.player_name.split(" ")[0]}
                    </div>
                  )
                })}
                {dayRes.length > 4 && (
                  <p className="text-xs text-gray-400 pl-1">
                    +{dayRes.length - 4} más
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
