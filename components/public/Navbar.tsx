import Link from "next/link"
import { Zap } from "lucide-react"

export function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">CanchaLibre</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/canchas"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Buscar cancha
          </Link>
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Soy dueño
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/canchas"
            className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Reservar ahora
          </Link>
        </div>
      </div>
    </header>
  )
}
