"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { COURT_TYPES, formatCurrency } from "@/lib/utils"
import type { Court } from "@/lib/supabase/types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const schema = z.object({
  court_id: z.string().min(1, "Seleccioná una cancha"),
  date: z.string().min(1, "Seleccioná una fecha"),
  start_time: z.string().min(1, "Ingresá hora inicio"),
  end_time: z.string().min(1, "Ingresá hora fin"),
  player_name: z.string().min(2, "Requerido"),
  player_phone: z.string().min(8, "Requerido"),
  player_email: z.string().email().optional().or(z.literal("")),
  player_count: z.coerce.number().min(1),
  deposit_paid: z.boolean(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  courts: Court[]
  complexId: string
}

export function NuevaReservaClient({ courts, complexId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      player_count: 10,
      deposit_paid: false,
    },
  })

  const selectedCourtId = watch("court_id")
  const selectedCourt = courts.find((c) => c.id === selectedCourtId)

  async function onSubmit(data: FormData) {
    if (!selectedCourt) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("reservations").insert({
      ...data,
      complex_id: complexId,
      total_price: selectedCourt.price_per_hour,
      deposit_amount: selectedCourt.deposit_amount,
      status: data.deposit_paid ? "confirmed" : "pending_deposit",
      source: "manual",
    })

    if (error) {
      toast.error("Error al crear reserva: " + error.message)
      setLoading(false)
      return
    }

    toast.success("Reserva creada")
    router.push("/admin/reservas")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label required>Cancha</Label>
        <Select {...register("court_id")} error={errors.court_id?.message}>
          <option value="">Seleccioná una cancha</option>
          {courts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {COURT_TYPES[c.type]} ({formatCurrency(c.price_per_hour)}/h)
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Fecha</Label>
          <Input type="date" {...register("date")} error={errors.date?.message} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Hora inicio</Label>
          <Input type="time" {...register("start_time")} error={errors.start_time?.message} />
        </div>
        <div>
          <Label required>Hora fin</Label>
          <Input type="time" {...register("end_time")} error={errors.end_time?.message} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Datos del jugador</p>
        <div className="space-y-3">
          <div>
            <Label required>Nombre completo</Label>
            <Input {...register("player_name")} placeholder="Juan García" error={errors.player_name?.message} />
          </div>
          <div>
            <Label required>Teléfono</Label>
            <Input {...register("player_phone")} type="tel" placeholder="+54 11 1234-5678" error={errors.player_phone?.message} />
          </div>
          <div>
            <Label>Email</Label>
            <Input {...register("player_email")} type="email" placeholder="juan@email.com" />
          </div>
          <div>
            <Label required>Cantidad jugadores</Label>
            <Input type="number" {...register("player_count")} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="deposit_paid"
          {...register("deposit_paid")}
          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="deposit_paid" className="text-sm text-gray-700">
          Seña ya pagada → estado "Confirmada"
        </label>
      </div>

      <div>
        <Label>Notas internas</Label>
        <Textarea {...register("notes")} rows={2} placeholder="Notas para el admin..." />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          Crear reserva
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/reservas")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
