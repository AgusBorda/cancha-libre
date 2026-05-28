"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { generateSlug, SERVICES_OPTIONS } from "@/lib/utils"
import type { Complex } from "@/lib/supabase/types"
import { Building2 } from "lucide-react"

const schema = z.object({
  name: z.string().min(2, "Requerido"),
  description: z.string().optional(),
  address: z.string().min(3, "Requerido"),
  city: z.string().min(2, "Requerido"),
  province: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  rules: z.string().optional(),
  services: z.array(z.string()).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  complex: Complex | null
  userId: string
}

export function ComplexFormClient({ complex, userId }: Props) {
  const [loading, setLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>(
    complex?.services ?? []
  )

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: complex
      ? {
          name: complex.name,
          description: complex.description ?? "",
          address: complex.address,
          city: complex.city,
          province: complex.province ?? "",
          phone: complex.phone ?? "",
          whatsapp: complex.whatsapp ?? "",
          instagram: complex.instagram ?? "",
          rules: complex.rules ?? "",
        }
      : {},
  })

  function toggleService(s: string) {
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  async function onSubmit(data: FormData) {
    setLoading(true)
    const supabase = createClient()
    const payload = {
      ...data,
      services: selectedServices,
      slug: complex?.slug ?? generateSlug(data.name),
      owner_id: userId,
    }

    const { error } = complex
      ? await supabase.from("complexes").update(payload).eq("id", complex.id)
      : await supabase.from("complexes").insert(payload)

    if (error) {
      toast.error("Error al guardar: " + error.message)
    } else {
      toast.success(complex ? "Complejo actualizado" : "Complejo creado")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Datos básicos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Building2 size={18} className="text-green-600" />
          Datos del complejo
        </h2>

        <div>
          <Label required>Nombre del complejo</Label>
          <Input
            {...register("name")}
            placeholder="Complejo Los Pibes"
            error={errors.name?.message}
          />
        </div>

        <div>
          <Label>Descripción</Label>
          <Textarea
            {...register("description")}
            rows={3}
            placeholder="Contá brevemente tu complejo: canchas, instalaciones, ambiente..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label required>Dirección</Label>
            <Input
              {...register("address")}
              placeholder="Av. Corrientes 1234"
              error={errors.address?.message}
            />
          </div>
          <div>
            <Label required>Ciudad</Label>
            <Input
              {...register("city")}
              placeholder="Buenos Aires"
              error={errors.city?.message}
            />
          </div>
        </div>

        <div>
          <Label>Provincia</Label>
          <Input {...register("province")} placeholder="CABA" />
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Contacto</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Teléfono</Label>
            <Input {...register("phone")} placeholder="1123456789" type="tel" />
          </div>
          <div>
            <Label>WhatsApp</Label>
            <Input
              {...register("whatsapp")}
              placeholder="5491123456789"
              type="tel"
            />
            <p className="text-xs text-gray-400 mt-1">
              Con código de país, sin +
            </p>
          </div>
        </div>

        <div>
          <Label>Instagram</Label>
          <Input
            {...register("instagram")}
            placeholder="@complejoslospibes"
          />
        </div>
      </div>

      {/* Servicios */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Servicios y comodidades</h2>
        <div className="flex flex-wrap gap-2">
          {SERVICES_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleService(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selectedServices.includes(s)
                  ? "bg-green-600 border-green-600 text-white"
                  : "bg-white border-gray-300 text-gray-600 hover:border-green-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Reglas */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Reglas del complejo</h2>
        <Textarea
          {...register("rules")}
          rows={5}
          placeholder={`Ej:\n- Puntualidad obligatoria. La cancha se libera a los 10 minutos.\n- Cancelaciones con 24hs de anticipación.\n- Obligatorio: botines o zapatillas.`}
        />
      </div>

      <Button type="submit" size="lg" loading={loading}>
        {complex ? "Guardar cambios" : "Crear complejo"}
      </Button>
    </form>
  )
}
