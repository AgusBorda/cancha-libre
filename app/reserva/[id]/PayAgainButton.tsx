"use client"

import { useState } from "react"
import { toast } from "sonner"

interface Props {
  reservationId: string
  courtName: string
  complexName: string
  date: string
  startTime: string
  endTime: string
  depositAmount: number
}

export function PayAgainButton({
  reservationId,
  courtName,
  complexName,
  date,
  startTime,
  endTime,
  depositAmount,
}: Props) {
  const [loading, setLoading] = useState(false)

  async function handlePay() {
    setLoading(true)
    try {
      const res = await fetch("/api/mp/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId,
          courtName,
          complexName,
          date,
          startTime,
          endTime,
          depositAmount,
        }),
      })
      const { url, error } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        toast.error(error ?? "Error al iniciar el pago")
        setLoading(false)
      }
    } catch {
      toast.error("Error al conectar con Mercado Pago")
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
    >
      {loading ? "Redirigiendo..." : "Pagar seña con Mercado Pago"}
    </button>
  )
}
