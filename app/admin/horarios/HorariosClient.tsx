"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ScheduleForm } from "@/components/admin/ScheduleForm"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DAYS_OF_WEEK, formatTime } from "@/lib/utils"
import type { Schedule, Court } from "@/lib/supabase/types"
import { toast } from "sonner"
import { Plus, Trash2, Clock } from "lucide-react"

interface Props {
  courts: (Court & { schedules: Schedule[] })[]
}

export function HorariosClient({ courts }: Props) {
  const [selectedCourt, setSelectedCourt] = useState(courts[0]?.id ?? "")
  const [showForm, setShowForm] = useState(false)
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null)
  const [schedules, setSchedules] = useState<Record<string, Schedule[]>>(
    Object.fromEntries(courts.map((c) => [c.id, c.schedules]))
  )
  const [deleting, setDeleting] = useState<string | null>(null)

  const court = courts.find((c) => c.id === selectedCourt)
  const courtSchedules = schedules[selectedCourt] ?? []

  async function handleSave(data: {
    day_of_week: number
    start_time: string
    end_time: string
    slot_duration: number
    price_override?: number | null
    is_active: boolean
  }) {
    const supabase = createClient()

    if (editSchedule) {
      const { error } = await supabase
        .from("schedules")
        .update(data)
        .eq("id", editSchedule.id)
      if (error) { toast.error(error.message); throw error }
      setSchedules((prev) => ({
        ...prev,
        [selectedCourt]: prev[selectedCourt].map((s) =>
          s.id === editSchedule.id ? { ...s, ...data } : s
        ),
      }))
      toast.success("Horario actualizado")
    } else {
      const { data: inserted, error } = await supabase
        .from("schedules")
        .insert({ ...data, court_id: selectedCourt })
        .select()
        .single()
      if (error) { toast.error(error.message); throw error }
      setSchedules((prev) => ({
        ...prev,
        [selectedCourt]: [...(prev[selectedCourt] ?? []), inserted],
      }))
      toast.success("Horario agregado")
    }

    setShowForm(false)
    setEditSchedule(null)
  }

  async function handleDelete(scheduleId: string) {
    if (!confirm("¿Eliminar este horario?")) return
    setDeleting(scheduleId)
    const supabase = createClient()
    const { error } = await supabase
      .from("schedules")
      .delete()
      .eq("id", scheduleId)
    if (error) { toast.error(error.message); setDeleting(null); return }
    setSchedules((prev) => ({
      ...prev,
      [selectedCourt]: prev[selectedCourt].filter((s) => s.id !== scheduleId),
    }))
    toast.success("Horario eliminado")
    setDeleting(null)
  }

  if (courts.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-400">
        <Clock className="h-10 w-10 mx-auto mb-3 text-gray-300" />
        <p>Primero creá una cancha para configurar horarios.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Court selector */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Seleccioná una cancha</p>
        <div className="flex flex-wrap gap-2">
          {courts.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelectedCourt(c.id); setShowForm(false); setEditSchedule(null) }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selectedCourt === c.id
                  ? "bg-green-600 border-green-600 text-white"
                  : "bg-white border-gray-300 text-gray-600 hover:border-green-400"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Schedules list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">{court?.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {courtSchedules.length} día{courtSchedules.length !== 1 ? "s" : ""} configurado{courtSchedules.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => { setShowForm(true); setEditSchedule(null) }}
            disabled={courtSchedules.length >= 7}
          >
            <Plus size={15} />
            Agregar día
          </Button>
        </div>

        {courtSchedules.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Esta cancha no tiene horarios configurados
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {courtSchedules
              .sort((a, b) => a.day_of_week - b.day_of_week)
              .map((s) => (
                <div key={s.id} className="px-6 py-3.5 flex items-center gap-4">
                  <div className="w-24 shrink-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {DAYS_OF_WEEK[s.day_of_week]}
                    </p>
                  </div>
                  <div className="flex-1 flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-gray-600">
                      {formatTime(s.start_time)} – {formatTime(s.end_time)}
                    </span>
                    <span className="text-xs text-gray-400">
                      Turnos de {s.slot_duration} min
                    </span>
                    {s.price_override && (
                      <Badge variant="blue">Precio especial</Badge>
                    )}
                    <Badge variant={s.is_active ? "green" : "gray"}>
                      {s.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => { setEditSchedule(s); setShowForm(true) }}
                      className="text-xs text-gray-500 hover:text-green-600 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deleting === s.id}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editSchedule ? "Editar horario" : "Agregar horario"}
          </h3>
          <ScheduleForm
            schedule={editSchedule ?? undefined}
            onSubmit={handleSave}
            onCancel={() => { setShowForm(false); setEditSchedule(null) }}
          />
        </div>
      )}
    </div>
  )
}
