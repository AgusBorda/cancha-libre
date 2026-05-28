import { NextRequest, NextResponse } from "next/server"
import MercadoPagoConfig, { Preference } from "mercadopago"
import { formatDate, formatTime } from "@/lib/utils"

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  try {
    const {
      reservationId,
      courtName,
      complexName,
      date,
      startTime,
      endTime,
      depositAmount,
      playerEmail,
    } = await req.json()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    const preference = new Preference(client)
    const result = await preference.create({
      body: {
        items: [
          {
            id: reservationId,
            title: `Seña — ${courtName} (${complexName})`,
            description: `${formatDate(date)} ${formatTime(startTime)} – ${formatTime(endTime)}`,
            quantity: 1,
            unit_price: depositAmount,
            currency_id: "ARS",
          },
        ],
        payer: playerEmail ? { email: playerEmail } : undefined,
        back_urls: {
          success: `${appUrl}/reserva/${reservationId}?pago=ok`,
          failure: `${appUrl}/reserva/${reservationId}?pago=error`,
          pending: `${appUrl}/reserva/${reservationId}?pago=pendiente`,
        },
        auto_return: "approved",
        notification_url: `${appUrl}/api/mp/webhook`,
        external_reference: reservationId,
        statement_descriptor: "CanchaLibre",
      },
    })

    return NextResponse.json({ url: result.init_point })
  } catch (err) {
    console.error("[MP] Error creando preferencia:", err)
    return NextResponse.json({ error: "Error al iniciar el pago" }, { status: 500 })
  }
}
