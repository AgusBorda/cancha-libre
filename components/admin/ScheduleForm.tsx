"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DAYS_OF_WEEK } from "@/lib/utils"
import type { Schedule } from "@/lib/supabase/types"

const schema = z.object({
  day_of_week: z.coerce.number().min(0).max(6),
  start_time: z.string().min(1, "Requerido"),
  end_time: z.string().min(1, "Requerido"),
  slot_duration: z.coerce.number().min(30).max(180),
  price_override: z.coerce.number().optional().nullable(),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Props {
  schedule?: Schedule
  onSubmit: (data: FormData) => Promise<void>
  onCancel?: () => void
}

export function ScheduleForm({ schedule, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: schedule
      ? {
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time.slice(0, 5),
          end_time: schedule.end_time.slice(0, 5),
          slot_duration: schedule.slot_duration,
          price_override: schedule.price_override,
          is_active: schedule.is_active,
        }
      : {
          day_of_week: 1,
          start_time: "08:00",
          end_time: "23:00",
          slot_duration: 60,
          is_active: true,
        },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label required>Día de la semana</Label>
        <select
          {...register("day_of_week")}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {DAYS_OF_WEEK.map((day, i) => (
            <option key={i} value={i}>{day}</option>
          ))}
        </select>
        {errors.day_of_week && (
          <p className="mt-1 text-xs text-red-600">{errors.day_of_week.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Desde</Label>
          <Input
            type="time"
            {...register("start_time")}
            error={errors.start_time?.message}
          />
        </div>
        <div>
          <Label required>Hasta</Label>
          <Input
            type="time"
            {...register("end_time")}
            error={errors.end_time?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Duración del turno (min)</Label>
          <select
            {...register("slot_duration")}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value={30}>30 minutos</option>
            <option value={60}>60 minutos</option>
            <option value={90}>90 minutos</option>
            <option value={120}>120 minutos</option>
          </select>
        </div>
        <div>
          <Label>Precio especial (opcional)</Label>
          <Input
            type="number"
            {...register("price_override")}
            placeholder="Precio por hora"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_active"
          {...register("is_active")}
          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="is_active" className="text-sm text-gray-700">
          Horario activo
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {schedule ? "Guardar cambios" : "Agregar horario"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}
