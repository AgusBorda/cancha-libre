import Link from "next/link"
import { Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">CanchaLibre</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Reservá tu cancha de fútbol en segundos. Sin WhatsApp, sin esperas.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Jugadores</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/canchas" className="hover:text-white transition-colors">
                  Buscar canchas
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Dueños de cancha</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-xs text-center">
          © {new Date().getFullYear()} CanchaLibre. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
