"use client"

import { Share2 } from "lucide-react"

export function ShareButton({ whatsappText }: { whatsappText: string }) {
  return (
    <a
      href={`https://wa.me/?text=${whatsappText}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-colors"
    >
      <Share2 size={16} />
      Compartir por WhatsApp
    </a>
  )
}
