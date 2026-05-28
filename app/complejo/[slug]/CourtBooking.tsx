"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TimeSlotPicker } from "@/components/public/TimeSlotPicker"
import { ReservationForm } from "@/components/public/ReservationForm"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, COURT_TYPES, getTodayString } from "@/lib/utils"
import type { Court, Complex, TimeSlot } from "@/lib/supabase/types"
import { toast } from "sonner"
import { Dumbbell } from "lucide-react"

interface Props {
  court: Court
  complex: Complex
}

export function CourtBooking({ court, complex }: Props) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [step, setStep] = useState<"picker" | "form">("picker")

  const fetchSlots = useCallback(
    async (date: string) => {
      setLoadingSlots(true)
      setSelectedSlot(null)
      try {
        const supabase = createClient()
        const d = new Date(date + "T00:00:00")
        const dayOfWeek = d.getDay()

        const { data: schedule } = await supabase
          .from("schedules")
          .select("*")
          .eq("court_id", court.id)
          .eq("day_of_week", dayOfWeek)
          .eq("is_active", true)
          .single()

        if (!schedule) {
          setSlots([])
          setLoadingSlots(false)
          return
        }

        const [{ data: reservations }, { data: blockedSlots }] =
          await Promise.all([
            supabase
              .from("reservations")
              .select("start_time, end_time")
              .eq("court_id", court.id)
              .eq("date", date)
              .not("status", "in", '("cancelled")'),
            supabase
              .from("blocked_slots")
              .select("start_time, end_time")
              .eq("court_id", court.id)
              .eq("date", date),
          ])

        const toMin = (t: string) => {
          const [h, m] = t.slice(0, 5).split(":").map(Number)
          return h * 60 + m
        }
        const fromMin = (m: number) =>
          `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`

        const startMin = toMin(schedule.start_time)
        const endMin = toMin(schedule.end_time)
        const dur = schedule.slot_duration
        const generated: TimeSlot[] = []

        for (let t = startMin; t + dur <= endMin; t += dur) {
          const slotStart = fromMin(t)
          const slotEnd = fromMin(t + dur)
          const isReserved = (reservations ?? []).some(
            (r) => slotStart < r.end_time.slice(0, 5) && slotEnd > r.start_time.slice(0, 5)
          )
          const isBlocked = (blockedSlots ?? []).some(
            (b) => slotStart < b.end_time.slice(0, 5) && slotEnd > b.start_time.slice(0, 5)
          )
          generated.push({
            start: slotStart,
            end: slotEnd,
            price: schedule.price_override ?? court.price_per_hour,
            available: !isReserved && !isBlocked,
          })
        }

        setSlots(generated)
      } catch {
        setSlots([])
      } finally {
        setLoadingSlots(false)
      }
    },
    [court.id, court.price_per_hour]
  )

  useEffect(() => {
    fetchSlots(selectedDate)
  }, [selectedDate, fetchSlots])

  async function handleReservation(formData: {
    player_name: string
    player_phone: string
    player_email?: string
    player_count: number
    notes?: string
  }) {
    if (!selectedSlot) return

    const supabase = createClient()
    const { data, error } = await supabase
      .from("reservations")
      .insert({
        court_id: court.id,
        complex_id: complex.id,
        player_name: formData.player_name,
        player_phone: formData.player_phone,
        player_email: formData.player_email || null,
        player_count: formData.player_count,
        notes: formData.notes || null,
        date: selectedDate,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        total_price: selectedSlot.price,
        deposit_amount: court.deposit_amount,
        deposit_paid: false,
        status: court.deposit_amount > 0 ? "pending_deposit" : "confirmed",
        source: "online",
      })
      .select()
      .single()

    if (error) {
      toast.error("Error al crear la reserva. Intentá de nuevo.")
      throw error
    }

    // Enviar notificación WhatsApp (sin bloquear la navegación)
    fetch("/api/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerName: formData.player_name,
        playerPhone: formData.player_phone,
        courtName: court.name,
        complexName: complex.name,
        complexAddress: complex.address,
        complexCity: complex.city,
        complexWhatsapp: (complex as any).whatsapp ?? null,
        ownerPhone: (complex as any).whatsapp ?? null,
        date: selectedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        totalPrice: selectedSlot.price,
        depositAmount: court.deposit_amount,
        reservationId: data.id,
      }),
    }).catch(() => {})

    // Si hay seña → redirigir a Mercado Pago
    if (court.deposit_amount > 0) {
      toast.loading("Redirigiendo a Mercado Pago...")
      const mpRes = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: data.id,
          courtName: court.name,
          complexName: complex.name,
          date: selectedDate,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          depositAmount: court.deposit_amount,
          playerEmail: formData.player_email || null,
        }),
      })
      const { url, error: mpError } = await mpRes.json()
      if (url) {
        window.location.href = url
        return
      }
      toast.error(mpError ?? "Error al iniciar el pago. Intentá de nuevo.")
      return
    }

    toast.success("¡Reserva confirmada!")
    router.push(`/reserva/${data.id}`)
  }

  return (
    <div>
      {/* Court info */}
      <div className="flex items-start gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
          <Dumbbell className="h-6 w-6 text-green-700" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900">{court.name}</h3>
            <Badge variant="green">{COURT_TYPES[court.type]}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {court.capacity} jugadores ·{" "}
            <span className="font-semibold text-gray-700">
              {formatCurrency(court.price_per_hour)}/hora
            </span>
            {court.deposit_amount > 0 && (
              <span className="text-gray-400">
                {" "}· seña {formatCurrency(court.deposit_amount)}
              </span>
            )}
          </p>
          {court.description && (
            <p className="text-xs text-gray-400 mt-1">{court.description}</p>
          )}
        </div>
      </div>

      {step === "picker" ? (
        <TimeSlotPicker
          slots={slots}
          selectedDate={selectedDate}
          selectedSlot={selectedSlot}
          loadingSlots={loadingSlots}
          onDateChange={(date) => {
            setSelectedDate(date)
            setSelectedSlot(null)
          }}
          onSlotSelect={(slot) => {
            setSelectedSlot(slot)
            setStep("form")
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
        />
      ) : (
        selectedSlot && (
          <ReservationForm
            court={court}
            complex={complex}
            selectedDate={selectedDate}
            selectedSlot={selectedSlot}
            onSubmit={handleReservation}
            onBack={() => setStep("picker")}
          />
        )
      )}
    </div>
  )
}
