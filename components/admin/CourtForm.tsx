"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { COURT_TYPES } from "@/lib/utils"
import type { Court } from "@/lib/supabase/types"

const schema = z.object({
  name: z.string().min(1, "Requerido"),
  type: z.enum(["F5", "F7", "F8", "F11"]),
  capacity: z.coerce.number().min(2).max(22),
  description: z.string().optional(),
  price_per_hour: z.coerce.number().min(1, "Ingresá el precio"),
  deposit_amount: z.coerce.number().min(0),
  is_active: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Props {
  court?: Court
  onSubmit: (data: FormData) => Promise<void>
  onCancel?: () => void
}

export function CourtForm({ court, onSubmit, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: court
      ? {
          name: court.name,
          type: court.type,
          capacity: court.capacity,
          description: court.description ?? "",
          price_per_hour: court.price_per_hour,
          deposit_amount: court.deposit_amount,
          is_active: court.is_active,
        }
      : {
          type: "F5",
          capacity: 10,
          deposit_amount: 0,
          is_active: true,
        },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label required>Nombre de la cancha</Label>
        <Input
          {...register("name")}
          placeholder="Ej: Cancha 1 — Fútbol 5"
          error={errors.name?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Tipo</Label>
          <Select {...register("type")} error={errors.type?.message}>
            {Object.entries(COURT_TYPES).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label required>Capacidad (jugadores)</Label>
          <Input
            type="number"
            {...register("capacity")}
            placeholder="10"
            error={errors.capacity?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label required>Precio por hora ($)</Label>
          <Input
            type="number"
            {...register("price_per_hour")}
            placeholder="25000"
            error={errors.price_per_hour?.message}
          />
        </div>
        <div>
          <Label>Monto de seña ($)</Label>
          <Input
            type="number"
            {...register("deposit_amount")}
            placeholder="5000"
            error={errors.deposit_amount?.message}
          />
        </div>
      </div>

      <div>
        <Label>Descripción</Label>
        <Textarea
          {...register("description")}
          rows={3}
          placeholder="Césped sintético, tablero, etc."
        />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_active"
          {...register("is_active")}
          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
        />
        <label htmlFor="is_active" className="text-sm text-gray-700">
          Cancha activa (visible para reservas)
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {court ? "Guardar cambios" : "Crear cancha"}
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
