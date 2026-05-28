import { NextRequest, NextResponse } from "next/server"
import {
  sendWhatsAppMessage,
  buildConfirmationMessage,
  buildOwnerNotificationMessage,
  type ReservationNotificationData,
} from "@/lib/twilio"

export async function POST(req: NextRequest) {
  try {
    const data: ReservationNotificationData & { ownerPhone?: string } = await req.json()

    // Mensaje al jugador
    const playerSent = await sendWhatsAppMessage(
      data.playerPhone,
      buildConfirmationMessage(data)
    )

    // Mensaje al dueño si tiene teléfono
    let ownerSent = false
    if (data.ownerPhone) {
      ownerSent = await sendWhatsAppMessage(
        data.ownerPhone,
        buildOwnerNotificationMessage(data)
      )
    }

    return NextResponse.json({ playerSent, ownerSent })
  } catch (err) {
    console.error("[API/whatsapp/send]", err)
    return NextResponse.json({ error: "Error enviando mensajes" }, { status: 500 })
  }
}
