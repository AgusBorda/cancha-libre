import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d)
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

export function formatTime(time: string): string {
  return time.slice(0, 5)
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export const COURT_TYPES: Record<string, string> = {
  F5: "Fútbol 5",
  F7: "Fútbol 7",
  F8: "Fútbol 8",
  F11: "Fútbol 11",
}

export const RESERVATION_STATUS: Record<
  string,
  { label: string; variant: "yellow" | "green" | "red" | "gray" | "orange" }
> = {
  pending_deposit: { label: "Pendiente de seña", variant: "yellow" },
  confirmed: { label: "Confirmada", variant: "green" },
  cancelled: { label: "Cancelada", variant: "red" },
  completed: { label: "Finalizada", variant: "gray" },
  no_show: { label: "No asistió", variant: "orange" },
}

export const DAYS_OF_WEEK = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
]

export const SERVICES_OPTIONS = [
  "Estacionamiento",
  "Vestuarios",
  "Duchas",
  "Bar / Cantina",
  "WiFi",
  "Iluminación nocturna",
  "Tribuna",
  "Alquiler de pecheras",
  "Alquiler de pelota",
]

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0]
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00")
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}
