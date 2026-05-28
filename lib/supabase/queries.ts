import { createClient } from "@/lib/supabase/server"
import type { TimeSlot, ReservationStatus } from "@/lib/supabase/types"

// ─── Complexes ────────────────────────────────────────────────────────────────

export async function getActiveComplexes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("complexes")
    .select("*, courts(id, type, price_per_hour, is_active)")
    .eq("is_active", true)
    .order("name")
  if (error) throw error
  return data
}

export async function getComplexBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("complexes")
    .select(
      `*,
      courts(
        *,
        court_images(*)
      )`
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single()
  if (error) throw error
  return data
}

export async function getComplexByOwner(ownerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("complexes")
    .select("*")
    .eq("owner_id", ownerId)
    .single()
  if (error) return null
  return data
}

// ─── Courts ───────────────────────────────────────────────────────────────────

export async function getCourtsByComplex(complexId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("courts")
    .select("*, court_images(*)")
    .eq("complex_id", complexId)
    .order("name")
  if (error) throw error
  return data
}

export async function getCourtById(courtId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("courts")
    .select("*, court_images(*), schedules(*)")
    .eq("id", courtId)
    .single()
  if (error) throw error
  return data
}

// ─── Schedules ────────────────────────────────────────────────────────────────

export async function getSchedulesByCourt(courtId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("schedules")
    .select("*")
    .eq("court_id", courtId)
    .order("day_of_week")
  if (error) throw error
  return data ?? []
}

// ─── Available Slots ──────────────────────────────────────────────────────────

export async function getAvailableSlots(
  courtId: string,
  date: string,
  pricePerHour: number
): Promise<TimeSlot[]> {
  const supabase = await createClient()

  const d = new Date(date + "T00:00:00")
  const dayOfWeek = d.getDay()

  const { data: schedule } = await supabase
    .from("schedules")
    .select("*")
    .eq("court_id", courtId)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true)
    .single()

  if (!schedule) return []

  const [{ data: reservations }, { data: blockedSlots }] = await Promise.all([
    supabase
      .from("reservations")
      .select("start_time, end_time")
      .eq("court_id", courtId)
      .eq("date", date)
      .not("status", "in", '("cancelled")'),
    supabase
      .from("blocked_slots")
      .select("start_time, end_time")
      .eq("court_id", courtId)
      .eq("date", date),
  ])

  const toMinutes = (t: string) => {
    const [h, m] = t.slice(0, 5).split(":").map(Number)
    return h * 60 + m
  }
  const fromMinutes = (m: number) =>
    `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`

  const startMin = toMinutes(schedule.start_time)
  const endMin = toMinutes(schedule.end_time)
  const duration = schedule.slot_duration
  const slots: TimeSlot[] = []

  for (let t = startMin; t + duration <= endMin; t += duration) {
    const slotStart = fromMinutes(t)
    const slotEnd = fromMinutes(t + duration)

    const isReserved = (reservations ?? []).some((r) => {
      const rStart = r.start_time.slice(0, 5)
      const rEnd = r.end_time.slice(0, 5)
      return slotStart < rEnd && slotEnd > rStart
    })

    const isBlocked = (blockedSlots ?? []).some((b) => {
      const bStart = b.start_time.slice(0, 5)
      const bEnd = b.end_time.slice(0, 5)
      return slotStart < bEnd && slotEnd > bStart
    })

    const price = schedule.price_override ?? pricePerHour
    slots.push({ start: slotStart, end: slotEnd, price, available: !isReserved && !isBlocked })
  }

  return slots
}

// ─── Reservations ─────────────────────────────────────────────────────────────

export async function getReservationsByComplex(
  complexId: string,
  filters?: { status?: ReservationStatus; date?: string }
) {
  const supabase = await createClient()
  let query = supabase
    .from("reservations")
    .select("*, courts(name, type)")
    .eq("complex_id", complexId)
    .order("date", { ascending: false })
    .order("start_time", { ascending: true })

  if (filters?.status) query = query.eq("status", filters.status)
  if (filters?.date) query = query.eq("date", filters.date)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getTodayReservations(complexId: string) {
  const today = new Date().toISOString().split("T")[0]
  return getReservationsByComplex(complexId, { date: today })
}

export async function getReservationById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("reservations")
    .select("*, courts(name, type, complexes(name, address, city, whatsapp))")
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function getDashboardStats(complexId: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]

  const [{ data: todayRes }, { data: monthRes }, { data: courts }] =
    await Promise.all([
      supabase
        .from("reservations")
        .select("total_price, deposit_paid, status")
        .eq("complex_id", complexId)
        .eq("date", today)
        .not("status", "in", '("cancelled")'),
      supabase
        .from("reservations")
        .select("total_price, status")
        .eq("complex_id", complexId)
        .gte("date", today.slice(0, 7) + "-01")
        .not("status", "in", '("cancelled")'),
      supabase
        .from("courts")
        .select("id")
        .eq("complex_id", complexId)
        .eq("is_active", true),
    ])

  return {
    todayCount: todayRes?.length ?? 0,
    todayRevenue: todayRes?.reduce((s, r) => s + r.total_price, 0) ?? 0,
    monthRevenue: monthRes?.reduce((s, r) => s + r.total_price, 0) ?? 0,
    activeCourts: courts?.length ?? 0,
  }
}

export async function getFrequentClients(complexId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("reservations")
    .select("player_name, player_phone, player_email, status, date")
    .eq("complex_id", complexId)
    .not("status", "in", '("cancelled")')
    .order("created_at", { ascending: false })

  if (error) throw error

  const map = new Map<
    string,
    { name: string; phone: string; email: string | null; count: number; lastDate: string }
  >()

  for (const r of data ?? []) {
    const key = r.player_phone
    const existing = map.get(key)
    if (existing) {
      existing.count++
      if (r.date > existing.lastDate) existing.lastDate = r.date
    } else {
      map.set(key, {
        name: r.player_name,
        phone: r.player_phone,
        email: r.player_email,
        count: 1,
        lastDate: r.date,
      })
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 50)
}
