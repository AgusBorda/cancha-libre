"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"
import type { TimeSlot, Court, Complex } from "@/lib/supabase/types"
import { CalendarCheck, Clock, DollarSign, Users } from "lucide-react"

const schema = z.object({
  player_name: z.string().min(2, "Ingresá tu nombre completo"),
  player_phone: z
    .string()
    .min(8, "Ingresá un teléfono válido")
    .regex(/^[\d\s\+\-\(\)]+$/, "Solo números"),
  player_email: z.string().email("Email inválido").optional().or(z.literal("")),
  player_count: z.coerce.number().min(1).max(22),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  court: Court
  complex: Pick<Complex, "name" | "address" | "city">
  selectedDate: string
  selectedSlot: TimeSlot
  onSubmit: (data: FormData) => Promise<void>
  onBack: () => void
}

export function ReservationForm({
  court,
  complex,
  selectedDate,
  selectedSlot,
  onSubmit,
  onBack,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { player_count: court.capacity / 2 },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Resumen */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2.5">
        <h3 className="font-bold text-green-900 text-sm mb-3">Resumen de tu reserva</h3>
        <div className="flex items-center gap-2.5 text-sm">
          <div className="w-7 h-7 bg-green-200 rounded-lg flex items-center justify-center shrink-0">
            <CalendarCheck size={14} className="text-green-700" />
          </div>
          <div>
            <p className="text-gray-500 text-xs">Fecha</p>
            <p className="font-medium text-gray-900 capitalize">
              {formatDate(selectedDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <div className="w-7 h-7 bg-green-200 rounded-lg flex items-center justify-center shrink-0">
            <Clock size={14} className="text-green-700" />
          </div>
          <div>
            <p className="text-gray-500 text-xs">Horario</p>
            <p className="font-medium text-gray-900">
              {formatTime(selectedSlot.start)} – {formatTime(selectedSlot.end)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <div className="w-7 h-7 bg-green-200 rounded-lg flex items-center justify-center shrink-0">
            <DollarSign size={14} className="text-green-700" />
          </div>
          <div>
            <p className="text-gray-500 text-xs">Total / Seña</p>
            <p className="font-medium text-gray-900">
              {formatCurrency(selectedSlot.price)}
              {court.deposit_amount > 0 && (
                <span className="text-gray-500 font-normal">
                  {" "}· seña {formatCurrency(court.deposit_amount)}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="pt-2 border-t border-green-200 text-xs text-gray-500">
          <p className="font-medium text-gray-700">{court.name}</p>
          <p>
            {complex.name} · {complex.address}, {complex.city}
          </p>
        </div>
      </div>

      {/* Datos del jugador */}
      <div>
        <Label required>Nombre completo</Label>
        <Input
          {...register("player_name")}
          placeholder="Juan García"
          error={errors.player_name?.message}
        />
      </div>

      <div>
        <Label required>Teléfono (WhatsApp)</Label>
        <Input
          {...register("player_phone")}
          type="tel"
          placeholder="+54 11 1234-5678"
          error={errors.player_phone?.message}
        />
      </div>

      <div>
        <Label>Email (opcional)</Label>
        <Input
          {...register("player_email")}
          type="email"
          placeholder="juan@email.com"
          error={errors.player_email?.message}
        />
      </div>

      <div>
        <Label required>
          <span className="flex items-center gap-1">
            <Users size={13} />
            Cantidad de jugadores
          </span>
        </Label>
        <Input
          type="number"
          {...register("player_count")}
          min={1}
          max={court.capacity}
          error={errors.player_count?.message}
        />
      </div>

      <div>
        <Label>Notas (opcional)</Label>
        <Textarea
          {...register("notes")}
          rows={2}
          placeholder="Ej: traer pecheras, cumpleaños, etc."
        />
      </div>

      <div className="flex flex-col gap-3 pt-1">
        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          Confirmar reserva
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-gray-500"
        >
          ← Cambiar horario
        </Button>
      </div>
    </form>
  )
}
