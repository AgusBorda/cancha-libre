import { NextRequest, NextResponse } from "next/server"
import MercadoPagoConfig, { Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // MP envía distintos tipos de notificación
    if (body.type !== "payment") {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    // Consultamos el pago a la API de MP para verificarlo
    const payment = new Payment(client)
    const paymentData = await payment.get({ id: paymentId })

    const reservationId = paymentData.external_reference
    const status = paymentData.status // approved | pending | rejected

    if (!reservationId) return NextResponse.json({ ok: true })

    if (status === "approved") {
      await supabaseAdmin
        .from("reservations")
        .update({
          status: "confirmed",
          deposit_paid: true,
        })
        .eq("id", reservationId)
    } else if (status === "rejected") {
      // Pago rechazado — dejamos la reserva en pending_deposit
      // El jugador puede volver a intentar desde la página de confirmación
      console.log(`[MP] Pago rechazado para reserva ${reservationId}`)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[MP Webhook]", err)
    return NextResponse.json({ ok: true }) // siempre 200 para que MP no reintente
  }
}
