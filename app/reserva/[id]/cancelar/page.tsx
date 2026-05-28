"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { XCircle, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { use } from "react"

export default function CancelarPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")

  async function handleCancel() {
    setStatus("loading")
    const supabase = createClient()

    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("status, date, start_time")
      .eq("id", id)
      .single()

    if (fetchError || !reservation) {
      setStatus("error")
      return
    }

    if (reservation.status === "cancelled") {
      setStatus("done")
      return
    }

    const { error } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", id)

    if (error) {
      setStatus("error")
      return
    }

    setStatus("done")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">

          {status === "idle" && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                ¿Cancelar tu reserva?
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Esta acción no se puede deshacer. El turno quedará liberado.
              </p>
              <button
                onClick={handleCancel}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-colors mb-3"
              >
                Sí, cancelar mi turno
              </button>
              <Link
                href={`/reserva/${id}`}
                className="block text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                No, mantener la reserva
              </Link>
            </>
          )}

          {status === "loading" && (
            <>
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Cancelando tu reserva...</p>
            </>
          )}

          {status === "done" && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Reserva cancelada
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Tu turno fue cancelado correctamente.
              </p>
              <Link
                href="/canchas"
                className="block w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-colors text-center"
              >
                Buscar otro turno
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Ocurrió un error
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                No pudimos cancelar la reserva. Contactá al complejo directamente.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="block w-full text-sm text-gray-400 hover:text-gray-600"
              >
                Intentar de nuevo
              </button>
            </>
          )}

        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          <Link href="/" className="hover:text-gray-600">CanchaLibre</Link>
        </p>
      </div>
    </div>
  )
}
