"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Dumbbell,
  Calendar,
  ClipboardList,
  Clock,
  Users,
  LogOut,
  Menu,
  X,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

const navItems = [
  { href: "/admin",           label: "Dashboard",   icon: LayoutDashboard },
  { href: "/admin/complejo",  label: "Mi Complejo", icon: Building2 },
  { href: "/admin/canchas",   label: "Canchas",     icon: Dumbbell },
  { href: "/admin/horarios",  label: "Horarios",    icon: Clock },
  { href: "/admin/reservas",  label: "Reservas",    icon: ClipboardList },
  { href: "/admin/calendario",label: "Calendario",  icon: Calendar },
  { href: "/admin/clientes",  label: "Clientes",    icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg">CanchaLibre</span>
        </Link>
        <p className="text-xs text-gray-500 mt-1 ml-10">Panel Admin</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-green-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-gray-900 min-h-screen fixed left-0 top-0 z-30">
        <NavContent />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-gray-900 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">CanchaLibre</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-gray-300 hover:text-white p-1"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 flex flex-col">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  )
}
