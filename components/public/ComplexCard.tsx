import Link from "next/link"
import { MapPin, Dumbbell } from "lucide-react"
import { formatCurrency, COURT_TYPES } from "@/lib/utils"
import type { Complex, Court } from "@/lib/supabase/types"

interface Props {
  complex: Complex & {
    courts?: Pick<Court, "type" | "price_per_hour" | "is_active">[]
  }
}

export function ComplexCard({ complex }: Props) {
  const activeCourts = complex.courts?.filter((c) => c.is_active) ?? []
  const types = [...new Set(activeCourts.map((c) => c.type))]
  const minPrice = activeCourts.length
    ? Math.min(...activeCourts.map((c) => c.price_per_hour))
    : null

  return (
    <Link
      href={`/complejo/${complex.slug}`}
      className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group overflow-hidden"
    >
      {/* Image placeholder */}
      <div className="h-44 bg-gradient-to-br from-green-800 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Dumbbell className="h-24 w-24 text-white" />
        </div>
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {types.map((t) => (
            <span
              key={t}
              className="bg-white/90 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full"
            >
              {COURT_TYPES[t]}
            </span>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors text-base leading-tight">
          {complex.name}
        </h3>

        <div className="flex items-center gap-1.5 mt-1.5 text-gray-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <p className="text-sm truncate">
            {complex.city}
            {complex.province ? `, ${complex.province}` : ""}
          </p>
        </div>

        {complex.description && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {complex.description}
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <div>
            {minPrice !== null && (
              <p className="text-sm text-gray-500">
                Desde{" "}
                <span className="font-bold text-green-700 text-base">
                  {formatCurrency(minPrice)}
                </span>
                <span className="text-xs text-gray-400">/hora</span>
              </p>
            )}
          </div>
          <span className="text-xs font-semibold text-green-600 group-hover:underline">
            Ver canchas →
          </span>
        </div>
      </div>
    </Link>
  )
}
