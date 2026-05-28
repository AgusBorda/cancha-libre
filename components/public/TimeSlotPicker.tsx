"use client"

import { useState } from "react"
import { cn, formatCurrency, formatTime, getTodayString, addDays } from "@/lib/utils"
import type { TimeSlot } from "@/lib/supabase/types"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface Props {
  slots: TimeSlot[]
  selectedDate: string
  selectedSlot: TimeSlot | null
  loadingSlots: boolean
  onDateChange: (date: string) => void
  onSlotSelect: (slot: TimeSlot) => void
}

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

export function TimeSlotPicker({
  slots,
  selectedDate,
  selectedSlot,
  loadingSlots,
  onDateChange,
  onSlotSelect,
}: Props) {
  const today = getTodayString()
  const [calStart, setCalStart] = useState(() => {
    const d = new Date(today + "T00:00:00")
    d.setDate(1)
    return d.toISOString().split("T")[0]
  })

  // Build calendar month
  const monthStart = new Date(calStart + "T00:00:00")
  const year = monthStart.getFullYear()
  const month = monthStart.getMonth()
  const firstDayOfWeek = monthStart.getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function prevMonth() {
    const d = new Date(calStart + "T00:00:00")
    d.setMonth(d.getMonth() - 1)
    setCalStart(d.toISOString().split("T")[0])
  }
  function nextMonth() {
    const d = new Date(calStart + "T00:00:00")
    d.setMonth(d.getMonth() + 1)
    setCalStart(d.toISOString().split("T")[0])
  }

  function buildDate(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const leadingBlanks = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  return (
    <div className="space-y-5">
      {/* Calendar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ChevronLeft size={18} />
          </button>
          <p className="font-semibold text-gray-900 text-sm">
            {MONTH_NAMES[month]} {year}
          </p>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map((d) => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: leadingBlanks }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const dateStr = buildDate(day)
            const isPast = dateStr < today
            const isSelected = dateStr === selectedDate
            const isToday = dateStr === today

            return (
              <button
                key={day}
                disabled={isPast}
                onClick={() => onDateChange(dateStr)}
                className={cn(
                  "h-9 w-full rounded-lg text-sm font-medium transition-colors",
                  isPast
                    ? "text-gray-300 cursor-not-allowed"
                    : isSelected
                    ? "bg-green-600 text-white"
                    : isToday
                    ? "border-2 border-green-600 text-green-700 hover:bg-green-50"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-3">
          Horarios disponibles —{" "}
          {new Date(selectedDate + "T00:00:00").toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>

        {loadingSlots ? (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 className="animate-spin h-5 w-5" />
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-400 bg-gray-50 rounded-lg">
            No hay horarios disponibles para este día
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => {
              const isSelected =
                selectedSlot?.start === slot.start &&
                selectedSlot?.end === slot.end

              return (
                <button
                  key={slot.start}
                  disabled={!slot.available}
                  onClick={() => slot.available && onSlotSelect(slot)}
                  className={cn(
                    "rounded-lg border p-2.5 text-center transition-all",
                    !slot.available
                      ? "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed line-through"
                      : isSelected
                      ? "bg-green-600 border-green-600 text-white shadow-md"
                      : "bg-white border-gray-200 text-gray-700 hover:border-green-500 hover:bg-green-50"
                  )}
                >
                  <p className="font-bold text-sm leading-none">
                    {formatTime(slot.start)}
                  </p>
                  <p className="text-xs mt-1 opacity-75">
                    {formatCurrency(slot.price)}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
