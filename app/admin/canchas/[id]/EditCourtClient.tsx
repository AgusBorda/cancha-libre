"use client"

import { CourtForm } from "@/components/admin/CourtForm"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Court } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"

interface Props {
  court: Court
}

export function EditCourtClient({ court }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(data: {
    name: string
    type: "F5" | "F7" | "F8" | "F11"
    capacity: number
    description?: string
    price_per_hour: number
    deposit_amount: number
    is_active: boolean
  }) {
    const supabase = createClient()
    const { error } = await supabase
      .from("courts")
      .update(data)
      .eq("id", court.id)
    if (error) {
      toast.error("Error al guardar: " + error.message)
      throw error
    }
    toast.success("Cancha actualizada")
    router.push("/admin/canchas")
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta cancha? Esta acción no se puede deshacer.")) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from("courts").delete().eq("id", court.id)
    if (error) {
      toast.error("Error al eliminar: " + error.message)
      setDeleting(false)
      return
    }
    toast.success("Cancha eliminada")
    router.push("/admin/canchas")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <CourtForm
          court={court}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/canchas")}
        />
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="font-semibold text-red-800 mb-1">Zona de peligro</h3>
        <p className="text-sm text-red-600 mb-4">
          Esta acción eliminará la cancha y todos sus horarios. Las reservas
          existentes no se eliminarán.
        </p>
        <Button
          variant="danger"
          size="sm"
          loading={deleting}
          onClick={handleDelete}
        >
          <Trash2 size={15} />
          Eliminar cancha
        </Button>
      </div>
    </div>
  )
}
