export type CourtType = "F5" | "F7" | "F8" | "F11"
export type ReservationStatus =
  | "pending_deposit"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show"
export type ReservationSource = "online" | "manual"

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: "admin" | "player"
  created_at: string
}

export interface Complex {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  address: string
  city: string
  province: string | null
  lat: number | null
  lng: number | null
  phone: string | null
  whatsapp: string | null
  instagram: string | null
  rules: string | null
  services: string[]
  is_active: boolean
  created_at: string
}

export interface Court {
  id: string
  complex_id: string
  name: string
  type: CourtType
  capacity: number
  description: string | null
  price_per_hour: number
  deposit_amount: number
  is_active: boolean
  created_at: string
}

export interface CourtImage {
  id: string
  court_id: string
  url: string
  order: number
}

export interface Schedule {
  id: string
  court_id: string
  day_of_week: number
  start_time: string
  end_time: string
  slot_duration: number
  price_override: number | null
  is_active: boolean
}

export interface BlockedSlot {
  id: string
  court_id: string
  date: string
  start_time: string
  end_time: string
  reason: string | null
}

export interface Reservation {
  id: string
  court_id: string
  complex_id: string
  player_name: string
  player_phone: string
  player_email: string | null
  player_count: number
  date: string
  start_time: string
  end_time: string
  total_price: number
  deposit_amount: number
  deposit_paid: boolean
  status: ReservationStatus
  source: ReservationSource
  notes: string | null
  created_at: string
  cancelled_at: string | null
  cancellation_reason: string | null
}

export interface Promotion {
  id: string
  complex_id: string
  court_id: string | null
  name: string
  discount_percentage: number
  valid_from: string
  valid_to: string
  applicable_days: number[]
  is_active: boolean
}

// Extended types with joins
export interface ReservationWithCourt extends Reservation {
  courts: Pick<Court, "name" | "type"> & {
    complexes: Pick<Complex, "name">
  }
}

export interface CourtWithImages extends Court {
  court_images: CourtImage[]
}

export interface ComplexWithCourts extends Complex {
  courts: CourtWithImages[]
}

export interface TimeSlot {
  start: string
  end: string
  price: number
  available: boolean
}
