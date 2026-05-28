import { getReservationById } from "@/lib/supabase/queries"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/public/Navbar"
import { Footer } from "@/components/public/Footer"
import { formatDate, formatTime, formatCurrency, RESERVATION_STATUS, COURT_TYPES } from "@/lib/utils"
import { CheckCircle2, MapPin, Clock, Calendar, DollarSign, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ShareButton } from "./ShareButton"
import { PayAgainButton } from "./PayAgainButton"

export default async function ReservationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ pago?: string }>
}) {
  const { id } = await params
  const { pago } = await searchParams
  let reservation
  try {
    reservation = await getReservationById(id)
  } catch {
    notFound()
  }

  const statusInfo = RESERVATION_STATUS[reservation.status]
  const court = (reservation as any).courts
  const complex = court?.complexes

  const whatsappText = encodeURIComponent(
    `¡Partido confirmado en ${complex?.name ?? "la cancha"}! 🏃\n` +
      `📅 ${formatDate(reservation.date)}\n` +
      `⏰ ${formatTime(reservation.start_time)} – ${formatTime(reservation.end_time)}\n` +
      `📍 ${complex?.address ?? ""}, ${complex?.city ?? ""}\n` +
      (reservation.deposit_amount > 0
        ? `💰 Seña: ${formatCurrency(reservation.deposit_amount)}\n`
        : "") +
      `\nReservado en CanchaLibre`
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 max-w-lg mx-auto px-4 py-10 w-full">
        {/* Status header */}
        <div className="text-center mb-8">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              reservation.status === "confirmed" || reservation.status === "completed"
                ? "bg-green-100"
                : reservation.status === "pending_deposit"
                ? "bg-yellow-100"
                : "bg-gray-100"
            }`}
          >
            <CheckCircle2
              className={`h-8 w-8 ${
                reservation.status === "confirmed" || reservation.status === "completed"
                  ? "text-green-600"
                  : reservation.status === "pending_deposit"
                  ? "text-yellow-600"
                  : "text-gray-500"
              }`}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {reservation.status === "pending_deposit"
              ? "¡Reserva recibida!"
              : "¡Reserva confirmada!"}
          </h1>
          <p className="text-gray-500 text-sm">
            {reservation.status === "pending_deposit"
              ? "Coordiná el pago de la seña para confirmar tu turno"
              : "Tu turno está asegurado"}
          </p>
          <div className="mt-3">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
        </div>

        {/* Details card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <p className="text-white font-bold">{complex?.name ?? "—"}</p>
            {complex?.address && (
              <div className="flex items-center gap-1 text-green-100 text-xs mt-0.5">
                <MapPin size={12} />
                {complex.address}, {complex.city}
              </div>
            )}
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                <Calendar size={16} className="text-green-700" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Fecha</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {formatDate(reservation.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                <Clock size={16} className="text-green-700" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Horario</p>
                <p className="font-semibold text-gray-900">
                  {formatTime(reservation.start_time)} –{" "}
                  {formatTime(reservation.end_time)}
                </p>
              </div>
            </div>

            {court && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-green-700 font-bold text-xs">
                    {court.type}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cancha</p>
                  <p className="font-semibold text-gray-900">
                    {court.name} · {COURT_TYPES[court.type]}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                <DollarSign size={16} className="text-green-700" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(reservation.total_price)}
                  {reservation.deposit_amount > 0 && (
                    <span className="text-gray-400 font-normal text-sm ml-2">
                      · seña {formatCurrency(reservation.deposit_amount)}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Deposit pending alert */}
            {reservation.status === "pending_deposit" &&
              reservation.deposit_amount > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-2">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">
                    Pendiente: pago de seña
                  </p>
                  <p className="text-xs text-yellow-700 mb-3">
                    Para confirmar tu turno abonás una seña de{" "}
                    <strong>{formatCurrency(reservation.deposit_amount)}</strong>.
                  </p>
                  <PayAgainButton
                    reservationId={reservation.id}
                    courtName={court?.name}
                    complexName={complex?.name}
                    date={reservation.date}
                    startTime={reservation.start_time}
                    endTime={reservation.end_time}
                    depositAmount={reservation.deposit_amount}
                  />
                </div>
              )}
          </div>
        </div>

        {/* Jugador info */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">
            Datos del jugador
          </p>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-500">Nombre: </span>
              <span className="font-medium">{reservation.player_name}</span>
            </p>
            <p>
              <span className="text-gray-500">Teléfono: </span>
              <span className="font-medium">{reservation.player_phone}</span>
            </p>
            <p>
              <span className="text-gray-500">Jugadores: </span>
              <span className="font-medium">{reservation.player_count}</span>
            </p>
          </div>
        </div>

        {/* Banner resultado pago MP */}
        {pago === "ok" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            <p className="text-sm font-medium text-green-800">¡Seña pagada! Tu reserva está confirmada.</p>
          </div>
        )}
        {pago === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-800">El pago no se pudo procesar. Podés intentarlo de nuevo.</p>
          </div>
        )}
        {pago === "pendiente" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
            <p className="text-sm font-medium text-yellow-800">Tu pago está siendo procesado. Te avisamos cuando se confirme.</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <ShareButton whatsappText={whatsappText} />

          <Link
            href="/canchas"
            className="block text-center text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            ← Buscar otra cancha
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
