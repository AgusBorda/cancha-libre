"use client"

import { CourtForm } from "@/components/admin/CourtForm"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Props {
  complexId: string
}

export function NewCourtClient({ complexId }: Props) {
  const router = useRouter()

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
    const { error } = await supabase.from("courts").insert({
      ...data,
      complex_id: complexId,
    })
    if (error) {
      toast.error("Error al crear la cancha: " + error.message)
      throw error
    }
    toast.success("Cancha creada")
    router.push("/admin/canchas")
    router.refresh()
  }

  return (
    <CourtForm
      onSubmit={handleSubmit}
      onCancel={() => router.push("/admin/canchas")}
    />
  )
}
