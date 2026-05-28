import twilio from "twilio"
import { formatDate, formatTime, formatCurrency } from "@/lib/utils"

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const from = process.env.TWILIO_WHATSAPP_FROM!

export function getTwilioClient() {
  return twilio(accountSid, authToken)
}

// Normaliza el número para WhatsApp: "1123456789" → "whatsapp:+541123456789"
export function toWhatsAppNumber(phone: string): string {
  // Si ya tiene el formato correcto, lo devolvemos igual
  if (phone.startsWith("whatsapp:")) return phone
  // Limpiamos todo lo que no sea dígito
  const digits = phone.replace(/\D/g, "")
  // Si empieza con 0 (ej 011...) lo quitamos
  const clean = digits.startsWith("0") ? digits.slice(1) : digits
  // Si ya tiene código de país (empieza con 54) lo usamos, si no agregamos Argentina
  const withCountry = clean.startsWith("54") ? clean : `54${clean}`
  return `whatsapp:+${withCountry}`
}

export interface ReservationNotificationData {
  playerName: string
  playerPhone: string
  courtName: string
  complexName: string
  complexAddress: string
  complexCity: string
  complexWhatsapp?: string | null
  date: string
  startTime: string
  endTime: string
  totalPrice: number
  depositAmount: number
  reservationId: string
}

// Mensaje al jugador cuando confirma la reserva
export function buildConfirmationMessage(data: ReservationNotificationData): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://canchaLibre.com"
  const cancelUrl = `${appUrl}/reserva/${data.reservationId}/cancelar`

  const depositLine =
    data.depositAmount > 0
      ? `\n💰 *Seña:* ${formatCurrency(data.depositAmount)} (pendiente de pago)`
      : ""
  const contactLine = data.complexWhatsapp
    ? `\n📞 *Contacto:* wa.me/${data.complexWhatsapp.replace(/\D/g, "")}`
    : ""

  return `✅ *¡Reserva confirmada!*

👤 *Jugador:* ${data.playerName}
🏟️ *Cancha:* ${data.courtName} — ${data.complexName}
📍 *Dirección:* ${data.complexAddress}, ${data.complexCity}
📅 *Fecha:* ${formatDate(data.date)}
⏰ *Horario:* ${formatTime(data.startTime)} – ${formatTime(data.endTime)}
💵 *Total:* ${formatCurrency(data.totalPrice)}${depositLine}${contactLine}

❌ Para cancelar tu turno: ${cancelUrl}

_CanchaLibre 🏃_`
}

// Mensaje al dueño cuando entra una reserva nueva
export function buildOwnerNotificationMessage(data: ReservationNotificationData): string {
  const depositLine =
    data.depositAmount > 0
      ? `\n💰 *Seña:* ${formatCurrency(data.depositAmount)}`
      : ""

  return `🆕 *Nueva reserva online*

🏟️ *Cancha:* ${data.courtName}
👤 *Jugador:* ${data.playerName}
📱 *Teléfono:* ${data.playerPhone}
📅 *Fecha:* ${formatDate(data.date)}
⏰ *Horario:* ${formatTime(data.startTime)} – ${formatTime(data.endTime)}
💵 *Total:* ${formatCurrency(data.totalPrice)}${depositLine}

_CanchaLibre 🏃_`
}

// Mensaje recordatorio 2hs antes del partido
export function buildReminderMessage(data: ReservationNotificationData): string {
  return `⏰ *Recordatorio de partido*

Hoy jugás a las *${formatTime(data.startTime)}* en *${data.complexName}*
🏟️ Cancha: ${data.courtName}
📍 ${data.complexAddress}, ${data.complexCity}

¡Que salga bien el partido! ⚽

_CanchaLibre 🏃_`
}

// Envía un mensaje de WhatsApp
export async function sendWhatsAppMessage(to: string, body: string): Promise<boolean> {
  try {
    const client = getTwilioClient()
    await client.messages.create({
      from,
      to: toWhatsAppNumber(to),
      body,
    })
    return true
  } catch (err) {
    console.error("[Twilio] Error enviando mensaje:", err)
    return false
  }
}
